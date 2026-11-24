# Handleiding beheerder

Log in via **/admin**. Na de eerste login vraagt het systeem om tweestapsverificatie (2FA) in te stellen.

## Overzicht
Live cijfers (ververst elke 15 seconden): omzet, verkochte tickets (volwassen/kind), resterende plekken, ingecheckte
bezoekers, bestellingen, openstaande betalingen, terugbetalingen, geschatte betaalkosten, kosten en geschatte winst.
Kies bovenaan één evenement of alle actuele evenementen. Onder de cijfers staan grafieken van de verkoop per dag en de
omzetontwikkeling (met tabelweergave). Waarschuwingen bovenaan tonen wat nog geconfigureerd moet worden.

## Evenementen
- **Nieuw evenement**: vul gegevens in, maak het aan en voeg daarna tickettypes toe.
- **Dupliceren**: kopieert evenement + tickettypes als concept. Pas daarna datum, locatie en *slug* (link) aan.
- **Publiceren / Verbergen**: gepubliceerd = zichtbaar en te koop. Verborgen = alleen via directe link, niet te koop.
- **Verkoop pauzeren**: tijdelijk geen verkoop (bestaande tickets blijven geldig).
- **Verkoop sluit automatisch** bij aanvang, of op het zelf ingestelde tijdstip.
- **Capaciteit**: het systeem verkoopt nooit meer dan dit aantal personen. Lager zetten dan al verkocht kan niet.
- **Reserveringstijd**: hoe lang plekken worden vastgehouden tijdens het betalen (standaard 10 minuten).
- **Leeftijdsgrenzen kinderen**: laat leeg tot ze bevestigd zijn – dan worden ze nergens getoond.
- **Tickettypes**: naam, categorie (volwassene/kind), prijs, eigen limiet, verkoopperiode en ‘personen per ticket’.
  - *Earlybird*: apart type met lagere prijs, eigen limiet en ‘verkoop tot’-datum.
  - *Groepsticket*: bijv. ‘personen per ticket = 5’ → de koper krijgt 5 QR-codes.
- **Afbeelding**: wordt gebruikt als achtergrond op de homepage en in linkvoorbeelden (WhatsApp/Instagram/TikTok).
- **Deelbare links**: kopieer per kanaal een link met campagnecodes (UTM), of deel direct via WhatsApp.
- **Wachtlijst**: bij uitverkocht kunnen bezoekers zich aanmelden. Komen er plekken vrij, kies dan hoeveel mensen je
  wilt informeren en klik op *Informeren*.
- **Wijziging melden**: vink bij opslaan ‘Ticketkopers mailen’ aan om alle kopers over een gewijzigde datum/tijd/locatie te informeren.

## Bestellingen
- Zoek op naam, e-mail, telefoon, bestel- of ticketnummer en filter op status of evenement.
- In een bestelling kun je:
  - tickets **opnieuw versturen**;
  - klantgegevens corrigeren (bijv. typefout in e-mail);
  - tickets **ongeldig maken** (optioneel met e-mail aan de klant);
  - een check-in **terugdraaien**;
  - een **handmatige betaling bevestigen** (bankoverschrijving) – tickets gaan direct de deur uit;
  - **terugbetalen**: volledig of gedeeltelijk, eventueel met annulering van specifieke tickets.
    Via Mollie gaat het geld automatisch terug.
- **Gratis / handmatige tickets**: maak gratis tickets (bijv. vrijwilligers, winacties) of een bestelling met betaling per overschrijving.
- **Export**: bestellingen of tickets (gastenlijst) als CSV – opent direct in Excel.

Automatisch afgehandeld (geen actie nodig):
- Verlopen of afgebroken betalingen geven plekken vanzelf vrij.
- Betaalt iemand ná het verlopen van de reservering terwijl het intussen vol is, dan wordt het bedrag automatisch teruggestort.
- Betaalt iemand per ongeluk twee keer voor dezelfde bestelling, dan wordt de tweede betaling automatisch teruggestort.

## Financiën
Voer kosten in (zwembadhuur, personeel, marketing, betaalkosten, verzekering, overig), per evenement of algemeen.
Het overzicht toont bruto omzet, terugbetalingen, netto-omzet, btw (alleen als ingesteld), totale kosten en het resultaat
vóór inkomstenbelasting. Betaalkosten worden geschat op basis van de tarieven bij Instellingen, totdat je de werkelijke
Mollie-kosten zelf als kostenpost invoert. **Laat btw-tarief en fiscale behandeling bevestigen door je boekhouder.**

## Marketing
- Kortingscodes: percentage of vast bedrag, maximum aantal keer, geldigheidsperiode, optioneel per evenement.
- Overzicht van bestellingen per bron/campagne (UTM).
- Nieuwsbrieflijst exporteren: alleen mensen die bij het bestellen vrijwillig het aparte vinkje aanzetten.

## E-mails
- Verzendlog met status. Mislukte e-mails worden automatisch opnieuw geprobeerd (max. 5 keer) en kun je ook handmatig opnieuw versturen.
- Teksten van alle e-mails zijn aanpasbaar (onderwerp + tekst) met velden zoals `{{voornaam}}`.

## Instellingen
Website- en contactgegevens, social-medialinks, bestelinstellingen (max. tickets, kortingsveld, bankoverschrijving + IBAN),
btw en betaalkosten, bewaartermijn, herinneringen, juridische teksten en veelgestelde vragen.

## Gebruikers
Maak accounts voor **beheerders** (alles) of **medewerkers** (alleen scanner). Deactiveer accounts die niet meer nodig zijn.
Reset wachtwoord of 2FA als iemand zijn telefoon kwijt is.

## Privacy (AVG)
Zoek op e-mailadres om een inzage-, export- of verwijderverzoek af te handelen. *Anonimiseren* wist naam, e-mail en
telefoon, maar bewaart bedragen voor de fiscale bewaarplicht. Na de ingestelde bewaartermijn gebeurt dit automatisch.

## Logboek
Alle belangrijke acties (wie deed wat, wanneer) en het volledige scanlogboek.
