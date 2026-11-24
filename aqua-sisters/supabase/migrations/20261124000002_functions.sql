-- Aqua Sisters – databasefuncties voor capaciteit, bestellingen, betalingen en check-ins.
-- Alle kritieke bewerkingen zijn atomair en vergrendelen de evenementrij (FOR UPDATE),
-- zodat gelijktijdige bestellingen nooit meer plekken kunnen verkopen dan de capaciteit.

-- Niet-voorspelbaar token (2 × UUIDv4 = ±244 bits uit pg_strong_random), URL-veilig.
create or replace function random_token() returns text
language sql volatile as $$
  select translate(encode(uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid()), 'base64'), '+/=', '-_')
$$;

-- Leesbare willekeurige code (zonder verwarrende tekens 0/O/1/I).
create or replace function random_code(n integer) returns text
language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  idx constant integer[] := array[0,1,2,3,4,5,7,9,10,11,12,13,14,15]; -- bytes zonder vaste UUID-versiebits
  b bytea := uuid_send(gen_random_uuid());
  result text := '';
begin
  if n < 1 or n > 14 then raise exception 'random_code: n moet tussen 1 en 14 liggen'; end if;
  for i in 1..n loop
    result := result || substr(alphabet, (get_byte(b, idx[i]) % 32) + 1, 1);
  end loop;
  return result;
end $$;

-- Aantal bezette plekken (personen) voor een evenement:
-- geldige/ingecheckte tickets + actieve (niet-verlopen) reserveringen.
create or replace function event_persons_used(p_event_id uuid, p_exclude_order uuid default null)
returns integer language sql stable as $$
  select (
    coalesce((select count(*) from tickets
              where event_id = p_event_id and status in ('valid', 'checked_in')), 0)
    +
    coalesce((select sum(oi.persons) from order_items oi
              join orders o on o.id = oi.order_id
              where o.event_id = p_event_id
                and o.status in ('pending', 'awaiting_transfer')
                and o.reserved_until > now()
                and (p_exclude_order is null or o.id <> p_exclude_order)), 0)
  )::integer
$$;

-- Aantal verkochte/gereserveerde eenheden van een tickettype.
create or replace function ticket_type_units_used(p_ticket_type_id uuid, p_exclude_order uuid default null)
returns integer language sql stable as $$
  select coalesce(sum(oi.quantity), 0)::integer
  from order_items oi join orders o on o.id = oi.order_id
  where oi.ticket_type_id = p_ticket_type_id
    and (p_exclude_order is null or o.id <> p_exclude_order)
    and (o.status in ('paid', 'partially_refunded')
         or (o.status in ('pending', 'awaiting_transfer') and o.reserved_until > now()))
$$;

create or replace function discount_code_uses(p_discount_id uuid, p_exclude_order uuid default null)
returns integer language sql stable as $$
  select count(*)::integer from orders o
  where o.discount_code_id = p_discount_id
    and (p_exclude_order is null or o.id <> p_exclude_order)
    and (o.status in ('paid', 'partially_refunded')
         or (o.status in ('pending', 'awaiting_transfer') and o.reserved_until > now()))
$$;

-- Bestelling aanmaken + plekken tijdelijk reserveren (atomair).
create or replace function create_order(
  p_event_id uuid,
  p_items jsonb,                  -- [{"ticket_type_id": "...", "quantity": 2}, ...]
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_discount_code text,
  p_awaiting_transfer boolean,
  p_transfer_hold_minutes integer,
  p_marketing boolean,
  p_utm jsonb,
  p_created_by uuid,
  p_admin boolean,
  p_free boolean default false
) returns jsonb
language plpgsql as $$
declare
  ev events%rowtype;
  tt ticket_types%rowtype;
  dc discount_codes%rowtype;
  rec record;
  v_sub integer := 0;
  v_persons integer := 0;
  v_disc integer := 0;
  v_total integer;
  v_used integer;
  v_order orders%rowtype;
  v_lines jsonb := '[]'::jsonb;
  v_line jsonb;
