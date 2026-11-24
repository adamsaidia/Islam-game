import Link from 'next/link';
import { Logo } from './Logo';

export function SiteHeader({ light = false, cta }: { light?: boolean; cta?: { href: string; label: string } }) {
  return (
    <header className={`relative z-20 ${light ? 'text-white' : 'text-deep'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Aqua Sisters – home">
          <Logo light={light} />
        </Link>
        {cta && (
          <Link href={cta.href} className={`hidden text-sm tracking-wide underline-offset-8 hover:underline md:inline ${light ? 'text-white' : 'text-deep'}`}>
            {cta.label}
          </Link>
        )}
      </div>
    </header>
  );
}
