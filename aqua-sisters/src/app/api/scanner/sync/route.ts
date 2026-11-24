import { NextResponse } from 'next/server';
import { apiStaff } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { checkIn, cleanToken, isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

/** Verwerkt offline gescande tickets. Dubbel gebruik tussen offline scanners wordt hier zichtbaar als conflict. */
export async function POST(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { eventId?: string; device?: string; scans?: { token: string; at: string }[] };
  if (!isUuid(body.eventId) || !Array.isArray(body.scans)) return NextResponse.json({ message: 'Ongeldig' }, { status: 400 });
  const results = [];
  for (const s of body.scans.slice(0, 1000)) {
    const token = cleanToken(s.token);
    if (!token) continue;
    const at = typeof s.at === 'string' ? s.at.slice(11, 16) : '';
    const r = await checkIn({ token, eventId: body.eventId, userId: user.id, device: `${String(body.device || '').slice(0, 40)} offline@${at}`, action: 'offline_sync' });
    results.push({ token: token.slice(0, 6), result: r.result, ticket_number: r.ticket_number, holder: r.holder, checked_in_at: r.checked_in_at });
  }
  const conflicts = results.filter((r) => r.result !== 'ok');
  if (conflicts.length) await audit(user.id, 'checkin.offline_conflicts', 'event', body.eventId, { conflicts });
  return NextResponse.json({ synced: results.length, conflicts });
}
