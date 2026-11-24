'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { anonymizeOrders } from '@/lib/privacy';

export async function anonymizePerson(form: FormData) {
  const user = await requireAdmin();
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!email.includes('@')) redirect('/admin/privacy?error=Ongeldig+e-mailadres');
  const orders = await sql<{ id: string }[]>`select o.id from orders o join events e on e.id = o.event_id where lower(o.email) = ${email}`;
  const n = await anonymizeOrders(orders.map((o) => o.id));
  const w = await sql`delete from waitlist where lower(email) = ${email} returning id`;
  await sql`update email_logs set to_email = 'geanonimiseerd' where lower(to_email) = ${email}`;
  await audit(user.id, 'privacy.anonymize', 'person', null, { orders: n, waitlist: w.length });
  redirect(`/admin/privacy?msg=${encodeURIComponent(`${n} bestelling(en) geanonimiseerd, ${w.length} wachtlijst-aanmelding(en) verwijderd.`)}`);
}
