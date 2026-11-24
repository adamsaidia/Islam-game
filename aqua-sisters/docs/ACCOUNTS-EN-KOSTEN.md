# Externe accounts en terugkerende kosten

Prijzen zijn indicaties (november 2026) en kunnen wijzigen. **Controleer altijd de officiële prijspagina's.**

## Benodigde accounts

| Dienst | Waarvoor | Wat je moet regelen |
|---|---|---|
| **Mollie** | Betalingen (iDEAL \| Wero, Apple Pay, Google Pay, kaarten, Bancontact) | Zakelijk account + verificatie (KvK, IBAN, ID). Methodes activeren. API-sleutels. |
| **Supabase** | PostgreSQL-database + back-ups | Project in regio Frankfurt. Databasewachtwoord + connection string. |
| **Vercel** | Hosting van de website, dashboard en scanner | Koppelen aan GitHub-repository, domein, omgevingsvariabelen. |
| **Resend** | Verzenden van e-mails met tickets | Domein verifiëren (SPF/DKIM) + API-sleutel. |
| **Domeinnaam** | bijv. aquasisters.nl | DNS-beheer voor Vercel en Resend (+ DMARC). |
| **GitHub** | Versiebeheer (al aanwezig) | – |

## Keuze betaalprovider: Mollie (aanbevolen) vs. Stripe

| | Mollie | Stripe |
|---|---|---|
| iDEAL \| Wero | Vast bedrag per transactie (externe bronnen noemen ±€0,32; check mollie.com/pricing) | Vast bedrag per transactie, globaal €0,20–0,50 volgens Stripe's eigen gidsen |
| Apple Pay / Google Pay | Automatisch op de gehoste checkout op geschikte apparaten; tarief van de onderliggende kaart | Ook mogelijk; tarief van de onderliggende kaart |
| Abonnement | Geen vaste maandkosten, alleen geslaagde transacties | Geen vaste maandkosten |
| Nederlandse focus | Nederlands bedrijf, Nederlandstalige support en checkout | Internationaal |
| Uitbetaling | Standaard dagelijks/periodiek naar je IBAN (instelbaar) | Standaard rollend schema |

**Gekozen: Mollie** – Nederlands, eenvoudige gehoste checkout met alle gangbare methodes inclusief Apple Pay zonder
extra werk, geen maandkosten. De code is modulair (`src/lib/payments/`): een Stripe-adapter kan later met dezelfde
interface worden toegevoegd.

## Terugkerende kosten (indicatie)

| Post | Plan | Kosten |
|---|---|---|
| Vercel | **Pro** (Hobby is niet bedoeld voor commercieel gebruik) | ± $20 per gebruiker per maand |
| Supabase | **Pro** (dagelijkse back-ups, 7 dagen bewaard; geen automatische pauze) | ± $25 per maand |
| Resend | **Pro** aanbevolen (gratis plan: 3.000/maand maar **max. 100 per dag** – te weinig op een verkoopdag) | ± $20 per maand (50.000 e-mails) |
| Mollie | Geen abonnement | Per transactie; bij 300 tickets in ±120 iDEAL-bestellingen à ±€0,32 ≈ €40 per evenement |
| Domeinnaam | – | ± €10–15 per jaar |
| **Totaal vast** | | **± €60–70 per maand** + transactiekosten |

Besparen in de opstartfase: Supabase Free en Resend Free kunnen voor testen, maar niet voor de echte verkoop
(Supabase Free pauzeert na inactiviteit en heeft geen back-ups; Resend Free stopt na 100 e-mails per dag).

## Bronnen
- Mollie: https://www.mollie.com/pricing
- Stripe NL: https://stripe.com/nl/pricing
- Supabase: https://supabase.com/pricing
- Vercel: https://vercel.com/pricing
- Resend: https://resend.com/pricing
