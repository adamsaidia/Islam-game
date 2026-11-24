import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, Flash, Section, Stat, TableWrap, Empty } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { ShareLinks } from '@/components/admin/ShareLinks';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { getAvailability, getEventById, getTicketTypeRemaining, getTicketTypes, type TicketTypeRow } from '@/lib/events';
import { formatDateTime, toLocalInput } from '@/lib/dates';
import { formatEuro } from '@/lib/money';
import { EventForm } from '../EventForm';
import { deleteTicketType, deleteWaitlistEntry, duplicateEvent, notifyWaitlist, removeEventImage, saveTicketType, setEventFlag, uploadEventImage } from '../actions';

export const dynamic = 'force-dynamic';

function TicketTypeForm({ eventId, t }: { eventId: string; t?: TicketTypeRow }) {
  return (
    <form action={saveTicketType} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      <input type="hidden" name="event_id" value={eventId} />
      {t && <input type="hidden" name="id" value={t.id} />}
      <label className="col-span-2"><span className="label mb-1">Naam</span><input name="name" className="input" required defaultValue={t?.name ?? ''} placeholder="bijv. Earlybird volwassene" /></label>
      <label><span className="label mb-1">Categorie</span>
        <select name="category" className="input" defaultValue={t?.category ?? 'adult'}><option value="adult">Volwassene</option><option value="child">Kind</option></select>
      </label>
      <label><span className="label mb-1">Prijs (€)</span><input name="price" className="input" required inputMode="decimal" defaultValue={t ? (t.price_cents / 100).toFixed(2).replace('.', ',') : ''} /></label>
      <label><span className="label mb-1">Personen/ticket</span><input name="persons_per_unit" type="number" min={1} max={20} className="input" defaultValue={t?.persons_per_unit ?? 1} /></label>
      <label><span className="label mb-1">Max. per bestelling</span><input name="max_per_order" type="number" min={1} max={50} className="input" defaultValue={t?.max_per_order ?? 10} /></label>
      <label className="col-span-2"><span className="label mb-1">Omschrijving</span><input name="description" className="input" defaultValue={t?.description ?? ''} /></label>
      <label><span className="label mb-1">Eigen limiet</span><input name="capacity" type="number" min={0} className="input" defaultValue={t?.capacity ?? ''} placeholder="geen" /></label>
      <label><span className="label mb-1">Volgorde</span><input name="sort_order" type="number" min={0} className="input" defaultValue={t?.sort_order ?? 10} /></label>
      <label><span className="label mb-1">Verkoop vanaf</span><input name="sales_start_at" type="datetime-local" className="input" defaultValue={toLocalInput(t?.sales_start_at ?? null)} /></label>
      <label><span className="label mb-1">Verkoop tot</span><input name="sales_end_at" type="datetime-local" className="input" defaultValue={toLocalInput(t?.sales_end_at ?? null)} /></label>
      <div className="col-span-2 flex items-center gap-4 sm:col-span-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={t?.is_active ?? true} /> Actief</label>
        <SubmitButton>{t ? 'Opslaan' : 'Toevoegen'}</SubmitButton>
      </div>
    </form>
  );
}

