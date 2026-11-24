import 'server-only';
import { sql } from './db';
import { formatDateShort } from './dates';

export async function eventOptions() {
  const rows = await sql<{ id: string; title: string; city: string; starts_at: Date }[]>`
    select id, title, city, starts_at from events where status <> 'archived' order by starts_at desc`;
  return rows.map((r) => ({ id: r.id, label: `${formatDateShort(r.starts_at)} · ${r.city}` }));
}

export function fillDays(rows: { day: string; value: number }[]) {
  if (!rows.length) return [];
  const out: { label: string; value: number }[] = [];
  const map = new Map(rows.map((r) => [r.day, r.value]));
  const d = new Date(rows[0].day + 'T12:00:00Z');
  const end = new Date(rows[rows.length - 1].day + 'T12:00:00Z');
  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    out.push({ label: key, value: map.get(key) ?? 0 });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
