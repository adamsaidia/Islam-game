import 'server-only';
import { sql } from './db';
import type { Settings } from './settings-defaults';

// Statussen die als verkocht tellen. Bewust een string (geen sql-fragment op moduleniveau),
// zodat er tijdens de build geen databaseverbinding nodig is.
const SOLD = ['paid', 'partially_refunded', 'refunded', 'over_capacity'];

export function vatPortion(grossCents: number, settings: Settings): number {
  const r = settings.finance.vatEnabled ? settings.finance.vatRatePercent : null;
  if (!r || r <= 0) return 0;
  return Math.round((grossCents * r) / (100 + r));
}

export async function getDashboard(eventId: string | null, settings: Settings) {
  const ev = eventId ? sql`and o.event_id = ${eventId}` : sql``;
  const evT = eventId ? sql`and t.event_id = ${eventId}` : sql``;
  const evE = eventId ? sql`and e.id = ${eventId}` : sql`and e.ends_at > now() - interval '1 day' and e.status <> 'archived'`;
  const evX = eventId ? sql`and x.event_id = ${eventId}` : sql``;

  const [[orders], [tickets], [cap], [exp], feeRows, refunds] = await Promise.all([
    sql<{ gross: number; refunded: number; paid_orders: number; open_orders: number; all_orders: number; free_orders: number }[]>`
      select coalesce(sum(o.total_cents) filter (where o.status = any(${SOLD})), 0)::int as gross,
             coalesce(sum(o.refunded_cents), 0)::int as refunded,
             count(*) filter (where o.status in ('paid', 'partially_refunded'))::int as paid_orders,
             count(*) filter (where o.status in ('pending', 'awaiting_transfer') and o.reserved_until > now())::int as open_orders,
             count(*)::int as all_orders,
             count(*) filter (where o.status in ('paid','partially_refunded') and o.total_cents = 0)::int as free_orders
      from orders o where true ${ev}`,
    sql<{ sold: number; adult: number; child: number; checked_in: number }[]>`
      select count(*) filter (where t.status in ('valid', 'checked_in'))::int as sold,
             count(*) filter (where t.status in ('valid', 'checked_in') and t.category = 'adult')::int as adult,
             count(*) filter (where t.status in ('valid', 'checked_in') and t.category = 'child')::int as child,
             count(*) filter (where t.status = 'checked_in')::int as checked_in
      from tickets t where true ${evT}`,
    sql<{ capacity: number; used: number }[]>`
      select coalesce(sum(e.capacity), 0)::int as capacity, coalesce(sum(event_persons_used(e.id)), 0)::int as used
      from events e where true ${evE}`,
    sql<{ total: number; fees: number }[]>`
      select coalesce(sum(x.amount_cents), 0)::int as total,
             coalesce(sum(x.amount_cents) filter (where x.category = 'payment_fees'), 0)::int as fees
      from expenses x where true ${evX}`,
    sql<{ method: string | null; n: number; amount: number; fee: number | null }[]>`
      select p.method, count(*)::int as n, sum(p.amount_cents)::int as amount, sum(p.fee_cents)::int as fee
      from payments p join orders o on o.id = p.order_id
      where p.status = 'paid' ${ev} group by p.method`,
    sql<{ n: number }[]>`select count(*)::int as n from refunds r join orders o on o.id = r.order_id where true ${ev}`,
  ]);

  let estFees = 0;
  for (const r of feeRows) {
    if (r.fee != null) {
      estFees += r.fee;
      continue;
    }
    const f = settings.finance.feeEstimates[r.method ?? ''] ?? null;
    if (f) estFees += r.n * f.fixedCents + Math.round((r.amount * f.percentBps) / 10000);
  }

  const netRevenue = orders.gross - orders.refunded;
  const vat = vatPortion(netRevenue, settings);
  // Betaalkosten die al als kostenpost zijn ingevoerd niet dubbel tellen.
  const feesForProfit = exp.fees > 0 ? 0 : estFees;
  const profit = netRevenue - vat - exp.total - feesForProfit;

  return {
    grossCents: orders.gross,
    refundedCents: orders.refunded,
    netRevenueCents: netRevenue,
    vatCents: vat,
    expensesCents: exp.total,
    estFeesCents: estFees,
    profitCents: profit,
    paidOrders: orders.paid_orders,
    openOrders: orders.open_orders,
    allOrders: orders.all_orders,
    freeOrders: orders.free_orders,
    refunds: refunds[0].n,
    ticketsSold: tickets.sold,
    adult: tickets.adult,
    child: tickets.child,
    checkedIn: tickets.checked_in,
    capacity: cap.capacity,
    remaining: Math.max(cap.capacity - cap.used, 0),
  };
}

export async function getDailySeries(eventId: string | null) {
  const ev = eventId ? sql`and o.event_id = ${eventId}` : sql``;
  const rows = await sql<{ day: string; tickets: number; revenue: number }[]>`
    select to_char(date_trunc('day', o.paid_at at time zone 'Europe/Amsterdam'), 'YYYY-MM-DD') as day,
           coalesce(sum((select count(*) from tickets t where t.order_id = o.id)), 0)::int as tickets,
           coalesce(sum(o.total_cents - o.refunded_cents), 0)::int as revenue
    from orders o
    where o.paid_at is not null and o.status in ('paid', 'partially_refunded', 'refunded') ${ev}
      and o.paid_at > now() - interval '120 days'
    group by 1 order by 1`;
  return rows;
}
