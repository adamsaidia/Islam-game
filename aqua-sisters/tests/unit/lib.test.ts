import { describe, expect, it } from 'vitest';
import { calculateTotals } from '@/lib/pricing';
import { formatEuro, parseEuroToCents } from '@/lib/money';
import { hotp, totp, verifyTotp, base32Encode, base32Decode, generateTotpSecret } from '@/lib/auth/totp';
import { hashPassword, verifyPassword, passwordProblems } from '@/lib/auth/password';
import { encrypt, decrypt } from '@/lib/crypto';
import { toCsv } from '@/lib/csv';
import { fromLocalInput, toLocalInput } from '@/lib/dates';
import { esc, fillPlaceholders, renderEmail } from '@/lib/email/layout';
import { orderSchema, pickUtm } from '@/lib/validation';
import { centsToValue, valueToCents } from '@/lib/payments/types';

describe('prijsberekening', () => {
  const lines = [
    { ticketTypeId: 'a', name: 'Volwassene', unitPriceCents: 1350, quantity: 2, personsPerUnit: 1 },
    { ticketTypeId: 'c', name: 'Kind', unitPriceCents: 800, quantity: 1, personsPerUnit: 1 },
  ];
  it('berekent het voorbeeld uit de opdracht: 2×13,50 + 1×8,00 = 35,00', () => {
    const t = calculateTotals(lines);
    expect(t.subtotalCents).toBe(3500);
    expect(t.totalCents).toBe(3500);
    expect(t.persons).toBe(3);
    expect(t.lines.map((l) => l.lineTotalCents)).toEqual([2700, 800]);
  });
  it('past percentage- en vaste korting toe zonder negatief totaal', () => {
    expect(calculateTotals(lines, { kind: 'percent', amount: 10 }).totalCents).toBe(3150);
    expect(calculateTotals(lines, { kind: 'fixed', amount: 9999 }).totalCents).toBe(0);
  });
  it('rondt procentuele korting naar beneden af in centen', () => {
    expect(calculateTotals([{ ticketTypeId: 'x', name: 'x', unitPriceCents: 1350, quantity: 1, personsPerUnit: 1 }], { kind: 'percent', amount: 15 }).discountCents).toBe(202);
  });
  it('telt groepstickets als meerdere personen', () => {
    expect(calculateTotals([{ ticketTypeId: 'g', name: 'Groep', unitPriceCents: 5000, quantity: 2, personsPerUnit: 5 }]).persons).toBe(10);
  });
});

describe('geld', () => {
  it('formatteert in euro', () => expect(formatEuro(3500)).toBe('€ 35,00'));
  it('parset bedragen', () => {
    expect(parseEuroToCents('13,50')).toBe(1350);
    expect(parseEuroToCents('8')).toBe(800);
    expect(parseEuroToCents('€ 1.5')).toBe(150);
    expect(parseEuroToCents('abc')).toBeNull();
    expect(parseEuroToCents('1,234')).toBeNull();
  });
  it('converteert Mollie-bedragen exact', () => {
    expect(centsToValue(1350)).toBe('13.50');
    expect(valueToCents('13.50')).toBe(1350);
    expect(valueToCents('0.10')).toBe(10);
    expect(valueToCents('35.00')).toBe(3500);
  });
});

describe('TOTP (RFC 6238)', () => {
  // RFC 6238 testgeheim "12345678901234567890" (SHA1)
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  it('base32 is omkeerbaar', () => expect(base32Decode(secret).toString()).toBe('12345678901234567890'));
  it('geeft de RFC-testvectoren', () => {
    expect(totp(secret, 59_000)).toBe('287082');
    expect(totp(secret, 1111111109_000)).toBe('081804');
    expect(totp(secret, 2000000000_000)).toBe('279037');
  });
  it('hotp RFC 4226', () => expect(hotp(secret, 1)).toBe('287082'));
  it('accepteert ±1 tijdstap en weigert onzin', () => {
    const s = generateTotpSecret();
    const now = Date.now();
    expect(verifyTotp(s, totp(s, now - 30_000), now)).toBe(true);
    expect(verifyTotp(s, totp(s, now - 120_000), now)).toBe(false);
    expect(verifyTotp(s, 'abcdef', now)).toBe(false);
  });
});

