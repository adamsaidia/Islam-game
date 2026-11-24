'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  ['/admin', 'Overzicht'],
  ['/admin/evenementen', 'Evenementen'],
  ['/admin/bestellingen', 'Bestellingen'],
  ['/admin/financien', 'Financiën'],
  ['/admin/marketing', 'Marketing'],
  ['/admin/emails', 'E-mails'],
  ['/admin/instellingen', 'Instellingen'],
  ['/admin/gebruikers', 'Gebruikers'],
  ['/admin/privacy', 'Privacy (AVG)'],
  ['/admin/logboek', 'Logboek'],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Beheer" className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
      {ITEMS.map(([href, label]) => {
        const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap px-3 py-2 text-sm transition md:border-l-2 ${active ? 'border-gold text-white md:bg-white/5' : 'border-transparent text-cream/60 hover:text-white'}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