begin
  select * into ev from events where id = p_event_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'event_not_found');
  end if;

  if not coalesce(p_admin, false) then
    if ev.status <> 'published' then
      return jsonb_build_object('ok', false, 'error', 'not_available');
    end if;
    if ev.sales_paused then
      return jsonb_build_object('ok', false, 'error', 'sales_paused');
    end if;
    if ev.sales_start_at is not null and now() < ev.sales_start_at then
      return jsonb_build_object('ok', false, 'error', 'sales_not_started');
    end if;
    if now() >= coalesce(ev.sales_end_at, ev.starts_at) then
      return jsonb_build_object('ok', false, 'error', 'sales_closed');
    end if;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'no_items');
  end if;

  for rec in
    select (e->>'ticket_type_id')::uuid as ticket_type_id, sum((e->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) e
    group by 1
  loop
    if rec.quantity is null or rec.quantity < 0 then
      return jsonb_build_object('ok', false, 'error', 'invalid_quantity');
    end if;
    continue when rec.quantity = 0;

    select * into tt from ticket_types where id = rec.ticket_type_id and event_id = ev.id;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'invalid_ticket_type');
    end if;
    if not coalesce(p_admin, false) then
      if not tt.is_active
         or (tt.sales_start_at is not null and now() < tt.sales_start_at)
         or (tt.sales_end_at is not null and now() >= tt.sales_end_at) then
        return jsonb_build_object('ok', false, 'error', 'ticket_type_unavailable', 'ticket_type_id', tt.id);
      end if;
      if rec.quantity > tt.max_per_order then
        return jsonb_build_object('ok', false, 'error', 'too_many', 'ticket_type_id', tt.id, 'max', tt.max_per_order);
      end if;
    end if;
    if tt.capacity is not null and ticket_type_units_used(tt.id) + rec.quantity > tt.capacity then
      return jsonb_build_object('ok', false, 'error', 'ticket_type_sold_out', 'ticket_type_id', tt.id,
        'remaining', greatest(tt.capacity - ticket_type_units_used(tt.id), 0));
    end if;

    v_sub := v_sub + rec.quantity * tt.price_cents;
    v_persons := v_persons + rec.quantity * tt.persons_per_unit;
    v_lines := v_lines || jsonb_build_object(
      'ticket_type_id', tt.id, 'name', tt.name, 'category', tt.category,
      'quantity', rec.quantity, 'persons', rec.quantity * tt.persons_per_unit,
      'unit_price_cents', tt.price_cents, 'line_total_cents', rec.quantity * tt.price_cents);
  end loop;

  if v_persons = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_items');
  end if;
  if v_persons > 100 then
    return jsonb_build_object('ok', false, 'error', 'too_many');
  end if;

  v_used := event_persons_used(ev.id);
  if v_used + v_persons > ev.capacity then
    return jsonb_build_object('ok', false, 'error', 'sold_out', 'remaining', greatest(ev.capacity - v_used, 0));
  end if;

  if p_discount_code is not null and length(trim(p_discount_code)) > 0 then
    select * into dc from discount_codes where code = upper(trim(p_discount_code)) for update;
    if not found or not dc.is_active
       or (dc.event_id is not null and dc.event_id <> ev.id)
       or (dc.starts_at is not null and now() < dc.starts_at)
       or (dc.ends_at is not null and now() >= dc.ends_at) then
      return jsonb_build_object('ok', false, 'error', 'invalid_discount');
    end if;
    if dc.max_uses is not null and discount_code_uses(dc.id) >= dc.max_uses then
      return jsonb_build_object('ok', false, 'error', 'discount_exhausted');
    end if;
    if dc.kind = 'fixed' then
      v_disc := least(dc.amount, v_sub);
    else
      v_disc := (v_sub * dc.amount) / 100;
    end if;
  end if;

  if coalesce(p_admin, false) and coalesce(p_free, false) then
    v_disc := v_sub;  -- gratis tickets (alleen door beheerder)
  end if;

  v_total := v_sub - v_disc;

  insert into orders (
    event_id, access_token, first_name, last_name, email, phone, status,
    subtotal_cents, discount_cents, total_cents, discount_code_id,
    payment_method, reserved_until, terms_accepted_at,
    marketing_opt_in, marketing_opt_in_at, utm, created_by
  ) values (
    ev.id, random_token(), trim(p_first_name), trim(p_last_name), lower(trim(p_email)), nullif(trim(coalesce(p_phone, '')), ''),
    case when coalesce(p_awaiting_transfer, false) and v_total > 0 then 'awaiting_transfer' else 'pending' end,
    v_sub, v_disc, v_total, dc.id,
    case when coalesce(p_awaiting_transfer, false) and v_total > 0 then 'banktransfer' end,
    now() + make_interval(mins => case when coalesce(p_awaiting_transfer, false) and v_total > 0
                                       then greatest(coalesce(p_transfer_hold_minutes, 4320), 10)
                                       else ev.hold_minutes end),
    now(), coalesce(p_marketing, false), case when coalesce(p_marketing, false) then now() end,
    p_utm, p_created_by
  ) returning * into v_order;

  for v_line in select * from jsonb_array_elements(v_lines) loop
    insert into order_items (order_id, ticket_type_id, name, category, quantity, persons, unit_price_cents, line_total_cents)
    values (v_order.id, (v_line->>'ticket_type_id')::uuid, v_line->>'name', v_line->>'category',
            (v_line->>'quantity')::integer, (v_line->>'persons')::integer,
            (v_line->>'unit_price_cents')::integer, (v_line->>'line_total_cents')::integer);
  end loop;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'access_token', v_order.access_token,
    'status', v_order.status,
    'subtotal_cents', v_sub,
    'discount_cents', v_disc,
    'total_cents', v_total,
    'persons', v_persons,
    'reserved_until', v_order.reserved_until
  );
