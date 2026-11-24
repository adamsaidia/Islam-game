# Handleiding QR-scanner

De scanner werkt in de browser van iPhone (Safari) en Android (Chrome). Geen app nodig.

## Starten
1. Open **https://JOUWDOMEIN/scanner** en log in met je medewerkersaccount.
2. Kies het evenement (wordt onthouden op dit toestel).
3. Tik op **Start scannen** en sta cameratoegang toe.
   Tip: zet de pagina op het beginscherm (Delen → *Zet op beginscherm*) voor snelle toegang.

## Schermen
| Kleur | Betekenis | Actie |
|---|---|---|
| 🟢 **Groen – Welkom!** | Geldig ticket, nu ingecheckt | Toegang. Scherm sluit vanzelf. |
| 🔴 **Rood – Al gebruikt** | Ticket is eerder gescand (tijdstip staat erbij) | Geen toegang zonder controle. |
| 🔴 **Rood – Ongeldig / Geannuleerd** | Onbekende of ongeldige code | Geen toegang. Zoek eventueel op naam. |
| 🟠 **Oranje – Ander evenement** | Ticket hoort bij een andere datum/locatie | Geen toegang. |
| 🟤 **Offline – voorlopig toegelaten** | Alleen in noodmodus, zie onder | Wordt later gecontroleerd. |
| ⬛ **Geen verbinding** | Scan is NIET verwerkt | Opnieuw proberen of noodprocedure. |

Bij een geldig ticket zie je naam hoofdboeker, tickettype/categorie, ticketnummer en tijdstip van binnenkomst.
Groen geeft een korte hoge toon + trilling; rood een lage dubbele toon (trillen werkt niet op iPhone).

Meerdere scanners tegelijk zijn geen probleem: een ticket kan maar op één telefoon tegelijk worden geaccepteerd
(de database laat precies één scan winnen). De tellers *Binnen / Nog verwacht / Verkocht* zijn live.

## Zoeken en handmatig inchecken
Tab **Zoeken**: typ naam, ticket- of bestelnummer → **Inchecken**. Handig als een QR-code onleesbaar is
(gebarsten scherm, lage helderheid). Je kunt ook de code onder *QR-code handmatig invoeren* plakken.

## Foutje gemaakt?
Tab **Logboek** → **Terugdraaien** bij een groene scan. Medewerkers kunnen hun eigen scans van de afgelopen
10 minuten terugdraaien (met reden); beheerders altijd. Alles wordt gelogd.

## Noodprocedure bij internetstoring
Vooraf (elk evenement):
1. Open de scanner op elk toestel **vóór** aanvang, zodat de noodlijst wordt gedownload (gebeurt automatisch, elke 2 minuten ververst).
2. Exporteer en print de gastenlijst: dashboard → Bestellingen → *Export tickets / gastenlijst*.
3. Zorg voor een mobiele hotspot als reserve-internet.

Bij een storing:
1. Probeer eerst een andere verbinding (mobiele data / hotspot).
2. Werkt dat niet: tik op **Noodprocedure: offline modus**. Lees en bevestig de waarschuwing.
3. **Gebruik bij voorkeur ÉÉN offline scanner per ingang.** Scanners kunnen elkaar offline niet zien;
   twee offline scanners zouden hetzelfde ticket elk één keer kunnen accepteren. Verdeel anders de gastenlijst
   (bijv. scanner 1 achternaam A–L, scanner 2 M–Z).
4. In offline modus controleert de telefoon tickets met de noodlijst (gehashte kenmerken + voornaam en initiaal; de QR-codes zelf staan er niet in)
   en herkent hij dubbele scans **op hetzelfde toestel**.
5. Zodra er weer verbinding is, worden offline scans automatisch gesynchroniseerd. Is een ticket intussen ook op een
   ander toestel gebruikt, dan verschijnt een duidelijke **conflictmelding** op de scanner én in het dashboard-logboek.
   Dubbel gebruik wordt dus nooit ongemerkt geaccepteerd.
6. Zet offline modus weer uit zodra alles normaal werkt.

Laatste redmiddel: de geprinte gastenlijst, afvinken op naam.
