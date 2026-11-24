'use client';

import { useState } from 'react';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', medium: 'social' },
  { key: 'instagram', label: 'Instagram (bio/story)', medium: 'social' },
  { key: 'tiktok', label: 'TikTok (bio)', medium: 'social' },
  { key: 'email', label: 'Nieuwsbrief', medium: 'email' },
];

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [campaign, setCampaign] = useState('lancering');
  const linkFor = (c: (typeof CHANNELS)[number]) =>
    `${url}?utm_source=${c.key}&utm_medium=${c.medium}&utm_campaign=${encodeURIComponent(campaign.trim().toLowerCase().replace(/\s+/g, '-') || 'algemeen')}`;
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* geen klembord */
    }
  }
  const wa = linkFor(CHANNELS[0]);
  return (
    <div className="space-y-4 text-sm">
      <label className="block max-w-xs">
        <span className="label mb-1">Campagnenaam</span>
        <input className="input" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
      </label>
      <ul className="divide-y divide-line border-y border-line">
        {CHANNELS.map((c) => {
          const l = linkFor(c);
          return (
            <li key={c.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-deep">{c.label}</p>
                <p className="truncate text-xs text-muted">{l}</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm text-deep" onClick={() => copy(l, c.key)}>{copied === c.key ? 'Gekopieerd ✓' : 'Kopiëren'}</button>
            </li>
          );
        })}
      </ul>
      <a className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${wa}`)}`}>
        Delen via WhatsApp
      </a>
      <p className="text-xs text-muted">Linkvoorbeelden (titel, datum, afbeelding) worden automatisch getoond in WhatsApp, Instagram en TikTok.</p>
    </div>
  );
}
