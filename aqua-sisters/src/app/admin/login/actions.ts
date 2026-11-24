'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { DUMMY_HASH, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { verifyTotp } from '@/lib/auth/totp';
import { decrypt } from '@/lib/crypto';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { audit } from '@/lib/audit';

export type LoginState = { error?: string } | undefined;

function safeNext(n: FormDataEntryValue | null, fallback: string) {
  const s = typeof n === 'string' ? n : '';
  return /^\/(admin|scanner)(\/|$)[\w\-/?=&]*$/.test(s) ? s : fallback;
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') || '').trim().toLowerCase().slice(0, 200);
  const password = String(form.get('password') || '').slice(0, 200);
  const ip = await clientIp();
  const ua = (await headers()).get('user-agent') || '';
  if (!(await rateLimit(`login-ip:${ip}`, 900, 20)) || !(await rateLimit(`login-email:${email}`, 900, 8))) {
    return { error: 'Te veel inlogpogingen. Wacht 15 minuten en probeer het opnieuw.' };
  }
  const [u] = await sql<{ id: string; password_hash: string; totp_enabled: boolean; roles: string[] }[]>`
    select u.id, u.password_hash, u.totp_enabled, coalesce(array_agg(r.role) filter (where r.role is not null), '{}') as roles
    from users u left join user_roles r on r.user_id = u.id
    where lower(u.email) = ${email} and u.is_active group by u.id`;
  const ok = await verifyPassword(password, u?.password_hash ?? DUMMY_HASH);
  if (!u || !ok) {
    await audit(null, 'auth.login_failed', 'user', null, { email }, ip);
    return { error: 'E-mailadres of wachtwoord klopt niet.' };
  }
  await createSession(u.id, false, ip, ua);
  await sql`update users set last_login_at = now() where id = ${u.id}`;
  await audit(u.id, 'auth.login', 'user', u.id, null, ip);
  const isAdmin = u.roles.includes('admin');
  const next = safeNext(form.get('next'), isAdmin ? '/admin' : '/scanner');
  if (u.totp_enabled) redirect(`/admin/login/2fa?next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function verify2faAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (!(await rateLimit(`2fa:${user.id}`, 900, 10))) return { error: 'Te veel pogingen. Wacht 15 minuten.' };
  const [row] = await sql<{ totp_secret: string | null }[]>`select totp_secret from users where id = ${user.id}`;
  const code = String(form.get('code') || '');
  if (!row?.totp_secret || !verifyTotp(decrypt(row.totp_secret, env.encryptionKey), code)) {
    await audit(user.id, 'auth.2fa_failed', 'user', user.id);
    return { error: 'Code klopt niet. Probeer het opnieuw.' };
  }
  await sql`update sessions set mfa_verified = true where id = ${user.sessionId}`;
  redirect(safeNext(form.get('next'), user.roles.includes('admin') ? '/admin' : '/scanner'));
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin/login');
}
