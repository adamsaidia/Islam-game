import type { Metadata, Viewport } from 'next';
import { requireStaff } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { formatDate, formatTimeRange } from '@/lib/dates';
import { Scanner } from '@/components/scanner/Scanner';
import { logoutAction } from '../admin/login/actions';

export const metadata: Metadata = { title: 'Scanner', robots: { index: false } };
export const viewport: Viewport = { themeColor: '#0C3331', width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false };
export const dynamic = 'force-dynamic';

export default async function ScannerPage() {
  const user = await requireStaff();
  const events = await sql<{ id: string; title: string; city: string; starts_at: Date; ends_at: Date }[]>`
    select id, title, city, starts_at, ends_at from events
    where status in ('published', 'hidden') and ends_at > now() - interval '12 hours'
    order by starts_at limit 20`;
  return (
    <Scanner
      user={{ name: user.name, isAdmin: user.roles.includes('admin') }}
      events={events.map((e) => ({ id: e.id, label: `${e.city} · ${formatDate(e.starts_at)}`, time: formatTimeRange(e.starts_at, e.ends_at), title: e.title }))}
      logout={logoutAction}
    />
  );
}
