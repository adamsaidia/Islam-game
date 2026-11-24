# Deployment naar productie

Aanbevolen: **Vercel** (hosting) + **Supabase** (database, regio Frankfurt) + **Mollie** (betalingen) + **Resend** (e-mail).
Alles in de EU-regio's waar mogelijk (AVG).

> ⚠️ Activeer echte betalingen (`live_`-sleutel) pas na een volledige testronde met de `test_`-sleutel
> en nadat de juridische teksten zijn goedgekeurd.

## 1. Supabase (database)
1. Maak een project aan op supabase.com, regio **Central EU (Frankfurt)**. Kies een sterk databasewachtwoord.
2. Kies het **Pro-plan** voor productie (dagelijkse back-ups, geen automatische pauze). Zie ACCOUNTS-EN-KOSTEN.md.
3. Ga naar *Project Settings → Database → Connection string* en kopieer de **Transaction pooler**-URL (poort 6543).
4. Voer de migraties uit vanaf je eigen computer:
   ```bash
   DATABASE_URL="postgres://postgres.xxx:WACHTWOORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" npm run db:migrate
   ```
   (Of met de Supabase CLI: `supabase db push` – de migraties staan in `supabase/migrations/`.)
5. Maak de eerste beheerder aan:
   ```bash
   DATABASE_URL="…" npm run user:create -- --email jij@aquasisters.nl --name "Naam" --role admin
   ```
6. Beveiliging: alle tabellen hebben Row Level Security aan zonder policies en alle functies zijn ingetrokken voor
   `anon`/`authenticated`. De publieke Supabase-API (anon key) kan dus **niets** lezen of schrijven. De app gebruikt
   alleen de server-side databaseverbinding. Deel de anon key/service key niet; ze zijn niet nodig.

## 2. Mollie (betalingen)
1. Maak een account op mollie.com en rond de verificatie af (KvK, bankrekening, identificatie).
2. Activeer in het dashboard de betaalmethodes: **iDEAL | Wero**, **Apple Pay**, **creditcard**, eventueel **Google Pay** en **Bancontact**.
   - Apple Pay verschijnt automatisch op de gehoste Mollie-checkout op geschikte Apple-apparaten (Safari). Mollie regelt de
     domeinverificatie van hun checkoutpagina; je hoeft niets op je eigen domein te plaatsen.
   - Google Pay: activeer indien beschikbaar voor je account.
3. Kopieer de **test**-API-sleutel (`test_…`) en later de **live**-sleutel (`live_…`).
4. Webhook: niets instellen in het Mollie-dashboard. De app geeft per betaling zelf de webhook-URL mee:
   `https://JOUWDOMEIN/api/webhooks/mollie`.

## 3. Resend (e-mail)
1. Maak een account op resend.com, regio **EU** (Ireland) indien beschikbaar.
2. *Domains → Add domain*: bijv. `aquasisters.nl` (of subdomein `mail.aquasisters.nl`).
3. Zet de getoonde DNS-records bij je domeinbeheerder:
   - **SPF** (TXT) en **DKIM** (TXT/CNAME) – precies zoals Resend aangeeft.
   - **MX** voor bounces (indien Resend dit vraagt).
   - **DMARC** (zelf toevoegen): host `_dmarc`, type TXT, waarde
     `v=DMARC1; p=quarantine; rua=mailto:dmarc@aquasisters.nl; adkim=s; aspf=s`
     Begin eventueel met `p=none` en ga na een paar weken naar `quarantine`.
4. Wacht tot Resend het domein als *Verified* toont en maak een API-key (Sending access).
5. `EMAIL_FROM` moet een adres op dat domein zijn, bijv. `Aqua Sisters <tickets@aquasisters.nl>`.

## 4. Vercel (hosting)
1. Importeer de GitHub-repository in Vercel.
2. **Root Directory**: `aqua-sisters`. Framework: Next.js (automatisch).
3. Zet de omgevingsvariabelen uit `.env.example` (Production én Preview):
   `DATABASE_URL`, `APP_URL`, `PAYMENT_PROVIDER=mollie`, `MOLLIE_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `EMAIL_REPLY_TO`, `ENCRYPTION_KEY`, `CRON_SECRET`.
   Gebruik voor Preview-omgevingen een `test_`-Mollie-sleutel.
4. Koppel je domein (Settings → Domains) en zet `APP_URL` op dat domein (met https://).
5. Regio: `vercel.json` zet de functies in `fra1` (Frankfurt), dicht bij de database.
6. Let op: het Vercel **Hobby**-plan is alleen voor niet-commercieel gebruik. Voor ticketverkoop is **Pro** nodig.

## 5. Geplande taken (cron)
`/api/cron` ruimt verlopen reserveringen op, haalt gemiste betaalstatussen op, stuurt herinneringen, probeert
mislukte e-mails opnieuw en anonimiseert oude gegevens. Reserveringen werken ook zonder cron (ze verlopen op tijd),
maar herinneringen en opnieuw versturen hebben de cron nodig.
- `vercel.json` draait de taak dagelijks (toegestaan op alle plannen).
- Aanbevolen: elke 10 minuten. Op Vercel Pro kun je het schema in `vercel.json` aanpassen naar `*/10 * * * *`,
  of gebruik een externe dienst (bijv. cron-job.org) die elke 10 minuten aanroept:
  `GET https://JOUWDOMEIN/api/cron` met header `Authorization: Bearer <CRON_SECRET>`.

## 6. Checklist vóór livegang
- [ ] Testbestelling met `test_`-sleutel: iDEAL, creditcard, Apple Pay (iPhone/Safari), annuleren, verlopen.
- [ ] Ticketmail ontvangen (ook in Gmail/Outlook), niet in spam; PDF opent.
- [ ] Scanner getest op een iPhone én een Android-telefoon, op de locatie (verlichting!).
- [ ] 2FA aangezet voor alle beheerders (wordt in productie afgedwongen).
- [ ] Juridische teksten gecontroleerd en als goedgekeurd gemarkeerd (Instellingen → Teksten).
- [ ] Contactgegevens, Instagram- en TikTok-links ingevuld (Instellingen → Website).
- [ ] Logo vervangen door het officiële logo (zie BEPERKINGEN.md).
- [ ] Leeftijdsgrenzen kinderen ingevuld zodra bevestigd.
- [ ] Mollie live-sleutel ingesteld **met expliciete toestemming van de organisator**.
- [ ] Back-ups in Supabase gecontroleerd.

## Back-ups en herstel
- Supabase Pro maakt dagelijkse back-ups (7 dagen bewaard). Point-in-time recovery is een betaalde add-on.
- Extra zekerheid: exporteer vóór elk evenement de gastenlijst (Bestellingen → Export tickets) – ook bruikbaar als papieren noodlijst.

## Foutregistratie
- Serverfouten verschijnen in Vercel → Logs. Belangrijke gebeurtenissen (mislukte betalingen, bedragverschillen,
  terugbetalingen, offline-conflicten) staan in het dashboard onder **Logboek**.
- Mislukte e-mails: dashboard → **E-mails**.
- Optioneel: koppel Sentry of een log-drain in Vercel voor meldingen.
