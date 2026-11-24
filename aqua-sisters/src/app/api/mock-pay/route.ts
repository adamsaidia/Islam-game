import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/** Alleen voor de testprovider: zet de status van een testbetaling en stuurt de webhook. */
export async function POST(req: Request) {
  if (env.paymentProvider !== 'mock') return new NextResponse(null, { status: 404 });
  const form = await req.formData();
  const id = String(form.get('id') || '');
  const action = String(form.get('action') || '');
  const amount = form.get('amount') ? Number(form.get('amount')) : null;
  if (!['paid', 'canceled', 'failed', 'expired'].includes(action)) return new NextResponse(null, { status: 400 });
  const [p] = await sql<{ order_id: string; access_token: string }[]>`
    update payments p set raw = coalesce(p.raw, '{}'::jsonb) || ${sql.json({ mock_status: action, ...(amount != null ? { mock_amount: amount } : {}) })}
    from orders o where o.id = p.order_id and p.provider = 'mock' and p.provider_payment_id = ${id}
    returning p.order_id, o.access_token`;
  if (!p) return new NextResponse(null, { status: 404 });
  await fetch(`${env.appUrl}/api/webhooks/mock`, { method: 'POST', body: new URLSearchParams({ id }) });
  const target = action === 'paid' ? `/bestelling/${p.access_token}?retour=1` : `/bestelling/${p.access_token}?geannuleerd=1`;
  return NextResponse.redirect(new URL(target, env.appUrl), 303);
}
