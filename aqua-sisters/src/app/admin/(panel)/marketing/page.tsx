import { PageHeader, Flash, Section, TableWrap, Empty, Status } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { eventOptions } from '@/lib/admin-data';
import { formatDateTime } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { saveDiscount, toggleDiscount } from './actions';

export const dynamic = 'force-dynamic';

export default async function MarketingPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [codes, events, sources, [optins]] = await Promise.all([
    sql<{ id: string; code: string; kind: string; amount: number; max_uses: number | null; uses: number; starts_at: Date | null; ends_at: Date | null; is_active: boolean; description: string | null; city: string | null; discount_total: number }[]>`
      select d.*, discount_code_uses(d.id) as uses, e.city,
        (select coalesce(sum(o.discount_cents), 0) from orders o where o.discount_code_id = d.id and o.status in ('paid','partially_refunded'))::int as discount_total
      from discount_codes d left join events e on e.id = d.event_id order by d.created_at desc`,
    eventOptions(),
    sql<{ source: string; campaign: string; orders: number; tickets: number; revenue: number }[]>`
      select coalesce(o.utm->>'utm_source', 'direct') as source, coalesce(o.utm->>'utm_campaign', '—') as campaign,
             count(*)::int as orders,
             (select count(*) from tickets t where t.order_id = any(array_agg(o.id)))::int as tickets,
             sum(o.total_cents - o.refunded_cents)::int as revenue
      from orders o where o.status in ('paid','partially_refunded') group by 1, 2 order by revenue desc limit 30`,
    sql<{ n: number }[]>`select count(distinct lower(email))::int as n from orders where marketing_opt_in and anonymized_at is null`,
  ]);
  return (
    <>
      <PageHeader title="Marketing" actions={<a className="btn btn-ghost btn-sm text-deep" href="/admin/export/newsletter">Nieuwsbrieflijst exporteren ({optins.n})</a>} />
      <Flash msg={sp.msg} error={sp.error} />

      <Section title="Nieuwe kortingscode / actie">
        <form action={saveDiscount} className="grid gap-3 text-sm sm:grid-cols-4 sm:items-end">
          <label><span className="label mb-1">Code</span><input name="code" className="input uppercase" required placeholder="EARLYBIRD" /></label>
          <label><span className="label mb-1">Soort</span><select name="kind" className="input"><option value="percent">Percentage</option><option value="fixed">Vast bedrag (€)</option></select></label>
          <label><span className="label mb-1">Waarde</span><input name="amount" className="input" required inputMode="decimal" placeholder="10" /></label>
          <label><span className="label mb-1">Max. aantal keer</span><input name="max_uses" type="number" min={1} className="input" placeholder="onbeperkt" /></label>
          <label><span className="label mb-1">Geldig vanaf</span><input name="starts_at" type="datetime-local" className="input" /></label>
          <label><span className="label mb-1">Geldig tot</span><input name="ends_at" type="datetime-local" className="input" /></label>
          <label><span className="label mb-1">Evenement</span><select name="event_id" className="input"><option value="">Alle evenementen</option>{events.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
          <label><span className="label mb-1">Notitie</span><input name="description" className="input" /></label>
          <div><SubmitButton>Aanmaken</SubmitButton></div>
        </form>
        <p className="mt-3 text-xs text-muted">Earlybird- en groepstickets maak je als apart tickettype bij het evenement (met eigen prijs, verkoopperiode, limiet en ‘personen per ticket’).</p>
      </Section>

      <Section title="Kortingscodes">
        {codes.length === 0 ? <Empty>Nog geen kortingscodes.</Empty> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Code</th><th>Korting</th><th>Gebruikt</th><th>Periode</th><th>Evenement</th><th>Status</th><th /></tr></thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono">{c.code}{c.description && <div className="font-sans text-xs text-muted">{c.description}</div>}</td>
                    <td>{c.kind === 'percent' ? `${c.amount}%` : formatEuro(c.amount)}<div className="text-xs text-muted">{formatEuro(c.discount_total)} totaal</div></td>
                    <td className="tabular-nums">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                    <td className="text-xs">{c.starts_at ? formatDateTime(c.starts_at) : '—'} → {c.ends_at ? formatDateTime(c.ends_at) : '—'}</td>
                    <td className="text-xs">{c.city ?? 'Alle'}</td>
                    <td><Status value={c.is_active ? 'valid' : 'inactive'} label={c.is_active ? 'Actief' : 'Uit'} /></td>
                    <td><form action={toggleDiscount}><input type="hidden" name="id" value={c.id} /><SubmitButton className="text-xs underline">{c.is_active ? 'Uitzetten' : 'Aanzetten'}</SubmitButton></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      <Section title="Herkomst van bestellingen (UTM)">
        <p className="mb-3 text-xs text-muted">Campagnelinks maak je per evenement onder ‘Deelbare links’.</p>
        {sources.length === 0 ? <Empty>Nog geen betaalde bestellingen.</Empty> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Bron</th><th>Campagne</th><th className="text-right">Bestellingen</th><th className="text-right">Tickets</th><th className="text-right">Omzet</th></tr></thead>
              <tbody>{sources.map((s) => <tr key={s.source + s.campaign}><td>{s.source}</td><td>{s.campaign}</td><td className="text-right">{s.orders}</td><td className="text-right">{s.tickets}</td><td className="text-right">{formatEuro(s.revenue)}</td></tr>)}</tbody>
            </table>
          </TableWrap>
        )}
      </Section>
    </>
  );
}
