import { SiteFooter } from '@/components/SiteFooter';
import { getSettings } from '@/lib/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <main className="min-h-dvh">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
