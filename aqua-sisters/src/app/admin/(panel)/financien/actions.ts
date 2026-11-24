'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { parseEuroToCents } from '@/lib/money';

const CATS = ['venue', 'staff', 'marketing', 'payment_fees', 'insurance', 'other'];

export async function addExpense(form: FormData) {
  const user = await requireAdmin();
  const amount = parseEuroToCents(String(form.get('amount') || ''));
  const vat = form.get('vat') ? parseEuroToCents(String(form.get('vat'))) : null;
  const category = String(form.get('category'));
  const description = String(form.get('description') || '').trim().slice(0, 200);
  const eventId = String(form.get('event_id') || '') || null;
  const date = String(form.get('incurred_on') || '') || new Date().toISOString().slice(0, 10);
  if (amount == null || !CATS.includes(category) || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect('/admin/financien?error=' + encodeURIComponent('Controleer bedrag, categorie en omschrijving.'));
  const [row] = await sql<{ id: string }[]>`insert into expenses (event_id, category, description, amount_cents, vat_cents, incurred_on, created_by)
    values (${eventId}, ${category}, ${description}, ${amount}, ${vat}, ${date}, ${user.id}) returning id`;
  await audit(user.id, 'expense.create', 'expense', row.id, { amount, category });
  redirect('/admin/financien?msg=Kostenpost+toegevoegd');
}

export async function deleteExpense(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  await sql`delete from expenses where id = ${id}`;
  await audit(user.id, 'expense.delete', 'expense', id);
  redirect('/admin/financien?msg=Verwijderd');
}
