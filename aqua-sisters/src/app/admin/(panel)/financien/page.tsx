import { PageHeader, Flash, Section, Stat, TableWrap, Empty } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { EventFilter } from '@/components/admin/EventFilter';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { getDashboard } from '@/lib/stats';
import { eventOptions } from '@/lib/admin-data';
import { formatDateShort } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { addExpense, deleteExpense } from './actions';

export const dynamic = 'force-dynamic';

const CAT_LABEL: Record<string, string> = { venue: 'Zwembadhuur', staff: 'Personeel', marketing: 'Marketing', payment_fees: 'Betaalkosten', insurance: 'Verzekering', other: 'Overig' };

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ event?: string; msg?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const eventId = sp.event && /^[0-9a-f-]{36}$/.test(sp.event) ? sp.event : null;
  const settings = await getSettings();
  const [d, events, expenses] = await Promise.all([
    getDashboard(eventId, settings),
    eventOptions(),
    sql<{ id: string; category: string; description: string; amount_cents: number; vat_cents: number | null; incurred_on: Date; event: string | null }[]>`
      select x.id, x.category, x.description, x.amount_cents, x.vat_cents, x.incurred_on, e.city || ' ' || to_char(e.starts_at, 'DD-MM-YYYY') as event
      from expenses x left join events e on e.id = x.event_id
      where true ${eventId ? sql`and x.event_id = ${eventId}` : sql``} order by x.incurred_on desc`,
  ]);
  const vatRate = settings.finance.vatEnabled ? settings.finance.vatRatePercent : null;
  const feesInExpenses = expenses.some((x) => x.category === 'payment_fees');
  return (
    <>
      <PageHeader title="Financiën" actions={<EventFilter events={events} value={eventId ?? ''} allLabel="Alle actuele evenementen" />} />
      <Flash msg={sp.msg} error={sp.error} />
      <div className="mb-4 grid grid-cols-2 gap-6 md:grid-cols-3">
        <Stat label="Bruto omzet" value={formatEuro(d.grossCents)} />
        <Stat label="Terugbetaald" value={formatEuro(d.refundedCents)} />
        <Stat label="Netto-omzet (incl. btw)" value={formatEuro(d.netRevenueCents)} />
        <Stat label={vatRate ? `Btw (${vatRate}%)` : 'Btw'} value={vatRate ? formatEuro(d.vatCents) : '—'} hint={vatRate ? 'inbegrepen in de prijs' : 'niet ingesteld'} />
        <Stat label="Totale kosten" value={formatEuro(d.expensesCents + (feesInExpenses ? 0 : d.estFeesCents))} hint={feesInExpenses ? 'incl. ingevoerde betaalkosten' : `incl. ${formatEuro(d.estFeesCents)} geschatte betaalkosten`} />
        <Stat label="Resultaat vóór inkomstenbelasting" value={formatEuro(d.profitCents)} tone={d.profitCents < 0 ? 'danger' : 'ok'} />
      </div>
      <p className="mb-12 text-xs text-muted">
        Btw-instellingen staan onder Instellingen en zijn standaard uitgeschakeld. Laat het juiste tarief en de fiscale behandeling bevestigen door je boekhouder; deze cijfers zijn een indicatie.
      </p>

      <Section title="Kostenpost toevoegen">
        <form action={addExpense} className="grid gap-3 text-sm sm:grid-cols-6 sm:items-end">
          <label className="sm:col-span-2"><span className="label mb-1">Omschrijving</span><input name="description" className="input" required placeholder="bijv. Huur recreatiebad" /></label>
          <label><span className="label mb-1">Categorie</span>
            <select name="category" className="input">{Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label><span className="label mb-1">Bedrag (€)</span><input name="amount" className="input" inputMode="decimal" required /></label>
          <label><span className="label mb-1">Waarvan btw (€)</span><input name="vat" className="input" inputMode="decimal" /></label>
          <label><span className="label mb-1">Datum</span><input name="incurred_on" type="date" className="input" /></label>
          <label className="sm:col-span-3"><span className="label mb-1">Evenement</span>
            <select name="event_id" className="input" defaultValue={eventId ?? ''}><option value="">Algemeen</option>{events.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select>
          </label>
          <div><SubmitButton>Toevoegen</SubmitButton></div>
        </form>
      </Section>

      <Section title="Kosten">
        {expenses.length === 0 ? <Empty>Nog geen kosten ingevoerd.</Empty> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Datum</th><th>Omschrijving</th><th>Categorie</th><th>Evenement</th><th className="text-right">Bedrag</th><th /></tr></thead>
              <tbody>
                {expenses.map((x) => (
                  <tr key={x.id}>
                    <td className="whitespace-nowrap">{formatDateShort(x.incurred_on)}</td><td>{x.description}</td><td>{CAT_LABEL[x.category]}</td><td className="text-xs">{x.event ?? 'Algemeen'}</td>
                    <td className="text-right tabular-nums">{formatEuro(x.amount_cents)}{x.vat_cents != null && <div className="text-xs text-muted">btw {formatEuro(x.vat_cents)}</div>}</td>
                    <td><form action={deleteExpense}><input type="hidden" name="id" value={x.id} /><SubmitButton className="text-xs text-danger underline" confirm="Kostenpost verwijderen?">Verwijder</SubmitButton></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>
    </>
  );
}
