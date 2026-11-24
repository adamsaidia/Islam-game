import 'server-only';
import { sql } from '../db';
import { env } from '../env';
import { getSettings } from '../settings';
import type { EmailTemplateKey, Settings } from '../settings-defaults';
import { getOrderById, CATEGORY_LABEL, type FullOrder } from '../order-data';
import { formatDate, formatDateTime, formatTimeRange } from '../dates';
import { formatEuro } from '../money';
import { renderTicketsPdf } from '../tickets-pdf';
import { fillPlaceholders, renderEmail, type EmailBlock } from './layout';
import type { EventRow } from '../events';

export type EmailPayload = {
  orderId?: string;
  waitlistId?: string;
  amountCents?: number;
  ticketNumbers?: string[];
};

type BuiltEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string }[];
};

function footerText(s: Settings) {
  const contact = [s.site.contactEmail, s.site.contactPhone].filter(Boolean).join(' · ');
  return `${s.site.orgName}${contact ? ` · ${contact}` : ''}\nJe ontvangt deze e-mail vanwege je bestelling of aanmelding bij ${s.site.orgName}.`;
}

function eventRows(e: EventRow): [string, string][] {
  return [
    ['Evenement', e.title],
    ['Datum', formatDate(e.starts_at)],
    ['Tijd', formatTimeRange(e.starts_at, e.ends_at)],
    ['Locatie', [e.venue_name, e.pool_name, e.city].filter(Boolean).join(' · ')],
    ...(e.dress_code ? ([['Dresscode', e.dress_code]] as [string, string][]) : []),
  ];
}

function orderLink(o: FullOrder['order']) {
  return `${env.appUrl}/bestelling/${o.access_token}`;
}

async function buildOrderEmail(kind: EmailTemplateKey, payload: EmailPayload, s: Settings): Promise<BuiltEmail | null> {
  if (!payload.orderId) return null;
  const data = await getOrderById(payload.orderId);
  if (!data || data.order.anonymized_at) return null;
  const { order, event, items, tickets } = data;
  const tpl = s.emailTemplates[kind];
  const vars = {
    voornaam: order.first_name,
    achternaam: order.last_name,
    evenement: event.title,
    datum: formatDate(event.starts_at),
    bestelnummer: order.order_number,
    bedrag: formatEuro(payload.amountCents ?? order.total_cents),
  };
  const subject = fillPlaceholders(tpl.subject, vars);
  const intro = fillPlaceholders(tpl.intro, vars);
  const blocks: EmailBlock[] = [];
  let attachments: BuiltEmail['attachments'];

  const itemRows: [string, string][] = items.map((i) => [`${i.quantity} × ${i.name}`, formatEuro(i.line_total_cents)]);
  if (order.discount_cents > 0) itemRows.push(['Korting', `− ${formatEuro(order.discount_cents)}`]);
  itemRows.push(['Totaal', formatEuro(order.total_cents)]);

  switch (kind) {
    case 'tickets': {
      const valid = tickets.filter((t) => t.status === 'valid' || t.status === 'checked_in');
      blocks.push({ type: 'details', rows: [['Bestelnummer', order.order_number], ...eventRows(event)] });
      blocks.push({ type: 'button', label: 'Bekijk mijn tickets', href: orderLink(order) });
      blocks.push({
        type: 'list',
        items: valid.map((t) => `${t.ticket_number} – ${t.ticket_type_name} (${CATEGORY_LABEL[t.category]})`),
      });
      blocks.push({ type: 'details', rows: itemRows });
      blocks.push({
        type: 'note',
        text: 'Je tickets zitten ook als PDF in de bijlage. Laat bij de ingang per persoon de QR-code scannen – vanaf je telefoon of geprint.',
      });
      blocks.push({ type: 'text', text: s.legal.houseRules.text.replace(/^CONCEPT.*\n+/i, '') });
      const pdf = await renderTicketsPdf(data, {
        houseRules: s.legal.houseRules.text,
        contact: [s.site.contactEmail, s.site.contactPhone].filter(Boolean).join(' · '),
      });
      attachments = [{ filename: `aqua-sisters-tickets-${order.order_number}.pdf`, content: Buffer.from(pdf).toString('base64') }];
      break;
    }
    case 'order_received': {
      blocks.push({ type: 'details', rows: [['Bestelnummer', order.order_number], ...eventRows(event)] });
      blocks.push({ type: 'details', rows: itemRows });
      if (order.status === 'awaiting_transfer') {
        blocks.push({
          type: 'note',
          text: `Maak ${formatEuro(order.total_cents)} over naar ${s.checkout.iban || '[IBAN nog niet ingesteld]'} t.n.v. ${s.checkout.accountHolder}, onder vermelding van ${order.order_number}.${
            order.reserved_until ? `\nJe reservering is geldig tot ${formatDateTime(order.reserved_until)}.` : ''
          }`,
        });
      }
      blocks.push({ type: 'button', label: 'Bekijk je bestelling', href: orderLink(order) });
      break;
    }
    case 'payment_reminder':
      blocks.push({ type: 'details', rows: eventRows(event) });
      blocks.push({ type: 'button', label: 'Opnieuw bestellen', href: `${env.appUrl}/reserveren/${event.slug}` });
      break;
    case 'event_reminder':
      blocks.push({ type: 'details', rows: eventRows(event) });
      blocks.push({ type: 'button', label: 'Bekijk mijn tickets', href: orderLink(order) });
      blocks.push({ type: 'text', text: s.legal.houseRules.text.replace(/^CONCEPT.*\n+/i, '') });
      break;
    case 'event_changed':
      blocks.push({ type: 'details', rows: eventRows(event) });
      blocks.push({ type: 'button', label: 'Bekijk mijn tickets', href: orderLink(order) });
      break;
    case 'cancellation':
      if (payload.ticketNumbers?.length) blocks.push({ type: 'list', items: payload.ticketNumbers });
      blocks.push({ type: 'details', rows: [['Bestelnummer', order.order_number], ...eventRows(event)] });
      blocks.push({ type: 'text', text: 'Vragen? Neem gerust contact met ons op.' });
      break;
    case 'refund':
    case 'over_capacity':
      blocks.push({
        type: 'details',
        rows: [
          ['Bestelnummer', order.order_number],
          ['Bedrag', formatEuro(payload.amountCents ?? order.total_cents)],
          ['Evenement', event.title],
        ],
      });
      if (kind === 'over_capacity' && event.waitlist_enabled) {
        blocks.push({ type: 'button', label: 'Zet me op de wachtlijst', href: `${env.appUrl}/reserveren/${event.slug}#wachtlijst` });
      }
      break;
    default:
      return null;
  }

  const { html, text } = renderEmail({ preheader: intro.slice(0, 120), heading: subject.replace(/\s*[–-]\s*AS\d+$/, ''), intro, blocks, footer: footerText(s) });
  return { to: order.email, subject, html, text, attachments };
}

