'use client';

import { useEffect, useState } from 'react';

/**
 * Instagram/TikTok/Facebook openen links in een eigen browser. Daarin werkt Apple Pay
 * niet en kan terugkeren vanuit de bank-app haperen. We tonen een subtiele tip om de
 * pagina in Safari of Chrome te openen. iDEAL | Wero en kaartbetalingen werken wel.
 */
export function InAppBrowserNotice() {
  const [kind, setKind] = useState<null | 'ios' | 'android'>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const inApp = /Instagram|FBAN|FBAV|FB_IAB|musical_ly|Bytedance|TikTok|Snapchat|LinkedInApp/i.test(ua);
    if (inApp) setKind(/iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'android');
  }, []);

  if (!kind) return null;
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;

  return (
    <div className="mb-8 border-l-2 border-gold bg-white px-4 py-3 text-sm" data-testid="inapp-notice">
      <p className="text-deep">Tip: open deze pagina in {kind === 'ios' ? 'Safari' : 'Chrome'} om met Apple Pay of Google Pay te betalen.</p>
      <div className="mt-2 flex flex-wrap gap-4 text-xs">
        {kind === 'android' && (
          <a href={intent} className="underline underline-offset-4">
            Openen in Chrome
          </a>
        )}
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              /* niet beschikbaar */
            }
          }}
        >
          {copied ? 'Link gekopieerd' : 'Link kopiëren'}
        </button>
        {kind === 'ios' && <span className="text-muted">Of tik op ··· en kies ‘Openen in browser’.</span>}
      </div>
    </div>
  );
}
