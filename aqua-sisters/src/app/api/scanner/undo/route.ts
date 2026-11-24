import { NextResponse } from 'next/server';
import { apiStaff } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { audit } from '@/lib/audit';
import { isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

/** Correctie van een foutieve scan. Medewerkers: alleen eigen scans binnen 10 minuten. Beheerders: altijd. */
export async function POST(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const { ticketId, reason } = (await req.json().catch(() => ({}))) as { ticketId?: string; reason?: string };
  if (!isUuid(ticketId)) return NextResponse.json({ message: 'Ongeldig' }, { status: 400 });
  if (!user.roles.includes('admin')) {
    const [t] = await sql`select 1 from tickets where id = ${ticketId} and checked_in_by = ${user.id} and checked_in_at > now() - interval '10 minutes'`;
    if (!t) return NextResponse.json({ message: 'Alleen je eigen scans van de afgelopen 10 minuten kun je terugdraaien. Vraag een beheerder.' }, { status: 403 });
  }
  const [{ ok }] = await sql<{ ok: boolean }[]>`select undo_check_in(${ticketId}, ${user.id}, ${String(reason || 'Correctie via scanner').slice(0, 200)}) as ok`;
  await audit(user.id, 'checkin.undo', 'ticket', ticketId, { reason });
  return NextResponse.json({ ok });
}