async function buildWaitlistEmail(payload: EmailPayload, s: Settings): Promise<BuiltEmail | null> {
  if (!payload.waitlistId) return null;
  const [w] = await sql<{ first_name: string; email: string; event_id: string }[]>`select first_name, email, event_id from waitlist where id = ${payload.waitlistId}`;
  if (!w) return null;
  const [event] = await sql<EventRow[]>`select * from events where id = ${w.event_id}`;
  const tpl = s.emailTemplates.waitlist;
  const vars = { voornaam: w.first_name, evenement: event.title, datum: formatDate(event.starts_at), bestelnummer: '', bedrag: '' };
  const subject = fillPlaceholders(tpl.subject, vars);
  const intro = fillPlaceholders(tpl.intro, vars);
  const { html, text } = renderEmail({
    preheader: intro.slice(0, 120),
    heading: subject,
    intro,
    blocks: [
      { type: 'details', rows: eventRows(event) },
      { type: 'button', label: 'Reserveer jouw tickets', href: `${env.appUrl}/reserveren/${event.slug}?utm_source=wachtlijst&utm_medium=email` },
    ],
    footer: footerText(s),
  });
  return { to: w.email, subject, html, text };
}

async function sendViaResend(m: BuiltEmail): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      text: m.text,
      ...(env.emailReplyTo ? { reply_to: env.emailReplyTo } : {}),
      ...(m.attachments ? { attachments: m.attachments } : {}),
    }),
    signal: AbortSignal.timeout(20000),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok || !body.id) throw new Error(`Resend ${res.status}: ${body.message || res.statusText}`);
  return body.id;
}

/** Bouwt en verstuurt een gelogde e-mail. Mislukte pogingen worden later door de cron opnieuw geprobeerd. */
export async function deliverEmail(logId: string): Promise<'sent' | 'failed' | 'skipped'> {
  const [log] = await sql<{ id: string; template: EmailTemplateKey; payload: EmailPayload; status: string }[]>`
    update email_logs set attempts = attempts + 1 where id = ${logId} and status <> 'sent' returning id, template, payload, status`;
  if (!log) return 'skipped';
  try {
    const s = await getSettings();
    const built = log.template === 'waitlist' ? await buildWaitlistEmail(log.payload, s) : await buildOrderEmail(log.template, log.payload, s);
    if (!built) {
      await sql`update email_logs set status = 'skipped', error = 'Gegevens niet (meer) beschikbaar' where id = ${logId}`;
      return 'skipped';
    }
    await sql`update email_logs set subject = ${built.subject}, to_email = ${built.to} where id = ${logId}`;
    if (!env.resendApiKey) {
      if (!env.isProduction) console.info(`[e-mail] (niet verstuurd, RESEND_API_KEY ontbreekt) aan ${built.to}: ${built.subject}`);
      await sql`update email_logs set status = 'failed', error = 'RESEND_API_KEY ontbreekt' where id = ${logId}`;
      return 'failed';
    }
    const id = await sendViaResend(built);
    await sql`update email_logs set status = 'sent', provider_message_id = ${id}, sent_at = now(), error = null where id = ${logId}`;
    return 'sent';
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[e-mail] verzenden mislukt', msg);
    await sql`update email_logs set status = 'failed', error = ${msg.slice(0, 500)} where id = ${logId}`;
    return 'failed';
  }
}

export async function queueEmail(template: EmailTemplateKey, payload: EmailPayload, meta: { to: string; orderId?: string | null; eventId?: string | null }) {
  const [row] = await sql<{ id: string }[]>`
    insert into email_logs (order_id, event_id, to_email, template, subject, payload)
    values (${meta.orderId ?? null}, ${meta.eventId ?? null}, ${meta.to}, ${template}, ${template}, ${sql.json(payload as never)})
    returning id`;
  const result = await deliverEmail(row.id);
  return { id: row.id, result };
}

export async function queueOrderEmail(template: EmailTemplateKey, orderId: string, extra: Omit<EmailPayload, 'orderId'> = {}) {
  const [o] = await sql<{ email: string; event_id: string }[]>`select email, event_id from orders where id = ${orderId}`;
  if (!o) return null;
  return queueEmail(template, { orderId, ...extra }, { to: o.email, orderId, eventId: o.event_id });
}
