import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Configuratiecontrole zonder geheimen te tonen: laat zien welke instellingen
 * ontbreken en of de database bereikbaar en gemigreerd is.
 */
export async function GET() {
  const has = (k: string) => !!process.env[k];
  const config = {
    DATABASE_URL: has('DATABASE_URL'),
    APP_URL: has('APP_URL'),
    ENCRYPTION_KEY: has('ENCRYPTION_KEY'),
    CRON_SECRET: has('CRON_SECRET'),
    MOLLIE_API_KEY: has('MOLLIE_API_KEY'),
    RESEND_API_KEY: has('RESEND_API_KEY'),
    EMAIL_FROM: has('EMAIL_FROM'),
  };
  let database: 'ok' | 'not_configured' | 'not_migrated' | 'unreachable' = 'not_configured';
  let detail: string | undefined;
  if (config.DATABASE_URL) {
    try {
      const { getSql } = await import('@/lib/db');
      const sql = getSql();
      const [r] = await sql<{ ok: boolean }[]>`select to_regclass('public.events') is not null as ok`;
      database = r.ok ? 'ok' : 'not_migrated';
    } catch (e) {
      database = 'unreachable';
      detail = (e as { code?: string }).code || 'connectiefout';
    }
  }
  const ready = database === 'ok' && config.APP_URL && config.ENCRYPTION_KEY;
  return NextResponse.json({ ready, database, detail, config }, { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