describe('wachtwoorden en versleuteling', () => {
  it('hasht en verifieert met scrypt', async () => {
    const h = await hashPassword('correct horse 123');
    expect(h.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse 123', h)).toBe(true);
    expect(await verifyPassword('fout', h)).toBe(false);
  });
  it('controleert wachtwoordsterkte', () => {
    expect(passwordProblems('kort1')).not.toBeNull();
    expect(passwordProblems('alleenletterszonder')).not.toBeNull();
    expect(passwordProblems('goedwachtwoord123')).toBeNull();
  });
  it('AES-GCM versleutelt en detecteert manipulatie', () => {
    const c = encrypt('geheim', 'sleutel-abc');
    expect(decrypt(c, 'sleutel-abc')).toBe('geheim');
    expect(() => decrypt(c, 'andere-sleutel')).toThrow();
  });
});

describe('CSV-export', () => {
  it('neutraliseert formule-injectie en escapet', () => {
    const csv = toCsv(['a', 'b'], [['=HYPERLINK("x")', 'gewoon; met puntkomma']]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"gewoon; met puntkomma"');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});

describe('datums (Amsterdam)', () => {
  it('rekent wintertijd correct om', () => {
    expect(fromLocalInput('2027-01-09T18:00')!.toISOString()).toBe('2027-01-09T17:00:00.000Z');
    expect(toLocalInput(new Date('2027-01-09T17:00:00Z'))).toBe('2027-01-09T18:00');
  });
  it('rekent zomertijd correct om', () => {
    expect(fromLocalInput('2027-07-01T18:00')!.toISOString()).toBe('2027-07-01T16:00:00.000Z');
  });
  it('weigert ongeldige invoer', () => expect(fromLocalInput('morgen')).toBeNull());
});

describe('e-mail', () => {
  it('escapet HTML en vult velden in', () => {
    expect(esc('<script>"')).toBe('&lt;script&gt;&quot;');
    expect(fillPlaceholders('Hoi {{voornaam}}, {{ bestelnummer }}', { voornaam: 'Amira', bestelnummer: 'AS1001' })).toBe('Hoi Amira, AS1001');
  });
  it('rendert html en tekstversie zonder ruwe invoer', () => {
    const r = renderEmail({ preheader: 'p', heading: 'Kop', intro: 'Hoi <b>x</b>', blocks: [{ type: 'button', label: 'Open', href: 'https://x.nl/?a=1&b=2' }], footer: 'f' });
    expect(r.html).toContain('Hoi &lt;b&gt;x&lt;/b&gt;');
    expect(r.html).toContain('https://x.nl/?a=1&amp;b=2');
    expect(r.text).toContain('Open: https://x.nl/?a=1&b=2');
  });
});

describe('validatie bestelformulier', () => {
  const base = {
    eventId: '00000000-0000-4000-8000-000000000000',
    firstName: 'Amira',
    lastName: 'Test',
    email: 'Amira@Example.NL ',
    phone: '',
    items: [{ ticketTypeId: '00000000-0000-4000-8000-000000000001', quantity: 2 }],
    acceptTerms: true,
  };
  it('accepteert een minimale bestelling en normaliseert e-mail', () => {
    const r = orderSchema.parse(base);
    expect(r.email).toBe('amira@example.nl');
    expect(r.marketingOptIn).toBe(false);
  });
  it('vereist akkoord met voorwaarden', () => expect(orderSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false));
  it('weigert ongeldige e-mail en telefoon', () => {
    expect(orderSchema.safeParse({ ...base, email: 'geen-mail' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, phone: '<script>' }).success).toBe(false);
  });
  it('bewaart alleen bekende UTM-velden', () => expect(pickUtm({ utm_source: 'tiktok', evil: 'x' })).toEqual({ utm_source: 'tiktok' }));
});
