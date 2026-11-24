import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const PAGES = {
  privacy: { key: 'privacy', title: 'Privacyverklaring' },
  voorwaarden: { key: 'terms', title: 'Algemene voorwaarden' },
  huisregels: { key: 'houseRules', title: 'Huisregels' },
  annulering: { key: 'cancellation', title: 'Annuleringsvoorwaarden' },
} as const;

type Props = { params: Promise<{ legal: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { legal } = await params;
  const p = PAGES[legal as keyof typeof PAGES];
  return p ? { title: p.title } : {};
}

export default async function LegalPage({ params }: Props) {
  const { legal } = await params;
  const p = PAGES[legal as keyof typeof PAGES];
  if (!p) notFound();
  const settings = await getSettings();
  const doc = settings.legal[p.key];
  return (
    <div className="bg-cream">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <p className="eyebrow">Aqua Sisters</p>
        <h1 className="display mt-3 text-5xl text-deep">{p.title}</h1>
        {!doc.approved && (
          <p className="mt-6 border-l-2 border-warn bg-white px-4 py-3 text-sm">Deze tekst is een concept en wordt nog gecontroleerd.</p>
        )}
        <div className="prose-legal mt-10 text-[0.98rem] text-ink/90">{doc.text.replace(/^CONCEPT.*\n+/i, '')}</div>
      </article>
    </div>
  );
}
