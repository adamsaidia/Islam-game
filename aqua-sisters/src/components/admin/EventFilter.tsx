'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function EventFilter({ events, value, allLabel = 'Alle actuele evenementen' }: { events: { id: string; label: string }[]; value: string; allLabel?: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <select
      aria-label="Evenement"
      className="input max-w-xs"
      value={value}
      onChange={(e) => {
        const p = new URLSearchParams(sp.toString());
        if (e.target.value) p.set('event', e.target.value);
        else p.delete('event');
        p.delete('page');
        router.push(`${path}?${p.toString()}`);
      }}
    >
      <option value="">{allLabel}</option>
      {events.map((e) => (
        <option key={e.id} value={e.id}>{e.label}</option>
      ))}
    </select>
  );
}
