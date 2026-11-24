'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type EventOpt = { id: string; label: string; time: string; title: string };
type Result = {
  result: 'ok' | 'already_used' | 'invalid' | 'cancelled' | 'wrong_event' | 'offline_ok' | 'offline_used' | 'offline_unknown' | 'network';
  ticket_id?: string;
  ticket_number?: string;
  category?: 'adult' | 'child';
  checked_in_at?: string;
  ticket_type?: string;
  holder?: string;
  event_title?: string;
  event_starts_at?: string;
};
type Stats = { sold: number; checked_in: number; adult_in: number; child_in: number; conflicts: number; recent: Recent[] };
type Recent = { id: string; result: string; action: string; scanned_at: string; ticket_number: string | null; ticket_id: string | null; category: string | null; by: string | null; mine: boolean; holder: string | null };
type PkgTicket = { h: string; n: string; c: string; s: string; name: string };
type Pkg = { eventId: string; generatedAt: string; tickets: PkgTicket[] };
type QueueItem = { token: string; at: string };
type SearchRow = { id: string; ticket_number: string; category: 'adult' | 'child'; status: string; checked_in_at: string | null; ticket_type: string; holder: string; order_number: string };

const CAT = { adult: 'Volwassene', child: 'Kind' } as const;

function ls<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* opslag vol of geblokkeerd */
  }
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function time(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });
}

async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 5000): Promise<T> {
  const res = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
  if (res.status === 401) {
    window.location.href = '/scanner/login';
    throw new Error('auth');
  }
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.message || 'Fout'), { status: res.status, body });
  return body as T;
}

