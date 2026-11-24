'use server';

import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { getCurrentUser } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { hashPassword, passwordProblems, verifyPassword } from '@/lib/auth/password';
import { generateTotpSecret, verifyTotp } from '@/lib/auth/totp';
import { decrypt, encrypt } from '@/lib/crypto';

const back = (p: Record<string, string>): never => redirect('/admin/account?' + new URLSearchParams(p).toString());

async function me() {
  const u = await getCurrentUser();
  if (!u || (u.totpEnabled && !u.mfaVerified)) redirect('/admin/login');
  return u;
}

export async function startTotp() {
  const u = await me();
  const secret = generateTotpSecret();
  await sql`update users set totp_secret = ${encrypt(secret, env.encryptionKey)}, totp_enabled = false where id = ${u.id} and not totp_enabled`;
  back({ setup: '1' });
}

export async function confirmTotp(form: FormData) {
  const u = await me();
  const [row] = await sql<{ totp_secret: string | null; totp_enabled: boolean }[]>`select totp_secret, totp_enabled from users where id = ${u.id}`;
  if (!row?.totp_secret || row.totp_enabled) back({ error: 'Start de koppeling opnieuw.' });
  if (!verifyTotp(decrypt(row.totp_secret!, env.encryptionKey), String(form.get('code') || ''))) back({ setup: '1', error: 'Code klopt niet. Controleer de tijd op je telefoon.' });
  await sql`update users set totp_enabled = true where id = ${u.id}`;
  await sql`update sessions set mfa_verified = true where id = ${u.sessionId}`;
  await sql`delete from sessions where user_id = ${u.id} and id <> ${u.sessionId}`;
  await audit(u.id, 'auth.2fa_enabled', 'user', u.id);
  back({ msg: 'Tweestapsverificatie staat aan.' });
}

export async function changePassword(form: FormData) {
  const u = await me();
  const [row] = await sql<{ password_hash: string }[]>`select password_hash from users where id = ${u.id}`;
  if (!(await verifyPassword(String(form.get('current') || ''), row.password_hash))) back({ error: 'Huidig wachtwoord klopt niet.' });
  const next = String(form.get('next') || '');
  const problem = passwordProblems(next);
  if (problem) back({ error: problem });
  await sql`update users set password_hash = ${await hashPassword(next)} where id = ${u.id}`;
  await sql`delete from sessions where user_id = ${u.id} and id <> ${u.sessionId}`;
  await audit(u.id, 'auth.password_changed', 'user', u.id);
  back({ msg: 'Wachtwoord gewijzigd. Andere sessies zijn uitgelogd.' });
}
