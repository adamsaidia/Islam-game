import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

/** Controleert een kortingscode voor de live prijsweergave. De database blijft leidend bij bestellen. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') || '').trim().toUpperCase();
  const eventId = url.searchParams.get('eventId') || '';
  if (!(await rateLimit(`discount:${await clientIp()}`, 600, 30))) {
    return NextResponse.json({ valid: false, message: 'Te veel pogingen.' }, { status: 429 });
  }
  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !/^[0-9a-f-]{36}$/.test(eventId)) return NextResponse.json({ valid: false });
  const [d] = await sql<{ id: string; kind: 'fixed' | 'percent'; amount: number; max_uses: number | null; uses: number }[]>`
    select id, kind, amount, max_uses, discount_code_uses(id) as uses from discount_codes
    where code = ${code} and is_active and (event_id is null or event_id = ${eventId})
      and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())`;
  if (!d) return NextResponse.json({ valid: false, message: 'Deze kortingscode is niet geldig.' });
  if (d.max_uses != null && d.uses >= d.max_uses) return NextResponse.json({ valid: false, message: 'Deze kortingscode is al maximaal gebruikt.' });
  return NextResponse.json({ valid: true, kind: d.kind, amount: d.amount });
}
