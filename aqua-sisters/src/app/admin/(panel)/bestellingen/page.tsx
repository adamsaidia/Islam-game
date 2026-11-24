import Link from 'next/link';
import { PageHeader, Status, TableWrap, Empty, LinkButton } from '@/components/admin/ui';
import { EventFilter } from '@/components/admin/EventFilter';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { eventOptions } from '@/lib/admin-data';
import { formatDateTime } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { ORDER_STATUS_LABEL, type OrderRow } from '@/lib/order-data';

export const dynamic = 'force-dynamic';
const PAGE = 50;

type Search = { q?: string; status?: string; event?: string; page?: string };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q || '').trim().slice(0, 100);
  const status = sp.status && sp.status in ORDER_STATUS_LABEL ? sp.status : '';
  const eventId = sp.event && /^[0-9a-f-]{36}$/.test(sp.event) ? sp.event : '';
  const page = Math.max(1, Number(sp.page) || 1);
  const like = `%${q.replace(/[%_\\]/g, (m) => '\\' + m)}%`;

  const where = sql`
    where true
    ${eventId ? sql`and o.event_id = ${eventId}` : sql``}
    ${status ? sql`and o.status = ${status}` : sql``}
    ${q ? sql`and (o.order_number ilike ${like} or o.email ilike ${like} or (o.first_name || ' ' || o.last_name) ilike ${like}
              or o.phone ilike ${like} or exists (select 1 from tickets t where t.order_id = o.id and t.ticket_number ilike ${like}))` : sql``}`;

  const [rows, [{ count }], events] = await Promise.all([
    sql<(OrderRow & { persons: number; city: string; method: string | null; checked: number })[]>`
      select o.*, e.city,
        (select coalesce(sum(persons), 0) from order_items i where i.order_id = o.id)::int as persons,
        (select count(*) from tickets t where t.order_id = o.id and t.status = 'checked_in')::int as checked,
        coalesce(o.payment_method, (select p.method from payments p where p.order_id = o.id order by p.created_at desc limit 1)) as method
      from orders o join events e on e.id = o.event_id ${where}
      order by o.created_at desc limit ${PAGE} offset ${(page - 1) * PAGE}`,
    sql<{ count: number }[]>`select count(*)::int as count from orders o ${where}`,
    eventOptions(),
  ]);
  const qs = (p: Record<string, string>) => new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(eventId && { event: eventId }), ...p }).toString();

  return (
    <>
      <PageHeader
        title="Bestellingen"
        actions={
          <>
            <LinkButton href="/admin/bestellingen/nieuw" variant="primary">Gratis / handmatige tickets</LinkButton>
            <a className="btn btn-ghost btn-sm text-deep" href={`/admin/export/orders?${qs({})}`}>Export bestellingen (CSV)</a>
            <a className="btn btn-ghost btn-sm text-deep" href={`/admin/export/tickets?${qs({})}`}>Export tickets / gastenlijst</a>
          </>
        }
      />
      <form className="mb-6 flex flex-col gap-3 sm:flex-row" role="search">
        <input name="q" defaultValue={q} placeholder="Zoek op naam, e-mail, bestel- of ticketnummer" className="input sm:max-w-sm" />
        <select name="status" defaultValue={status} className="input sm:max-w-[14rem]" aria-label="Status">
          <option value="">Alle statussen</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {eventId && <input type="hidden" name="event" value={eventId} />}
        <button className="btn btn-primary btn-sm">Zoeken</button>
      </form>
      <div className="mb-6"><EventFilter events={events} value={eventId} allLabel="Alle evenementen" /></div>
      <p className="mb-3 text-xs text-muted">{count} bestelling(en)</p>
      {rows.length === 0 ? (
        <Empty>Geen bestellingen gevonden.</Empty>
      ) : (
        <TableWrap>
          <table className="table">
            <thead>
              <tr><th>Bestelling</th><th>Naam</th><th>Tickets</th><th className="text-right">Bedrag</th><th>Betaling</th><th>Status</th><th>Datum</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/bestellingen/${o.id}`} className="font-mono text-deep underline-offset-4 hover:underline">{o.order_number}</Link><div className="text-xs text-muted">{o.city}</div></td>
                  <td>{o.anonymized_at ? <span className="text-muted">geanonimiseerd</span> : <>{o.first_name} {o.last_name}<div className="text-xs text-muted">{o.email}{o.phone && ` · ${o.phone}`}</div></>}</td>
                  <td className="tabular-nums">{o.persons}{o.checked > 0 && <div className="text-xs text-petrol">{o.checked} binnen</div>}</td>
                  <td className="text-right tabular-nums">{formatEuro(o.total_cents)}{o.refunded_cents > 0 && <div className="text-xs text-danger">−{formatEuro(o.refunded_cents)}</div>}</td>
                  <td className="text-xs">{o.method ?? '—'}</td>
                  <td><Status value={o.status} label={ORDER_STATUS_LABEL[o.status]} /></td>
                  <td className="whitespace-nowrap text-xs">{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
      <div className="mt-6 flex gap-3 text-sm">
        {page > 1 && <Link className="underline" href={`?${qs({ page: String(page - 1) })}`}>← Vorige</Link>}
        {page * PAGE < count && <Link className="underline" href={`?${qs({ page: String(page + 1) })}`}>Volgende →</Link>}
      </div>
    </>
  );
}
