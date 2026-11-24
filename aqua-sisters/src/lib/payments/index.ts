import 'server-only';
import { env } from '../env';
import { MollieProvider } from './mollie';
import { MockProvider } from './mock';
import type { PaymentProvider } from './types';

export function getPaymentProvider(name?: string): PaymentProvider {
  const n = name ?? env.paymentProvider;
  if (n === 'mock') {
    if (env.paymentProvider !== 'mock') throw new Error('Mock-provider niet toegestaan');
    return new MockProvider(env.appUrl);
  }
  if (n === 'mollie') return new MollieProvider(env.mollieApiKey);
  throw new Error(`Onbekende betaalprovider: ${n}`);
}

export function paymentsConfigured(): boolean {
  if (!env.dbConfigured) return false;
  try {
    return env.paymentProvider === 'mock' || !!env.mollieApiKey;
  } catch {
    return false;
  }
}
