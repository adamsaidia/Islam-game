import { PageHeader, Flash, Section } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { findPersonData } from '@/lib/privacy';
import { getSettings } from '@/lib/settings';
import { anonymizePerson } from './actions';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ email?: string; msg?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const settings = await getSettings();
  const data = sp.email && sp.email.includes('@') ? await findPersonData(sp.email) : null;
  return (
    <>
      <PageHeader title="Privacy (AVG)" />
      <Flash msg={sp.msg} error={sp.error} />
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted">
        Zoek alle gegevens van één persoon om een verzoek tot inzage, export of verwijdering af te handelen. Bij verwijderen worden naam, e-mail en telefoon
        geanonimiseerd; bedragen en data blijven bewaard voor de fiscale bewaarplicht. Automatische anonimisering: {settings.privacy.retentionMonths} maanden na het evenement.
      </p>
      <form className="mb-10 flex max-w-lg gap-3" role="search">
        <input name="email" type="email" required defaultValue={sp.email} placeholder="E-mailadres" className="input" />
        <button className="btn btn-primary btn-sm">Zoeken</button>
      </form>
      {data && (
        <>
          <Section title={`Gevonden: ${data.orders.length} bestelling(en), ${data.tickets.length} ticket(s), ${data.waitlist.length} wachtlijst`}>
            <pre className="max-h-96 overflow-auto bg-white p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="btn btn-ghost btn-sm text-deep" href={`/admin/export/person?email=${encodeURIComponent(data.email)}`}>Exporteren (JSON)</a>
              <form action={anonymizePerson}>
                <input type="hidden" name="email" value={data.email} />
                <SubmitButton className="btn btn-ghost btn-sm text-danger" confirm="Persoonsgegevens definitief anonimiseren? Dit kan niet ongedaan worden gemaakt. Tickets blijven geldig maar zonder naam.">Anonimiseren</SubmitButton>
              </form>
            </div>
          </Section>
        </>
      )}
    </>
  );
}
