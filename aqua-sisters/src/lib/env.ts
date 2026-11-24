import 'server-only';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Omgevingsvariabele ${name} ontbreekt`);
  return v;
}

export const env = {
  get databaseUrl() {
    return required('DATABASE_URL');
  },
  get appUrl() {
    return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  },
  get paymentProvider(): 'mollie' | 'mock' {
    const p = process.env.PAYMENT_PROVIDER || 'mollie';
    if (p === 'mock') {
      if (process.env.ALLOW_MOCK_PAYMENTS !== 'true' || process.env.VERCEL_ENV === 'production') {
        throw new Error('Mock-betalingen zijn alleen toegestaan in test (ALLOW_MOCK_PAYMENTS=true, niet in productie).');
      }
      return 'mock';
    }
    return 'mollie';
  },
  get mollieApiKey() {
    return process.env.MOLLIE_API_KEY || '';
  },
  get resendApiKey() {
    return process.env.RESEND_API_KEY || '';
  },
  get emailFrom() {
    return process.env.EMAIL_FROM || 'Aqua Sisters <tickets@example.com>';
  },
  get emailReplyTo() {
    return process.env.EMAIL_REPLY_TO || '';
  },
  get cronSecret() {
    return process.env.CRON_SECRET || '';
  },
  get encryptionKey() {
    return required('ENCRYPTION_KEY');
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
};
