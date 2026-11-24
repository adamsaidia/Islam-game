import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { sql } from '../db';
import { env } from '../env';
import { randomToken, sha256 } from '../crypto';

export const SESSION_COOKIE = 'aqua_session';
const SESSION_HOURS = 12;

export type Role = 'admin' | 'staff';
export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  totpEnabled: boolean;
  mfaVerified: boolean;
  sessionId: string;
};

export async function createSession(userId: string, mfaVerified: boolean, ip: string, userAgent: string) {
  const token = randomToken(32);
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await sql`insert into sessions (token_hash, user_id, mfa_verified, expires_at, ip, user_agent)
            values (${sha256(token)}, ${userId}, ${mfaVerified}, ${expires}, ${ip}, ${userAgent.slice(0, 300)})`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.appUrl.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`delete from sessions where token_hash = ${sha256(token)}`;
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const rows = await sql<{
    session_id: string; mfa_verified: boolean; id: string; email: string; name: string; totp_enabled: boolean; roles: Role[];
  }[]>`
    select s.id as session_id, s.mfa_verified, u.id, u.email, u.name, u.totp_enabled,
           coalesce(array_agg(r.role) filter (where r.role is not null), '{}') as roles
    from sessions s
    join users u on u.id = s.user_id and u.is_active
    left join user_roles r on r.user_id = u.id
    where s.token_hash = ${sha256(token)} and s.expires_at > now()
    group by s.id, u.id`;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id, email: r.email, name: r.name, roles: r.roles, totpEnabled: r.totp_enabled,
    mfaVerified: r.mfa_verified, sessionId: r.session_id,
  };
});

export function admin2faRequired(): boolean {
  return env.isProduction && process.env.ADMIN_2FA_OPTIONAL !== 'true';
}

/** Voor pagina's en server actions in /admin. Gooit een redirect als de gebruiker geen toegang heeft. */
export async function requireAdmin(opts: { allowWithout2fa?: boolean } = {}): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) redirect('/admin/login');
  if (u.totpEnabled && !u.mfaVerified) redirect('/admin/login/2fa');
  if (!u.roles.includes('admin')) redirect(u.roles.includes('staff') ? '/scanner' : '/admin/login');
  if (!opts.allowWithout2fa && !u.totpEnabled && admin2faRequired()) redirect('/admin/account?setup2fa=1');
  return u;
}

/** Voor de scanner: medewerkers én beheerders. */
export async function requireStaff(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) redirect('/scanner/login');
  if (u.totpEnabled && !u.mfaVerified) redirect('/admin/login/2fa?next=/scanner');
  if (!u.roles.includes('staff') && !u.roles.includes('admin')) redirect('/scanner/login');
  return u;
}

/** Variant voor API-routes: geeft null terug i.p.v. redirect. */
export async function apiStaff(): Promise<CurrentUser | null> {
  const u = await getCurrentUser();
  if (!u) return null;
  if (u.totpEnabled && !u.mfaVerified) return null;
  if (!u.roles.includes('staff') && !u.roles.includes('admin')) return null;
  return u;
}
export async function apiAdmin(): Promise<CurrentUser | null> {
  const u = await apiStaff();
  return u && u.roles.includes('admin') ? u : null;
}
