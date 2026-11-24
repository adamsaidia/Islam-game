import 'server-only';
import { centsToValue, valueToCents, type CreatedPayment, type CreatedRefund, type CreatePaymentArgs, type PaymentProvider, type ProviderPaymentStatus, type RemotePayment } from './types';

const API = 'https://api.mollie.com/v2';

type MollieAmount = { currency: string; value: string };
type MolliePayment = {
  id: string;
  mode: 'test' | 'live';
  status: ProviderPaymentStatus;
  amount: MollieAmount;
  amountRefunded?: MollieAmount;
  amountChargedBack?: MollieAmount;
  method: string | null;
  metadata: { order_id?: string } | null;
  _links: { checkout?: { href: string } };
};

export class MollieProvider implements PaymentProvider {
  readonly name = 'mollie';
  constructor(private apiKey: string) {
    if (!apiKey) throw new Error('MOLLIE_API_KEY ontbreekt – betalingen zijn niet geconfigureerd.');
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(API + path, {
      ...init,
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = (body as { detail?: string }).detail || res.statusText;
      throw new Error(`Mollie ${res.status}: ${detail}`);
    }
    return body as T;
  }

  async createPayment(a: CreatePaymentArgs): Promise<CreatedPayment> {
    // Geen vaste methode: de gehoste Mollie-checkout toont automatisch alle in het
    // dashboard geactiveerde methodes (iDEAL | Wero, Apple Pay op Apple-apparaten,
    // Google Pay waar beschikbaar, creditcard, Bancontact).
    const p = await this.request<MolliePayment>('/payments', {
      method: 'POST',
      headers: { 'Idempotency-Key': a.idempotencyKey },
      body: JSON.stringify({
        amount: { currency: 'EUR', value: centsToValue(a.amountCents) },
        description: a.description,
        redirectUrl: a.redirectUrl,
        cancelUrl: a.cancelUrl,
        ...(a.webhookUrl ? { webhookUrl: a.webhookUrl } : {}),
        locale: 'nl_NL',
        metadata: { order_id: a.orderId, order_number: a.orderNumber },
      }),
    });
    if (!p._links.checkout?.href) throw new Error('Mollie gaf geen checkout-URL terug');
    return { providerPaymentId: p.id, checkoutUrl: p._links.checkout.href, status: p.status, mode: p.mode };
  }

  async getPayment(id: string): Promise<RemotePayment> {
    if (!/^tr_[A-Za-z0-9]+$/.test(id)) throw new Error('Ongeldig Mollie-betaal-ID');
    const p = await this.request<MolliePayment>(`/payments/${id}`);
    return {
      id: p.id,
      status: p.status,
      amountCents: valueToCents(p.amount.value),
      currency: p.amount.currency,
      method: p.method,
      orderId: p.metadata?.order_id ?? null,
      amountRefundedCents: p.amountRefunded ? valueToCents(p.amountRefunded.value) : 0,
      amountChargedBackCents: p.amountChargedBack ? valueToCents(p.amountChargedBack.value) : 0,
      mode: p.mode,
      raw: { id: p.id, status: p.status, method: p.method, mode: p.mode },
    };
  }

  async createRefund(id: string, amountCents: number, description: string): Promise<CreatedRefund> {
    const r = await this.request<{ id: string; status: string }>(`/payments/${id}/refunds`, {
      method: 'POST',
      body: JSON.stringify({ amount: { currency: 'EUR', value: centsToValue(amountCents) }, description }),
    });
    const status = r.status === 'refunded' ? 'refunded' : r.status === 'failed' || r.status === 'canceled' ? 'failed' : r.status === 'processing' ? 'processing' : 'pending';
    return { id: r.id, status };
  }
}
