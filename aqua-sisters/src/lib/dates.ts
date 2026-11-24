const TZ = 'Europe/Amsterdam';

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(d));
}
export function formatDateShort(d: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(d));
}
export function formatTime(d: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(d)).replace(':', '.');
}
export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(d));
}
export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)}–${formatTime(end)} uur`;
}

/** Zet een Date om naar de waarde voor <input type="datetime-local"> in Amsterdamse tijd. */
export function toLocalInput(d: Date | string | null): string {
  if (!d) return '';
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(d));
  return parts.replace(' ', 'T');
}

/** Interpreteer "2027-01-09T18:00" als Amsterdamse tijd en geef een Date terug. */
export function fromLocalInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const asUtc = new Date(value + ':00Z');
  // Bepaal offset van Amsterdam op dat moment (twee iteraties voor DST-randen).
  let guess = asUtc.getTime();
  for (let i = 0; i < 2; i++) {
    const local = toLocalInput(new Date(guess));
    const diff = new Date(local + ':00Z').getTime() - asUtc.getTime();
    guess -= diff;
  }
  return new Date(guess);
}
