import 'server-only';
import { sql } from './db';
import type { EventRow } from './events';

export type OrderRow = {
  id: string;
  order_number: string;
  event_id: string;
  access_token: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: 'pending' | 'awaiting_transfer' | 'paid' | 'cancelled' | 'expired' | 'over_capacity' | 'refunded' | 'partially_refunded';
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  refunded_cents: number;
  discount_code_id: string | null;
  payment_method: string | null;
  reserved_until: Date | null;
  paid_at: Date | null;
  marketing_opt_in: boolean;
  utm: Record<string, string> | null;
  note: string | null;
  anonymized_at: Date | null;
  created_at: Date;
};

export type OrderItemRow = {
  id: string;
  ticket_type_id: string;
  name: string;
  category: 'adult' | 'child';
  quantity: number;
  persons: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export type TicketRow = {
  id: string;
  ticket_number: string;
  qr_token: string;
  category: 'adult' | 'child';
  status: 'valid' | 'checked_in' | 'cancelled' | 'refunded';
  checked_in_at: Date | null;
  ticket_type_id: string;
  ticket_type_name: string;
};

export type FullOrder = {
  order: OrderRow;
  event: EventRow;
  items: OrderItemRow[];
  tickets: TicketRow[];
};

async function load(where: 'id' | 'token', value: string): Promise<FullOrder | null> {
  const [order] =
    where === 'id'
      ? await sql<OrderRow[]>`select * from orders where id = ${value}`
      : await sql<OrderRow[]>`select * from orders where access_token = ${value}`;
  if (!order) return null;
  const [[event], items, tickets] = await Promise.all([
    sql<EventRow[]>`select * from events where id = ${order.event_id}`,
    sql<OrderItemRow[]>`select * from order_items where order_id = ${order.id} order by created_at, id`,
    sql<TicketRow[]>`select t.id, t.ticket_number, t.qr_token, t.category, t.status, t.checked_in_at, t.ticket_type_id, tt.name as ticket_type_name
                     from tickets t join ticket_types tt on tt.id = t.ticket_type_id
                     where t.order_id = ${order.id} order by t.created_at, t.id`,
  ]);
  return { order, event, items, tickets };
}

export const getOrderById = (id: string) => load('id', id);
export const getOrderByToken = (token: string) => {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return Promise.resolve(null);
  return load('token', token);
};

export const ORDER_STATUS_LABEL: Record<OrderRow['status'], string> = {
  pending: 'Wacht op betaling',
  awaiting_transfer: 'Wacht op overschrijving',
  paid: 'Betaald',
  cancelled: 'Geannuleerd',
  expired: 'Verlopen',
  over_capacity: 'Betaald, maar vol (terugbetalen)',
  refunded: 'Terugbetaald',
  partially_refunded: 'Deels terugbetaald',
};

export const TICKET_STATUS_LABEL: Record<TicketRow['status'], string> = {
  valid: 'Geldig',
  checked_in: 'Ingecheckt',
  cancelled: 'Geannuleerd',
  refunded: 'Terugbetaald',
};

export const CATEGORY_LABEL = { adult: 'Volwassene', child: 'Kind' } as const;
