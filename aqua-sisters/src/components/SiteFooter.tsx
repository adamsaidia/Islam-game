import Link from 'next/link';
import { Logo } from './Logo';
import type { Settings } from '@/lib/settings-defaults';

export function SiteFooter({ settings }: { settings: Settings }) {
  const s = settings.site;
  const socials = [
    { href: s.instagramUrl, label: 'Instagram' },
    { href: s.tiktokUrl, label: 'TikTok' },
    { href: s.whatsappUrl, label: 'WhatsApp' },
  ].filter((x) => x.href);
  return (
    <footer className="bg-deep text-cream/80">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">{s.tagline}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow !text-gold">Contact</p>
          {s.contactEmail && (
            <p>
              <a className="hover:text-white" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>
            </p>
          )}
          {s.contactPhone && (
            <p>
              <a className="hover:text-white" href={`tel:${s.contactPhone.replace(/\s/g, '')}`}>{s.contactPhone}</a>
            </p>
          )}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
              {socials.map((x) => (
                <li key={x.label}>
                  <a className="underline-offset-4 hover:text-white hover:underline" href={x.href} target="_blank" rel="noopener noreferrer">{x.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow !text-gold">Informatie</p>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" href="/huisregels">Huisregels</Link></li>
            <li><Link className="hover:text-white" href="/voorwaarden">Algemene voorwaarden</Link></li>
            <li><Link className="hover:text-white" href="/annulering">Annuleringsvoorwaarden</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacyverklaring</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-cream/40">© {new Date().getFullYear()} {s.orgName}</p>
      </div>
    </footer>
  );
}
