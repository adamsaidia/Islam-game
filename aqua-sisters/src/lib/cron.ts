import 'server-only';
import { sql } from './db';
import { getSettings } from './settings';
import { deliverEmail, queueOrderEmail } from './email';
import { syncLatestPaymentForOrder } from './orders';
import { anonymizeOrders } from './privacy';

/** Periodieke taken. Veilig om vaak te draaien (alle stappen zijn idempotent). */
export async function runCron() {
  const s = await getSettings();
  const report: Record<string, number> = {};

  // 1. Verlopen reserveringen: eerst laatste betaalstatus ophalen (vangnet voor gemiste webhooks).
  const stale = await sql<{ id: string }[]>`
    select o.id from orders o where o.status = 'pending' and o.reserved_until < now()
      and exists (select 1 from payments p where p.order_id = o.id and p.status in ('open', 'pending', 'authorized'))
    order by o.reserved_until desc limit 50`;
  for (const o of stale) await syncLatestPaymentForOrder(o.id);
  const expired = await sql`update orders set status = 'expired' where status in ('pending', 'awaiting_transfer') and reserved_until < now() returning id`;
  report.synced = stale.length;
  report.expired = expired.length;

  // 2. Betalingsherinnering voor afgebroken bestellingen (alleen als er nog plek is).
  if (s.reminders.paymentReminderMinutes > 0) {
    const rows = await sql<{ id: string }[]>`
      select o.id from orders o join events e on e.id = o.event_id
      where o.status in ('expired', 'cancelled') and o.total_cents > 0 and o.anonymized_at is null
        and o.reserved_until < now() - make_interval(mins => ${s.reminders.paymentReminderMinutes})
        and o.created_at > now() - interval '2 days'
        and e.status = 'published' and not e.sales_paused and coalesce(e.sales_end_at, e.starts_at) > now()
        and event_persons_used(e.id) < e.capacity
        and not exists (select 1 from orders o2 where lower(o2.email) = lower(o.email) and o2.event_id = o.event_id and o2.status in ('paid','partially_refunded','pending','awaiting_transfer'))
        and not exists (select 1 from email_logs l where l.order_id = o.id and l.template = 'payment_reminder')
      limit 50`;
    // Eén herinnering per e-mailadres per evenement.
    const seen = new Set<string>();
    for (const r of rows) {
      const [o] = await sql<{ email: string; event_id: string }[]>`select email, event_id from orders where id = ${r.id}`;
      const key = `${o.email}:${o.event_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const [already] = await sql`select 1 from email_logs l join orders x on x.id = l.order_id where l.template = 'payment_reminder' and lower(x.email) = lower(${o.email}) and x.event_id = ${o.event_id}`;
      if (!already) await queueOrderEmail('payment_reminder', r.id);
    }
    report.paymentReminders = seen.size;
  }

  // 3. Evenementherinnering.
  if (s.reminders.eventReminderHours > 0) {
    const rows = await sql<{ id: string }[]>`
      select o.id from orders o join events e on e.id = o.event_id
      where o.status in ('paid', 'partially_refunded') and o.anonymized_at is null
        and e.starts_at > now() and e.starts_at < now() + make_interval(hours => ${s.reminders.eventReminderHours})
        and not exists (select 1 from email_logs l where l.order_id = o.id and l.template = 'event_reminder')
      limit 200`;
    for (const r of rows) await queueOrderEmail('event_reminder', r.id);
    report.eventReminders = rows.length;
  }

  // 4. Mislukte e-mails opnieuw proberen (max. 5 pogingen).
  const failed = await sql<{ id: string }[]>`select id from email_logs where status = 'failed' and attempts < 5 and created_at > now() - interval '3 days' order by created_at limit 50`;
  let resent = 0;
  for (const f of failed) if ((await deliverEmail(f.id)) === 'sent') resent++;
  report.emailRetries = resent;

  // 5. Bewaartermijn: persoonsgegevens anonimiseren.
  const old = await sql<{ id: string }[]>`
    select o.id from orders o join events e on e.id = o.event_id
    where o.anonymized_at is null and e.ends_at < now() - make_interval(months => ${s.privacy.retentionMonths}) limit 500`;
  report.anonymized = await anonymizeOrders(old.map((o) => o.id));
  const wl = await sql`delete from waitlist w using events e where e.id = w.event_id and e.ends_at < now() - interval '1 month' returning w.id`;
  report.waitlistPurged = wl.length;

  // 6. Opruimen.
  await sql`delete from sessions where expires_at < now()`;
  await sql`delete from rate_limits where window_start < now() - interval '1 day'`;
  await sql`delete from payment_webhook_events where received_at < now() - interval '180 days'`;

  return report;
}
