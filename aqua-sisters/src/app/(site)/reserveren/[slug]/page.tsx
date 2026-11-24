import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { OrderForm } from '@/components/OrderForm';
import { WaitlistForm } from '@/components/WaitlistForm';
import { getSettings } from '@/lib/settings';
import { childAgeText, getAvailability, getEventBySlug, getTicketTypeRemaining, getTicketTypes, saleState, ticketTypeOnSale } from '@/lib/events';
import { formatDate, formatTimeRange } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { paymentsConfigured } from '@/lib/payments';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e || (e.status !== 'published' && e.status !== 'hidden')) return { title: 'Evenement niet gevonden' };
  const title = `${e.title} · ${formatDate(e.starts_at)}`;
  const description = `${formatTimeRange(e.starts_at, e.ends_at)} · ${e.venue_name}, ${e.city}. ${e.audience_note ?? ''} Reserveer je tickets in een minuut.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    robots: e.status === 'hidden' ? { index: false } : undefined,
  };
}

const STATE_MESSAGE = {
  sold_out: 'Dit evenement is uitverkocht.',
  paused: 'De ticketverkoop is tijdelijk gepauzeerd. Kom later terug.',
  not_started: 'De ticketverkoop is nog niet gestart.',
  closed: 'De ticketverkoop voor dit evenement is gesloten.',
  unavailable: 'Dit evenement is niet beschikbaar.',
} as const;

export default async function ReservePage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  // Verborgen evenementen zijn alleen via directe link bereikbaar, maar niet te koop.
  if (!event || (event.status !== 'published' && event.status !== 'hidden')) notFound();

  const [settings, types, avail, typeRemaining] = await Promise.all([
    getSettings(),
    getTicketTypes(event.id),
    getAvailability(event.id),
    getTicketTypeRemaining(event.id),
  ]);
  const remaining = avail?.remaining ?? 0;
  const state = saleState(event, remaining);
  const ageText = childAgeText(event);
  const sellable = types
    .filter((t) => ticketTypeOnSale(t))
    .map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      priceCents: t.price_cents,
      personsPerUnit: t.persons_per_unit,
      maxPerOrder: t.max_per_order,
      remaining: typeRemaining[t.id] ?? null,
    }));

  return (
    <div className="bg-cream">
      <div className="water-bg text-white">
        <SiteHeader light />
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:pb-16">
          <p className="eyebrow !text-aqua">{event.title}</p>
          <h1 className="display mt-3 text-[2.6rem] capitalize-first leading-none md:text-6xl">{formatDate(event.starts_at)}</h1>
          <p className="mt-4 text-white/85">
            {formatTimeRange(event.starts_at, event.ends_at)} · {event.venue_name}
            {event.pool_name ? ` (${event.pool_name.toLowerCase()})` : ''}, {event.city}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-[1fr_20rem] md:py-14">
        <div>
          {state === 'on_sale' && sellable.length > 0 ? (
            paymentsConfigured() ? (
              <OrderForm
                eventId={event.id}
                ticketTypes={sellable}
                remaining={remaining}
                maxPersons={settings.checkout.maxPersonsPerOrder}
                bankTransfer={settings.checkout.bankTransferEnabled}
                showDiscount={settings.checkout.showDiscountField}
                holdMinutes={event.hold_minutes}
              />
            ) : (
              <div className="border-l-2 border-gold bg-white p-6" data-testid="sales-soon">
                <p className="display text-3xl text-deep">Ticketverkoop start binnenkort</p>
                <p className="mt-2 text-sm text-muted">Houd onze Instagram en TikTok in de gaten – je kunt hier binnenkort direct je tickets reserveren.</p>
              </div>
            )
          ) : (
            <div id="wachtlijst" className="scroll-mt-6">
              <p className="display text-3xl text-deep">{STATE_MESSAGE[state === 'on_sale' ? 'unavailable' : state]}</p>
              {event.waitlist_enabled && (state === 'sold_out' || state === 'paused' || state === 'not_started') && (
                <div className="mt-8">
                  <p className="text-muted">Laat je gegevens achter. We mailen je zodra er (weer) tickets beschikbaar zijn.</p>
                  <WaitlistForm eventId={event.id} />
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-8 text-sm md:border-l md:border-line md:pl-10">
          <div>
            <p className="eyebrow">Prijzen</p>
            <ul className="mt-3 space-y-1.5">
              {types.map((t) => (
                <li key={t.id} className="flex justify-between gap-4">
                  <span>{t.name}</span>
                  <span className="tabular-nums">{formatEuro(t.price_cents)}</span>
                </li>
              ))}
            </ul>
            {ageText && <p className="mt-2 text-xs text-muted">Kinderticket: {ageText}</p>}
          </div>
          <div>
            <p className="eyebrow">Goed om te weten</p>
            <ul className="mt-3 space-y-2 leading-relaxed text-muted">
              {event.audience_note && <li>{event.audience_note}.</li>}
              {event.dress_code && <li>{event.dress_code}.</li>}
              <li>Iedere persoon krijgt een eigen QR-code.</li>
              <li>Geen account nodig.</li>
            </ul>
          </div>
          {event.description && <p className="leading-relaxed text-muted">{event.description}</p>}
          <p className="text-xs text-muted">
            <Link className="underline underline-offset-4" href="/huisregels">Huisregels</Link> ·{' '}
            <Link className="underline underline-offset-4" href="/voorwaarden">Voorwaarden</Link> ·{' '}
            <Link className="underline underline-offset-4" href="/privacy">Privacy</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
