import 'server-only';
import postgres from 'postgres';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __aquaSql: postgres.Sql | undefined;
}

/**
 * Server-side databaseverbinding. Werkt met de Supabase connection pooler
 * (transaction mode, poort 6543) – daarom `prepare: false`.
 */
export function getSql(): postgres.Sql {
  if (!globalThis.__aquaSql) {
    const url = env.databaseUrl;
    const local = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);
    globalThis.__aquaSql = postgres(url, {
      // Supabase vereist een versleutelde verbinding; lokaal niet.
      ssl: local || /sslmode=disable/.test(url) ? false : 'require',
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
      types: {
        bigint: postgres.BigInt,
      },
    });
  }
  return globalThis.__aquaSql;
}

export const sql = new Proxy((() => {}) as unknown as postgres.Sql, {
  apply(_t, _this, args) {
    return (getSql() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_t, prop) {
    const real = getSql() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});
