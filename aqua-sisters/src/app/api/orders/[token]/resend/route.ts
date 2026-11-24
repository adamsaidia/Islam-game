import { NextResponse } from 'next/server';
import { getOrderByToken } from '@/lib/order-data';
import { queueOrderEmail } from '@/lib/email';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await getOrderByToken(token);
  if (!data) return NextResponse.json({ message: 'Niet gevonden' }, { status: 404 });
  if (!(await rateLimit(`resend:${data.order.id}`, 3600, 3))) {
    return NextResponse.json({ message: 'Je hebt de e-mail al een paar keer opnieuw aangevraagd. Probeer het later nog eens.' }, { status: 429 });
  }
  const template = data.order.status === 'awaiting_transfer' ? 'order_received' : 'tickets';
  if (template === 'tickets' && !['paid', 'partially_refunded'].includes(data.order.status)) {
    return NextResponse.json({ message: 'Er zijn nog geen tickets voor deze bestelling.' }, { status: 409 });
  }
  const r = await queueOrderEmail(template, data.order.id);
  return NextResponse.json({ ok: r?.result === 'sent', message: r?.result === 'sent' ? 'Verstuurd! Check ook je spam-map.' : 'Versturen lukte nu niet; we proberen het automatisch opnieuw.' });
}
