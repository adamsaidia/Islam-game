import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { Logo } from '@/components/Logo';
import { requireAdmin } from '@/lib/auth/session';
import { logoutAction } from '../login/actions';

export const metadata: Metadata = { title: { default: 'Beheer', template: '%s · Beheer' }, robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin({ allowWithout2fa: true });
  return (
    <div className="min-h-dvh bg-cream md:grid md:grid-cols-[15rem_1fr] md:bg-[linear-gradient(to_right,var(--color-deep)_15rem,var(--color-cream)_15rem)]">
      <aside className="bg-deep text-cream md:sticky md:top-0 md:h-dvh md:overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 md:block md:px-5 md:py-6">
          <Link href="/admin"><Logo light /></Link>
          <form action={logoutAction} className="md:hidden">
            <button className="text-xs text-cream/60">Uitloggen</button>
          </form>
        </div>
        <div className="px-2 pb-3 md:px-2">
          <AdminNav />
        </div>
        <div className="hidden space-y-2 border-t border-white/10 px-5 py-5 text-xs text-cream/60 md:block">
          <p className="truncate text-cream/80">{user.name}</p>
          <Link href="/scanner" className="block hover:text-white">Scanner openen ↗</Link>
          <Link href="/admin/account" className="block hover:text-white">Mijn account{!user.totpEnabled && ' · 2FA uit'}</Link>
          <form action={logoutAction}><button className="hover:text-white">Uitloggen</button></form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 md:px-12 md:py-12">
        {!user.totpEnabled && (
          <p className="mb-6 border-l-2 border-warn bg-white px-4 py-3 text-sm">
            Tweestapsverificatie staat uit. <Link href="/admin/account" className="underline underline-offset-4">Zet 2FA aan</Link> om het dashboard te beveiligen.
          </p>
        )}
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
