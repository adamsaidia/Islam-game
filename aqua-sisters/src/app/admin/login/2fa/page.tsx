import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TwoFactorForm } from '@/components/LoginForm';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Tweestapsverificatie', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await getCurrentUser();
  if (!u) redirect('/admin/login');
  const { next } = await searchParams;
  return <TwoFactorForm next={next || (u.roles.includes('admin') ? '/admin' : '/scanner')} />;
}