export default async function EventDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const sp = await searchParams;
  const event = await getEventById(id);
  if (!event) notFound();
  const [types, avail, typeRemaining, waitlist] = await Promise.all([
    getTicketTypes(id, false),
    getAvailability(id),
    getTicketTypeRemaining(id),
    sql<{ id: string; first_name: string; email: string; persons: number; notified_at: Date | null; created_at: Date }[]>`
      select id, first_name, email, persons, notified_at, created_at from waitlist where event_id = ${id} order by created_at`,
  ]);
  const url = `${env.appUrl}/reserveren/${event.slug}`;
  const waiting = waitlist.filter((w) => !w.notified_at).length;

  return (
    <>
      <PageHeader
        eyebrow="Evenement"
        title={event.title}
        actions={
          <>
            <Link className="btn btn-ghost btn-sm text-deep" href={`/reserveren/${event.slug}`} target="_blank">Bekijken ↗</Link>
            <form action={setEventFlag}>
              <input type="hidden" name="id" value={id} />
              {event.status === 'published' ? (
                <SubmitButton name="action" value="hide" className="btn btn-ghost btn-sm text-deep">Verbergen</SubmitButton>
              ) : (
                <SubmitButton name="action" value="publish" className="btn btn-primary btn-sm">Publiceren</SubmitButton>
              )}
            </form>
            <form action={setEventFlag}>
              <input type="hidden" name="id" value={id} />
              {event.sales_paused ? (
                <SubmitButton name="action" value="resume" className="btn btn-ghost btn-sm text-deep">Verkoop hervatten</SubmitButton>
              ) : (
                <SubmitButton name="action" value="pause" className="btn btn-ghost btn-sm text-deep" confirm="Ticketverkoop tijdelijk pauzeren?">Verkoop pauzeren</SubmitButton>
              )}
            </form>
            <form action={duplicateEvent}>
              <input type="hidden" name="id" value={id} />
              <SubmitButton className="btn btn-ghost btn-sm text-deep">Dupliceren</SubmitButton>
            </form>
          </>
        }
      />
      <Flash msg={sp.msg} error={sp.error} />

      <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Verkocht" value={avail?.sold ?? 0} hint={`van ${event.capacity}`} />
        <Stat label="Gereserveerd (betaalt nu)" value={(avail?.used ?? 0) - (avail?.sold ?? 0)} />
        <Stat label="Beschikbaar" value={avail?.remaining ?? 0} tone={avail?.remaining === 0 ? 'danger' : undefined} />
        <Stat label="Ingecheckt" value={avail?.checked_in ?? 0} />
      </div>

      <Section title="Tickettypes & prijzen">
        <div className="space-y-8">
          {types.map((t) => (
            <div key={t.id} className="border-t border-line pt-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <p className="text-deep">
                  {t.name} · {formatEuro(t.price_cents)} {!t.is_active && <span className="text-muted">(inactief)</span>}
                  {typeRemaining[t.id] != null && <span className="text-muted"> · nog {typeRemaining[t.id]} van {t.capacity}</span>}
                </p>
                <form action={deleteTicketType}>
                  <input type="hidden" name="event_id" value={id} />
                  <input type="hidden" name="id" value={t.id} />
                  <SubmitButton className="text-xs text-danger underline" confirm="Tickettype verwijderen?">Verwijderen</SubmitButton>
                </form>
              </div>
              <TicketTypeForm eventId={id} t={t} />
            </div>
          ))}
          <details className="border-t border-line pt-4">
            <summary className="cursor-pointer text-sm text-deep">+ Tickettype toevoegen (bijv. earlybird of groepsticket)</summary>
            <div className="mt-4"><TicketTypeForm eventId={id} /></div>
          </details>
        </div>
      </Section>

      <Section title="Gegevens">
        <EventForm event={event} />
      </Section>

      <Section title="Afbeelding (hero & linkvoorbeeld)">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {event.image_id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/images/${event.image_id}`} alt="" className="h-32 w-56 object-cover" />
          ) : (
            <p className="text-sm text-muted">Geen eigen afbeelding – de standaard waterfoto wordt gebruikt.</p>
          )}
          <div className="space-y-3">
            <form action={uploadEventImage} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={id} />
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="text-sm" required />
              <SubmitButton>Uploaden</SubmitButton>
            </form>
            {event.image_id && (
              <form action={removeEventImage}>
                <input type="hidden" name="id" value={id} />
                <SubmitButton className="text-xs text-danger underline">Verwijderen</SubmitButton>
              </form>
            )}
            <p className="text-xs text-muted">JPG/PNG/WebP, max. 3 MB. Liggend formaat (bijv. 1600×900) werkt het best.</p>
          </div>
        </div>
      </Section>

      <Section title="Deelbare links">
        <ShareLinks url={url} title={`${event.title} – Aqua Sisters`} />
      </Section>

      <Section
        title={`Wachtlijst (${waitlist.length})`}
        actions={
          waiting > 0 ? (
            <form action={notifyWaitlist} className="flex items-center gap-2">
              <input type="hidden" name="event_id" value={id} />
              <input type="number" name="count" min={1} max={500} defaultValue={Math.min(waiting, avail?.remaining || waiting)} className="input w-20" aria-label="Aantal" />
              <SubmitButton confirm="Deze personen een e-mail sturen dat er plek is?">Informeren</SubmitButton>
            </form>
          ) : undefined
        }
      >
        {waitlist.length === 0 ? (
          <Empty>Nog niemand op de wachtlijst.</Empty>
        ) : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Naam</th><th>E-mail</th><th>Pers.</th><th>Aangemeld</th><th>Geïnformeerd</th><th /></tr></thead>
              <tbody>
                {waitlist.map((w) => (
                  <tr key={w.id}>
                    <td>{w.first_name}</td><td>{w.email}</td><td>{w.persons}</td>
                    <td className="whitespace-nowrap">{formatDateTime(w.created_at)}</td>
                    <td className="whitespace-nowrap">{w.notified_at ? formatDateTime(w.notified_at) : '—'}</td>
                    <td>
                      <form action={deleteWaitlistEntry}>
                        <input type="hidden" name="event_id" value={id} /><input type="hidden" name="id" value={w.id} />
                        <SubmitButton className="text-xs text-danger underline">Verwijder</SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      <form action={setEventFlag} className="border-t border-line pt-6">
        <input type="hidden" name="id" value={id} />
        <SubmitButton name="action" value="archive" className="text-xs text-muted underline" confirm="Evenement archiveren? Het verdwijnt van de website.">Evenement archiveren</SubmitButton>
      </form>
    </>
  );
}
