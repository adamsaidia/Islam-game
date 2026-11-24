import 'server-only';
import { sql } from './db';
import { env } from './env';
import { DEFAULT_SETTINGS, type Settings } from './settings-defaults';

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isObj(base) || !isObj(override)) return (override === undefined ? base : (override as T));
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in out && isObj(out[k]) && isObj(v) ? deepMerge(out[k], v) : v;
  }
  return out as T;
}

export async function getSettings(): Promise<Settings> {
  if (!env.dbConfigured) return DEFAULT_SETTINGS;
  const rows = await sql<{ key: string; value: unknown }[]>`select key, value from settings`;
  let s: Settings = DEFAULT_SETTINGS;
  for (const r of rows) {
    if (r.key in DEFAULT_SETTINGS) {
      s = { ...s, [r.key]: deepMerge((DEFAULT_SETTINGS as Record<string, unknown>)[r.key], r.value) } as Settings;
    }
  }
  return s;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  await sql`
    insert into settings (key, value) values (${key}, ${sql.json(value as never)})
    on conflict (key) do update set value = excluded.value`;
}
