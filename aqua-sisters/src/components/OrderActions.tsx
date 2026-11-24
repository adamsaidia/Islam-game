'use client';

import { useState } from 'react';

export function ResendButton({ token }: { token: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-4 text-sm">
      <button
        type="button"
        disabled={busy}
        className="text-muted underline underline-offset-4 disabled:opacity-50"
        onClick={async () => {
          setBusy(true);
          const res = await fetch(`/api/orders/${token}/resend`, { method: 'POST' }).catch(() => null);
          const body = res ? await res.json().catch(() => ({})) : {};
          setMsg(body.message || 'Er ging iets mis.');
          setBusy(false);
        }}
      >
        Bevestigingsmail opnieuw ontvangen
      </button>
      {msg && <p className="mt-2 text-deep" role="status">{msg}</p>}
    </div>
  );
}

export function RetryPaymentButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        className="btn btn-primary"
        onClick={async () => {
          setBusy(true);
          const res = await fetch(`/api/orders/${token}/pay`, { method: 'POST' }).catch(() => null);
          const body = res ? await res.json().catch(() => ({})) : {};
          if (res?.ok && body.redirectUrl) window.location.href = body.redirectUrl;
          else {
            setErr(body.message || 'Er ging iets mis.');
            setBusy(false);
          }
        }}
      >
        {busy ? 'Even geduld…' : 'Betaling afronden'}
      </button>
      {err && <p className="mt-2 text-sm text-danger">{err}</p>}
    </div>
  );
}
