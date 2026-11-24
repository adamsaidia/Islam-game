# Testresultaten

Uitgevoerd op 24 november 2026 tegen PostgreSQL 16 en een productie-build (`next build` + `next start`).

| Suite | Resultaat |
|---|---|
| TypeScript (`tsc --noEmit`) | ✅ geen fouten |
| Productie-build (`next build`) | ✅ geslaagd |
| Unit-tests (Vitest) | ✅ 24/24 |
| Integratietests database (Vitest + echte Postgres) | ✅ 22/22 |
| Integratietests betalingen/webhooks/cron | ✅ 14/14 |
| End-to-end (Playwright, iPhone 13 + Desktop Chrome) | ✅ 23 geslaagd, 1 overgeslagen (mobiel-only test op desktop) |

## Wat is getest

**Betalingen** (via de testprovider die exact dezelfde webhook-route als Mollie gebruikt)
- Succesvolle betaling → tickets + precies één ticketmail
- Mislukte, geannuleerde en verlopen betaling → geen tickets, plekken vrijgegeven
- Herhaalde webhooks (5×, waarvan 3 gelijktijdig) → idempotent, geen dubbele tickets of e-mails
- Onjuist betaald bedrag → geen tickets, auditlog
- Onbekend/ongeldig betaal-ID in webhook
- Dubbele betaling voor dezelfde bestelling → automatisch teruggestort
- Betaling na verlopen reservering in vol evenement → automatisch teruggestort; met plek → alsnog tickets
- Gemiste webhook → door de cron alsnog verwerkt
- Gratis bestelling (100%-code) en gratis tickets door beheerder; bezoeker kan geen gratis tickets forceren

**Bestellen en capaciteit**
- Voorbeeld uit de opdracht: 2 × €13,50 + 1 × €8,00 = €35,00 (unit + e2e)
- Meerdere tickets per bestelling, per persoon een eigen QR-code
- 50 gelijktijdige bestellingen op 30 plekken → exact 30 verkocht
- Verlopen reserveringen komen automatisch vrij
- Limiet per tickettype (earlybird), kortingscode-maximum onder gelijktijdigheid, verlopen/onbekende codes
- Verkoop gepauzeerd / concept / gesloten

**Tickets en scanner**
- Eerste scan groen, tweede rood; 20 gelijktijdige scans van hetzelfde ticket → precies 1 geaccepteerd
- Ander evenement (oranje), ongeldig en geannuleerd (rood)
- Handmatig zoeken en inchecken; correctie terugdraaien
- Noodprocedure: offline scannen, dubbele scan op hetzelfde toestel geweigerd, conflict met ander toestel gemeld na synchronisatie
- QR-code bevat geen persoonsgegevens; PDF-download werkt

**Terugbetalingen**: gedeeltelijk met annulering van één ticket, volledig, te hoog bedrag geweigerd.

**Beveiliging**
- Dashboard, exports, scanner-API en cron zonder login → geweigerd (redirect/401)
- Medewerker kan niet in het dashboard; verkeerd wachtwoord geweigerd
- RLS staat aan op alle tabellen; alle geldkolommen zijn integers
- Rate limiter, scrypt-wachtwoorden, TOTP (RFC 6238-testvectoren), AES-GCM, CSV-injectie, HTML-escaping in e-mails

**Overig**: datum/tijd (zomer-/wintertijd Amsterdam), bewaartermijn/anonimisering, alle dashboardpagina's laden (200),
mobiele betaalknop blijft in beeld.

## Niet automatisch getest (handmatig doen vóór livegang)
- Echte Mollie-betalingen (testmodus) inclusief **Apple Pay** op iPhone/Safari en **Google Pay** op Android/Chrome
- E-mailbezorging via Resend (Gmail, Outlook, iCloud; spamscore)
- Camerascan op echte iPhone- en Android-toestellen bij de verlichting van het zwembad
- Instagram- en TikTok-in-app-browsers op echte telefoons
- Gedrag bij storing van Mollie/Resend in productie (de code vangt dit af: bestelling wordt geannuleerd met nette melding;
  e-mails worden gelogd en automatisch opnieuw geprobeerd)
