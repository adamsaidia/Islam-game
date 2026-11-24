import { PageHeader, Flash, Section } from '@/components/admin/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/auth/session';
import { getSettings } from '@/lib/settings';
import { saveSettingsSection } from './actions';

export const dynamic = 'force-dynamic';

const LEGAL = [['privacy', 'Privacyverklaring'], ['terms', 'Algemene voorwaarden'], ['houseRules', 'Huisregels'], ['cancellation', 'Annuleringsvoorwaarden']] as const;
const METHODS = [['ideal', 'iDEAL | Wero'], ['creditcard', 'Creditcard'], ['applepay', 'Apple Pay'], ['googlepay', 'Google Pay'], ['bancontact', 'Bancontact']] as const;

function T({ label, name, value, type = 'text', rows }: { label: string; name: string; value: string | number; type?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="label mb-1">{label}</span>
      {rows ? <textarea name={name} rows={rows} className="input" defaultValue={String(value)} /> : <input name={name} type={type} className="input" defaultValue={String(value)} />}
    </label>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireAdmin();
  const { msg } = await searchParams;
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Instellingen" />
      <Flash msg={msg} />

      <Section title="Website & contact">
        <form id="site" action={saveSettingsSection} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="section" value="site" />
          <T label="Organisatie" name="orgName" value={s.site.orgName} />
          <T label="Slogan" name="tagline" value={s.site.tagline} />
          <div className="sm:col-span-2"><T label="Introductie (homepage)" name="intro" value={s.site.intro} rows={3} /></div>
          <T label="Contact e-mail" name="contactEmail" value={s.site.contactEmail} type="email" />
          <T label="Contact telefoon" name="contactPhone" value={s.site.contactPhone} />
          <T label="Instagram-link (https://…)" name="instagramUrl" value={s.site.instagramUrl} />
          <T label="TikTok-link (https://…)" name="tiktokUrl" value={s.site.tiktokUrl} />
          <T label="WhatsApp-link (https://wa.me/…)" name="whatsappUrl" value={s.site.whatsappUrl} />
          <div className="sm:col-span-2"><T label="Tekst privacy" name="privacyNote" value={s.site.privacyNote} rows={2} /></div>
          <div className="sm:col-span-2"><T label="Tekst burkini" name="burkiniNote" value={s.site.burkiniNote} rows={2} /></div>
          <div><SubmitButton>Opslaan</SubmitButton></div>
        </form>
      </Section>

      <Section title="Bestellen & betalen">
        <form id="checkout" action={saveSettingsSection} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="section" value="checkout" />
          <T label="Max. tickets per bestelling" name="maxPersonsPerOrder" value={s.checkout.maxPersonsPerOrder} type="number" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showDiscountField" defaultChecked={s.checkout.showDiscountField} /> Veld voor kortingscode tonen</label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="bankTransferEnabled" defaultChecked={s.checkout.bankTransferEnabled} /> Bankoverschrijving aanbieden (handmatige bevestiging nodig; vereist IBAN)</label>
          <T label="IBAN" name="iban" value={s.checkout.iban} />
          <T label="Tenaamstelling" name="accountHolder" value={s.checkout.accountHolder} />
          <T label="Reservering bij overschrijving (uren)" name="transferHoldHours" value={s.checkout.transferHoldHours} type="number" />
          <div className="sm:col-span-2"><SubmitButton>Opslaan</SubmitButton></div>
        </form>
      </Section>

      <Section title="Btw & betaalkosten">
        <form id="finance" action={saveSettingsSection} className="space-y-4">
          <input type="hidden" name="section" value="finance" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="vatEnabled" defaultChecked={s.finance.vatEnabled} /> Btw berekenen in financieel overzicht</label>
            <T label="Btw-tarief (%) – laten bevestigen door je boekhouder" name="vatRatePercent" value={s.finance.vatRatePercent ?? ''} />
          </div>
          <p className="text-xs text-muted">Geschatte transactiekosten per betaalmethode (zie je Mollie-tarieven). Worden gebruikt zolang je ze niet als kostenpost invoert.</p>
          <div className="grid gap-3 sm:grid-cols-5">
            {METHODS.map(([k, label]) => (
              <fieldset key={k} className="space-y-2 text-sm">
                <legend className="mb-1 text-deep">{label}</legend>
                <T label="Vast (€)" name={`fee.${k}.fixed`} value={((s.finance.feeEstimates[k]?.fixedCents ?? 0) / 100).toFixed(2).replace('.', ',')} />
                <T label="Percentage" name={`fee.${k}.percent`} value={((s.finance.feeEstimates[k]?.percentBps ?? 0) / 100).toString().replace('.', ',')} />
              </fieldset>
            ))}
          </div>
          <SubmitButton>Opslaan</SubmitButton>
        </form>
      </Section>

      <Section title="Privacy & herinneringen">
        <form id="privacy" action={saveSettingsSection} className="grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="section" value="privacy" />
          <T label="Persoonsgegevens anonimiseren na (maanden na evenement)" name="retentionMonths" value={s.privacy.retentionMonths} type="number" />
          <T label="Evenementherinnering (uren vooraf, 0 = uit)" name="eventReminderHours" value={s.reminders.eventReminderHours} type="number" />
          <T label="Betalingsherinnering na verlopen reservering (min., 0 = uit)" name="paymentReminderMinutes" value={s.reminders.paymentReminderMinutes} type="number" />
          <div><SubmitButton>Opslaan</SubmitButton></div>
        </form>
      </Section>

      <Section title="Teksten (concept – controleer vóór publicatie)">
        <form id="legal" action={saveSettingsSection} className="space-y-6">
          <input type="hidden" name="section" value="legal" />
          {LEGAL.map(([k, label]) => (
            <div key={k} className="border-t border-line pt-4">
              <T label={label} name={`${k}.text`} value={s.legal[k].text} rows={10} />
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name={`${k}.approved`} defaultChecked={s.legal[k].approved} /> Gecontroleerd en goedgekeurd (verbergt de concept-melding)</label>
            </div>
          ))}
          <SubmitButton>Teksten opslaan</SubmitButton>
        </form>
      </Section>

      <Section title="Veelgestelde vragen">
        <form id="faq" action={saveSettingsSection} className="space-y-4">
          <input type="hidden" name="section" value="faq" />
          {[...s.faq, { q: '', a: '' }, { q: '', a: '' }].map((f, i) => (
            <div key={i} className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_2fr]">
              <input name="q" className="input" defaultValue={f.q} placeholder="Vraag" aria-label={`Vraag ${i + 1}`} />
              <textarea name="a" rows={2} className="input" defaultValue={f.a} placeholder="Antwoord" aria-label={`Antwoord ${i + 1}`} />
            </div>
          ))}
          <p className="text-xs text-muted">Leeg laten om een vraag te verwijderen.</p>
          <SubmitButton>Opslaan</SubmitButton>
        </form>
      </Section>
    </>
  );
}
