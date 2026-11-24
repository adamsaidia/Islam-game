import { NextResponse } from 'next/server';
import { getOrderByToken } from '@/lib/order-data';
import { startPayment } from '@/lib/orders';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

/** Nieuwe betaalpoging voor een bestelling waarvan de reservering nog loopt. */
export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await getOrderByToken(token);
  if (!data) return NextResponse.json({ message: 'Niet gevonden' }, { status: 404 });
  if (!(await rateLimit(`pay:${data.order.id}`, 600, 5))) return NextResponse.json({ message: 'Te veel pogingen.' }, { status: 429 });
  const r = await startPayment(data.order.id);
  if ('error' in r) return NextResponse.json({ message: r.error }, { status: 409 });
  return NextResponse.json({ redirectUrl: r.checkoutUrl });
}
