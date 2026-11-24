import { sql } from '@/lib/db';
import { apiAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { toCsv } from '@/lib/csv';
import { CATEGORY_LABEL, TICKET_STATUS_LABEL } from '@/lib/order-data';

export const dynamic = 'force-dynamic';

/** Gastenlijst per ticket – ook bruikbaar als papieren noodlijst bij internetstoring. */
export async function GET(req: Request) {
  const user = await apiAdmin();
  if (!user) return new Response('Geen toegang', { status: 401 });
  const eventId = new URL(req.url).searchParams.get('event');
  const rows = await sql<{ ticket_number: string; category: 'adult' | 'child'; status: keyof typeof TICKET_STATUS_LABEL; checked_in_at: Date | null; order_number: string; name: string; email: string; type: string; title: string }[]>`
    select t.ticket_number, t.category, t.status, t.checked_in_at, o.order_number, o.last_name || ', ' || o.first_name as name, o.email, tt.name as type, e.title
    from tickets t join orders o on o.id = t.order_id join ticket_types tt on tt.id = t.ticket_type_id join events e on e.id = t.event_id
    where true ${eventId && /^[0-9a-f-]{36}$/.test(eventId) ? sql`and t.event_id = ${eventId}` : sql``}
    order by o.last_name, o.first_name, t.ticket_number`;
  await audit(user.id, 'export.tickets', 'ticket', null, { count: rows.length });
  const csv = toCsv(
    ['Naam hoofdboeker', 'Ticketnummer', 'Type', 'Categorie', 'Status', 'Ingecheckt', 'Bestelnummer', 'E-mail', 'Evenement'],
    rows.map((r) => [r.name, r.ticket_number, r.type, CATEGORY_LABEL[r.category], TICKET_STATUS_LABEL[r.status], r.checked_in_at ? r.checked_in_at.toISOString() : '', r.order_number, r.email, r.title]),
  );
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="gastenlijst-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } });
}
