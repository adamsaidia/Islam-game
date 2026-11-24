'use client';

import Link from 'next/link';

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="water-bg grid min-h-dvh place-items-center px-6 text-white">
      <div className="max-w-md text-center">
        <p className="eyebrow !text-aqua">Aqua Sisters</p>
        <h1 className="display mt-4 text-4xl">Even geduld…</h1>
        <p className="mt-4 text-white/80">De website is tijdelijk niet bereikbaar. Probeer het over een paar minuten opnieuw.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-gold">Opnieuw proberen</button>
          <Link href="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </main>
  );
}
