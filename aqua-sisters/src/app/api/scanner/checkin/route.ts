import { NextResponse } from 'next/server';
import { apiStaff } from '@/lib/auth/session';
import { checkIn, cleanToken, isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { token?: string; ticketId?: string; eventId?: string; device?: string };
  if (!isUuid(body.eventId)) return NextResponse.json({ message: 'Kies een evenement' }, { status: 400 });
  const token = body.token != null ? cleanToken(body.token) : null;
  const ticketId = isUuid(body.ticketId) ? body.ticketId : null;
  if (!token && !ticketId) {
    // Onleesbare of vreemde QR-code: wel loggen als ongeldig.
    return NextResponse.json({ result: 'invalid' });
  }
  const r = await checkIn({ token, ticketId, eventId: body.eventId, userId: user.id, device: String(body.device || 'onbekend'), action: ticketId ? 'manual' : 'scan' });
  return NextResponse.json(r, { headers: { 'Cache-Control': 'no-store' } });
}
