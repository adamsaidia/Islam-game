import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { syncPayment } from '@/lib/orders';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Betaalwebhook. Mollie stuurt alleen `id=tr_…`; we halen de echte status altijd
 * zelf op bij de provider (de payload wordt nooit vertrouwd). Verwerking is
 * idempotent: herhaalde webhooks geven nooit dubbele tickets.
 */
export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (provider !== 'mollie' && provider !== 'mock') return new NextResponse(null, { status: 404 });
  if (provider === 'mock' && env.paymentProvider !== 'mock') return new NextResponse(null, { status: 404 });

  let id = '';
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) id = String(((await req.json().catch(() => ({}))) as { id?: string }).id || '');
  else id = String((await req.formData().catch(() => null))?.get('id') || '');
  if (!/^[A-Za-z0-9_]{4,64}$/.test(id)) return new NextResponse(null, { status: 400 });

  const [log] = await sql<{ id: string }[]>`
    insert into payment_webhook_events (provider, provider_object_id, payload) values (${provider}, ${id}, ${sql.json({ id })}) returning id`;
  try {
    const result = await syncPayment(provider, id);
    await sql`update payment_webhook_events set processed_at = now(), result = ${result.result} where id = ${log.id}`;
    // Onbekende ID's: 200 teruggeven zodat er niets over ons systeem uitlekt.
    return new NextResponse(null, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[webhook] verwerking mislukt', msg);
    await sql`update payment_webhook_events set error = ${msg.slice(0, 500)} where id = ${log.id}`;
    // 500 → de provider probeert het later opnieuw.
    return new NextResponse(null, { status: 500 });
  }
}
