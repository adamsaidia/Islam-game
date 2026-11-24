import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { apiStaff } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

/**
 * Noodpakket voor offline scannen: alleen SHA-256-hashes van de QR-tokens (de tokens
 * zelf verlaten de server niet), plus ticketnummer, categorie, status en naam.
 */
export async function GET(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!isUuid(eventId)) return NextResponse.json({ message: 'Ongeldig' }, { status: 400 });
  const rows = await sql<{ qr_token: string; ticket_number: string; category: string; status: string; holder: string }[]>`
    select t.qr_token, t.ticket_number, t.category, t.status, o.first_name || ' ' || left(o.last_name, 1) || '.' as holder
    from tickets t join orders o on o.id = t.order_id where t.event_id = ${eventId}`;
  return NextResponse.json(
    {
      eventId,
      generatedAt: new Date().toISOString(),
      tickets: rows.map((r) => ({ h: createHash('sha256').update(r.qr_token).digest('hex'), n: r.ticket_number, c: r.category, s: r.status, name: r.holder })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
