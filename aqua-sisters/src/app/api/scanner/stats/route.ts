import { NextResponse } from 'next/server';
import { apiStaff } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { isUuid } from '@/lib/scanner';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await apiStaff();
  if (!user) return NextResponse.json({ message: 'Niet ingelogd' }, { status: 401 });
  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!isUuid(eventId)) return NextResponse.json({ message: 'Ongeldig' }, { status: 400 });
  const [[c], recent] = await Promise.all([
    sql<{ sold: number; checked_in: number; adult_in: number; child_in: number; conflicts: number }[]>`
      select count(*) filter (where status in ('valid','checked_in'))::int as sold,
             count(*) filter (where status = 'checked_in')::int as checked_in,
             count(*) filter (where status = 'checked_in' and category = 'adult')::int as adult_in,
             count(*) filter (where status = 'checked_in' and category = 'child')::int as child_in,
             (select count(*) from check_ins ci where ci.event_id = ${eventId} and ci.action = 'offline_sync' and ci.result <> 'ok')::int as conflicts
      from tickets where event_id = ${eventId}`,
    sql`select c.id, c.result, c.action, c.scanned_at, t.ticket_number, t.id as ticket_id, t.category, u.name as by, c.user_id = ${user.id} as mine,
               o.first_name || ' ' || o.last_name as holder
        from check_ins c left join tickets t on t.id = c.ticket_id left join orders o on o.id = t.order_id left join users u on u.id = c.user_id
        where c.event_id = ${eventId} order by c.created_at desc limit 25`,
  ]);
  return NextResponse.json({ ...c, recent }, { headers: { 'Cache-Control': 'no-store' } });
}
