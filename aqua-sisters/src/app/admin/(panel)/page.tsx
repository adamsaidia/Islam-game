import { PageHeader, Stat, Section } from '@/components/admin/ui';
import { BarChart, LineChart } from '@/components/admin/Charts';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { EventFilter } from '@/components/admin/EventFilter';
import { requireAdmin } from '@/lib/auth/session';
import { getSettings } from '@/lib/settings';
import { getDailySeries, getDashboard } from '@/lib/stats';
import { eventOptions, fillDays } from '@/lib/admin-data';
import { formatEuro } from '@/lib/money';
import { paymentsConfigured } from '@/lib/payments';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  await requireAdmin();
  const { event } = await searchParams;
  const eventId = event && /^[0-9a-f-]{36}$/.test(event) ? event : null;
  const settings = await getSettings();
  const [d, series, events] = await Promise.all([getDashboard(eventId, settings), getDailySeries(eventId), eventOptions()]);
  const tickets = fillDays(series.map((s) => ({ day: s.day, value: s.tickets })));
  let cum = 0;
  const revenue = fillDays(series.map((s) => ({ day: s.day, value: s.revenue }))).map((p) => ({ ...p, value: (cum += p.value) / 100 }));

  const warnings: string[] = [];
  if (!paymentsConfigured()) warnings.push('Betaalprovider niet geconfigureerd (MOLLIE_API_KEY ontbreekt).');
  if (!env.resendApiKey) warnings.push('E-mail niet geconfigureerd (RESEND_API_KEY ontbreekt) – tickets worden niet gemaild.');
  if (env.mollieApiKey.startsWith('test_')) warnings.push('Mollie staat in testmodus – er worden geen echte betalingen ontvangen.');
  const unapproved = Object.entries(settings.legal).filter(([, v]) => !v.approved).length;
  if (unapproved) warnings.push(`${unapproved} juridische tekst(en) nog niet goedgekeurd (Instellingen → Teksten).`);

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Overzicht" eyebrow="Live" actions={<EventFilter events={events} value={eventId ?? ''} />} />
      {warnings.length > 0 && (
        <ul className="mb-10 space-y-1 border-l-2 border-warn bg-white px-4 py-3 text-sm">
          {warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
        <Stat label="Omzet (netto)" value={formatEuro(d.netRevenueCents)} hint={`bruto ${formatEuro(d.grossCents)}`} />
        <Stat label="Verkochte tickets" value={d.ticketsSold} hint={`${d.adult} volwassen · ${d.child} kind`} />
        <Stat label="Nog beschikbaar" value={d.remaining} hint={`van ${d.capacity} plekken`} tone={d.remaining === 0 ? 'danger' : d.remaining < 30 ? 'warn' : undefined} />
        <Stat label="Ingecheckt" value={d.checkedIn} hint={d.ticketsSold ? `${Math.round((d.checkedIn / d.ticketsSold) * 100)}% van verkocht` : undefined} />
        <Stat label="Bestellingen" value={d.allOrders} hint={`${d.paidOrders} betaald${d.freeOrders ? ` · ${d.freeOrders} gratis` : ''}`} />
        <Stat label="Openstaand" value={d.openOrders} hint="actieve reserveringen" tone={d.openOrders ? 'warn' : undefined} />
        <Stat label="Terugbetalingen" value={d.refunds} hint={formatEuro(d.refundedCents)} />
        <Stat label="Betaalkosten (geschat)" value={formatEuro(d.estFeesCents)} hint="instelbaar bij Instellingen" />
        <Stat label="Kosten" value={formatEuro(d.expensesCents)} />
        {settings.finance.vatEnabled && <Stat label="Btw" value={formatEuro(d.vatCents)} />}
        <Stat label="Geschatte winst" value={formatEuro(d.profitCents)} tone={d.profitCents < 0 ? 'danger' : 'ok'} hint="vóór inkomstenbelasting" />
      </div>
      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <Section title="Ticketverkoop per dag">
          <BarChart title="Tickets per dag" data={tickets} />
        </Section>
        <Section title="Omzetontwikkeling">
          <LineChart title="Cumulatieve omzet (€)" data={revenue} unit="euro" />
        </Section>
      </div>
    </>
  );
}
