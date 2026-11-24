import 'server-only';
import { headers } from 'next/headers';
import { sql } from './db';

/** true = toegestaan. Werkt over alle serverinstanties heen (teller in de database). */
export async function rateLimit(key: string, windowSeconds: number, limit: number): Promise<boolean> {
  const [r] = await sql<{ ok: boolean }[]>`select rate_limit_hit(${key}, ${windowSeconds}, ${limit}) as ok`;
  return r.ok;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'unknown').trim().slice(0, 64);
}
