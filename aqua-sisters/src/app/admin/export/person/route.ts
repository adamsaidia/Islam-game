import { apiAdmin } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { findPersonData } from '@/lib/privacy';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await apiAdmin();
  if (!user) return new Response('Geen toegang', { status: 401 });
  const email = new URL(req.url).searchParams.get('email') || '';
  if (!email.includes('@')) return new Response('Ongeldig', { status: 400 });
  const data = await findPersonData(email);
  await audit(user.id, 'privacy.export', 'person', null, { orders: data.orders.length });
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="persoonsgegevens.json"', 'Cache-Control': 'no-store' },
  });
}
