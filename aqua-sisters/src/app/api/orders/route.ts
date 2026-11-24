import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/validation';
import { placeOrder } from '@/lib/orders';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!(await rateLimit(`order:${ip}`, 600, 20))) {
    return NextResponse.json({ message: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' }, { status: 429 });
  }
  const json = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ message: first?.message || 'Controleer je gegevens.', field: first?.path.join('.') }, { status: 400 });
  }
  try {
    const result = await placeOrder(parsed.data);
    if (!result.ok) return NextResponse.json({ message: result.message, code: 'code' in result ? result.code : undefined }, { status: 409 });
    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (e) {
    console.error('[bestelling] onverwachte fout', e);
    return NextResponse.json({ message: 'Er ging iets mis aan onze kant. Probeer het opnieuw.' }, { status: 500 });
  }
}
