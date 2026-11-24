import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type postgres from 'postgres';
import { client, createOrder, makeEvent, resetDatabase } from './helpers';

let sql: postgres.Sql;

beforeAll(async () => {
  await resetDatabase();
  sql = client(40);
});
afterAll(async () => {
  await sql?.end();
});

const confirm = async (orderId: string, amount: number, method = 'ideal') =>
  (await sql<{ r: { result: string; tickets?: number } }[]>`select confirm_order_paid(${orderId}, ${amount}, ${method}) as r`)[0].r;
const checkIn = async (token: string | null, eventId: string, ticketId: string | null = null) =>
  (await sql<{ r: { result: string; ticket_number?: string } }[]>`select check_in_ticket(${token}, ${ticketId}, ${eventId}, null, 'test', 'scan') as r`)[0].r;

describe('eerste evenement (seed)', () => {
  it('bevat Utrecht 9 januari 2027, 18.00–20.00, €13,50/€8,00, 300 plekken, geen leeftijdsgrens', async () => {
    const [e] = await sql`select * from events where slug = 'utrecht-9-januari-2027'`;
    expect(e.capacity).toBe(300);
    expect(e.venue_name).toBe('Zwembad Den Hommel');
    expect(e.dress_code).toBe('Burkini verplicht');
    expect(new Date(e.starts_at).toISOString()).toBe('2027-01-09T17:00:00.000Z');
    expect(new Date(e.ends_at).toISOString()).toBe('2027-01-09T19:00:00.000Z');
    expect(e.child_age_min).toBeNull();
    expect(e.child_age_max).toBeNull();
    const types = await sql`select name, price_cents from ticket_types where event_id = ${e.id} order by sort_order`;
    expect(types.map((t) => [t.name, t.price_cents])).toEqual([['Volwassene', 1350], ['Kind', 800]]);
  });
});

describe('bestellen en betalen', () => {
  it('maakt per persoon een ticket met unieke, niet-voorspelbare QR-code', async () => {
    const ev = await makeEvent(sql);
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }, { ticket_type_id: ev.child, quantity: 2 }]);
    expect(o.ok).toBe(true);
    expect(o.total_cents).toBe(4300);
    expect(await confirm(o.order_id, 4300)).toEqual({ result: 'paid', tickets: 4 });
    const t = await sql`select qr_token, ticket_number, category from tickets where order_id = ${o.order_id}`;
    expect(t).toHaveLength(4);
    expect(new Set(t.map((x) => x.qr_token)).size).toBe(4);
    for (const x of t) {
      expect(x.qr_token).toMatch(/^[A-Za-z0-9_-]{40,}$/);
      expect(x.ticket_number).toMatch(/^AS-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    }
    expect(t.filter((x) => x.category === 'child')).toHaveLength(2);
  });

  it('is idempotent: herhaalde bevestiging geeft geen extra tickets', async () => {
    const ev = await makeEvent(sql);
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }]);
    await confirm(o.order_id, 1350);
    const again = await Promise.all([confirm(o.order_id, 1350), confirm(o.order_id, 1350), confirm(o.order_id, 1350)]);
    expect(again.every((r) => r.result === 'already_paid')).toBe(true);
    const [{ n }] = await sql`select count(*)::int as n from tickets where order_id = ${o.order_id}`;
    expect(n).toBe(1);
  });

  it('weigert een onjuist betaald bedrag', async () => {
    const ev = await makeEvent(sql);
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }]);
    expect((await confirm(o.order_id, 1)).result).toBe('amount_mismatch');
    const [{ n }] = await sql`select count(*)::int as n from tickets where order_id = ${o.order_id}`;
    expect(n).toBe(0);
  });

  it('respecteert verkoopstatus (gepauzeerd, concept, gesloten)', async () => {
    const ev = await makeEvent(sql);
    await sql`update events set sales_paused = true where id = ${ev.eventId}`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }])).error).toBe('sales_paused');
    await sql`update events set sales_paused = false, status = 'draft' where id = ${ev.eventId}`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }])).error).toBe('not_available');
    await sql`update events set status = 'published', sales_end_at = now() - interval '1 minute' where id = ${ev.eventId}`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }])).error).toBe('sales_closed');
  });

  it('weigert tickettypes van een ander evenement en lege bestellingen', async () => {
    const a = await makeEvent(sql);
    const b = await makeEvent(sql);
    expect((await createOrder(sql, a.eventId, [{ ticket_type_id: b.adult, quantity: 1 }])).error).toBe('invalid_ticket_type');
    expect((await createOrder(sql, a.eventId, [{ ticket_type_id: a.adult, quantity: 0 }])).error).toBe('no_items');
  });

  it('beheerder kan gratis tickets uitgeven (totaal €0)', async () => {
    const ev = await makeEvent(sql);
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }], { admin: true, free: true });
    expect(o.total_cents).toBe(0);
    expect((await confirm(o.order_id, 0, 'free')).result).toBe('paid');
  });

  it('bezoeker kan geen gratis tickets forceren', async () => {
    const ev = await makeEvent(sql);
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }], { admin: false, free: true });
    expect(o.total_cents).toBe(1350);
  });
});