end $$;

-- Betaling bevestigen en tickets uitgeven (idempotent).
-- Resultaten: paid | already_paid | amount_mismatch | over_capacity | not_found | invalid_status
create or replace function confirm_order_paid(p_order_id uuid, p_amount_cents integer, p_method text)
returns jsonb language plpgsql as $$
declare
  o orders%rowtype;
  ev events%rowtype;
  it order_items%rowtype;
  tt ticket_types%rowtype;
  v_persons integer;
  v_reserved boolean;
  v_count integer := 0;
begin
  select * into o from orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('result', 'not_found');
  end if;
  if o.status in ('paid', 'partially_refunded', 'refunded') then
    return jsonb_build_object('result', 'already_paid');
  end if;
  if p_amount_cents is distinct from o.total_cents then
    return jsonb_build_object('result', 'amount_mismatch', 'expected', o.total_cents, 'received', p_amount_cents);
  end if;
  if o.status not in ('pending', 'awaiting_transfer', 'expired', 'cancelled', 'over_capacity') then
    return jsonb_build_object('result', 'invalid_status', 'status', o.status);
  end if;

  select * into ev from events where id = o.event_id for update;
  select coalesce(sum(persons), 0) into v_persons from order_items where order_id = o.id;
  v_reserved := o.status in ('pending', 'awaiting_transfer') and o.reserved_until > now();

  if not v_reserved then
    -- Reservering verlopen: alleen uitgeven als er nog werkelijk plek is.
    if event_persons_used(ev.id, o.id) + v_persons > ev.capacity then
      update orders set status = 'over_capacity', payment_method = coalesce(p_method, payment_method) where id = o.id;
      return jsonb_build_object('result', 'over_capacity');
    end if;
    for it in select * from order_items where order_id = o.id loop
      select * into tt from ticket_types where id = it.ticket_type_id;
      if tt.capacity is not null and ticket_type_units_used(tt.id, o.id) + it.quantity > tt.capacity then
        update orders set status = 'over_capacity', payment_method = coalesce(p_method, payment_method) where id = o.id;
        return jsonb_build_object('result', 'over_capacity');
      end if;
    end loop;
  end if;

  update orders
     set status = 'paid', paid_at = now(), reserved_until = null,
         payment_method = coalesce(p_method, payment_method)
   where id = o.id;

  for it in select * from order_items where order_id = o.id order by created_at, id loop
    for i in 1..it.persons loop
      insert into tickets (order_id, order_item_id, event_id, ticket_type_id, ticket_number, qr_token, category)
      values (o.id, it.id, o.event_id, it.ticket_type_id,
              'AS-' || random_code(4) || '-' || random_code(4), random_token(), it.category);
      v_count := v_count + 1;
    end loop;
  end loop;

  return jsonb_build_object('result', 'paid', 'tickets', v_count);
