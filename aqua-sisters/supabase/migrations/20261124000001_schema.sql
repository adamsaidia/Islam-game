-- Aqua Sisters – basisschema
-- Alle geldbedragen in gehele eurocenten (integer).
-- Alle tabellen hebben RLS aan zonder policies: de publieke Supabase API (anon/authenticated)
-- heeft dus geen toegang. De applicatie verbindt server-side via DATABASE_URL.

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────────────────── Instellingen ─────────────────────────
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger settings_updated before update on settings for each row execute function set_updated_at();

-- ───────────────────────── Gebruikers ─────────────────────────
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  password_hash text not null,
  totp_secret text,
  totp_enabled boolean not null default false,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index users_email_key on users (lower(email));
create trigger users_updated before update on users for each row execute function set_updated_at();

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  mfa_verified boolean not null default false,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index sessions_user_idx on sessions (user_id);
create index sessions_expires_idx on sessions (expires_at);

-- ───────────────────────── Afbeeldingen ─────────────────────────
create table images (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 3000000),
  data bytea not null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Evenementen ─────────────────────────
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue_name text not null,
  venue_address text,
  city text not null,
  pool_name text,
  dress_code text,
  audience_note text,
  child_age_min integer check (child_age_min is null or child_age_min >= 0),
  child_age_max integer check (child_age_max is null or child_age_max >= 0),
  capacity integer not null check (capacity >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'archived')),
  sales_paused boolean not null default false,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  waitlist_enabled boolean not null default true,
  hold_minutes integer not null default 10 check (hold_minutes between 2 and 60),
  image_id uuid references images(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index events_status_start_idx on events (status, starts_at);
create trigger events_updated before update on events for each row execute function set_updated_at();

create table ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (category in ('adult', 'child')),
  price_cents integer not null check (price_cents >= 0),
  persons_per_unit integer not null default 1 check (persons_per_unit between 1 and 20),
  capacity integer check (capacity is null or capacity >= 0),
  max_per_order integer not null default 10 check (max_per_order between 1 and 50),
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ticket_types_event_idx on ticket_types (event_id, sort_order);
create trigger ticket_types_updated before update on ticket_types for each row execute function set_updated_at();

-- ───────────────────────── Kortingscodes ─────────────────────────
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  kind text not null check (kind in ('fixed', 'percent')),
  amount integer not null check (amount > 0),
  event_id uuid references events(id) on delete cascade,
  max_uses integer check (max_uses is null or max_uses > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'percent' or amount <= 100)
);
create unique index discount_codes_code_key on discount_codes (code);
create trigger discount_codes_updated before update on discount_codes for each row execute function set_updated_at();

-- ───────────────────────── Bestellingen ─────────────────────────
create sequence order_number_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AS' || nextval('order_number_seq')::text),
  event_id uuid not null references events(id) on delete restrict,
  access_token text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  status text not null default 'pending' check (status in (
    'pending', 'awaiting_transfer', 'paid', 'cancelled', 'expired',
    'over_capacity', 'refunded', 'partially_refunded'
  )),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  refunded_cents integer not null default 0 check (refunded_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  discount_code_id uuid references discount_codes(id) on delete set null,
  payment_method text,
  reserved_until timestamptz,
  paid_at timestamptz,
  terms_accepted_at timestamptz not null,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  utm jsonb,
  created_by uuid references users(id) on delete set null,
  note text,
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_cents = subtotal_cents - discount_cents)
);
create index orders_event_status_idx on orders (event_id, status);
create index orders_email_idx on orders (lower(email));
create index orders_created_idx on orders (created_at desc);
create index orders_reserved_idx on orders (reserved_until) where status in ('pending', 'awaiting_transfer');
create trigger orders_updated before update on orders for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id) on delete restrict,
  name text not null,
  category text not null check (category in ('adult', 'child')),
  quantity integer not null check (quantity > 0),
  persons integer not null check (persons > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on order_items (order_id);
create index order_items_type_idx on order_items (ticket_type_id);

-- ───────────────────────── Tickets ─────────────────────────
create table tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  event_id uuid not null references events(id) on delete restrict,
  ticket_type_id uuid not null references ticket_types(id) on delete restrict,
  ticket_number text not null unique,
  qr_token text not null unique,
  category text not null check (category in ('adult', 'child')),
  status text not null default 'valid' check (status in ('valid', 'checked_in', 'cancelled', 'refunded')),
  checked_in_at timestamptz,
  checked_in_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tickets_event_status_idx on tickets (event_id, status);
create index tickets_order_idx on tickets (order_id);
create trigger tickets_updated before update on tickets for each row execute function set_updated_at();

-- ───────────────────────── Betalingen ─────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  status text not null default 'open' check (status in ('open', 'pending', 'authorized', 'paid', 'failed', 'canceled', 'expired')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  method text,
  checkout_url text,
  fee_cents integer,
  mode text not null default 'test' check (mode in ('test', 'live')),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_provider_id_key on payments (provider, provider_payment_id) where provider_payment_id is not null;
create index payments_order_idx on payments (order_id);
create trigger payments_updated before update on payments for each row execute function set_updated_at();

create table payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_object_id text not null,
  payload jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  result text,
  error text
);
create index payment_webhook_events_obj_idx on payment_webhook_events (provider, provider_object_id);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_id uuid references payments(id) on delete set null,
  provider text,
  provider_refund_id text,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'refunded', 'failed', 'manual')),
  reason text,
  ticket_ids uuid[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index refunds_order_idx on refunds (order_id);
create trigger refunds_updated before update on refunds for each row execute function set_updated_at();

-- ───────────────────────── Check-ins ─────────────────────────
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete set null,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null check (action in ('scan', 'manual', 'undo', 'offline_sync')),
  result text not null check (result in ('ok', 'already_used', 'invalid', 'cancelled', 'wrong_event', 'undone', 'offline_conflict')),
  device text,
  scanned_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);
create index check_ins_event_idx on check_ins (event_id, created_at desc);
create index check_ins_ticket_idx on check_ins (ticket_id);

-- ───────────────────────── Wachtlijst ─────────────────────────
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  first_name text not null,
  email text not null,
  persons integer not null default 1 check (persons between 1 and 20),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index waitlist_event_email_key on waitlist (event_id, lower(email));

-- ───────────────────────── Kosten ─────────────────────────
create table expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  category text not null check (category in ('venue', 'staff', 'marketing', 'payment_fees', 'insurance', 'other')),
  description text not null,
  amount_cents integer not null check (amount_cents >= 0),
  vat_cents integer check (vat_cents is null or vat_cents >= 0),
  incurred_on date not null default current_date,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index expenses_event_idx on expenses (event_id);
create trigger expenses_updated before update on expenses for each row execute function set_updated_at();

-- ───────────────────────── E-mail ─────────────────────────
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  to_email text not null,
  template text not null,
  subject text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  payload jsonb not null default '{}'::jsonb,
  provider_message_id text,
  error text,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_logs_status_idx on email_logs (status, created_at);
create index email_logs_order_idx on email_logs (order_id);

-- ───────────────────────── Audit ─────────────────────────
create table audit_logs (
  id bigserial primary key,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb,
  ip text,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on audit_logs (created_at desc);

-- ───────────────────────── Rate limiting ─────────────────────────
create table rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

-- ───────────────────────── Beveiliging ─────────────────────────
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema public from anon';
    execute 'revoke all on all sequences in schema public from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from authenticated';
    execute 'revoke all on all sequences in schema public from authenticated';
  end if;
end $$;
