import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

export const TEST_DB = process.env.DATABASE_URL!;

/** Zet een schone testdatabase neer met alle migraties. */
export async function resetDatabase() {
  const sql = postgres(TEST_DB, { max: 1, onnotice: () => {} });
  await sql.unsafe('drop schema if exists public cascade; create schema public;');
  const dir = path.resolve(import.meta.dirname, '../../supabase/migrations');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) {
    await sql.unsafe(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  await sql.end();
}

export function client(max = 30) {
  return postgres(TEST_DB, { max, onnotice: () => {} });
}

export async function makeEvent(sql: postgres.Sql, opts: { capacity?: number; slug?: string; startsInDays?: number; status?: string } = {}) {
  const slug = opts.slug ?? 'test-' + Math.random().toString(36).slice(2, 8);
  const days = opts.startsInDays ?? 30;
  const [e] = await sql<{ id: string }[]>`
    insert into events (slug, title, starts_at, ends_at, venue_name, city, capacity, status)
    values (${slug}, 'Test', now() + make_interval(days => ${days}), now() + make_interval(days => ${days}, hours => 2), 'Bad', 'Utrecht', ${opts.capacity ?? 300}, ${opts.status ?? 'published'})
    returning id`;
  const types = await sql<{ id: string; category: string }[]>`
    insert into ticket_types (event_id, name, category, price_cents, sort_order)
    values (${e.id}, 'Volwassene', 'adult', 1350, 1), (${e.id}, 'Kind', 'child', 800, 2) returning id, category`;
  return { eventId: e.id, adult: types.find((t) => t.category === 'adult')!.id, child: types.find((t) => t.category === 'child')!.id };
}

export async function createOrder(
  sql: postgres.Sql,
  eventId: string,
  items: { ticket_type_id: string; quantity: number }[],
  opts: { code?: string; admin?: boolean; free?: boolean; email?: string } = {},
) {
  const [{ r }] = await sql<{ r: Record<string, unknown> }[]>`
    select create_order(${eventId}, ${sql.json(items)}, 'Fatima', 'Test', ${opts.email ?? 'f@example.com'}, null, ${opts.code ?? null}, false, null, false, null, null, ${opts.admin ?? false}, ${opts.free ?? false}) as r`;
  return r as { ok: boolean; error?: string; order_id: string; total_cents: number; access_token: string; remaining?: number };
}
