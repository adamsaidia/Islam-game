export type ProviderPaymentStatus = 'open' | 'pending' | 'authorized' | 'paid' | 'failed' | 'canceled' | 'expired';

export type CreatePaymentArgs = {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  description: string;
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl: string | null;
  idempotencyKey: string;
};

export type CreatedPayment = {
  providerPaymentId: string;
  checkoutUrl: string;
  status: ProviderPaymentStatus;
  mode: 'test' | 'live';
};

export type RemotePayment = {
  id: string;
  status: ProviderPaymentStatus;
  amountCents: number;
  currency: string;
  method: string | null;
  orderId: string | null;
  amountRefundedCents: number;
  amountChargedBackCents: number;
  mode: 'test' | 'live';
  raw: unknown;
};

export type CreatedRefund = { id: string; status: 'pending' | 'processing' | 'refunded' | 'failed' };

/** Modulaire interface: een andere provider (bijv. Stripe) implementeert dezelfde methodes. */
export interface PaymentProvider {
  readonly name: string;
  createPayment(args: CreatePaymentArgs): Promise<CreatedPayment>;
  getPayment(providerPaymentId: string): Promise<RemotePayment>;
  createRefund(providerPaymentId: string, amountCents: number, description: string): Promise<CreatedRefund>;
}

export function centsToValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
export function valueToCents(value: string): number {
  const [w, f = ''] = value.split('.');
  return Number(w) * 100 + Number(f.padEnd(2, '0').slice(0, 2));
}