describe('capaciteit', () => {
  it('verkoopt nooit meer dan de capaciteit bij 50 gelijktijdige bestellingen', async () => {
    const ev = await makeEvent(sql, { capacity: 30 });
    const results = await Promise.all(
      Array.from({ length: 50 }, () => createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }])),
    );
    const ok = results.filter((r) => r.ok);
    expect(ok).toHaveLength(15);
    expect(results.filter((r) => !r.ok).every((r) => r.error === 'sold_out')).toBe(true);
    await Promise.all(ok.map((o) => confirm(o.order_id, 2700)));
    const [{ n }] = await sql`select count(*)::int as n from tickets where event_id = ${ev.eventId}`;
    expect(n).toBe(30);
  });

  it('geeft verlopen reserveringen automatisch vrij', async () => {
    const ev = await makeEvent(sql, { capacity: 2 });
    const first = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }]);
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }])).error).toBe('sold_out');
    await sql`update orders set reserved_until = now() - interval '1 second' where id = ${first.order_id}`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }])).ok).toBe(true);
  });

  it('late betaling na verlopen reservering: uitgifte als er plek is, anders over_capacity', async () => {
    const ev = await makeEvent(sql, { capacity: 2 });
    const late = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }]);
    await sql`update orders set reserved_until = now() - interval '1 second' where id = ${late.order_id}`;
    const other = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }]);
    await confirm(other.order_id, 2700);
    expect((await confirm(late.order_id, 2700)).result).toBe('over_capacity');
    const [o] = await sql`select status from orders where id = ${late.order_id}`;
    expect(o.status).toBe('over_capacity');

    const ev2 = await makeEvent(sql, { capacity: 5 });
    const late2 = await createOrder(sql, ev2.eventId, [{ ticket_type_id: ev2.adult, quantity: 2 }]);
    await sql`update orders set reserved_until = now() - interval '1 second', status = 'expired' where id = ${late2.order_id}`;
    expect((await confirm(late2.order_id, 2700)).result).toBe('paid');
  });

  it('bewaakt de eigen limiet van een tickettype (bijv. earlybird)', async () => {
    const ev = await makeEvent(sql);
    await sql`update ticket_types set capacity = 3 where id = ${ev.adult}`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }])).ok).toBe(true);
    const r = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }]);
    expect(r.error).toBe('ticket_type_sold_out');
    expect(r.remaining).toBe(1);
  });
});

