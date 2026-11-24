import { PageHeader, Section, TableWrap, Empty } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatDateTime } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export default async function LogPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab } = await searchParams;
  const scans = tab === 'scans';
  const rows = scans
    ? await sql<{ id: string; at: Date; who: string | null; what: string; detail: string }[]>`
        select c.id, c.scanned_at as at, u.name as who, c.action || ' → ' || c.result as what,
               coalesce(t.ticket_number, c.note, '') || coalesce(' · ' || c.device, '') || coalesce(' · ' || e.city, '') as detail
        from check_ins c left join users u on u.id = c.user_id left join tickets t on t.id = c.ticket_id left join events e on e.id = c.event_id
        order by c.created_at desc limit 300`
    : await sql<{ id: string; at: Date; who: string | null; what: string; detail: string }[]>`
        select a.id::text, a.created_at as at, u.name as who, a.action as what,
               coalesce(a.entity, '') || coalesce(' ' || a.entity_id, '') || coalesce(' · ' || left(a.details::text, 160), '') as detail
        from audit_logs a left join users u on u.id = a.actor_user_id order by a.created_at desc limit 300`;
  return (
    <>
      <PageHeader title="Logboek" />
      <div className="mb-6 flex gap-5 text-sm">
        <a href="?" className={!scans ? 'text-deep underline underline-offset-4' : 'text-muted'}>Wijzigingen (audit)</a>
        <a href="?tab=scans" className={scans ? 'text-deep underline underline-offset-4' : 'text-muted'}>Scanlogboek</a>
      </div>
      <Section title={scans ? 'Laatste 300 scans' : 'Laatste 300 acties'}>
        {rows.length === 0 ? <Empty>Nog niets gelogd.</Empty> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Tijd</th><th>Wie</th><th>Actie</th><th>Details</th></tr></thead>
              <tbody>{rows.map((r) => <tr key={r.id}><td className="whitespace-nowrap text-xs">{formatDateTime(r.at)}</td><td className="text-xs">{r.who ?? 'systeem'}</td><td className="text-xs">{r.what}</td><td className="break-all text-xs text-muted">{r.detail}</td></tr>)}</tbody>
            </table>
          </TableWrap>
        )}
      </Section>
    </>
  );
}