end $$;

-- Ticket inchecken (atomair: één scan wint, ook bij gelijktijdige scanners).
create or replace function check_in_ticket(
  p_token text, p_ticket_id uuid, p_event_id uuid, p_user_id uuid, p_device text, p_action text
) returns jsonb language plpgsql as $$
declare
  t tickets%rowtype;
  v_result text;
  v_info jsonb;
begin
  update tickets
     set status = 'checked_in', checked_in_at = now(), checked_in_by = p_user_id
   where ((p_token is not null and qr_token = p_token) or (p_ticket_id is not null and id = p_ticket_id))
     and event_id = p_event_id
     and status = 'valid'
  returning * into t;

  if found then
    v_result := 'ok';
  else
    select * into t from tickets
     where (p_token is not null and qr_token = p_token) or (p_ticket_id is not null and id = p_ticket_id);
    if not found then
      v_result := 'invalid';
    elsif t.event_id <> p_event_id then
      v_result := 'wrong_event';
    elsif t.status = 'checked_in' then
      v_result := 'already_used';
    else
      v_result := 'cancelled';
    end if;
  end if;

  insert into check_ins (ticket_id, event_id, user_id, action, result, device, note)
  values (t.id, p_event_id, p_user_id, coalesce(p_action, 'scan'), v_result, p_device,
          case when t.id is null and p_token is not null then 'token:' || left(p_token, 6) || '…' end);

  if t.id is null then
    return jsonb_build_object('result', v_result);
  end if;

  select jsonb_build_object(
    'ticket_id', t.id,
    'ticket_number', t.ticket_number,
    'category', t.category,
    'status', t.status,
    'checked_in_at', t.checked_in_at,
    'ticket_type', tt.name,
    'holder', o.first_name || ' ' || o.last_name,
    'order_number', o.order_number,
    'event_title', e.title,
    'event_starts_at', e.starts_at
  ) into v_info
  from orders o
  join ticket_types tt on tt.id = t.ticket_type_id
  join events e on e.id = t.event_id
  where o.id = t.order_id;

  return jsonb_build_object('result', v_result) || coalesce(v_info, '{}'::jsonb);
end $$;

create or replace function undo_check_in(p_ticket_id uuid, p_user_id uuid, p_note text)
returns boolean language plpgsql as $$
declare t tickets%rowtype;
begin
  update tickets set status = 'valid', checked_in_at = null, checked_in_by = null
   where id = p_ticket_id and status = 'checked_in'
  returning * into t;
  if not found then return false; end if;
  insert into check_ins (ticket_id, event_id, user_id, action, result, note)
  values (t.id, t.event_id, p_user_id, 'undo', 'undone', p_note);
  return true;
end $$;

-- Rate limiting over meerdere serverinstanties heen. true = toegestaan.
create or replace function rate_limit_hit(p_key text, p_window_seconds integer, p_limit integer)
returns boolean language plpgsql as $$
declare
  v_ws timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into rate_limits (key, window_start, count) values (p_key, v_ws, 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_limit;
end $$;

-- Functies niet blootstellen via de publieke Supabase API.
do $$
begin
  execute 'revoke execute on all functions in schema public from public';
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke execute on all functions in schema public from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke execute on all functions in schema public from authenticated';
  end if;
end $$;
