// Het eerste evenement als vaste gegevens, zodat de website al online kan
// voordat de database is gekoppeld. Gelijk aan de seed-migratie.
import type { EventRow, TicketTypeRow } from './events';

const created = new Date('2026-11-24T00:00:00Z');

export const FALLBACK_EVENT: EventRow = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'utrecht-9-januari-2027',
  title: 'Exclusief vrouwenzwemmen',
  subtitle: 'Twee uur zwemmen in een volledig besloten setting',
  description:
    'Een avond in het recreatiebad van Zwembad Den Hommel, exclusief voor vrouwen en toegestane kinderen. Ontspan, zwem en geniet in alle rust en privacy.',
  starts_at: new Date('2027-01-09T17:00:00Z'),
  ends_at: new Date('2027-01-09T19:00:00Z'),
  venue_name: 'Zwembad Den Hommel',
  venue_address: null,
  city: 'Utrecht',
  pool_name: 'Recreatiebad',
  dress_code: 'Burkini verplicht',
  audience_note: 'Uitsluitend voor vrouwen en toegestane kinderen',
  child_age_min: null,
  child_age_max: null,
  capacity: 300,
  status: 'published',
  sales_paused: false,
  sales_start_at: null,
  sales_end_at: null,
  waitlist_enabled: false,
  hold_minutes: 10,
  image_id: null,
  created_at: created,
};

const base = { event_id: FALLBACK_EVENT.id, description: null, persons_per_unit: 1, capacity: null, max_per_order: 10, sales_start_at: null, sales_end_at: null, is_active: true };

export const FALLBACK_TICKET_TYPES: TicketTypeRow[] = [
  { ...base, id: '00000000-0000-4000-8000-000000000011', name: 'Volwassene', category: 'adult', price_cents: 1350, sort_order: 1 },
  { ...base, id: '00000000-0000-4000-8000-000000000012', name: 'Kind', category: 'child', price_cents: 800, sort_order: 2 },
];
