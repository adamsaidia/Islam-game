import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type postgres from 'postgres';
import { client, makeEvent, resetDatabase } from './helpers';
import { placeOrder, syncPayment, refundOrder } from '@/lib/orders';
import { POST as webhook } from '@/app/api/webhooks/[provider]/route';
import { runCron } from '@/lib/cron';

let sql: postgres.Sql;

beforeAll(async () => {
  await resetDatabase();
  sql = client(10);
});
afterAll(async () => {
  await sql?.end();
  await globalThis.__aquaSql?.end();
});

async function order(eventId: string, items: { ticketTypeId: string; quantity: number }[], extra: Partial<Parameters<typeof placeOrder>[0]> = {}) {
  const r = await placeOrder({
    eventId,
    firstName: 'Samira',
    lastName: 'Test',
    email: 'samira@example.com',
    phone: '',
    items,
    discountCode: '',
    paymentMethod: 'online',
    acceptTerms: true,
    marketingOptIn: false,
    ...extra,
  });
  if (!r.ok) throw new Error(r.message);
  const [o] = await sql<{ id: string; status: string; access_token: string }[]>`select id, status, access_token from orders order by created_at desc limit 1`;
  const [p] = await sql<{ provider_payment_id: string }[]>`select provider_payment_id from payments where order_id = ${o.id} order by created_at desc limit 1`;
  return { redirectUrl: r.redirectUrl, order: o, paymentId: p?.provider_payment_id };
}

async function setMock(paymentId: string, status: string, amount?: number) {
  await sql`update payments set raw = coalesce(raw, '{}'::jsonb) || ${sql.json({ mock_status: status, ...(amount != null ? { mock_amount: amount } : {}) })} where provider_payment_id = ${paymentId}`;
}

async function callWebhook(id: string) {
  const res = await webhook(new Request('http://localhost/api/webhooks/mock', { method: 'POST', body: new URLSearchParams({ id }) }), {
    params: Promise.resolve({ provider: 'mock' }),
  });
  return res.status;
}

const ticketCount = async (orderId: string) => (await sql<{ n: number }[]>`select count(*)::int as n from tickets where order_id = ${orderId}`)[0].n;
const orderStatus = async (orderId: string) => (await sql<{ status: string }[]>`select status from orders where id = ${orderId}`)[0].status;

describe('betaalflow via webhook', () => {
  it('stuurt de bezoeker naar de checkout en reserveert plekken', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }, { ticketTypeId: ev.child, quantity: 1 }]);
    expect(o.redirectUrl).toContain('/test-betaling/mock_');
    expect(o.order.status).toBe('pending');
    const [p] = await sql`select amount_cents from payments where provider_payment_id = ${o.paymentId}`;
    expect(p.amount_cents).toBe(3500);
    expect(await ticketCount(o.order.id)).toBe(0); // geen tickets vóór bevestigde betaling
  });

  it('geslaagde betaling → tickets + e-mail gelogd; herhaalde webhooks zijn idempotent', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }, { ticketTypeId: ev.child, quantity: 2 }]);
    await setMock(o.paymentId, 'paid');
    expect(await callWebhook(o.paymentId)).toBe(200);
    expect(await callWebhook(o.paymentId)).toBe(200);
    await Promise.all([callWebhook(o.paymentId), callWebhook(o.paymentId), callWebhook(o.paymentId)]);
    expect(await orderStatus(o.order.id)).toBe('paid');
    expect(await ticketCount(o.order.id)).toBe(4);
    const mails = await sql`select template, status, error from email_logs where order_id = ${o.order.id}`;
    expect(mails).toHaveLength(1); // precies één ticketmail
    expect(mails[0].template).toBe('tickets');
    expect(mails[0].error).toBe('RESEND_API_KEY ontbreekt'); // geen sleutel in test: netjes gelogd
    const events = await sql`select count(*)::int as n from payment_webhook_events where provider_object_id = ${o.paymentId}`;
    expect(events[0].n).toBe(5);
  });

  it('mislukte, geannuleerde en verlopen betalingen geven plekken vrij zonder tickets', async () => {
    for (const status of ['failed', 'canceled', 'expired']) {
      const ev = await makeEvent(sql, { capacity: 2 });
      const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }]);
      await setMock(o.paymentId, status);
      await callWebhook(o.paymentId);
      expect(await orderStatus(o.order.id)).toBe(status === 'expired' ? 'expired' : 'cancelled');
      expect(await ticketCount(o.order.id)).toBe(0);
      const [{ used }] = await sql`select event_persons_used(${ev.eventId}) as used`;
      expect(used).toBe(0);
    }
  });

  it('onjuist bedrag bij provider → geen tickets, wel auditlog', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 1 }]);
    await setMock(o.paymentId, 'paid', 1);
    await callWebhook(o.paymentId);
    expect(await ticketCount(o.order.id)).toBe(0);
    const [a] = await sql`select count(*)::int as n from audit_logs where action = 'payment.amount_mismatch'`;
    expect(a.n).toBeGreaterThan(0);
  });

  it('onbekend betaal-ID geeft 200 zonder effect; ongeldig ID 400', async () => {
    expect(await callWebhook('mock_onbekend123')).toBe(200);
    expect(await callWebhook('../../etc')).toBe(400);
  });

  it('betaling na verlopen reservering in een vol evenement → automatisch terugbetaald', async () => {
    const ev = await makeEvent(sql, { capacity: 2 });
    const late = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }]);
    await sql`update orders set reserved_until = now() - interval '1 second' where id = ${late.order.id}`;
    const other = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }], { email: 'ander@example.com' });
    await setMock(other.paymentId, 'paid');
    await callWebhook(other.paymentId);
    await setMock(late.paymentId, 'paid');
    await callWebhook(late.paymentId);
    expect(await ticketCount(late.order.id)).toBe(0);
    const [o] = await sql`select status, refunded_cents from orders where id = ${late.order.id}`;
    expect(o.status).toBe('refunded');
    expect(o.refunded_cents).toBe(2700);
    const [{ n }] = await sql`select count(*)::int as n from tickets where event_id = ${ev.eventId}`;
    expect(n).toBe(2);
  });

  it('dubbele betaling (twee pogingen) → tweede automatisch teruggestort, geen dubbele tickets', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 1 }]);
    // tweede betaalpoging forceren (eerste niet hergebruiken)
    await sql`update payments set created_at = now() - interval '1 hour' where provider_payment_id = ${o.paymentId}`;
    const { startPayment } = await import('@/lib/orders');
    await startPayment(o.order.id);
    const pays = await sql<{ provider_payment_id: string }[]>`select provider_payment_id from payments where order_id = ${o.order.id} order by created_at`;
    expect(pays).toHaveLength(2);
    for (const p of pays) {
      await setMock(p.provider_payment_id, 'paid');
      await callWebhook(p.provider_payment_id);
    }
    expect(await ticketCount(o.order.id)).toBe(1);
    const refunds = await sql`select reason from refunds where order_id = ${o.order.id}`;
    expect(refunds).toHaveLength(1);
    expect(refunds[0].reason).toContain('dubbele betaling');
  });
});

