import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, Flash, Section, Status, TableWrap } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { getOrderById, ORDER_STATUS_LABEL, TICKET_STATUS_LABEL, CATEGORY_LABEL } from '@/lib/order-data';
import { formatDate, formatDateTime } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { cancelTickets, cancelUnpaidOrder, confirmManualPayment, refundAction, resendOrderEmail, undoCheckIn, updateContact } from '../actions';

export const dynamic = 'force-dynamic';

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const sp = await searchParams;
  const data = await getOrderById(id);
  if (!data) notFound();
  const { order: o, event, items, tickets } = data;
  const [payments, refunds, emails, checkins] = await Promise.all([
    sql<{ id: string; provider: string; provider_payment_id: string | null; status: string; method: string | null; amount_cents: number; mode: string; created_at: Date }[]>`
      select id, provider, provider_payment_id, status, method, amount_cents, mode, created_at from payments where order_id = ${id} order by created_at`,
    sql<{ amount_cents: number; status: string; reason: string | null; created_at: Date }[]>`select amount_cents, status, reason, created_at from refunds where order_id = ${id} order by created_at`,
    sql<{ template: string; status: string; error: string | null; created_at: Date; to_email: string }[]>`select template, status, error, created_at, to_email from email_logs where order_id = ${id} order by created_at desc limit 20`,
    sql<{ ticket_number: string | null; action: string; result: string; scanned_at: Date; name: string | null; device: string | null }[]>`
      select t.ticket_number, c.action, c.result, c.scanned_at, u.name, c.device from check_ins c
      left join tickets t on t.id = c.ticket_id left join users u on u.id = c.user_id
      where c.ticket_id in (select id from tickets where order_id = ${id}) order by c.scanned_at desc limit 50`,
  ]);
  const paid = ['paid', 'partially_refunded'].includes(o.status);
  const refundable = o.total_cents - o.refunded_cents;
  const activeTickets = tickets.filter((t) => t.status === 'valid' || t.status === 'checked_in');

  return (
    <>
      <PageHeader
        eyebrow={`${event.title} · ${formatDate(event.starts_at)}`}
        title={`Bestelling ${o.order_number}`}
        actions={
          <>
            {(paid || o.status === 'awaiting_transfer') && (
              <form action={resendOrderEmail}><input type="hidden" name="id" value={id} /><SubmitButton className="btn btn-ghost btn-sm text-deep">{paid ? 'Tickets opnieuw versturen' : 'Betaalinstructies opnieuw sturen'}</SubmitButton></form>
            )}
            {paid && <a className="btn btn-ghost btn-sm text-deep" href={`/api/orders/${o.access_token}/pdf`}>PDF</a>}
            <a className="btn btn-ghost btn-sm text-deep" href={`${env.appUrl}/bestelling/${o.access_token}`} target="_blank">Klantpagina ↗</a>
          </>
        }
      />
      <Flash msg={sp.msg} error={sp.error} />

      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="Bestelling">
          <dl className="grid grid-cols-[9rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted">Status</dt><dd><Status value={o.status} label={ORDER_STATUS_LABEL[o.status]} /></dd>
            <dt className="text-muted">Besteld</dt><dd>{formatDateTime(o.created_at)}</dd>
            {o.paid_at && (<><dt className="text-muted">Betaald</dt><dd>{formatDateTime(o.paid_at)}</dd></>)}
            {o.reserved_until && (<><dt className="text-muted">Gereserveerd tot</dt><dd>{formatDateTime(o.reserved_until)}</dd></>)}
            <dt className="text-muted">Betaalmethode</dt><dd>{o.payment_method ?? '—'}</dd>
            {items.map((i) => (<Fragment key={i.id}><dt className="text-muted">{i.quantity} × {i.name}</dt><dd>{formatEuro(i.line_total_cents)}</dd></Fragment>))}
            {o.discount_cents > 0 && (<><dt className="text-muted">Korting</dt><dd>− {formatEuro(o.discount_cents)}</dd></>)}
            <dt className="text-muted">Totaal</dt><dd className="font-medium">{formatEuro(o.total_cents)}</dd>
            {o.refunded_cents > 0 && (<><dt className="text-muted">Terugbetaald</dt><dd className="text-danger">{formatEuro(o.refunded_cents)}</dd></>)}
            {o.utm && (<><dt className="text-muted">Campagne</dt><dd className="text-xs">{Object.entries(o.utm).map(([k, v]) => `${k}=${v}`).join(' · ')}</dd></>)}
            <dt className="text-muted">Marketing</dt><dd>{o.marketing_opt_in ? 'Toestemming gegeven' : 'Nee'}</dd>
          </dl>
          {(o.status === 'pending' || o.status === 'awaiting_transfer') && (
            <div className="mt-6 flex flex-wrap gap-2">
              <form action={confirmManualPayment}><input type="hidden" name="id" value={id} /><SubmitButton confirm={`Bevestig dat ${formatEuro(o.total_cents)} is ontvangen. Tickets worden direct verstuurd.`}>Betaling handmatig bevestigen</SubmitButton></form>
              <form action={cancelUnpaidOrder}><input type="hidden" name="id" value={id} /><SubmitButton className="btn btn-ghost btn-sm text-danger" confirm="Bestelling annuleren en plekken vrijgeven?">Annuleren</SubmitButton></form>
            </div>
          )}
        </Section>

        <Section title="Klant">
          {o.anonymized_at ? (
            <p className="text-sm text-muted">Persoonsgegevens geanonimiseerd op {formatDateTime(o.anonymized_at)}.</p>
          ) : (
            <form action={updateContact} className="grid grid-cols-2 gap-3 text-sm">
              <input type="hidden" name="id" value={id} />
              <label><span className="label mb-1">Voornaam</span><input name="first_name" className="input" defaultValue={o.first_name} /></label>
              <label><span className="label mb-1">Achternaam</span><input name="last_name" className="input" defaultValue={o.last_name} /></label>
              <label className="col-span-2"><span className="label mb-1">E-mail</span><input name="email" type="email" className="input" defaultValue={o.email} /></label>
              <label className="col-span-2"><span className="label mb-1">Telefoon</span><input name="phone" className="input" defaultValue={o.phone ?? ''} /></label>
              <label className="col-span-2"><span className="label mb-1">Interne notitie</span><textarea name="note" rows={2} className="input" defaultValue={o.note ?? ''} /></label>
              <div className="col-span-2"><SubmitButton className="btn btn-ghost btn-sm text-deep">Opslaan</SubmitButton></div>
            </form>
          )}
        </Section>
      </div>

      <Section title={`Tickets (${tickets.length})`}>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted">Nog geen tickets – deze worden pas aangemaakt na een bevestigde betaling.</p>
        ) : (
          <form action={cancelTickets}>
            <input type="hidden" name="id" value={id} />
            <TableWrap>
              <table className="table">
                <thead><tr><th /><th>Ticket</th><th>Type</th><th>Status</th><th>Ingecheckt</th><th /></tr></thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td><input type="checkbox" name="ticket_ids" value={t.id} disabled={t.status === 'cancelled' || t.status === 'refunded'} aria-label={`Selecteer ${t.ticket_number}`} /></td>
                      <td className="font-mono">{t.ticket_number}</td>
                      <td>{t.ticket_type_name} <span className="text-xs text-muted">({CATEGORY_LABEL[t.category]})</span></td>
                      <td><Status value={t.status} label={TICKET_STATUS_LABEL[t.status]} /></td>
                      <td className="text-xs">{t.checked_in_at ? formatDateTime(t.checked_in_at) : '—'}</td>
                      <td>{t.status === 'checked_in' && <button formAction={undoCheckIn} name="ticket_id" value={t.id} className="text-xs underline">Check-in terugdraaien</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            {activeTickets.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" name="notify" defaultChecked /> Klant mailen</label>
                <SubmitButton className="btn btn-ghost btn-sm text-danger" confirm="Geselecteerde tickets ongeldig maken? Dit kan niet ongedaan worden gemaakt.">Geselecteerde tickets ongeldig maken</SubmitButton>
              </div>
            )}
          </form>
        )}
      </Section>

      {(paid || o.status === 'over_capacity') && refundable > 0 && (
        <Section title="Terugbetalen">
          <form action={refundAction} className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr_auto] sm:items-end">
            <input type="hidden" name="id" value={id} />
            <label><span className="label mb-1">Bedrag (€)</span><input name="amount" className="input" inputMode="decimal" defaultValue={(refundable / 100).toFixed(2).replace('.', ',')} /></label>
            <label><span className="label mb-1">Reden</span><input name="reason" className="input" placeholder="bijv. annulering op verzoek" /></label>
            <SubmitButton className="btn btn-primary btn-sm" confirm="Terugbetaling uitvoeren via de betaalprovider?">Terugbetalen</SubmitButton>
            {activeTickets.length > 0 && (
              <fieldset className="sm:col-span-3">
                <legend className="mb-1 text-xs text-muted">Tickets die hierbij vervallen (optioneel):</legend>
                <div className="flex flex-wrap gap-4">
                  {activeTickets.map((t) => (
                    <label key={t.id} className="flex items-center gap-2"><input type="checkbox" name="ticket_ids" value={t.id} /> <span className="font-mono">{t.ticket_number}</span> ({CATEGORY_LABEL[t.category]})</label>
                  ))}
                </div>
              </fieldset>
            )}
          </form>
          <p className="mt-2 text-xs text-muted">Maximaal {formatEuro(refundable)}. Bij betalingen via de provider gaat het geld automatisch terug; bij bankoverschrijving registreert dit een handmatige terugbetaling.</p>
        </Section>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="Betalingen">
          {payments.length === 0 ? <p className="text-sm text-muted">Geen.</p> : (
            <ul className="space-y-2 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex justify-between gap-4 border-b border-line pb-2">
                  <span>{p.provider} <span className="font-mono text-xs text-muted">{p.provider_payment_id}</span> {p.mode === 'test' && <span className="text-xs text-warn">test</span>}<br /><span className="text-xs text-muted">{formatDateTime(p.created_at)} · {p.method ?? '—'}</span></span>
                  <span className="text-right"><Status value={p.status} /><br />{formatEuro(p.amount_cents)}</span>
                </li>
              ))}
            </ul>
          )}
          {refunds.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {refunds.map((r, i) => <li key={i}>Terugbetaling {formatEuro(r.amount_cents)} · {r.status} · {formatDateTime(r.created_at)}{r.reason && ` · ${r.reason}`}</li>)}
            </ul>
          )}
        </Section>
        <Section title="E-mails & check-ins">
          <ul className="space-y-1 text-sm">
            {emails.map((e, i) => <li key={i}><Status value={e.status} /> {e.template} · {formatDateTime(e.created_at)}{e.error && <span className="text-xs text-danger"> · {e.error}</span>}</li>)}
            {emails.length === 0 && <li className="text-muted">Nog geen e-mails.</li>}
          </ul>
          {checkins.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {checkins.map((c, i) => <li key={i} className="text-xs">{formatDateTime(c.scanned_at)} · {c.ticket_number} · {c.action} → {c.result}{c.name && ` · ${c.name}`}</li>)}
            </ul>
          )}
          <p className="mt-4 text-xs"><Link className="underline" href={`/admin/bestellingen?event=${event.id}`}>← Alle bestellingen van dit evenement</Link></p>
        </Section>
      </div>
    </>
  );
}
