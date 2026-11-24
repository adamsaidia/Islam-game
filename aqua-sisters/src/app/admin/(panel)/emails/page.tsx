import { PageHeader, Flash, Section, Status, TableWrap, Empty } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { env } from '@/lib/env';
import { getSettings } from '@/lib/settings';
import { EMAIL_TEMPLATE_LABELS, type EmailTemplateKey } from '@/lib/settings-defaults';
import { formatDateTime } from '@/lib/dates';
import { retryAllFailed, retryEmail, saveTemplates } from './actions';

export const dynamic = 'force-dynamic';

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string; status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = ['sent', 'failed', 'skipped', 'queued'].includes(sp.status || '') ? sp.status! : '';
  const [logs, settings, [{ failed }]] = await Promise.all([
    sql<{ id: string; to_email: string; template: string; subject: string; status: string; error: string | null; attempts: number; created_at: Date; order_id: string | null }[]>`
      select id, to_email, template, subject, status, error, attempts, created_at, order_id from email_logs
      ${status ? sql`where status = ${status}` : sql``} order by created_at desc limit 200`,
    getSettings(),
    sql<{ failed: number }[]>`select count(*)::int as failed from email_logs where status = 'failed'`,
  ]);
  return (
    <>
      <PageHeader title="E-mails" actions={failed > 0 ? <form action={retryAllFailed}><SubmitButton>Alle mislukte opnieuw versturen ({failed})</SubmitButton></form> : undefined} />
      <Flash msg={sp.msg} error={sp.error} />
      {!env.resendApiKey && <p className="mb-6 border-l-2 border-warn bg-white px-4 py-3 text-sm">RESEND_API_KEY ontbreekt: e-mails worden gelogd maar niet verstuurd.</p>}

      <Section title="Verzendlog">
        <div className="mb-3 flex gap-4 text-sm">
          {[['', 'Alle'], ['sent', 'Verstuurd'], ['failed', 'Mislukt'], ['skipped', 'Overgeslagen']].map(([k, v]) => (
            <a key={k} href={k ? `?status=${k}` : '?'} className={status === k ? 'text-deep underline underline-offset-4' : 'text-muted'}>{v}</a>
          ))}
        </div>
        {logs.length === 0 ? <Empty>Nog geen e-mails.</Empty> : (
          <TableWrap>
            <table className="table">
              <thead><tr><th>Datum</th><th>Aan</th><th>Onderwerp</th><th>Status</th><th /></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap text-xs">{formatDateTime(l.created_at)}</td>
                    <td className="text-xs">{l.to_email}</td>
                    <td>{l.subject}<div className="text-xs text-muted">{EMAIL_TEMPLATE_LABELS[l.template as EmailTemplateKey] ?? l.template}{l.order_id && <> · <a className="underline" href={`/admin/bestellingen/${l.order_id}`}>bestelling</a></>}</div></td>
                    <td><Status value={l.status} />{l.error && <div className="max-w-xs text-xs text-danger">{l.error}</div>}<div className="text-xs text-muted">{l.attempts} poging(en)</div></td>
                    <td>{l.status !== 'sent' && <form action={retryEmail}><input type="hidden" name="id" value={l.id} /><SubmitButton className="text-xs underline">Opnieuw</SubmitButton></form>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Section>

      <Section title="Teksten van e-mails">
        <form id="sjablonen" action={saveTemplates} className="space-y-8">
          <p className="text-xs text-muted">Beschikbare velden: {'{{voornaam}} {{achternaam}} {{evenement}} {{datum}} {{bestelnummer}} {{bedrag}}'}. Opmaak, evenementgegevens, knoppen en tickets worden automatisch toegevoegd.</p>
          {(Object.keys(EMAIL_TEMPLATE_LABELS) as EmailTemplateKey[]).map((k) => (
            <fieldset key={k} className="grid gap-2 border-t border-line pt-4">
              <legend className="mb-2 text-sm text-deep">{EMAIL_TEMPLATE_LABELS[k]}</legend>
              <label><span className="label mb-1">Onderwerp</span><input name={`${k}.subject`} className="input" defaultValue={settings.emailTemplates[k].subject} /></label>
              <label><span className="label mb-1">Tekst</span><textarea name={`${k}.intro`} rows={3} className="input" defaultValue={settings.emailTemplates[k].intro} /></label>
            </fieldset>
          ))}
          <SubmitButton>Teksten opslaan</SubmitButton>
        </form>
      </Section>

      <Section title="Domeinverificatie">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Verstuur vanaf je eigen domein (bijv. tickets@aquasisters.nl). Voeg in Resend het domein toe en zet de getoonde SPF-, DKIM- en MX-records bij je domeinbeheerder.
          Voeg daarnaast een DMARC-record toe (<code>_dmarc</code> TXT: <code>v=DMARC1; p=quarantine; rua=mailto:…</code>). Zie docs/DEPLOYMENT.md.
        </p>
      </Section>
    </>
  );
}
