import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { formatEuro } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function MockCheckout({ params }: { params: Promise<{ id: string }> }) {
  let mock = false;
  try {
    mock = env.paymentProvider === 'mock';
  } catch {
    mock = false;
  }
  if (!mock) notFound();
  const { id } = await params;
  const [p] = await sql<{ amount_cents: number; order_number: string }[]>`
    select p.amount_cents, o.order_number from payments p join orders o on o.id = p.order_id where p.provider = 'mock' and p.provider_payment_id = ${id}`;
  if (!p) notFound();
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="eyebrow">Testomgeving – geen echte betaling</p>
      <h1 className="display mt-3 text-4xl text-deep">Testbetaling {p.order_number}</h1>
      <p className="mt-2 text-muted">Bedrag: {formatEuro(p.amount_cents)}</p>
      <form action="/api/mock-pay" method="post" className="mt-8 grid gap-3">
        <input type="hidden" name="id" value={id} />
        <button name="action" value="paid" className="btn btn-primary" data-testid="mock-paid">Betaling geslaagd</button>
        <button name="action" value="canceled" className="btn btn-ghost text-deep" data-testid="mock-canceled">Annuleren</button>
        <button name="action" value="failed" className="btn btn-ghost text-deep" data-testid="mock-failed">Mislukt</button>
        <button name="action" value="expired" className="btn btn-ghost text-deep" data-testid="mock-expired">Verlopen</button>
      </form>
    </main>
  );
}
