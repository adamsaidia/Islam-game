const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

export function formatEuro(cents: number): string {
  return fmt.format(cents / 100).replace(/ /g, ' ');
}

/** "13,50" / "13.50" / "13" → 1350. Geeft null bij ongeldige invoer. */
export function parseEuroToCents(input: string): number | null {
  const s = input.trim().replace(/[€\s]/g, '');
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split(/[.,]/);
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}