describe('terugbetalingen', () => {
  async function paidOrder() {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 2 }, { ticketTypeId: ev.child, quantity: 1 }]);
    await setMock(o.paymentId, 'paid');
    await syncPayment('mock', o.paymentId);
    return o.order.id;
  }

  it('gedeeltelijke terugbetaling met annulering van één ticket', async () => {
    const id = await paidOrder();
    const [child] = await sql<{ id: string }[]>`select id from tickets where order_id = ${id} and category = 'child'`;
    const r = await refundOrder(id, { amountCents: 800, reason: 'kind ziek', actorId: null, ticketIds: [child.id] });
    expect(r.ok).toBe(true);
    const [o] = await sql`select status, refunded_cents from orders where id = ${id}`;
    expect(o).toMatchObject({ status: 'partially_refunded', refunded_cents: 800 });
    const [t] = await sql`select status from tickets where id = ${child.id}`;
    expect(t.status).toBe('refunded');
  });

  it('volledige terugbetaling maakt alle tickets ongeldig', async () => {
    const id = await paidOrder();
    const r = await refundOrder(id, { amountCents: 3500, reason: 'annulering', actorId: null, ticketIds: [] });
    expect(r.ok).toBe(true);
    const tickets = await sql`select status from tickets where order_id = ${id}`;
    expect(tickets.every((t) => t.status === 'refunded')).toBe(true);
    expect(await orderStatus(id)).toBe('refunded');
  });

  it('weigert meer terug te betalen dan betaald', async () => {
    const id = await paidOrder();
    const r = await refundOrder(id, { amountCents: 999999, reason: 'x', actorId: null, ticketIds: [] });
    expect(r.ok).toBe(false);
  });
});

describe('gratis bestelling via kortingscode', () => {
  it('slaat de betaalprovider over en geeft direct tickets', async () => {
    const ev = await makeEvent(sql);
    await sql`insert into discount_codes (code, kind, amount) values ('GRATIS100', 'percent', 100)`;
    const r = await placeOrder({ eventId: ev.eventId, firstName: 'A', lastName: 'B', email: 'a@b.nl', phone: '', items: [{ ticketTypeId: ev.adult, quantity: 1 }], discountCode: 'GRATIS100', paymentMethod: 'online', acceptTerms: true, marketingOptIn: false });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.redirectUrl).toContain('/bestelling/');
    const [o] = await sql`select id, status, total_cents from orders order by created_at desc limit 1`;
    expect(o).toMatchObject({ status: 'paid', total_cents: 0 });
    expect(await ticketCount(o.id)).toBe(1);
  });
});

describe('periodieke taken (cron)', () => {
  it('zet verlopen reserveringen op expired en ruimt op', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 1 }]);
    await sql`update orders set reserved_until = now() - interval '1 minute' where id = ${o.order.id}`;
    const report = await runCron();
    expect(report.expired).toBeGreaterThanOrEqual(1);
    expect(await orderStatus(o.order.id)).toBe('expired');
  });

  it('vangt een gemiste webhook op: betaalde maar verlopen reservering wordt alsnog verwerkt', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 1 }]);
    await setMock(o.paymentId, 'paid');
    await sql`update orders set reserved_until = now() - interval '1 minute' where id = ${o.order.id}`;
    await runCron();
    expect(await orderStatus(o.order.id)).toBe('paid');
    expect(await ticketCount(o.order.id)).toBe(1);
  });

  it('anonimiseert persoonsgegevens na de bewaartermijn', async () => {
    const ev = await makeEvent(sql);
    const o = await order(ev.eventId, [{ ticketTypeId: ev.adult, quantity: 1 }]);
    await sql`update events set starts_at = now() - interval '30 months', ends_at = now() - interval '30 months' + interval '2 hours' where id = ${ev.eventId}`;
    await runCron();
    const [row] = await sql`select first_name, email, anonymized_at, total_cents from orders where id = ${o.order.id}`;
    expect(row.first_name).toBe('Geanonimiseerd');
    expect(row.email).toMatch(/@invalid\.invalid$/);
    expect(row.anonymized_at).not.toBeNull();
    expect(row.total_cents).toBe(1350); // financiële gegevens blijven
  });
});
