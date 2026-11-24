# Resterende beperkingen en open punten

## Nog door de organisator te regelen (configuratie)
| Punt | Status | Wat nodig is |
|---|---|---|
| Mollie-account + API-sleutels | Ontbreekt | Account verifiëren, methodes activeren, `MOLLIE_API_KEY` zetten. Eerst `test_`, live pas na expliciete toestemming. |
| Resend + domeinverificatie | Ontbreekt | Domein toevoegen, SPF/DKIM/DMARC zetten, `RESEND_API_KEY` en `EMAIL_FROM`. Zonder dit worden e-mails gelogd maar niet verstuurd. |
| Supabase-project | Ontbreekt | Project aanmaken (Frankfurt), migraties draaien, eerste beheerder aanmaken. |
| Vercel + domein | Ontbreekt | Zie DEPLOYMENT.md. |
| **Officieel logo en flyer** | Niet aangeleverd in de repository | Het huidige logo is een tijdelijk woordmerk (`public/brand/`, `src/components/Logo.tsx`). Vervang door het officiële logo (SVG). Kleuren zijn afgestemd op de beschreven huisstijl; stem fijn af op de flyer. |
| **Zwembadfotografie** | Niet aangeleverd | De site gebruikt een gegenereerde waterafbeelding. Upload per evenement een eigen foto (Evenement → Afbeelding), bij voorkeur zonder herkenbare personen. |
| Juridische teksten | Concept | Laten controleren; daarna per tekst ‘goedgekeurd’ aanvinken. |
| Leeftijdsgrenzen kinderen | Bewust leeg | Invullen bij het evenement zodra bevestigd. |
| Btw-tarief | Uit | Door boekhouder laten bepalen; dan instellen. |
| Contact, Instagram, TikTok, WhatsApp | Leeg | Instellingen → Website & contact. |
| Adres Zwembad Den Hommel | Leeg | Invullen bij het evenement (niet geverifieerd, daarom niet ingevuld). |

## Functionele beperkingen
- **Apple Wallet / Google Wallet**: niet gebouwd. Apple Wallet vereist een betaald Apple Developer-account
  (± $99/jaar) en certificaatbeheer; Google Wallet een Google Pay & Wallet-console. De mobiele tickets + PDF dekken de behoefte.
  Kan later worden toegevoegd.
- **Apple Pay / Google Pay** zijn niet automatisch getest: dit vereist een geverifieerd live Mollie-account en echte
  toestellen. Mollie toont ze automatisch op geschikte apparaten als ze in het dashboard zijn geactiveerd. Test ze vóór livegang.
- **Instagram/TikTok in-app browsers**: de bestelflow werkt; Apple Pay werkt daar niet. Bezoekers krijgen een tip en
  knop om in Safari/Chrome te openen. Handmatig testen op echte telefoons wordt aanbevolen.
- **Betaalkosten** zijn een schatting (instelbaar); de werkelijke Mollie-kosten staan in je Mollie-overzicht en kun je als kostenpost invoeren.
- **Terugbetaling bij bankoverschrijving** wordt alleen geregistreerd; het geld moet je zelf terugstorten.
- **Offline scannen**: dubbel gebruik tussen meerdere offline scanners wordt pas na synchronisatie gemeld (zie SCANNER.md).
- **Realtime** via korte polling (4–15 s), niet via websockets.
- **Cron**: in `vercel.json` dagelijks (werkt op elk plan). Voor tijdige betalings-/evenementherinneringen elke 10 minuten instellen (zie DEPLOYMENT.md).
- **PWA**: de site is installeerbaar (manifest + iconen), maar heeft geen service worker; zonder internet laadt de scanner
  niet opnieuw. Houd de scannerpagina dus open tijdens het evenement.
- **Taal**: alleen Nederlands.
