import { getOrderByToken } from '@/lib/order-data';
import { renderTicketsPdf } from '@/lib/tickets-pdf';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await getOrderByToken(token);
  if (!data || !['paid', 'partially_refunded'].includes(data.order.status)) return new Response('Niet gevonden', { status: 404 });
  const s = await getSettings();
  const pdf = await renderTicketsPdf(data, { houseRules: s.legal.houseRules.text, contact: [s.site.contactEmail, s.site.contactPhone].filter(Boolean).join(' · ') });
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="aqua-sisters-tickets-${data.order.order_number}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
