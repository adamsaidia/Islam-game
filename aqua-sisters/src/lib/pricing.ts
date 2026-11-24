// Prijsberekening voor weergave in de bestelpagina. De server (create_order in de
// database) is altijd leidend; deze functie gebruikt dezelfde regels.

export type PriceLine = { ticketTypeId: string; name: string; unitPriceCents: number; quantity: number; personsPerUnit: number };
export type Discount = { kind: 'fixed' | 'percent'; amount: number } | null;

export function calculateTotals(lines: PriceLine[], discount: Discount = null) {
  const active = lines.filter((l) => l.quantity > 0);
  const subtotal = active.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const persons = active.reduce((s, l) => s + l.personsPerUnit * l.quantity, 0);
  let discountCents = 0;
  if (discount) {
    discountCents = discount.kind === 'fixed' ? Math.min(discount.amount, subtotal) : Math.floor((subtotal * discount.amount) / 100);
  }
  return {
    lines: active.map((l) => ({ ...l, lineTotalCents: l.unitPriceCents * l.quantity })),
    subtotalCents: subtotal,
    discountCents,
    totalCents: subtotal - discountCents,
    persons,
  };
}
