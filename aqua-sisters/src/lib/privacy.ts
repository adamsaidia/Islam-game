import 'server-only';
import { sql } from './db';

/** Verwijdert persoonsgegevens; financiële gegevens (bedragen, data) blijven voor de wettelijke bewaarplicht. */
export async function anonymizeOrders(orderIds: string[]) {
  if (!orderIds.length) return 0;
  const rows = await sql<{ id: string }[]>`
    update orders set first_name = 'Geanonimiseerd', last_name = '-', email = 'anon-' || left(id::text, 8) || '@invalid.invalid',
      phone = null, utm = null, note = null, marketing_opt_in = false, anonymized_at = now()
    where id = any(${orderIds}::uuid[]) and anonymized_at is null returning id`;
  await sql`update email_logs set to_email = 'geanonimiseerd', payload = '{}'::jsonb where order_id = any(${orderIds}::uuid[])`;
  return rows.length;
}

export async function findPersonData(email: string) {
  const e = email.trim().toLowerCase();
  const [orders, waitlist, emails] = await Promise.all([
    sql`select o.id, o.order_number, o.first_name, o.last_name, o.email, o.phone, o.status, o.total_cents, o.created_at, o.paid_at,
               o.marketing_opt_in, o.marketing_opt_in_at, o.utm, ev.title as event, ev.starts_at
        from orders o join events ev on ev.id = o.event_id where lower(o.email) = ${e} order by o.created_at`,
    sql`select w.id, w.first_name, w.email, w.persons, w.created_at, w.notified_at, ev.title as event
        from waitlist w join events ev on ev.id = w.event_id where lower(w.email) = ${e}`,
    sql`select template, subject, status, created_at from email_logs where lower(to_email) = ${e} order by created_at`,
  ]);
  const tickets = orders.length
    ? await sql`select t.ticket_number, t.category, t.status, t.checked_in_at, o.order_number from tickets t join orders o on o.id = t.order_id where o.id = any(${orders.map((o) => o.id as string)}::uuid[])`
    : [];
  return { email: e, orders, tickets, waitlist, emails };
}
