import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSettings } from '@/lib/settings';
import { childAgeText, getAvailability, getTicketTypes, listUpcomingEvents, saleState, ticketTypeOnSale, type EventRow } from '@/lib/events';
import { formatDate, formatTimeRange } from '@/lib/dates';
import { formatEuro } from '@/lib/money';

export const dynamic = 'force-dynamic';

const STATE_LABEL = {
  on_sale: 'Reserveer jouw tickets',
  sold_out: 'Uitverkocht – wachtlijst',
  paused: 'Verkoop tijdelijk gepauzeerd',
  not_started: 'Verkoop start binnenkort',
  closed: 'Verkoop gesloten',
  unavailable: 'Niet beschikbaar',
} as const;

async function eventSummary(e: EventRow) {
  const [types, avail] = await Promise.all([getTicketTypes(e.id), getAvailability(e.id)]);
  const state = saleState(e, avail?.remaining ?? 0);
  return { event: e, types: types.filter((t) => ticketTypeOnSale(t)), state, remaining: avail?.remaining ?? 0 };
}

export default async function HomePage() {
  const [settings, events] = await Promise.all([getSettings(), listUpcomingEvents()]);
  const summaries = await Promise.all(events.map(eventSummary));
  const next = summaries[0];
  const others = summaries.slice(1);
  const s = settings.site;

  return (
    <>
      {/* ───── Hero ───── */}
      <section
        className="water-bg animate-drift relative isolate flex min-h-[100svh] flex-col text-white"
        style={next?.event.image_id ? { backgroundImage: `linear-gradient(180deg, rgb(12 51 49 / 0.55) 0%, rgb(12 51 49 / 0.3) 45%, rgb(12 51 49 / 0.9) 100%), url(/api/images/${next.event.image_id})` } : undefined}
      >
        <SiteHeader light cta={next ? { href: `/reserveren/${next.event.slug}`, label: 'Tickets' } : undefined} />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-28 pt-10 md:justify-center md:pb-24">
          <div className="animate-rise max-w-2xl">
            <p className="eyebrow !text-aqua">{s.tagline}</p>
            <h1 className="display mt-5 text-[3rem] leading-[0.95] sm:text-7xl md:text-8xl">
              Jouw moment
              <br />
              <em className="text-sand">in het water.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">{s.intro}</p>
          </div>

          {next ? (
            <div className="animate-rise glass-dark mt-10 max-w-2xl border-t border-gold/60 [animation-delay:150ms]">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 p-6 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-2">
                  <dt className="eyebrow !text-gold">Eerstvolgende</dt>
                  <dd className="display mt-1 text-2xl capitalize-first">{formatDate(next.event.starts_at)}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-gold">Tijd</dt>
                  <dd className="mt-1 text-sm">{formatTimeRange(next.event.starts_at, next.event.ends_at)}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-gold">Locatie</dt>
                  <dd className="mt-1 text-sm">
                    {next.event.venue_name}
                    <br />
                    <span className="text-white/70">{next.event.city}</span>
                  </dd>
                </div>
                {next.types.length > 0 && (
                  <div className="col-span-2 sm:col-span-4">
                    <dt className="sr-only">Prijzen</dt>
                    <dd className="flex flex-wrap gap-x-8 gap-y-1 text-sm text-white/90">
                      {next.types.map((t) => (
                        <span key={t.id}>
                          {t.name} <strong className="font-medium text-white">{formatEuro(t.price_cents)}</strong>
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <Link href={`/reserveren/${next.event.slug}`} className="btn btn-gold w-full sm:w-auto" data-testid="hero-cta">
                  {STATE_LABEL[next.state]}
                  <span aria-hidden="true">→</span>
                </Link>
                {next.event.dress_code && <p className="text-xs tracking-wide text-white/70">{next.event.dress_code} · {next.event.audience_note ?? 'Alleen vrouwen'}</p>}
              </div>
            </div>
          ) : (
            <div className="glass-dark mt-10 max-w-xl border-t border-gold/60 p-6">
              <p className="display text-2xl">Nieuwe data volgen binnenkort.</p>
              <p className="mt-2 text-sm text-white/75">Volg ons op social media om als eerste op de hoogte te zijn.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───── Over ───── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Over Aqua Sisters</p>
            <h2 className="display mt-4 text-4xl text-deep md:text-5xl">Een zwembad, alleen voor ons.</h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <div className="hairline" />
              <h3 className="display mt-5 text-2xl text-deep">Volledige privacy</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{s.privacyNote}</p>
            </div>
            <div>
              <div className="hairline" />
              <h3 className="display mt-5 text-2xl text-deep">Burkini verplicht</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{s.burkiniNote}</p>
            </div>
            <div>
              <div className="hairline" />
              <h3 className="display mt-5 text-2xl text-deep">Voor jou én je kinderen</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                Kom alleen, met vriendinnen of met je kinderen. {next && childAgeText(next.event) ? `Kindertickets gelden voor kinderen ${childAgeText(next.event)}.` : 'De voorwaarden voor kinderen staan bij het evenement.'}
              </p>
            </div>
            <div>
              <div className="hairline" />
              <h3 className="display mt-5 text-2xl text-deep">In een minuut geregeld</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">Geen account nodig. Kies je tickets, betaal met iDEAL | Wero, Apple Pay of je creditcard en ontvang direct je QR-codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Overige evenementen ───── */}
      {others.length > 0 && (
        <section className="border-t border-line bg-sand/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="eyebrow">Ook gepland</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {others.map(({ event: e, state }) => (
                <li key={e.id}>
                  <Link href={`/reserveren/${e.slug}`} className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="display text-2xl capitalize-first text-deep">{formatDate(e.starts_at)}</p>
                      <p className="text-sm text-muted">{formatTimeRange(e.starts_at, e.ends_at)} · {e.venue_name}, {e.city}</p>
                    </div>
                    <span className="text-sm tracking-wide text-deep underline-offset-8 group-hover:underline">{STATE_LABEL[state]} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ───── FAQ ───── */}
      {settings.faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-24">
          <p className="eyebrow">Veelgestelde vragen</p>
          <h2 className="display mt-4 text-4xl text-deep">Goed om te weten</h2>
          <div className="mt-10 border-t border-line">
            {settings.faq.map((f, i) => (
              <details key={i} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.02rem] text-deep [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-6 pr-8 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ───── CTA ───── */}
      {next && (
        <section className="water-bg relative text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow !text-aqua">{formatDate(next.event.starts_at)}</p>
              <h2 className="display mt-3 text-4xl md:text-5xl">Zien we je in het water?</h2>
            </div>
            <Link href={`/reserveren/${next.event.slug}`} className="btn btn-gold">
              {STATE_LABEL[next.state]} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Mobiele vaste reserveringsknop */}
      {next && next.state === 'on_sale' && (
        <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
          <Link href={`/reserveren/${next.event.slug}`} className="btn btn-primary w-full">
            Reserveer jouw tickets <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </>
  );
}
