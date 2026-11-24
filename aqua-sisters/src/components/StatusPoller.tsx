'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Ververst de bestelstatus tot de betaling definitief is (max. ±3 minuten). */
export function StatusPoller({ token }: { token: string }) {
  const router = useRouter();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    let tries = 0;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      tries++;
      try {
        const res = await fetch(`/api/orders/${token}/status`, { cache: 'no-store' });
        const body = await res.json();
        if (body.status && body.status !== 'pending') {
          router.refresh();
          return;
        }
      } catch {
        /* opnieuw proberen */
      }
      if (tries > 10) setSlow(true);
      if (tries < 60) setTimeout(tick, tries < 10 ? 2000 : 4000);
    };
    const t = setTimeout(tick, 1500);
    return () => {
      stopped = true;
      clearTimeout(t);
    };
  }, [token, router]);
  return (
    <div className="mb-10 flex items-center gap-3 text-sm text-muted" role="status">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-teal" />
      {slow ? 'Dit duurt langer dan normaal. Je mag deze pagina sluiten – je ontvangt je tickets per e-mail zodra de betaling binnen is.' : 'Status wordt gecontroleerd…'}
    </div>
  );
}
