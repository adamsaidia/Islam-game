import { z } from 'zod';

const name = z.string().trim().min(1, 'Vul dit veld in').max(80, 'Maximaal 80 tekens');

export const orderSchema = z.object({
  eventId: z.string().uuid(),
  firstName: name,
  lastName: name,
  email: z.string().trim().toLowerCase().max(200).email('Vul een geldig e-mailadres in'),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()-]*$/, 'Vul een geldig telefoonnummer in')
    .optional()
    .or(z.literal('')),
  items: z
    .array(z.object({ ticketTypeId: z.string().uuid(), quantity: z.number().int().min(0).max(50) }))
    .min(1)
    .max(20),
  discountCode: z.string().trim().max(32).optional().or(z.literal('')),
  paymentMethod: z.enum(['online', 'banktransfer']).default('online'),
  acceptTerms: z.literal(true, { error: 'Ga akkoord met de huisregels en voorwaarden' }),
  marketingOptIn: z.boolean().default(false),
  utm: z.record(z.string(), z.string().max(100)).optional(),
});
export type OrderInput = z.infer<typeof orderSchema>;

export const waitlistSchema = z.object({
  eventId: z.string().uuid(),
  firstName: name,
  email: z.string().trim().toLowerCase().max(200).email('Vul een geldig e-mailadres in'),
  persons: z.number().int().min(1).max(20).default(1),
});

export const ORDER_ERRORS: Record<string, string> = {
  event_not_found: 'Dit evenement bestaat niet (meer).',
  not_available: 'De ticketverkoop voor dit evenement is niet beschikbaar.',
  sales_paused: 'De ticketverkoop is tijdelijk gepauzeerd. Probeer het later opnieuw.',
  sales_not_started: 'De ticketverkoop is nog niet gestart.',
  sales_closed: 'De ticketverkoop is gesloten.',
  no_items: 'Kies minimaal één ticket.',
  invalid_quantity: 'Ongeldig aantal tickets.',
  invalid_ticket_type: 'Dit tickettype bestaat niet.',
  ticket_type_unavailable: 'Een van de gekozen tickettypes is niet meer beschikbaar.',
  ticket_type_sold_out: 'Een van de gekozen tickettypes is uitverkocht.',
  too_many: 'Je hebt te veel tickets gekozen voor één bestelling.',
  sold_out: 'Er zijn niet genoeg plekken meer beschikbaar.',
  invalid_discount: 'Deze kortingscode is niet geldig.',
  discount_exhausted: 'Deze kortingscode is al maximaal gebruikt.',
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
export function pickUtm(input: Record<string, string> | undefined): Record<string, string> | null {
  if (!input) return null;
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) if (input[k]) out[k] = String(input[k]).slice(0, 100);
  return Object.keys(out).length ? out : null;
}
