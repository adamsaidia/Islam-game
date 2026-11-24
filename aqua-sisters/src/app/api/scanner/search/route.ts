import { NextResponse } from 'next/server';
import { apiStaff } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
  if (!isUuid(eventId) || q.length < 2) return NextResponse.json({ results: [] });
  const like = `%${q.replace(/[%_\\]/g, (m) => '\\' + m)}%`;
  const rows = await sql`
    select t.id, t.ticket_number, t.category, t.status, t.checked_in_at, tt.name as ticket_type,
           o.first_name || ' ' || o.last_name as holder, o.order_number
    from tickets t join orders o on o.id = t.order_id join ticket_types tt on tt.id = t.ticket_type_id
    where t.event_id = ${eventId}
      and (t.ticket_number ilike ${like} or o.order_number ilike ${like} or (o.first_name || ' ' || o.last_name) ilike ${like} or o.email ilike ${like})
    order by o.last_name, o.first_name, t.ticket_number limit 40`;
  return NextResponse.json({ results: rows }, { headers: { 'Cache-Control': 'no-store' } });
}
