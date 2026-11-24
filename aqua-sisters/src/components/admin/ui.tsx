import Link from 'next/link';

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display mt-1 text-4xl text-deep">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: 'warn' | 'danger' | 'ok' }) {
  const color = tone === 'warn' ? 'text-warn' : tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : 'text-deep';
  return (
    <div className="border-t border-line pt-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className={`display mt-1 text-3xl tabular-nums ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Section({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="eyebrow">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Flash({ msg, error }: { msg?: string; error?: string }) {
  if (!msg && !error) return null;
  return (
    <p role="status" className={`mb-6 border-l-2 bg-white px-4 py-3 text-sm ${error ? 'border-danger text-danger' : 'border-ok text-deep'}`} data-testid="flash">
      {error || msg}
    </p>
  );
}

const BADGE: Record<string, string> = {
  paid: 'text-ok',
  valid: 'text-ok',
  sent: 'text-ok',
  published: 'text-ok',
  checked_in: 'text-petrol',
  pending: 'text-warn',
  awaiting_transfer: 'text-warn',
  draft: 'text-muted',
  hidden: 'text-muted',
  queued: 'text-warn',
};

export function Status({ value, label }: { value: string; label?: string }) {
  return <span className={`text-xs uppercase tracking-[0.12em] ${BADGE[value] ?? 'text-danger'}`}>{label ?? value}</span>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="border-y border-line py-10 text-center text-sm text-muted">{children}</p>;
}

export function LinkButton({ href, children, variant = 'ghost' }: { href: string; children: React.ReactNode; variant?: 'ghost' | 'primary' }) {
  return (
    <Link href={href} className={`btn btn-sm ${variant === 'primary' ? 'btn-primary' : 'btn-ghost text-deep'}`}>
      {children}
    </Link>
  );
}
