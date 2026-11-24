'use client';

import { useActionState } from 'react';
import { loginAction, verify2faAction } from '@/app/admin/login/actions';
import { Logo } from './Logo';

export function LoginForm({ next, title }: { next: string; title: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <AuthShell title={title}>
      <form action={action} className="space-y-6">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="password">Wachtwoord</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
        {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? 'Bezig…' : 'Inloggen'}</button>
      </form>
    </AuthShell>
  );
}

export function TwoFactorForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(verify2faAction, undefined);
  return (
    <AuthShell title="Tweestapsverificatie">
      <form action={action} className="space-y-6">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="code">Code uit je authenticator-app</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus className="field text-2xl tracking-[0.4em]" />
        </div>
        {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>Bevestigen</button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="water-bg grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm bg-cream p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]">
        <Logo />
        <h1 className="display mt-8 text-3xl text-deep">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
