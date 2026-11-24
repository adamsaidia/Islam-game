import 'server-only';
import { sql } from './db';

export type CheckInResult = {
  result: 'ok' | 'already_used' | 'invalid' | 'cancelled' | 'wrong_event';
  ticket_id?: string;
  ticket_number?: string;
  category?: 'adult' | 'child';
  checked_in_at?: string;
  ticket_type?: string;
  holder?: string;
  order_number?: string;
  event_title?: string;
  event_starts_at?: string;
};

export async function checkIn(opts: { token?: string | null; ticketId?: string | null; eventId: string; userId: string; device: string; action: 'scan' | 'manual' | 'offline_sync' }) {
  const [{ r }] = await sql<{ r: CheckInResult }[]>`
    select check_in_ticket(${opts.token ?? null}, ${opts.ticketId ?? null}, ${opts.eventId}, ${opts.userId}, ${opts.device.slice(0, 80)}, ${opts.action}) as r`;
  return r;
}

export function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** QR-inhoud: alleen het willekeurige token (geen persoonsgegevens). */
export function cleanToken(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  return /^[A-Za-z0-9_-]{30,64}$/.test(t) ? t : null;
}