describe('kortingscodes', () => {
  it('past korting toe en respecteert het maximum, ook gelijktijdig', async () => {
    const ev = await makeEvent(sql);
    await sql`insert into discount_codes (code, kind, amount, max_uses) values ('ZOMER10', 'percent', 10, 3)`;
    const results = await Promise.all(Array.from({ length: 10 }, () => createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 2 }], { code: 'zomer10' })));
    const ok = results.filter((r) => r.ok);
    expect(ok).toHaveLength(3);
    expect(ok[0].total_cents).toBe(2430);
    expect(results.filter((r) => !r.ok).every((r) => r.error === 'discount_exhausted')).toBe(true);
  });
  it('weigert verlopen of onbekende codes', async () => {
    const ev = await makeEvent(sql);
    await sql`insert into discount_codes (code, kind, amount, ends_at) values ('OUD', 'fixed', 500, now() - interval '1 day')`;
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }], { code: 'OUD' })).error).toBe('invalid_discount');
    expect((await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }], { code: 'BESTAATNIET' })).error).toBe('invalid_discount');
  });
});

describe('check-in', () => {
  async function paidTicket(capacity = 300) {
    const ev = await makeEvent(sql, { capacity });
    const o = await createOrder(sql, ev.eventId, [{ ticket_type_id: ev.adult, quantity: 1 }]);
    await confirm(o.order_id, 1350);
    const [t] = await sql<{ id: string; qr_token: string }[]>`select id, qr_token from tickets where order_id = ${o.order_id}`;
    return { ...ev, ticket: t, orderId: o.order_id };
  }

  it('groen bij eerste scan, rood bij tweede scan', async () => {
    const p = await paidTicket();
    expect((await checkIn(p.ticket.qr_token, p.eventId)).result).toBe('ok');
    expect((await checkIn(p.ticket.qr_token, p.eventId)).result).toBe('already_used');
  });

  it('accepteert hetzelfde ticket maar één keer bij 20 gelijktijdige scanners', async () => {
    const p = await paidTicket();
    const results = await Promise.all(Array.from({ length: 20 }, () => checkIn(p.ticket.qr_token, p.eventId)));
    expect(results.filter((r) => r.result === 'ok')).toHaveLength(1);
    expect(results.filter((r) => r.result === 'already_used')).toHaveLength(19);
    const [{ n }] = await sql`select count(*)::int as n from check_ins where ticket_id = ${p.ticket.id}`;
    expect(n).toBe(20);
  });

  it('oranje bij ander evenement, rood bij ongeldig of geannuleerd', async () => {
    const p = await paidTicket();
    const other = await makeEvent(sql);
    expect((await checkIn(p.ticket.qr_token, other.eventId)).result).toBe('wrong_event');
    expect((await checkIn('x'.repeat(43), p.eventId)).result).toBe('invalid');
    await sql`update tickets set status = 'cancelled' where id = ${p.ticket.id}`;
    expect((await checkIn(p.ticket.qr_token, p.eventId)).result).toBe('cancelled');
  });

  it('handmatig inchecken via ticket-ID en correctie terugdraaien', async () => {
    const p = await paidTicket();
    expect((await checkIn(null, p.eventId, p.ticket.id)).result).toBe('ok');
    const [{ ok }] = await sql`select undo_check_in(${p.ticket.id}, null, 'test') as ok`;
    expect(ok).toBe(true);
    expect((await checkIn(p.ticket.qr_token, p.eventId)).result).toBe('ok');
  });

  it('QR-code bevat geen persoonsgegevens', async () => {
    const p = await paidTicket();
    expect(p.ticket.qr_token).not.toMatch(/fatima|test|@/i);
  });
});

describe('beveiliging database', () => {
  it('heeft RLS op alle tabellen', async () => {
    const rows = await sql`select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
                           where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`;
    expect(rows.map((r) => r.relname)).toEqual([]);
  });
  it('bedragen zijn integers (eurocenten)', async () => {
    const rows = await sql`select table_name, column_name, data_type from information_schema.columns
                           where table_schema = 'public' and column_name like '%cents%' and data_type <> 'integer'`;
    expect(rows).toEqual([]);
  });
  it('rate limiter telt per venster', async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push((await sql`select rate_limit_hit('t:1', 60, 3) as ok`)[0].ok);
    expect(results).toEqual([true, true, true, false]);
  });
});
