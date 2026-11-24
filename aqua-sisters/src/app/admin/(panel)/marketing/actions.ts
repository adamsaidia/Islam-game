'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { fromLocalInput } from '@/lib/dates';
import { parseEuroToCents } from '@/lib/money';

const back = (p: Record<string, string>): never => redirect('/admin/marketing?' + new URLSearchParams(p).toString());

export async function saveDiscount(form: FormData) {
  const user = await requireAdmin();
  const code = String(form.get('code') || '').trim().toUpperCase();
  const kind = String(form.get('kind'));
  const raw = String(form.get('amount') || '');
  const amount = kind === 'percent' ? Number(raw) : parseEuroToCents(raw);
  const maxUses = form.get('max_uses') ? Number(form.get('max_uses')) : null;
  const startsAt = form.get('starts_at') ? fromLocalInput(String(form.get('starts_at'))) : null;
  const endsAt = form.get('ends_at') ? fromLocalInput(String(form.get('ends_at'))) : null;
  const eventId = String(form.get('event_id') || '') || null;
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) back({ error: 'Code: 3–32 tekens, letters/cijfers/-/_' });
  if (!['fixed', 'percent'].includes(kind) || amount == null || !Number.isInteger(amount) || amount <= 0 || (kind === 'percent' && amount > 100)) back({ error: 'Ongeldige korting.' });
  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) back({ error: 'Ongeldig maximum aantal.' });
  try {
    await sql`insert into discount_codes (code, kind, amount, event_id, max_uses, starts_at, ends_at, description)
              values (${code}, ${kind}, ${amount}, ${eventId}, ${maxUses}, ${startsAt}, ${endsAt}, ${String(form.get('description') || '').slice(0, 200) || null})`;
  } catch {
    back({ error: 'Deze code bestaat al.' });
  }
  await audit(user.id, 'discount.create', 'discount', code, { kind, amount, maxUses });
  back({ msg: `Kortingscode ${code} aangemaakt.` });
}

export async function toggleDiscount(form: FormData) {
  const user = await requireAdmin();
  const id = String(form.get('id'));
  await sql`update discount_codes set is_active = not is_active where id = ${id}`;
  await audit(user.id, 'discount.toggle', 'discount', id);
  back({ msg: 'Bijgewerkt.' });
}
