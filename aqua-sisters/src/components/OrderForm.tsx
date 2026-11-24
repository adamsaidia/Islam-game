'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateTotals, type Discount } from '@/lib/pricing';
import { formatEuro } from '@/lib/money';
import { InAppBrowserNotice } from './InAppBrowserNotice';

type TicketTypeOption = {
  id: string;
  name: string;
  description: string | null;
  category: 'adult' | 'child';
  priceCents: number;
  personsPerUnit: number;
  maxPerOrder: number;
  remaining: number | null;
};

type Props = {
  eventId: string;
  ticketTypes: TicketTypeOption[];
  remaining: number;
  maxPersons: number;
  bankTransfer: boolean;
  showDiscount: boolean;
  holdMinutes: number;
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];

export function OrderForm({ eventId, ticketTypes, remaining, maxPersons, bankTransfer, showDiscount, holdMinutes }: Props) {
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(ticketTypes.map((t, i) => [t.id, i === 0 && t.category === 'adult' ? 1 : 0])),
  );
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [method, setMethod] = useState<'online' | 'banktransfer'>('online');
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState<(Discount & { code: string }) | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    // Campagneparameters onthouden voor deze sessie (TikTok/Instagram/WhatsApp-links).
    try {
      const params = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      for (const k of UTM_KEYS) {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 100);
      }
      if (Object.keys(found).length) sessionStorage.setItem('aqua_utm', JSON.stringify(found));
      const stored = sessionStorage.getItem('aqua_utm');
      if (stored) setUtm(JSON.parse(stored));
    } catch {
      /* sessionStorage niet beschikbaar */
    }
  }, []);

  const totals = useMemo(
    () =>
      calculateTotals(
        ticketTypes.map((t) => ({ ticketTypeId: t.id, name: t.name, unitPriceCents: t.priceCents, quantity: qty[t.id] ?? 0, personsPerUnit: t.personsPerUnit })),
        discount,
      ),
    [ticketTypes, qty, discount],
  );

  const personLimit = Math.min(maxPersons, remaining);

  function change(t: TicketTypeOption, delta: number) {
    setQty((q) => {
      const current = q[t.id] ?? 0;
      const next = Math.max(0, current + delta);
      const personsAfter = totals.persons + (next - current) * t.personsPerUnit;
      if (delta > 0 && (next > t.maxPerOrder || personsAfter > personLimit || (t.remaining != null && next > t.remaining))) return q;
      return { ...q, [t.id]: next };
    });
    setFormError(null);
  }

  async function applyCode() {
    setCodeMsg(null);
    const c = code.trim().toUpperCase();
    if (!c) return;
    const res = await fetch(`/api/discount?eventId=${eventId}&code=${encodeURIComponent(c)}`);
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.valid) {
      setDiscount({ kind: body.kind, amount: body.amount, code: c });
      setCodeMsg(body.kind === 'percent' ? `${body.amount}% korting toegepast` : `${formatEuro(body.amount)} korting toegepast`);
    } else {
      setDiscount(null);
      setCodeMsg(body.message || 'Deze kortingscode is niet geldig.');
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Vul je voornaam in';
    if (!form.lastName.trim()) e.lastName = 'Vul je achternaam in';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Vul een geldig e-mailadres in';
    if (form.phone && !/^[+0-9 ()-]{6,30}$/.test(form.phone.trim())) e.phone = 'Vul een geldig telefoonnummer in';
    if (!acceptTerms) e.terms = 'Ga akkoord met de huisregels en voorwaarden';
    if (totals.persons === 0) e.tickets = 'Kies minimaal één ticket';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!validate() || submitting) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ...form,
          items: ticketTypes.map((t) => ({ ticketTypeId: t.id, quantity: qty[t.id] ?? 0 })),
          discountCode: discount?.code ?? '',
          paymentMethod: method,
          acceptTerms: true,
          marketingOptIn: marketing,
          utm,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.redirectUrl) {
        setFormError(body.message || 'Er ging iets mis. Probeer het opnieuw.');
        setSubmitting(false);
        return;
      }
      window.location.href = body.redirectUrl;
    } catch {
      setFormError('Geen verbinding. Controleer je internet en probeer het opnieuw.');
      setSubmitting(false);
    }
  }

  const field = (name: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="field"
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `${name}-err` : undefined}
        {...props}
      />
      {errors[name] && (
        <p id={`${name}-err`} className="mt-1.5 text-xs text-danger">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="pb-28 md:pb-0" data-testid="order-form">
      <InAppBrowserNotice />

      {/* Stap 1: tickets */}
      <fieldset>
        <legend className="eyebrow">1 · Tickets</legend>
        <ul className="mt-4 border-t border-line">
          {ticketTypes.map((t) => {
            const n = qty[t.id] ?? 0;
            return (
              <li key={t.id} className="flex items-center justify-between gap-4 border-b border-line py-5">
                <div>
                  <p className="text-[1.05rem] text-deep">{t.name}</p>
                  <p className="text-sm text-muted">
                    {formatEuro(t.priceCents)}
                    {t.personsPerUnit > 1 && ` · ${t.personsPerUnit} personen`}
                    {t.description && ` · ${t.description}`}
                    {t.remaining != null && t.remaining <= 20 && ` · nog ${t.remaining} beschikbaar`}
                  </p>
                </div>
                <div className="flex items-center" role="group" aria-label={`Aantal ${t.name}`}>
                  <button type="button" onClick={() => change(t, -1)} disabled={n === 0} className="grid h-11 w-11 place-items-center border border-line text-xl text-deep transition hover:border-deep disabled:opacity-30" aria-label={`Minder ${t.name}`} data-testid={`minus-${t.category}`}>
                    −
                  </button>
                  <output className="w-10 text-center text-lg tabular-nums" aria-live="polite" data-testid={`qty-${t.category}`}>
                    {n}
                  </output>
                  <button type="button" onClick={() => change(t, 1)} className="grid h-11 w-11 place-items-center border border-line text-xl text-deep transition hover:border-deep" aria-label={`Meer ${t.name}`} data-testid={`plus-${t.category}`}>
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {errors.tickets && <p className="mt-2 text-xs text-danger">{errors.tickets}</p>}
        {remaining <= 30 && <p className="mt-3 text-sm text-warn">Nog {remaining} {remaining === 1 ? 'plek' : 'plekken'} beschikbaar.</p>}
      </fieldset>

      {/* Stap 2: gegevens */}
      <fieldset className="mt-12">
        <legend className="eyebrow">2 · Jouw gegevens</legend>
        <div className="mt-2 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {field('firstName', 'Voornaam', { autoComplete: 'given-name', required: true, maxLength: 80 })}
          {field('lastName', 'Achternaam', { autoComplete: 'family-name', required: true, maxLength: 80 })}
          {field('email', 'E-mailadres', { type: 'email', inputMode: 'email', autoComplete: 'email', required: true, maxLength: 200, autoCapitalize: 'off', spellCheck: false })}
          {field('phone', 'Telefoon (optioneel)', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 30 })}
        </div>
        <p className="mt-3 text-xs text-muted">Je tickets worden naar dit e-mailadres gestuurd.</p>
      </fieldset>

      {/* Stap 3: afrekenen */}
      <fieldset className="mt-12">
        <legend className="eyebrow">3 · Overzicht</legend>
        <div className="mt-4 border-t border-line pt-4 text-[0.95rem]" data-testid="summary">
          {totals.lines.length === 0 && <p className="text-muted">Nog geen tickets gekozen.</p>}
          {totals.lines.map((l) => (
            <div key={l.ticketTypeId} className="flex justify-between py-1">
              <span>
                {l.quantity} × {l.name} <span className="text-muted">à {formatEuro(l.unitPriceCents)}</span>
              </span>
              <span className="tabular-nums">{formatEuro(l.lineTotalCents)}</span>
            </div>
          ))}
          {totals.discountCents > 0 && (
            <div className="flex justify-between py-1 text-teal">
              <span>Korting ({discount?.code})</span>
              <span className="tabular-nums">− {formatEuro(totals.discountCents)}</span>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">Totaal · geen extra kosten</span>
            <span className="display text-3xl text-deep tabular-nums" data-testid="total">
              {formatEuro(totals.totalCents)}
            </span>
          </div>
        </div>

        {showDiscount && (
          <div className="mt-4">
            {!codeOpen ? (
              <button type="button" onClick={() => setCodeOpen(true)} className="text-sm text-muted underline underline-offset-4">
                Kortingscode?
              </button>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="code" className="label">
                    Kortingscode
                  </label>
                  <input id="code" className="field uppercase" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" maxLength={32} />
                </div>
                <button type="button" onClick={applyCode} className="btn btn-ghost btn-sm text-deep">
                  Toepassen
                </button>
              </div>
            )}
            {codeMsg && <p className={`mt-2 text-xs ${discount ? 'text-teal' : 'text-danger'}`}>{codeMsg}</p>}
          </div>
        )}

        {bankTransfer && totals.totalCents > 0 && (
          <div className="mt-6 space-y-2 text-sm">
            <label className="flex items-center gap-3">
              <input type="radio" name="method" checked={method === 'online'} onChange={() => setMethod('online')} className="h-4 w-4 accent-[var(--color-deep)]" />
              Direct online betalen (iDEAL | Wero, Apple Pay, kaart)
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" name="method" checked={method === 'banktransfer'} onChange={() => setMethod('banktransfer')} className="h-4 w-4 accent-[var(--color-deep)]" />
              Bankoverschrijving (tickets na ontvangst betaling)
            </label>
          </div>
        )}

        <div className="mt-6 space-y-3 text-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-deep)]" aria-invalid={errors.terms ? 'true' : undefined} data-testid="terms" />
            <span>
              Ik ga akkoord met de{' '}
              <Link href="/huisregels" target="_blank" className="underline underline-offset-4">huisregels</Link> en{' '}
              <Link href="/voorwaarden" target="_blank" className="underline underline-offset-4">algemene voorwaarden</Link>, inclusief de verplichte burkini.
            </span>
          </label>
          {errors.terms && <p className="-mt-1 text-xs text-danger">{errors.terms}</p>}
          <label className="flex items-start gap-3 text-muted">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-deep)]" />
            <span>Ja, houd mij op de hoogte van nieuwe Aqua Sisters-evenementen (optioneel).</span>
          </label>
        </div>

        {formError && (
          <p role="alert" className="mt-6 border-l-2 border-danger bg-white px-4 py-3 text-sm text-danger" data-testid="form-error">
            {formError}
          </p>
        )}

        {/* Desktop-knop */}
        <button type="submit" disabled={submitting} className="btn btn-primary mt-8 hidden w-full md:flex" data-testid="pay-desktop">
          {submitting ? 'Even geduld…' : method === 'banktransfer' ? 'Bestelling plaatsen' : totals.totalCents === 0 && totals.persons > 0 ? 'Tickets ontvangen' : `Betalen · ${formatEuro(totals.totalCents)}`}
        </button>
        <p className="mt-3 hidden text-center text-xs text-muted md:block">Je plekken worden {holdMinutes} minuten voor je vastgehouden tijdens het betalen.</p>
      </fieldset>

      {/* Mobiel: vaste balk met totaal en betaalknop */}
      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-[5.5rem]">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{totals.persons} {totals.persons === 1 ? 'ticket' : 'tickets'}</p>
            <p className="display text-2xl leading-none text-deep tabular-nums">{formatEuro(totals.totalCents)}</p>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary flex-1" data-testid="pay-mobile">
            {submitting ? 'Even geduld…' : method === 'banktransfer' ? 'Bestellen' : 'Betalen'}
          </button>
        </div>
      </div>
    </form>
  );
}
