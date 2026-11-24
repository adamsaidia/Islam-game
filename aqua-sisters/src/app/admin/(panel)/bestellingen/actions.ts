'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { queueOrderEmail } from '@/lib/email';
import { createOrderRecord, finalizePaidOrder, refundOrder } from '@/lib/orders';
import { parseEuroToCents } from '@/lib/money';

function back(orderId: string, params: Record<string, string>): never {
  redirect(`/admin/bestellingen/${orderId}?${new URLSearchParams(params).toString()}`);
}

export async function resendOrderEmail(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const [o] = await sql<{ status: string }[]>`select status from orders where id = ${id}`;
  const template = o?.status === 'awaiting_transfer' ? 'order_received' : 'tickets';
  const r = await queueOrderEmail(template, id);
  await audit(user.id, 'order.resend', 'order', id);
  back(id, r?.result === 'sent' ? { msg: 'E-mail verstuurd.' } : { error: 'Versturen mislukt – zie E-mails voor de foutmelding.' });
}

export async function confirmManualPayment(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const [o] = await sql<{ total_cents: number; status: string }[]>`select total_cents, status from orders where id = ${id}`;
  if (!o) back(id, { error: 'Niet gevonden' });
  const r = await finalizePaidOrder(id, o.total_cents, 'banktransfer');
  await audit(user.id, 'order.manual_payment', 'order', id, r);
  if (r.result === 'paid') back(id, { msg: 'Betaling bevestigd. Tickets zijn verstuurd.' });
  if (r.result === 'over_capacity') back(id, { error: 'Het evenement is inmiddels vol – er zijn geen tickets uitgegeven.' });
  back(id, { error: `Niet bevestigd: ${r.result}` });
}

export async function cancelTickets(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const ticketIds = form.getAll('ticket_ids').map(String).filter((t) => /^[0-9a-f-]{36}$/.test(t));
  if (!ticketIds.length) back(id, { error: 'Selecteer minimaal één ticket.' });
  const rows = await sql<{ ticket_number: string }[]>`
    update tickets set status = 'cancelled' where order_id = ${id} and id = any(${ticketIds}::uuid[]) and status in ('valid', 'checked_in')
    returning ticket_number`;
  await audit(user.id, 'tickets.cancel', 'order', id, { ticketIds });
  if (form.get('notify') === 'on' && rows.length) await queueOrderEmail('cancellation', id, { ticketNumbers: rows.map((r) => r.ticket_number) });
  back(id, { msg: `${rows.length} ticket(s) ongeldig gemaakt.` });
}

export async function cancelUnpaidOrder(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  await sql`update orders set status = 'cancelled', reserved_until = least(reserved_until, now()) where id = ${id} and status in ('pending', 'awaiting_transfer')`;
  await audit(user.id, 'order.cancel', 'order', id);
  back(id, { msg: 'Bestelling geannuleerd; plekken zijn vrijgegeven.' });
}

export async function refundAction(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const amount = parseEuroToCents(String(form.get('amount') || '0'));
  const ticketIds = form.getAll('ticket_ids').map(String).filter((t) => /^[0-9a-f-]{36}$/.test(t));
  const reason = String(form.get('reason') || '').slice(0, 300) || 'Terugbetaling op verzoek';
  if (amount == null) back(id, { error: 'Ongeldig bedrag.' });
  const r = await refundOrder(id, { amountCents: amount, reason, actorId: user.id, ticketIds });
  if (!r.ok) back(id, { error: r.message });
  back(id, { msg: `Terugbetaling verwerkt (status: ${r.status}).` });
}

export async function undoCheckIn(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const ticketId = String(form.get('ticket_id'));
  const [{ ok }] = await sql<{ ok: boolean }[]>`select undo_check_in(${ticketId}, ${user.id}, 'Correctie via dashboard') as ok`;
  await audit(user.id, 'checkin.undo', 'ticket', ticketId);
  back(id, ok ? { msg: 'Check-in teruggedraaid.' } : { error: 'Ticket was niet ingecheckt.' });
}

const contactSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(30).regex(/^[+0-9 ()-]*$/),
  note: z.string().trim().max(1000),
});

export async function updateContact(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const p = contactSchema.safeParse(Object.fromEntries(form));
  if (!p.success) back(id, { error: 'Controleer de gegevens.' });
  await sql`update orders set first_name = ${p.data.first_name}, last_name = ${p.data.last_name}, email = ${p.data.email},
            phone = ${p.data.phone || null}, note = ${p.data.note || null} where id = ${id}`;
  await audit(user.id, 'order.update_contact', 'order', id);
  back(id, { msg: 'Gegevens bijgewerkt.' });
}

export async function createManualOrder(form: FormData) {
  const user = await requireAdmin();
  const eventId = String(form.get('event_id'));
  const mode = String(form.get('mode')) as 'free' | 'banktransfer';
  const items = form
    .getAll('ticket_type_id')
    .map((tid, i) => ({ ticketTypeId: String(tid), quantity: Number(form.getAll('quantity')[i]) || 0 }))
    .filter((i) => i.quantity > 0);
  const fail = (m: string): never => redirect(`/admin/bestellingen/nieuw?event=${eventId}&error=${encodeURIComponent(m)}`);
  const contact = contactSchema.omit({ note: true }).safeParse(Object.fromEntries(form));
  if (!contact.success) fail('Vul naam en een geldig e-mailadres in.');
  if (!items.length) fail('Kies minimaal één ticket.');
  const c = contact.data!;
  const r = await createOrderRecord(
    {
      eventId,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      phone: c.phone,
      items,
      discountCode: '',
      paymentMethod: mode === 'banktransfer' ? 'banktransfer' : 'online',
      marketingOptIn: false,
    },
    { admin: true, free: mode === 'free', createdBy: user.id },
  );
  if (!r.ok) fail(r.message);
  const orderId = (r as { orderId: string }).orderId;
  await sql`update orders set note = ${String(form.get('note') || '').slice(0, 1000) || null} where id = ${orderId}`;
  if (mode === 'free') {
    await finalizePaidOrder(orderId, 0, 'free');
  } else {
    await queueOrderEmail('order_received', orderId);
  }
  await audit(user.id, `order.create_${mode}`, 'order', orderId, { items });
  back(orderId, { msg: mode === 'free' ? 'Gratis tickets aangemaakt en verstuurd.' : 'Bestelling aangemaakt; betaalinstructies verstuurd.' });
}
