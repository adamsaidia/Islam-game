import 'server-only';
import { sql } from './db';
import { env } from './env';
import { FALLBACK_EVENT, FALLBACK_TICKET_TYPES } from './fallback-event';

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  starts_at: Date;
  ends_at: Date;
  venue_name: string;
  venue_address: string | null;
  city: string;
  pool_name: string | null;
  dress_code: string | null;
  audience_note: string | null;
  child_age_min: number | null;
  child_age_max: number | null;
  capacity: number;
  status: 'draft' | 'published' | 'hidden' | 'archived';
  sales_paused: boolean;
  sales_start_at: Date | null;
  sales_end_at: Date | null;
  waitlist_enabled: boolean;
  hold_minutes: number;
  image_id: string | null;
  created_at: Date;
};

export type TicketTypeRow = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  category: 'adult' | 'child';
  price_cents: number;
  persons_per_unit: number;
  capacity: number | null;
  max_per_order: number;
  sales_start_at: Date | null;
  sales_end_at: Date | null;
  is_active: boolean;
  sort_order: number;
};

export type SaleState = 'on_sale' | 'sold_out' | 'paused' | 'not_started' | 'closed' | 'unavailable';

export async function getEventBySlug(slug: string) {
  if (!env.dbConfigured) return slug === FALLBACK_EVENT.slug ? FALLBACK_EVENT : null;
  const [e] = await sql<EventRow[]>`select * from events where slug = ${slug}`;
  return e ?? null;
}

export async function getEventById(id: string) {
  if (!env.dbConfigured) return id === FALLBACK_EVENT.id ? FALLBACK_EVENT : null;
  const [e] = await sql<EventRow[]>`select * from events where id = ${id}`;
  return e ?? null;
}

/** Gepubliceerde evenementen die nog niet voorbij zijn, eerstvolgende eerst. */
export async function listUpcomingEvents() {
  if (!env.dbConfigured) return FALLBACK_EVENT.ends_at > new Date() ? [FALLBACK_EVENT] : [];
  return sql<EventRow[]>`select * from events where status = 'published' and ends_at > now() order by starts_at`;
}

export async function getTicketTypes(eventId: string, onlyActive = true) {
  if (!env.dbConfigured) return eventId === FALLBACK_EVENT.id ? FALLBACK_TICKET_TYPES : [];
  return sql<TicketTypeRow[]>`
    select * from ticket_types where event_id = ${eventId} ${onlyActive ? sql`and is_active` : sql``}
    order by sort_order, price_cents desc`;
}

export async function getAvailability(eventId: string) {
  if (!env.dbConfigured) {
    const cap = eventId === FALLBACK_EVENT.id ? FALLBACK_EVENT.capacity : 0;
    return { capacity: cap, used: 0, sold: 0, checked_in: 0, remaining: cap };
  }
  const [r] = await sql<{ capacity: number; used: number; sold: number; checked_in: number }[]>`
    select e.capacity,
           event_persons_used(e.id) as used,
           (select count(*) from tickets t where t.event_id = e.id and t.status in ('valid','checked_in'))::int as sold,
           (select count(*) from tickets t where t.event_id = e.id and t.status = 'checked_in')::int as checked_in
    from events e where e.id = ${eventId}`;
  if (!r) return null;
  return { ...r, remaining: Math.max(r.capacity - r.used, 0) };
}

export async function getTicketTypeRemaining(eventId: string) {
  if (!env.dbConfigured) return {} as Record<string, number | null>;
  const rows = await sql<{ id: string; remaining: number | null }[]>`
    select id, case when capacity is null then null else greatest(capacity - ticket_type_units_used(id), 0) end as remaining
    from ticket_types where event_id = ${eventId}`;
  return Object.fromEntries(rows.map((r) => [r.id, r.remaining])) as Record<string, number | null>;
}

export function saleState(e: EventRow, remaining: number, now = new Date()): SaleState {
  if (e.status !== 'published') return 'unavailable';
  if (now >= (e.sales_end_at ?? e.starts_at)) return 'closed';
  if (e.sales_paused) return 'paused';
  if (e.sales_start_at && now < e.sales_start_at) return 'not_started';
  if (remaining <= 0) return 'sold_out';
  return 'on_sale';
}

export function ticketTypeOnSale(t: TicketTypeRow, now = new Date()) {
  if (!t.is_active) return false;
  if (t.sales_start_at && now < t.sales_start_at) return false;
  if (t.sales_end_at && now >= t.sales_end_at) return false;
  return true;
}

export function childAgeText(e: Pick<EventRow, 'child_age_min' | 'child_age_max'>): string | null {
  const { child_age_min: min, child_age_max: max } = e;
  if (min != null && max != null) return `${min} t/m ${max} jaar`;
  if (min != null) return `vanaf ${min} jaar`;
  if (max != null) return `t/m ${max} jaar`;
  return null;
}
