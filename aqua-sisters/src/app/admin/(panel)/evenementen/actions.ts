'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { fromLocalInput } from '@/lib/dates';
import { parseEuroToCents } from '@/lib/money';
import { queueEmail, queueOrderEmail } from '@/lib/email';

const optInt = z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().int().min(0).max(100000).nullable());
const optDate = z.preprocess((v) => (v ? fromLocalInput(String(v)) : null), z.date().nullable());
const optText = (max: number) => z.preprocess((v) => (v === '' || v == null ? null : String(v).trim()), z.string().max(max).nullable());

const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Gebruik kleine letters, cijfers en streepjes').max(80),
  subtitle: optText(200),
  description: optText(3000),
  starts_at: z.preprocess((v) => fromLocalInput(String(v || '')), z.date({ error: 'Ongeldige starttijd' })),
  ends_at: z.preprocess((v) => fromLocalInput(String(v || '')), z.date({ error: 'Ongeldige eindtijd' })),
  venue_name: z.string().trim().min(2).max(120),
  venue_address: optText(200),
  city: z.string().trim().min(2).max(80),
  pool_name: optText(80),
  dress_code: optText(120),
  audience_note: optText(200),
  child_age_min: optInt,
  child_age_max: optInt,
  capacity: z.coerce.number().int().min(0).max(100000),
  hold_minutes: z.coerce.number().int().min(2).max(60),
  sales_start_at: optDate,
  sales_end_at: optDate,
  waitlist_enabled: z.preprocess((v) => v === 'on', z.boolean()),
  status: z.enum(['draft', 'published', 'hidden', 'archived']),
});

