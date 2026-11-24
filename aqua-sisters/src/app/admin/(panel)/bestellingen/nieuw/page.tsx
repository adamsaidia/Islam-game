import { PageHeader, Flash } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { EventFilter } from '@/components/admin/EventFilter';
import { requireAdmin } from '@/lib/auth/session';
import { eventOptions } from '@/lib/admin-data';
import { getAvailability, getTicketTypes } from '@/lib/events';
import { formatEuro } from '@/lib/money';
import { createManualOrder } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewManualOrder({ searchParams }: { searchParams: Promise<{ event?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const events = await eventOptions();
  const eventId = sp.event && /^[0-9a-f-]{36}$/.test(sp.event) ? sp.event : events[0]?.id;
  const [types, avail] = eventId ? await Promise.all([getTicketTypes(eventId, false), getAvailability(eventId)]) : [[], null];
  return (
    <>
      <PageHeader title="Gratis of handmatige tickets" eyebrow="Bestellingen" />
      <Flash error={sp.error} />
      <div className="mb-8 flex items-center gap-4">
        <EventFilter events={events} value={eventId ?? ''} allLabel="Kies evenement" />
        {avail && <span className="text-sm text-muted">Nog {avail.remaining} plekken beschikbaar</span>}
      </div>
      {eventId && (
        <form action={createManualOrder} className="grid max-w-2xl gap-5 sm:grid-cols-2">
          <input type="hidden" name="event_id" value={eventId} />
          <label><span className="label mb-1">Voornaam</span><input name="first_name" className="input" required /></label>
          <label><span className="label mb-1">Achternaam</span><input name="last_name" className="input" required /></label>
          <label><span className="label mb-1">E-mail</span><input name="email" type="email" className="input" required /></label>
          <label><span className="label mb-1">Telefoon (optioneel)</span><input name="phone" className="input" /></label>
          <fieldset className="sm:col-span-2">
            <legend className="label mb-2">Tickets</legend>
            <div className="space-y-2">
              {types.map((t) => (
                <label key={t.id} className="flex items-center justify-between gap-4 border-b border-line pb-2 text-sm">
                  <span>{t.name} · {formatEuro(t.price_cents)}{!t.is_active && ' (inactief)'}</span>
                  <input type="hidden" name="ticket_type_id" value={t.id} />
                  <input name="quantity" type="number" min={0} max={50} defaultValue={0} className="input w-20" aria-label={`Aantal ${t.name}`} />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2 text-sm sm:col-span-2">
            <legend className="label mb-2">Soort</legend>
            <label className="flex items-center gap-2"><input type="radio" name="mode" value="free" defaultChecked /> Gratis tickets (direct versturen)</label>
            <label className="flex items-center gap-2"><input type="radio" name="mode" value="banktransfer" /> Betaling per bankoverschrijving (tickets na bevestiging)</label>
          </fieldset>
          <label className="sm:col-span-2"><span className="label mb-1">Interne notitie</span><input name="note" className="input" placeholder="bijv. vrijwilliger, winactie" /></label>
          <div><SubmitButton className="btn btn-primary">Aanmaken</SubmitButton></div>
        </form>
      )}
    </>
  );
}
