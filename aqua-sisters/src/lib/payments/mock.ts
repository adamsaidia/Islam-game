import 'server-only';
import { sql } from '../db';
import type { CreatedPayment, CreatedRefund, CreatePaymentArgs, PaymentProvider, ProviderPaymentStatus, RemotePayment } from './types';

/**
 * Testprovider voor lokale ontwikkeling en geautomatiseerde tests.
 * Alleen actief met PAYMENT_PROVIDER=mock én ALLOW_MOCK_PAYMENTS=true (zie env.ts),
 * nooit in productie. Doorloopt exact dezelfde webhook-/bevestigingsroute als Mollie.
 */
export class MockProvider implements PaymentProvider {
  readonly name = 'mock';
  constructor(private appUrl: string) {}

  async createPayment(a: CreatePaymentArgs): Promise<CreatedPayment> {
    const id = 'mock_' + crypto.randomUUID().replace(/-/g, '');
    return { providerPaymentId: id, checkoutUrl: `${this.appUrl}/test-betaling/${id}`, status: 'open', mode: 'test' };
  }

  async getPayment(id: string): Promise<RemotePayment> {
    const [p] = await sql<{ order_id: string; amount_cents: number; raw: { mock_status?: ProviderPaymentStatus; mock_amount?: number; refunded?: number } | null }[]>`
      select order_id, amount_cents, raw from payments where provider = 'mock' and provider_payment_id = ${id}`;
    if (!p) throw new Error('Onbekende testbetaling');
    return {
      id,
      status: p.raw?.mock_status ?? 'open',
      amountCents: p.raw?.mock_amount ?? p.amount_cents,
      currency: 'EUR',
      method: p.raw?.mock_status === 'paid' ? 'ideal' : null,
      orderId: p.order_id,
      amountRefundedCents: p.raw?.refunded ?? 0,
      amountChargedBackCents: 0,
      mode: 'test',
      raw: p.raw,
    };
  }

  async createRefund(id: string, amountCents: number): Promise<CreatedRefund> {
    await sql`update payments set raw = coalesce(raw, '{}'::jsonb) || jsonb_build_object('refunded', coalesce((raw->>'refunded')::int, 0) + ${amountCents}::int)
              where provider = 'mock' and provider_payment_id = ${id}`;
    return { id: 're_mock_' + crypto.randomUUID().slice(0, 8), status: 'refunded' };
  }
}