function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params).toString()}`);
}

export async function saveEvent(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id') || '');
  const path = id ? `/admin/evenementen/${id}` : '/admin/evenementen/nieuw';
  const parsed = eventSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(path, { error: `${parsed.error.issues[0].path.join('.')}: ${parsed.error.issues[0].message}` });
  const e = parsed.data;
  if (e.ends_at <= e.starts_at) back(path, { error: 'De eindtijd moet na de starttijd liggen.' });
  if (e.child_age_min != null && e.child_age_max != null && e.child_age_min > e.child_age_max) back(path, { error: 'Minimumleeftijd is hoger dan maximumleeftijd.' });

  const values = { ...e };
  let eventId = id;
  try {
    if (id) {
      const [{ used }] = await sql<{ used: number }[]>`select event_persons_used(${id}) as used`;
      if (e.capacity < used) back(path, { error: `Capaciteit kan niet lager dan het aantal verkochte/gereserveerde plekken (${used}).` });
      const [before] = await sql<{ starts_at: Date; ends_at: Date; venue_name: string; city: string }[]>`select starts_at, ends_at, venue_name, city from events where id = ${id}`;
      await sql`update events set ${sql(values)} where id = ${id}`;
      await audit(user.id, 'event.update', 'event', id, values);
      const changed = before && (before.starts_at.getTime() !== e.starts_at.getTime() || before.ends_at.getTime() !== e.ends_at.getTime() || before.venue_name !== e.venue_name || before.city !== e.city);
      if (changed && form.get('notify_holders') === 'on') {
        const orders = await sql<{ id: string }[]>`select id from orders where event_id = ${id} and status in ('paid', 'partially_refunded')`;
        for (const o of orders) await queueOrderEmail('event_changed', o.id);
        await audit(user.id, 'event.notify_change', 'event', id, { orders: orders.length });
      }
    } else {
      const [row] = await sql<{ id: string }[]>`insert into events ${sql(values)} returning id`;
      eventId = row.id;
      await audit(user.id, 'event.create', 'event', eventId, values);
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err; // redirect
    const msg = String((err as Error).message || err);
    back(path, { error: msg.includes('events_slug_key') ? 'Deze slug is al in gebruik.' : 'Opslaan mislukt.' });
  }
  revalidatePath('/');
  back(`/admin/evenementen/${eventId}`, { msg: 'Opgeslagen.' });
}

export async function duplicateEvent(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const [src] = await sql<{ slug: string }[]>`select slug from events where id = ${id}`;
  if (!src) back('/admin/evenementen', { error: 'Niet gevonden' });
  const slug = `${src.slug}-kopie-${Math.random().toString(36).slice(2, 6)}`;
  const newId = await sql.begin(async (tx) => {
    const [n] = await tx<{ id: string }[]>`
      insert into events (slug, title, subtitle, description, starts_at, ends_at, venue_name, venue_address, city, pool_name,
        dress_code, audience_note, child_age_min, child_age_max, capacity, status, hold_minutes, waitlist_enabled, image_id)
      select ${slug}, title, subtitle, description, starts_at, ends_at, venue_name, venue_address, city, pool_name,
        dress_code, audience_note, child_age_min, child_age_max, capacity, 'draft', hold_minutes, waitlist_enabled, image_id
      from events where id = ${id} returning id`;
    await tx`insert into ticket_types (event_id, name, description, category, price_cents, persons_per_unit, capacity, max_per_order, is_active, sort_order)
             select ${n.id}, name, description, category, price_cents, persons_per_unit, capacity, max_per_order, is_active, sort_order
             from ticket_types where event_id = ${id}`;
    return n.id;
  });
  await audit(user.id, 'event.duplicate', 'event', newId, { from: id });
  back(`/admin/evenementen/${newId}`, { msg: 'Kopie aangemaakt als concept. Pas datum, locatie en slug aan.' });
}

export async function setEventFlag(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const action = String(form.get('action'));
  if (action === 'publish') await sql`update events set status = 'published' where id = ${id}`;
  else if (action === 'hide') await sql`update events set status = 'hidden' where id = ${id}`;
  else if (action === 'pause') await sql`update events set sales_paused = true where id = ${id}`;
  else if (action === 'resume') await sql`update events set sales_paused = false where id = ${id}`;
  else if (action === 'archive') await sql`update events set status = 'archived' where id = ${id}`;
  await audit(user.id, `event.${action}`, 'event', id);
  revalidatePath('/');
  back(`/admin/evenementen/${id}`, { msg: 'Bijgewerkt.' });
}

export async function uploadEventImage(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0) back(`/admin/evenementen/${id}`, { error: 'Kies een afbeelding.' });
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) back(`/admin/evenementen/${id}`, { error: 'Alleen JPG, PNG of WebP.' });
  if (file.size > 3_000_000) back(`/admin/evenementen/${id}`, { error: 'Maximaal 3 MB.' });
  const buf = Buffer.from(await file.arrayBuffer());
  // Controle op magic bytes: vertrouw het opgegeven type niet blind.
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf.subarray(0, 4).toString('hex') === '89504e47';
  const isWebp = buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
  if (!isJpg && !isPng && !isWebp) back(`/admin/evenementen/${id}`, { error: 'Bestand is geen geldige afbeelding.' });
  const type = isJpg ? 'image/jpeg' : isPng ? 'image/png' : 'image/webp';
  const [img] = await sql<{ id: string }[]>`insert into images (content_type, byte_size, data) values (${type}, ${buf.length}, ${buf}) returning id`;
  await sql`update events set image_id = ${img.id} where id = ${id}`;
  await audit(user.id, 'event.image', 'event', id);
  revalidatePath('/');
  back(`/admin/evenementen/${id}`, { msg: 'Afbeelding geüpload.' });
}

export async function removeEventImage(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id'));
  await sql`update events set image_id = null where id = ${id}`;
  back(`/admin/evenementen/${id}`, { msg: 'Afbeelding verwijderd.' });
}

const ticketTypeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: optText(200),
  category: z.enum(['adult', 'child']),
  price: z.string(),
  persons_per_unit: z.coerce.number().int().min(1).max(20),
  capacity: optInt,
  max_per_order: z.coerce.number().int().min(1).max(50),
  sales_start_at: optDate,
  sales_end_at: optDate,
  sort_order: z.coerce.number().int().min(0).max(1000),
  is_active: z.preprocess((v) => v === 'on', z.boolean()),
});

export async function saveTicketType(form: FormData) {
  const user = await requireAdmin();
  const eventId = String(form.get('event_id'));
  const id = String(form.get('id') || '');
  const parsed = ticketTypeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) back(`/admin/evenementen/${eventId}`, { error: `Tickettype: ${parsed.error.issues[0].path.join('.')} ${parsed.error.issues[0].message}` });
  const { price, ...rest } = parsed.data;
  const price_cents = parseEuroToCents(price);
  if (price_cents == null) back(`/admin/evenementen/${eventId}`, { error: 'Ongeldige prijs.' });
  const values = { ...rest, price_cents };
  if (id) await sql`update ticket_types set ${sql(values)} where id = ${id} and event_id = ${eventId}`;
  else await sql`insert into ticket_types ${sql({ ...values, event_id: eventId })}`;
  await audit(user.id, id ? 'ticket_type.update' : 'ticket_type.create', 'event', eventId, values);
  revalidatePath('/');
  back(`/admin/evenementen/${eventId}`, { msg: 'Tickettype opgeslagen.' });
}

export async function deleteTicketType(form: FormData) {
  const user = await requireAdmin();
  const eventId = String(form.get('event_id'));
  const id = String(form.get('id'));
  const [used] = await sql`select 1 from order_items where ticket_type_id = ${id} limit 1`;
  if (used) {
    await sql`update ticket_types set is_active = false where id = ${id}`;
    back(`/admin/evenementen/${eventId}`, { msg: 'Dit type is al verkocht en is daarom gedeactiveerd in plaats van verwijderd.' });
  }
  await sql`delete from ticket_types where id = ${id} and event_id = ${eventId}`;
  await audit(user.id, 'ticket_type.delete', 'event', eventId, { id });
  back(`/admin/evenementen/${eventId}`, { msg: 'Tickettype verwijderd.' });
}

export async function notifyWaitlist(form: FormData) {
  const user = await requireAdmin();
  const eventId = String(form.get('event_id'));
  const count = Math.max(1, Math.min(500, Number(form.get('count')) || 0));
  const rows = await sql<{ id: string; email: string }[]>`
    select id, email from waitlist where event_id = ${eventId} and notified_at is null order by created_at limit ${count}`;
  for (const w of rows) {
    await queueEmail('waitlist', { waitlistId: w.id }, { to: w.email, eventId });
    await sql`update waitlist set notified_at = now() where id = ${w.id}`;
  }
  await audit(user.id, 'waitlist.notify', 'event', eventId, { count: rows.length });
  back(`/admin/evenementen/${eventId}`, { msg: `${rows.length} wachtlijst-aanmelding(en) geïnformeerd.` });
}

export async function deleteWaitlistEntry(form: FormData) {
  await requireAdmin();
  const eventId = String(form.get('event_id'));
  await sql`delete from waitlist where id = ${String(form.get('id'))} and event_id = ${eventId}`;
  back(`/admin/evenementen/${eventId}`, { msg: 'Verwijderd van de wachtlijst.' });
}
