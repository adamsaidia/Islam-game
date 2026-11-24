import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { StatusPoller } from '@/components/StatusPoller';
import { ResendButton, RetryPaymentButton } from '@/components/OrderActions';
import { getOrderByToken, CATEGORY_LABEL } from '@/lib/order-data';
import { syncLatestPaymentForOrder } from '@/lib/orders';
import { getSettings } from '@/lib/settings';
import { qrSvg } from '@/lib/tickets-pdf';
import { formatDate, formatDateTime, formatTimeRange } from '@/lib/dates';
import { formatEuro } from '@/lib/money';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Jouw bestelling', robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ retour?: string; geannuleerd?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  let data = await getOrderByToken(token);
  if (!data) notFound();
  if (data.order.status === 'pending' && (sp.retour || sp.geannuleerd)) {
    // Nooit de redirect vertrouwen: status server-side bij de provider ophalen.
    await syncLatestPaymentForOrder(data.order.id);
    data = (await getOrderByToken(token))!;
  }
  const { order, event, items, tickets } = data;
  const settings = await getSettings();
  const paid = order.status === 'paid' || order.status === 'partially_refunded';
  const validTickets = tickets.filter((t) => t.status === 'valid' || t.status === 'checked_in');
  const qrs = paid ? await Promise.all(validTickets.map((t) => qrSvg(t.qr_token))) : [];
  const reservationActive = order.status === 'pending' && order.reserved_until && order.reserved_until > new Date();

  const eventRows: [string, string][] = [
    ['Datum', formatDate(event.starts_at)],
    ['Tijd', formatTimeRange(event.starts_at, event.ends_at)],
    ['Locatie', [event.venue_name, event.pool_name, event.city].filter(Boolean).join(' · ')],
  ];

  return (
    <div className="bg-cream">
      <div className="water-bg text-white">
        <SiteHeader light />
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-4">
          {paid ? (
            <>
              <p className="eyebrow !text-aqua">Bestelling {order.order_number}</p>
              <h1 className="display mt-3 text-5xl md:text-6xl" data-testid="success-title">Jouw plekje is gereserveerd!</h1>
              <p className="mt-4 max-w-lg text-white/85">Wij kijken ernaar uit om je te verwelkomen bij Aqua Sisters. Je tickets staan hieronder en zijn ook naar {order.email} gestuurd.</p>
            </>
          ) : order.status === 'pending' && !sp.geannuleerd ? (
            <>
              <p className="eyebrow !text-aqua">Bestelling {order.order_number}</p>
              <h1 className="display mt-3 text-5xl" data-testid="pending-title">We wachten op je betaling…</h1>
              <p className="mt-4 max-w-lg text-white/85">Zodra je betaling is bevestigd, verschijnen je tickets hier automatisch. Dit duurt meestal enkele seconden.</p>
            </>
          ) : order.status === 'awaiting_transfer' ? (
            <>
              <p className="eyebrow !text-aqua">Bestelling {order.order_number}</p>
              <h1 className="display mt-3 text-5xl">Bijna klaar</h1>
              <p className="mt-4 max-w-lg text-white/85">Je plekken zijn tijdelijk gereserveerd. Na ontvangst van je overschrijving sturen we je tickets.</p>
            </>
          ) : (
            <>
              <p className="eyebrow !text-aqua">Bestelling {order.order_number}</p>
              <h1 className="display mt-3 text-5xl" data-testid="failed-title">
                {order.status === 'refunded' ? 'Terugbetaald' : order.status === 'over_capacity' ? 'Helaas, het is vol' : 'Betaling niet afgerond'}
              </h1>
              <p className="mt-4 max-w-lg text-white/85">
                {order.status === 'refunded'
                  ? 'Deze bestelling is terugbetaald. De tickets zijn niet meer geldig.'
                  : order.status === 'over_capacity'
                    ? 'Je betaling kwam binnen nadat je reservering was verlopen en het evenement intussen vol was. We storten het volledige bedrag automatisch terug.'
                    : 'Je betaling is geannuleerd, mislukt of verlopen. Er is niets afgeschreven en je hebt nog geen tickets.'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {order.status === 'pending' && <StatusPoller token={token} />}

        {order.status === 'pending' && reservationActive && (
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RetryPaymentButton token={token} />
            <p className="text-sm text-muted">Je plekken blijven gereserveerd tot {formatDateTime(order.reserved_until!)}.</p>
          </div>
        )}
        {(order.status === 'cancelled' || order.status === 'expired' || (order.status === 'pending' && !reservationActive)) && (
          <Link href={`/reserveren/${event.slug}`} className="btn btn-primary mb-10">Opnieuw bestellen</Link>
        )}

        {order.status === 'awaiting_transfer' && (
          <div className="mb-10 border-l-2 border-gold bg-white p-5 text-sm leading-relaxed">
            <p>
              Maak <strong>{formatEuro(order.total_cents)}</strong> over naar <strong>{settings.checkout.iban || '—'}</strong> t.n.v. {settings.checkout.accountHolder}, onder vermelding van{' '}
              <strong>{order.order_number}</strong>.
            </p>
            {order.reserved_until && <p className="mt-2 text-muted">Je reservering is geldig tot {formatDateTime(order.reserved_until)}.</p>}
          </div>
        )}

        {paid && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`/api/orders/${token}/pdf`} className="btn btn-primary" data-testid="download-pdf">Download tickets (PDF)</a>
              <a href="#tickets" className="btn btn-ghost text-deep">Bekijk tickets</a>
            </div>
            <ResendButton token={token} />
          </>
        )}

        <dl className="mt-10 border-t border-line text-sm">
          {[...eventRows, ['Bestelnummer', order.order_number] as [string, string], ['Tickets', `${items.reduce((s, i) => s + i.persons, 0)}`] as [string, string], [paid ? 'Betaald' : 'Bedrag', formatEuro(order.total_cents)] as [string, string]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-line py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right capitalize-first">{v}</dd>
            </div>
          ))}
        </dl>

        {paid && (
          <section id="tickets" className="mt-16 scroll-mt-6">
            <p className="eyebrow">Jouw tickets</p>
            <p className="mt-2 text-sm text-muted">Zet je schermhelderheid hoog bij de ingang. Iedere QR-code is één keer geldig.</p>
            <ol className="mt-8 space-y-10">
              {validTickets.map((t, i) => (
                <li key={t.id} className="bg-white" data-testid="ticket">
                  <div className="flex items-center justify-between bg-deep px-6 py-4 text-white">
                    <span className="display text-lg tracking-[0.25em]">AQUA SISTERS</span>
                    <span className="text-xs tracking-[0.2em] text-gold">
                      {i + 1} / {validTickets.length}
                    </span>
                  </div>
                  <div className="grid gap-6 p-6 sm:grid-cols-[13rem_1fr] sm:items-center">
                    <div className="relative mx-auto w-52">
                      <div className={`aspect-square w-full [&_svg]:h-full [&_svg]:w-full ${t.status === 'checked_in' ? 'opacity-25' : ''}`} dangerouslySetInnerHTML={{ __html: qrs[i] }} />
                      {t.status === 'checked_in' && <span className="absolute inset-0 grid place-items-center text-sm font-medium text-deep">Ingecheckt</span>}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="display text-2xl text-deep">{t.ticket_type_name}</p>
                      <p className="text-muted">{CATEGORY_LABEL[t.category]} · {order.first_name} {order.last_name}</p>
                      <p className="pt-2 font-mono text-base tracking-wider">{t.ticket_number}</p>
                      <p className="pt-2 text-muted capitalize-first">{formatDate(event.starts_at)} · {formatTimeRange(event.starts_at, event.ends_at)}</p>
                      {event.dress_code && <p className="text-petrol">{event.dress_code}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="prose-legal mt-12 border-t border-line pt-6 text-xs text-muted">{settings.legal.houseRules.text.replace(/^CONCEPT.*\n+/i, '')}</div>
          </section>
        )}
      </div>
    </div>
  );
}
