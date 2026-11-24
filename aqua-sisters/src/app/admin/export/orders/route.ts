import { sql } from '@/lib/db';
import { apiAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { centsToCsv, toCsv } from '@/lib/csv';
import { ORDER_STATUS_LABEL } from '@/lib/order-data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await apiAdmin();
  if (!user) return new Response('Geen toegang', { status: 401 });
  const url = new URL(req.url);
  const eventId = url.searchParams.get('event');
  const status = url.searchParams.get('status');
  const rows = await sql<Record<string, unknown>[]>`
    select o.order_number, e.title, e.starts_at, o.first_name, o.last_name, o.email, o.phone, o.status,
      (select coalesce(sum(persons), 0) from order_items i where i.order_id = o.id)::int as persons,
      (select string_agg(i.quantity || 'x ' || i.name, ', ') from order_items i where i.order_id = o.id) as items,
      o.subtotal_cents, o.discount_cents, o.total_cents, o.refunded_cents, o.payment_method, o.created_at, o.paid_at,
      o.marketing_opt_in, o.utm->>'utm_source' as utm_source, o.utm->>'utm_campaign' as utm_campaign
    from orders o join events e on e.id = o.event_id
    where o.anonymized_at is null
      ${eventId && /^[0-9a-f-]{36}$/.test(eventId) ? sql`and o.event_id = ${eventId}` : sql``}
      ${status && status in ORDER_STATUS_LABEL ? sql`and o.status = ${status}` : sql``}
    order by o.created_at`;
  await audit(user.id, 'export.orders', 'order', null, { count: rows.length });
  const csv = toCsv(
    ['Bestelnummer', 'Evenement', 'Datum evenement', 'Voornaam', 'Achternaam', 'E-mail', 'Telefoon', 'Status', 'Personen', 'Tickets', 'Subtotaal', 'Korting', 'Totaal', 'Terugbetaald', 'Betaalmethode', 'Besteld', 'Betaald', 'Marketing', 'UTM bron', 'UTM campagne'],
    rows.map((r) => [
      r.order_number as string, r.title as string, (r.starts_at as Date).toISOString(), r.first_name as string, r.last_name as string, r.email as string, r.phone as string,
      ORDER_STATUS_LABEL[r.status as keyof typeof ORDER_STATUS_LABEL], r.persons as number, r.items as string,
      centsToCsv(r.subtotal_cents as number), centsToCsv(r.discount_cents as number), centsToCsv(r.total_cents as number), centsToCsv(r.refunded_cents as number),
      r.payment_method as string, (r.created_at as Date).toISOString(), r.paid_at ? (r.paid_at as Date).toISOString() : '', r.marketing_opt_in ? 'ja' : 'nee', r.utm_source as string, r.utm_campaign as string,
    ]),
  );
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="bestellingen-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } });
}
