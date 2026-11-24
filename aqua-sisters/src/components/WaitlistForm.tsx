'use client';

import { useState } from 'react';

export function WaitlistForm({ eventId }: { eventId: string }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [persons, setPersons] = useState(1);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, firstName, email, persons }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) setState('done');
    else {
      setState('error');
      setMsg(body.message || 'Aanmelden is niet gelukt. Probeer het opnieuw.');
    }
  }

  if (state === 'done') {
    return <p className="mt-6 border-l-2 border-gold bg-white px-4 py-3 text-deep" data-testid="waitlist-done">Je staat op de wachtlijst. We mailen je zodra er plek is.</p>;
  }
  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-5 sm:grid-cols-[1fr_1fr_6rem]">
      <div>
        <label htmlFor="wl-name" className="label">Voornaam</label>
        <input id="wl-name" className="field" required maxLength={80} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="wl-email" className="label">E-mailadres</label>
        <input id="wl-email" type="email" className="field" required maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="wl-persons" className="label">Personen</label>
        <input id="wl-persons" type="number" min={1} max={20} className="field" value={persons} onChange={(e) => setPersons(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
      </div>
      <div className="sm:col-span-3">
        <button className="btn btn-primary w-full sm:w-auto" disabled={state === 'busy'}>Zet me op de wachtlijst</button>
        {state === 'error' && <p className="mt-2 text-sm text-danger">{msg}</p>}
      </div>
    </form>
  );
}