export function Scanner({ user, events, logout }: { user: { name: string; isAdmin: boolean }; events: EventOpt[]; logout: () => Promise<void> }) {
  const [eventId, setEventId] = useState<string>('');
  const [tab, setTab] = useState<'scan' | 'search' | 'log'>('scan');
  const [started, setStarted] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [online, setOnline] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [pkgInfo, setPkgInfo] = useState<{ count: number; at: string } | null>(null);
  const [conflicts, setConflicts] = useState<{ ticket_number?: string; holder?: string; result: string }[]>([]);
  const [device, setDevice] = useState('');
  const [manual, setManual] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);
  const lastToken = useRef<{ t: string; at: number }>({ t: '', at: 0 });
  const audio = useRef<AudioContext | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Init ──
  useEffect(() => {
    const saved = ls<string>('aqua_event', '');
    const valid = events.find((e) => e.id === saved)?.id ?? (events.length === 1 ? events[0].id : '');
    setEventId(valid);
    let d = ls<string>('aqua_device', '');
    if (!d) {
      d = 'Scanner-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      lsSet('aqua_device', d);
    }
    setDevice(d);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [events]);

  useEffect(() => {
    if (!eventId) return;
    lsSet('aqua_event', eventId);
    setQueue(ls<QueueItem[]>(`aqua_queue_${eventId}`, []));
    setOfflineMode(ls<boolean>(`aqua_offline_${eventId}`, false));
    const p = ls<Pkg | null>(`aqua_pkg_${eventId}`, null);
    setPkgInfo(p ? { count: p.tickets.length, at: p.generatedAt } : null);
  }, [eventId]);

  // ── Live tellers + noodpakket verversen ──
  const refreshStats = useCallback(async () => {
    if (!eventId) return;
    try {
      const s = await fetchJson<Stats>(`/api/scanner/stats?eventId=${eventId}`);
      setStats(s);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [eventId]);

  const refreshPackage = useCallback(async () => {
    if (!eventId) return;
    try {
      const p = await fetchJson<Pkg>(`/api/scanner/package?eventId=${eventId}`, undefined, 10000);
      lsSet(`aqua_pkg_${eventId}`, p);
      setPkgInfo({ count: p.tickets.length, at: p.generatedAt });
    } catch {
      /* offline: bestaand pakket blijft */
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    refreshStats();
    refreshPackage();
    const a = setInterval(refreshStats, 4000);
    const b = setInterval(refreshPackage, 120000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [eventId, refreshStats, refreshPackage]);

  // ── Offline wachtrij synchroniseren zodra er weer verbinding is ──
  const syncQueue = useCallback(async () => {
    if (!eventId) return;
    const q = ls<QueueItem[]>(`aqua_queue_${eventId}`, []);
    if (!q.length) return;
    try {
      const r = await fetchJson<{ synced: number; conflicts: { ticket_number?: string; holder?: string; result: string }[] }>(
        '/api/scanner/sync',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, device, scans: q }) },
        15000,
      );
      lsSet(`aqua_queue_${eventId}`, []);
      setQueue([]);
      if (r.conflicts.length) setConflicts((c) => [...r.conflicts, ...c]);
      refreshStats();
    } catch {
      /* nog steeds offline */
    }
  }, [eventId, device, refreshStats]);

  useEffect(() => {
    if (!queue.length) return;
    const id = setInterval(() => navigator.onLine && syncQueue(), 8000);
    return () => clearInterval(id);
  }, [queue.length, syncQueue]);

  // ── Feedback ──
  const feedback = useCallback((kind: 'ok' | 'bad' | 'warn') => {
    try {
      navigator.vibrate?.(kind === 'ok' ? 80 : [180, 80, 180]);
    } catch {
      /* niet ondersteund */
    }
    const ctx = audio.current;
    if (!ctx) return;
    const tones = kind === 'ok' ? [880, 1320] : kind === 'warn' ? [600, 600] : [220, 180];
    tones.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = kind === 'bad' ? 'square' : 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.13);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.13 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.13 + 0.12);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.13);
      o.stop(ctx.currentTime + i * 0.13 + 0.13);
    });
  }, []);

  const show = useCallback(
    (r: Result) => {
      setResult(r);
      const kind = r.result === 'ok' ? 'ok' : r.result === 'wrong_event' || r.result === 'offline_ok' ? 'warn' : 'bad';
      feedback(kind);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (r.result === 'ok') {
        dismissTimer.current = setTimeout(() => {
          setResult(null);
          busy.current = false;
        }, 1800);
      }
    },
    [feedback],
  );

  const dismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setResult(null);
    busy.current = false;
  };

  // ── Offline verwerken (alleen na bewuste activering) ──
  const offlineCheck = useCallback(
    async (token: string): Promise<Result> => {
      const pkg = ls<Pkg | null>(`aqua_pkg_${eventId}`, null);
      if (!pkg) return { result: 'network' };
      const h = await sha256(token);
      const t = pkg.tickets.find((x) => x.h === h);
      if (!t) return { result: 'offline_unknown' };
      const usedLocal = ls<string[]>(`aqua_used_${eventId}`, []);
      if (t.s === 'checked_in' || usedLocal.includes(h)) return { result: 'offline_used', ticket_number: t.n, holder: t.name, category: t.c as 'adult' };
      if (t.s !== 'valid') return { result: 'cancelled', ticket_number: t.n, holder: t.name };
      lsSet(`aqua_used_${eventId}`, [...usedLocal, h]);
      const q = [...ls<QueueItem[]>(`aqua_queue_${eventId}`, []), { token, at: new Date().toISOString() }];
      lsSet(`aqua_queue_${eventId}`, q);
      setQueue(q);
      return { result: 'offline_ok', ticket_number: t.n, holder: t.name, category: t.c as 'adult', checked_in_at: new Date().toISOString() };
    },
    [eventId],
  );

  const handleToken = useCallback(
    async (raw: string) => {
      const token = raw.trim();
      const now = Date.now();
      if (busy.current || !eventId) return;
      if (lastToken.current.t === token && now - lastToken.current.at < 2500) return;
      lastToken.current = { t: token, at: now };
      busy.current = true;
      if (offlineMode && !navigator.onLine) {
        show(await offlineCheck(token));
        return;
      }
      try {
        const r = await fetchJson<Result>('/api/scanner/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventId, device }),
        });
        setOnline(true);
        show(r);
        refreshStats();
      } catch (e) {
        if ((e as Error).message === 'auth') return;
        setOnline(false);
        show(offlineMode ? await offlineCheck(token) : { result: 'network' });
      }
    },
    [eventId, device, offlineMode, offlineCheck, show, refreshStats],
  );

  const handleRef = useRef(handleToken);
  useEffect(() => {
    handleRef.current = handleToken;
  }, [handleToken]);

  // ── Camera ──
  useEffect(() => {
    if (!started || tab !== 'scan' || !eventId || !videoRef.current) return;
    let controls: { stop: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 100, delayBetweenScanSuccess: 600 });
        const c = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current!,
          (res) => {
            if (res) handleRef.current(res.getText());
          },
        );
        if (cancelled) c.stop();
        else controls = c;
        setCamError(null);
      } catch (e) {
        const name = (e as Error).name;
        setCamError(
          name === 'NotAllowedError'
            ? 'Geen toegang tot de camera. Sta cameratoegang toe in je browserinstellingen en herlaad de pagina.'
            : 'Camera niet beschikbaar. Gebruik handmatig zoeken of invoeren.',
        );
      }
    })();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [started, tab, eventId]);

  function start() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current = audio.current ?? new Ctx();
      void audio.current.resume();
    } catch {
      /* geen audio */
    }
    setStarted(true);
  }

  function enableOffline() {
    const ok = window.confirm(
      'Offline modus inschakelen?\n\n• Tickets worden gecontroleerd met de lijst op dit toestel.\n• Andere scanners zien deze scans pas na herstel van de verbinding.\n• Gebruik bij een storing bij voorkeur ÉÉN scanner per ingang, of verdeel de gastenlijst.\n• Conflicten (dubbel gebruik) worden na synchronisatie gemeld.',
    );
    if (!ok) return;
    lsSet(`aqua_offline_${eventId}`, true);
    setOfflineMode(true);
    dismiss();
  }
  function disableOffline() {
    lsSet(`aqua_offline_${eventId}`, false);
    setOfflineMode(false);
    syncQueue();
  }

  if (!events.length) {
    return (
      <Shell user={user} logout={logout}>
        <p className="p-6 text-cream/80">Er zijn geen actuele evenementen om te scannen.</p>
      </Shell>
    );
  }

  if (!eventId) {
    return (
      <Shell user={user} logout={logout}>
        <div className="p-5">
          <p className="eyebrow !text-gold">Kies evenement</p>
          <ul className="mt-4 space-y-3">
            {events.map((e) => (
              <li key={e.id}>
                <button onClick={() => setEventId(e.id)} className="w-full border border-white/15 p-4 text-left hover:border-gold" data-testid="pick-event">
                  <span className="block text-lg text-white">{e.label}</span>
                  <span className="text-sm text-cream/60">{e.title} · {e.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    );
  }

  const current = events.find((e) => e.id === eventId)!;

  return (
    <Shell user={user} logout={logout}>
      {/* Status */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-sm">
        <button onClick={() => setEventId('')} className="min-w-0 truncate text-left text-cream/80 underline-offset-4 hover:underline">
          {current.label}
        </button>
        <span className={`flex shrink-0 items-center gap-2 ${online ? 'text-aqua' : 'text-warn'}`} data-testid="online-state">
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-aqua' : 'bg-warn'}`} />
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="grid grid-cols-3 border-b border-white/10 text-center">
        <div className="py-3"><p className="display text-3xl text-white tabular-nums" data-testid="count-in">{stats?.checked_in ?? '–'}</p><p className="text-[0.65rem] uppercase tracking-[0.16em] text-cream/50">Binnen</p></div>
        <div className="border-x border-white/10 py-3"><p className="display text-3xl text-white tabular-nums">{stats ? stats.sold - stats.checked_in : '–'}</p><p className="text-[0.65rem] uppercase tracking-[0.16em] text-cream/50">Nog verwacht</p></div>
        <div className="py-3"><p className="display text-3xl text-white tabular-nums">{stats?.sold ?? '–'}</p><p className="text-[0.65rem] uppercase tracking-[0.16em] text-cream/50">Verkocht</p></div>
      </div>

      {(offlineMode || queue.length > 0 || conflicts.length > 0 || (stats?.conflicts ?? 0) > 0) && (
        <div className="space-y-2 border-b border-warn/40 bg-warn/15 px-4 py-3 text-sm text-white">
          {offlineMode && (
            <p className="flex items-center justify-between gap-3">
              <span><strong>Offline modus actief.</strong> {pkgInfo ? `${pkgInfo.count} tickets in noodlijst (${time(pkgInfo.at)}).` : 'Geen noodlijst!'}</span>
              <button className="shrink-0 underline" onClick={disableOffline}>Uitzetten</button>
            </p>
          )}
          {queue.length > 0 && <p>{queue.length} offline scan(s) wachten op synchronisatie… {navigator.onLine && <button className="underline" onClick={syncQueue}>Nu synchroniseren</button>}</p>}
          {(conflicts.length > 0 || (stats?.conflicts ?? 0) > 0) && (
            <div>
              <p className="font-medium">⚠ {Math.max(conflicts.length, stats?.conflicts ?? 0)} conflict(en) na offline scannen – controleer bij de ingang:</p>
              <ul className="mt-1 text-xs">{conflicts.slice(0, 5).map((c, i) => <li key={i}>{c.ticket_number ?? 'onbekend'} · {c.holder ?? ''} · {c.result === 'already_used' ? 'al eerder ingecheckt' : c.result}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 text-sm">
        {(['scan', 'search', 'log'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-3 ${tab === t ? 'border-b-2 border-gold text-white' : 'border-b border-white/10 text-cream/60'}`}>
            {t === 'scan' ? 'Scannen' : t === 'search' ? 'Zoeken' : 'Logboek'}
          </button>
        ))}
      </div>

      {tab === 'scan' && (
        <div className="p-4">
          {!started ? (
            <button onClick={start} className="btn btn-gold w-full !min-h-16 text-base" data-testid="start-scan">Start scannen</button>
          ) : (
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black sm:aspect-video">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
              <div className="pointer-events-none absolute inset-[18%] border-2 border-white/70" />
              {camError && <p className="absolute inset-x-0 bottom-0 bg-black/80 p-3 text-sm text-white">{camError}</p>}
            </div>
          )}
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!manual.trim()) return;
              lastToken.current = { t: '', at: 0 };
              handleToken(manual);
              setManual('');
            }}
          >
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="QR-code handmatig invoeren" className="w-full border border-white/15 bg-transparent px-3 py-3 text-white placeholder:text-cream/40" aria-label="QR-code" data-testid="manual-token" />
            <button className="btn btn-ghost btn-sm text-cream">OK</button>
          </form>
          {!offlineMode && (
            <button onClick={enableOffline} className="mt-6 text-xs text-cream/50 underline">Noodprocedure: offline modus inschakelen</button>
          )}
        </div>
      )}

      {tab === 'search' && <SearchTab eventId={eventId} device={device} onResult={(r) => { show(r); refreshStats(); }} online={online} />}

      {tab === 'log' && (
        <ul className="divide-y divide-white/10 text-sm">
          {(stats?.recent ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className={r.result === 'ok' ? 'text-aqua' : r.result === 'undone' ? 'text-cream/60' : 'text-[#ff8a80]'}>
                  {time(r.scanned_at)} · {r.result === 'ok' ? 'Toegelaten' : r.result === 'undone' ? 'Teruggedraaid' : r.result === 'already_used' ? 'Al gebruikt' : r.result === 'wrong_event' ? 'Ander evenement' : r.result === 'invalid' ? 'Ongeldig' : r.result}
                </p>
                <p className="truncate text-xs text-cream/60">{r.ticket_number ?? '—'} · {r.holder ?? ''} · {r.by ?? ''}{r.action === 'offline_sync' ? ' · offline' : ''}</p>
              </div>
              {r.result === 'ok' && r.ticket_id && (r.mine || user.isAdmin) && (
                <UndoButton ticketId={r.ticket_id} onDone={refreshStats} />
              )}
            </li>
          ))}
          {!stats?.recent.length && <li className="px-4 py-6 text-cream/50">Nog geen scans.</li>}
        </ul>
      )}

      <p className="px-4 pb-6 pt-8 text-center text-[0.65rem] text-cream/30">{device}</p>

      {result && <ResultScreen r={result} onClose={dismiss} onOffline={enableOffline} offlineMode={offlineMode} />}
    </Shell>
  );
}

function Shell({ user, logout, children }: { user: { name: string }; logout: () => Promise<void>; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-deep text-cream">
      <header className="flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <span className="display text-lg tracking-[0.25em] text-white">AQUA SISTERS</span>
        <form action={logout} className="flex items-center gap-3 text-xs text-cream/60">
          <span className="hidden sm:inline">{user.name}</span>
          <button>Uitloggen</button>
        </form>
      </header>
      <div className="mx-auto max-w-xl">{children}</div>
    </main>
  );
}

function ResultScreen({ r, onClose, onOffline, offlineMode }: { r: Result; onClose: () => void; onOffline: () => void; offlineMode: boolean }) {
  const map: Record<Result['result'], { bg: string; title: string; sub?: string }> = {
    ok: { bg: 'bg-[#1f7a4f]', title: 'Welkom!', sub: 'Toegang toegestaan' },
    already_used: { bg: 'bg-[#b3261e]', title: 'Al gebruikt', sub: r.checked_in_at ? `Ingecheckt om ${time(r.checked_in_at)}` : undefined },
    invalid: { bg: 'bg-[#b3261e]', title: 'Ongeldig ticket', sub: 'Deze QR-code is onbekend' },
    cancelled: { bg: 'bg-[#b3261e]', title: 'Geannuleerd', sub: 'Dit ticket is niet meer geldig' },
    wrong_event: { bg: 'bg-[#d9822b]', title: 'Ander evenement', sub: r.event_title ? `${r.event_title} · ${r.event_starts_at ? new Date(r.event_starts_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' }) : ''}` : undefined },
    offline_ok: { bg: 'bg-[#8a6d1f]', title: 'OFFLINE – voorlopig toegelaten', sub: 'Wordt gecontroleerd zodra er weer verbinding is' },
    offline_used: { bg: 'bg-[#b3261e]', title: 'Al gebruikt (offline lijst)' },
    offline_unknown: { bg: 'bg-[#b3261e]', title: 'Onbekend ticket', sub: 'Niet in de offline noodlijst' },
    network: { bg: 'bg-[#5b2b2b]', title: 'Geen verbinding', sub: 'Deze scan is NIET verwerkt.' },
  };
  const m = map[r.result];
  return (
    <div role="alertdialog" aria-live="assertive" className={`fixed inset-0 z-50 flex flex-col justify-between ${m.bg} p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white`} onClick={r.result === 'network' ? undefined : onClose} data-testid={`result-${r.result}`}>
      <div>
        <p className="text-7xl" aria-hidden="true">{r.result === 'ok' ? '✓' : r.result === 'wrong_event' || r.result === 'offline_ok' ? '!' : '✕'}</p>
        <h2 className="display mt-4 text-5xl leading-tight">{m.title}</h2>
        {m.sub && <p className="mt-2 text-lg text-white/85">{m.sub}</p>}
      </div>
      {r.ticket_number && (
        <dl className="space-y-3 text-lg">
          {r.holder && <div><dt className="text-xs uppercase tracking-[0.18em] text-white/60">Hoofdboeker</dt><dd className="text-2xl">{r.holder}</dd></div>}
          {r.category && <div><dt className="text-xs uppercase tracking-[0.18em] text-white/60">Ticket</dt><dd className="text-2xl">{r.ticket_type ?? CAT[r.category]}{r.ticket_type && r.ticket_type !== CAT[r.category] ? ` (${CAT[r.category]})` : ''}</dd></div>}
          <div><dt className="text-xs uppercase tracking-[0.18em] text-white/60">Ticketnummer</dt><dd className="font-mono">{r.ticket_number}</dd></div>
          {r.result === 'ok' && r.checked_in_at && <div><dt className="text-xs uppercase tracking-[0.18em] text-white/60">Binnenkomst</dt><dd>{time(r.checked_in_at)}</dd></div>}
        </dl>
      )}
      <div className="space-y-3">
        {r.result === 'network' && !offlineMode && (
          <button onClick={onOffline} className="btn w-full bg-white text-deep">Noodprocedure: offline modus</button>
        )}
        <button onClick={onClose} className="btn w-full border border-white/60 !min-h-14 text-base" data-testid="next-scan">Volgende scan</button>
      </div>
    </div>
  );
}

function UndoButton({ ticketId, onDone }: { ticketId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className="shrink-0 text-xs text-cream/70 underline"
      onClick={async () => {
        const reason = window.prompt('Reden van de correctie (bijv. verkeerd ticket gescand):');
        if (!reason) return;
        setBusy(true);
        try {
          await fetchJson('/api/scanner/undo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId, reason }) });
          onDone();
        } catch (e) {
          window.alert((e as Error).message);
        }
        setBusy(false);
      }}
    >
      Terugdraaien
    </button>
  );
}

function SearchTab({ eventId, device, onResult, online }: { eventId: string; device: string; onResult: (r: Result) => void; online: boolean }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (q.trim().length < 2) {
      setRows([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetchJson<{ results: SearchRow[] }>(`/api/scanner/search?eventId=${eventId}&q=${encodeURIComponent(q)}`);
        setRows(r.results);
      } catch {
        setRows([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, eventId, refresh]);

  async function checkin(row: SearchRow) {
    if (!window.confirm(`${row.holder} (${row.ticket_number}) handmatig inchecken?`)) return;
    try {
      const r = await fetchJson<Result>('/api/scanner/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId: row.id, eventId, device }) });
      onResult(r);
      setRefresh((n) => n + 1);
    } catch {
      onResult({ result: 'network' });
    }
  }

  return (
    <div className="p-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Naam, ticket- of bestelnummer" className="w-full border border-white/15 bg-transparent px-3 py-3 text-white placeholder:text-cream/40" autoFocus aria-label="Zoeken" data-testid="search-input" />
      {!online && <p className="mt-3 text-sm text-warn">Zoeken werkt alleen online. Gebruik anders de geëxporteerde gastenlijst.</p>}
      {loading && <p className="mt-3 text-sm text-cream/50">Zoeken…</p>}
      <ul className="mt-3 divide-y divide-white/10">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-white">{r.holder}</p>
              <p className="text-xs text-cream/60">{r.ticket_number} · {r.ticket_type} · {r.status === 'checked_in' ? `binnen sinds ${time(r.checked_in_at)}` : r.status === 'valid' ? 'geldig' : r.status}</p>
            </div>
            {r.status === 'valid' && (
              <button onClick={() => checkin(r)} className="btn btn-gold btn-sm shrink-0" data-testid="manual-checkin">Inchecken</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
