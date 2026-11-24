import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { waitlistSchema } from '@/lib/validation';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await rateLimit(`waitlist:${await clientIp()}`, 600, 10))) {
    return NextResponse.json({ message: 'Te veel pogingen.' }, { status: 429 });
  }
  const parsed = waitlistSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message || 'Controleer je gegevens.' }, { status: 400 });
  const d = parsed.data;
  const [e] = await sql`select id from events where id = ${d.eventId} and waitlist_enabled and status in ('published','hidden')`;
  if (!e) return NextResponse.json({ message: 'Wachtlijst niet beschikbaar.' }, { status: 404 });
  await sql`insert into waitlist (event_id, first_name, email, persons) values (${d.eventId}, ${d.firstName}, ${d.email}, ${d.persons})
            on conflict (event_id, lower(email)) do update set persons = excluded.persons, first_name = excluded.first_name`;
  return NextResponse.json({ ok: true });
}
