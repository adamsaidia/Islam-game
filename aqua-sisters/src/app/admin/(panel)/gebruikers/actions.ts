'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { hashPassword, passwordProblems } from '@/lib/auth/password';

const back = (p: Record<string, string>): never => redirect('/admin/gebruikers?' + new URLSearchParams(p).toString());

export async function createUser(form: FormData) {
  const admin = await requireAdmin();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const name = String(form.get('name') || '').trim().slice(0, 80);
  const role = String(form.get('role'));
  const password = String(form.get('password') || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) back({ error: 'Vul naam en e-mailadres in.' });
  if (!['admin', 'staff'].includes(role)) back({ error: 'Ongeldige rol.' });
  const problem = passwordProblems(password);
  if (problem) back({ error: problem });
  try {
    await sql.begin(async (tx) => {
      const [u] = await tx<{ id: string }[]>`insert into users (email, name, password_hash) values (${email}, ${name}, ${await hashPassword(password)}) returning id`;
      await tx`insert into user_roles (user_id, role) values (${u.id}, ${role})`;
      await audit(admin.id, 'user.create', 'user', u.id, { email, role });
    });
  } catch {
    back({ error: 'Dit e-mailadres heeft al een account.' });
  }
  back({ msg: `Account voor ${name} aangemaakt. Geef het wachtwoord persoonlijk door.` });
}

export async function setUserActive(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get('id'));
  const active = form.get('active') === 'true';
  if (id === admin.id) back({ error: 'Je kunt jezelf niet deactiveren.' });
  await sql`update users set is_active = ${active} where id = ${id}`;
  if (!active) await sql`delete from sessions where user_id = ${id}`;
  await audit(admin.id, active ? 'user.activate' : 'user.deactivate', 'user', id);
  back({ msg: 'Bijgewerkt.' });
}

export async function resetPassword(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get('id'));
  const password = String(form.get('password') || '');
  const problem = passwordProblems(password);
  if (problem) back({ error: problem });
  await sql`update users set password_hash = ${await hashPassword(password)} where id = ${id}`;
  await sql`delete from sessions where user_id = ${id}`;
  await audit(admin.id, 'user.reset_password', 'user', id);
  back({ msg: 'Wachtwoord gewijzigd; bestaande sessies zijn uitgelogd.' });
}

export async function reset2fa(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get('id'));
  await sql`update users set totp_enabled = false, totp_secret = null where id = ${id}`;
  await sql`delete from sessions where user_id = ${id}`;
  await audit(admin.id, 'user.reset_2fa', 'user', id);
  back({ msg: 'Tweestapsverificatie gereset.' });
}
