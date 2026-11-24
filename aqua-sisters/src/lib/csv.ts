/** CSV voor Nederlandse Excel: puntkomma, UTF-8 BOM, formule-injectie geneutraliseerd. */
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [headers, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}

export function centsToCsv(c: number): string {
  return (c / 100).toFixed(2).replace('.', ',');
}
