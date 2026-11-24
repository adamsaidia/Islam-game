import Link from 'next/link';
import { PageHeader, Status, TableWrap, Empty, LinkButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatDateShort, formatTimeRange } from '@/lib/dates';
import { formatEuro } from '@/lib/money';

export const dynamic = 'force-dynamic';

const STATUS = { draft: 'Concept', published: 'Gepubliceerd', hidden: 'Verborgen', archived: 'Gearchiveerd' } as const;

export default async function EventsPage() {
  await requireAdmin();
  const events = await sql<{ id: string; title: string; city: string; venue_name: string; starts_at: Date; ends_at: Date; status: keyof typeof STATUS; sales_paused: boolean; capacity: number; sold: number; used: number; revenue: number }[]>`
    select e.id, e.title, e.city, e.venue_name, e.starts_at, e.ends_at, e.status, e.sales_paused, e.capacity,
      (select count(*) from tickets t where t.event_id = e.id and t.status in ('valid','checked_in'))::int as sold,
      event_persons_used(e.id) as used,
      (select coalesce(sum(o.total_cents - o.refunded_cents), 0) from orders o where o.event_id = e.id and o.status in ('paid','partially_refunded','refunded'))::int as revenue
    from events e order by e.starts_at desc`;
  return (
    <>
      <PageHeader title="Evenementen" actions={<LinkButton href="/admin/evenementen/nieuw" variant="primary">Nieuw evenement</LinkButton>} />
      {events.length === 0 ? (
        <Empty>Nog geen evenementen.</Empty>
      ) : (
        <TableWrap>
          <table className="table">
            <thead>
              <tr><th>Datum</th><th>Evenement</th><th>Status</th><th className="text-right">Verkocht</th><th className="text-right">Omzet</th></tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{formatDateShort(e.starts_at)}<div className="text-xs text-muted">{formatTimeRange(e.starts_at, e.ends_at)}</div></td>
                  <td>
                    <Link className="text-deep underline-offset-4 hover:underline" href={`/admin/evenementen/${e.id}`}>{e.title}</Link>
                    <div className="text-xs text-muted">{e.venue_name}, {e.city}</div>
                  </td>
                  <td><Status value={e.status} label={STATUS[e.status]} />{e.sales_paused && <div className="text-xs text-warn">verkoop gepauzeerd</div>}</td>
                  <td className="text-right tabular-nums">{e.sold} / {e.capacity}{e.used > e.sold && <div className="text-xs text-muted">+{e.used - e.sold} gereserveerd</div>}</td>
                  <td className="text-right tabular-nums">{formatEuro(e.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
