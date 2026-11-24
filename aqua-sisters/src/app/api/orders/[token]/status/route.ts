import { NextResponse } from 'next/server';
import { getOrderByToken } from '@/lib/order-data';
import { syncLatestPaymentForOrder } from '@/lib/orders';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!(await rateLimit(`status:${await clientIp()}`, 60, 60))) return NextResponse.json({}, { status: 429 });
  let data = await getOrderByToken(token);
  if (!data) return NextResponse.json({ message: 'Niet gevonden' }, { status: 404 });
  if (data.order.status === 'pending') {
    // Vangnet als de webhook vertraagd is: status server-side bij de provider ophalen.
    await syncLatestPaymentForOrder(data.order.id);
    data = (await getOrderByToken(token))!;
  }
  return NextResponse.json({ status: data.order.status }, { headers: { 'Cache-Control': 'no-store' } });
}
