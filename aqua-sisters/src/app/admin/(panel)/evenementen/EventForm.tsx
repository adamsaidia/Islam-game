import { SubmitButton } from '@/components/admin/SubmitButton';
import { toLocalInput } from '@/lib/dates';
import type { EventRow } from '@/lib/events';
import { saveEvent } from './actions';

function F({ label, name, children, hint, wide }: { label: string; name: string; children?: React.ReactNode; hint?: string; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`} htmlFor={name}>
      <span className="label mb-1.5">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function EventForm({ event }: { event?: EventRow }) {
  const e = event;
  return (
    <form action={saveEvent} className="grid gap-5 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      <F label="Titel" name="title"><input id="title" name="title" className="input" required defaultValue={e?.title ?? 'Exclusief vrouwenzwemmen'} /></F>
      <F label="Slug (in de link)" name="slug" hint="bijv. rotterdam-14-maart-2027"><input id="slug" name="slug" className="input" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={e?.slug} /></F>
      <F label="Ondertitel" name="subtitle" wide><input id="subtitle" name="subtitle" className="input" defaultValue={e?.subtitle ?? ''} /></F>
      <F label="Omschrijving" name="description" wide><textarea id="description" name="description" rows={3} className="input" defaultValue={e?.description ?? ''} /></F>
      <F label="Start" name="starts_at"><input id="starts_at" name="starts_at" type="datetime-local" className="input" required defaultValue={toLocalInput(e?.starts_at ?? null)} /></F>
      <F label="Einde" name="ends_at"><input id="ends_at" name="ends_at" type="datetime-local" className="input" required defaultValue={toLocalInput(e?.ends_at ?? null)} /></F>
      <F label="Locatie" name="venue_name"><input id="venue_name" name="venue_name" className="input" required defaultValue={e?.venue_name ?? ''} /></F>
      <F label="Stad" name="city"><input id="city" name="city" className="input" required defaultValue={e?.city ?? ''} /></F>
      <F label="Adres" name="venue_address"><input id="venue_address" name="venue_address" className="input" defaultValue={e?.venue_address ?? ''} /></F>
      <F label="Bad" name="pool_name"><input id="pool_name" name="pool_name" className="input" defaultValue={e?.pool_name ?? 'Recreatiebad'} /></F>
      <F label="Dresscode" name="dress_code"><input id="dress_code" name="dress_code" className="input" defaultValue={e?.dress_code ?? 'Burkini verplicht'} /></F>
      <F label="Doelgroep" name="audience_note"><input id="audience_note" name="audience_note" className="input" defaultValue={e?.audience_note ?? 'Uitsluitend voor vrouwen en toegestane kinderen'} /></F>
      <F label="Kind: minimumleeftijd" name="child_age_min" hint="Leeg = niet tonen (nog niet bevestigd)"><input id="child_age_min" name="child_age_min" type="number" min={0} max={30} className="input" defaultValue={e?.child_age_min ?? ''} /></F>
      <F label="Kind: maximumleeftijd" name="child_age_max" hint="Leeg = niet tonen"><input id="child_age_max" name="child_age_max" type="number" min={0} max={30} className="input" defaultValue={e?.child_age_max ?? ''} /></F>
      <F label="Maximale capaciteit (personen)" name="capacity"><input id="capacity" name="capacity" type="number" min={0} className="input" required defaultValue={e?.capacity ?? 300} /></F>
      <F label="Reserveringstijd tijdens betalen (min.)" name="hold_minutes"><input id="hold_minutes" name="hold_minutes" type="number" min={2} max={60} className="input" required defaultValue={e?.hold_minutes ?? 10} /></F>
      <F label="Verkoop start (optioneel)" name="sales_start_at"><input id="sales_start_at" name="sales_start_at" type="datetime-local" className="input" defaultValue={toLocalInput(e?.sales_start_at ?? null)} /></F>
      <F label="Verkoop sluit automatisch" name="sales_end_at" hint="Leeg = bij aanvang evenement"><input id="sales_end_at" name="sales_end_at" type="datetime-local" className="input" defaultValue={toLocalInput(e?.sales_end_at ?? null)} /></F>
      <F label="Status" name="status">
        <select id="status" name="status" className="input" defaultValue={e?.status ?? 'draft'}>
          <option value="draft">Concept (niet zichtbaar)</option>
          <option value="published">Gepubliceerd</option>
          <option value="hidden">Verborgen (alleen via link, geen verkoop)</option>
          <option value="archived">Gearchiveerd</option>
        </select>
      </F>
      <div className="flex flex-col justify-end gap-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="waitlist_enabled" defaultChecked={e?.waitlist_enabled ?? true} /> Wachtlijst bij uitverkocht</label>
        {e && <label className="flex items-center gap-2"><input type="checkbox" name="notify_holders" /> Ticketkopers mailen bij wijziging datum/tijd/locatie</label>}
      </div>
      <div className="sm:col-span-2"><SubmitButton>{e ? 'Wijzigingen opslaan' : 'Evenement aanmaken'}</SubmitButton></div>
    </form>
  );
}
