// Standaardinstellingen. Alles is aanpasbaar via /admin/instellingen.
// Juridische teksten zijn CONCEPTEN: de organisator moet ze controleren vóór publicatie.

export type FeeEstimate = { fixedCents: number; percentBps: number };

export type EmailTemplateKey =
  | 'order_received'
  | 'tickets'
  | 'payment_reminder'
  | 'event_reminder'
  | 'cancellation'
  | 'refund'
  | 'event_changed'
  | 'waitlist'
  | 'over_capacity';

export type EmailTemplate = { subject: string; intro: string };

export type Settings = {
  site: {
    orgName: string;
    tagline: string;
    intro: string;
    contactEmail: string;
    contactPhone: string;
    whatsappUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    privacyNote: string;
    burkiniNote: string;
  };
  checkout: {
    bankTransferEnabled: boolean;
    transferHoldHours: number;
    iban: string;
    accountHolder: string;
    maxPersonsPerOrder: number;
    showDiscountField: boolean;
  };
  finance: {
    vatEnabled: boolean;
    vatRatePercent: number | null;
    feeEstimates: Record<string, FeeEstimate>;
  };
  privacy: { retentionMonths: number };
  reminders: { eventReminderHours: number; paymentReminderMinutes: number };
  legal: {
    privacy: { text: string; approved: boolean };
    terms: { text: string; approved: boolean };
    houseRules: { text: string; approved: boolean };
    cancellation: { text: string; approved: boolean };
  };
  faq: { q: string; a: string }[];
  emailTemplates: Record<EmailTemplateKey, EmailTemplate>;
};

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  order_received: 'Bestelbevestiging bij bankoverschrijving (met betaalinstructies)',
  tickets: 'Betaalbevestiging + digitale tickets',
  payment_reminder: 'Betalingsherinnering',
  event_reminder: 'Evenementherinnering',
  cancellation: 'Annulering',
  refund: 'Terugbetalingsbevestiging',
  event_changed: 'Wijziging evenementgegevens',
  waitlist: 'Wachtlijstmelding',
  over_capacity: 'Betaling ontvangen maar uitverkocht (automatische terugbetaling)',
};

export const DEFAULT_SETTINGS: Settings = {
  site: {
    orgName: 'Aqua Sisters',
    tagline: 'Exclusief zwemmen voor vrouwen',
    intro:
      'Aqua Sisters organiseert besloten zwemavonden, uitsluitend voor vrouwen en toegestane kinderen. Geen pottenkijkers, geen haast – alleen het water, rust en elkaar.',
    contactEmail: '',
    contactPhone: '',
    whatsappUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    privacyNote:
      'Tijdens Aqua Sisters is het zwembad volledig afgeschermd. Er is uitsluitend vrouwelijk personeel aanwezig in het zwembad en fotograferen of filmen is niet toegestaan.',
    burkiniNote:
      'Een burkini is verplicht tijdens het zwemmen. Zo voelt iedereen zich op haar gemak.',
  },
  checkout: {
    bankTransferEnabled: false,
    transferHoldHours: 72,
    iban: '',
    accountHolder: 'Aqua Sisters',
    maxPersonsPerOrder: 20,
    showDiscountField: true,
  },
  finance: {
    vatEnabled: false,
    vatRatePercent: null,
    feeEstimates: {
      ideal: { fixedCents: 0, percentBps: 0 },
      creditcard: { fixedCents: 0, percentBps: 0 },
      applepay: { fixedCents: 0, percentBps: 0 },
      googlepay: { fixedCents: 0, percentBps: 0 },
      bancontact: { fixedCents: 0, percentBps: 0 },
    },
  },
  privacy: { retentionMonths: 24 },
  reminders: { eventReminderHours: 48, paymentReminderMinutes: 30 },
  legal: {
    privacy: {
      approved: false,
      text: `CONCEPT – laat deze tekst controleren vóór publicatie.

Aqua Sisters vindt jouw privacy belangrijk. In deze verklaring lees je welke persoonsgegevens wij verwerken en waarom.

Welke gegevens verwerken wij?
• Voornaam en achternaam
• E-mailadres
• Telefoonnummer (alleen als je dit zelf opgeeft)
• Bestel- en betaalgegevens (bestelnummer, bedrag, betaalmethode, status)
• Gegevens over toegang tot het evenement (tijdstip van inchecken)

Waarom?
• Om je bestelling uit te voeren en je tickets te versturen (uitvoering overeenkomst).
• Om je te informeren over wijzigingen van het evenement waarvoor je een ticket hebt.
• Om te voldoen aan wettelijke (fiscale) bewaarplichten.
• Alleen als je daar apart toestemming voor geeft: om je te informeren over nieuwe evenementen. Deze toestemming kun je altijd intrekken.

Betalingen worden verwerkt door onze betaalprovider. Wij ontvangen en bewaren geen kaartgegevens.
E-mails worden verstuurd via een e-mailprovider die als verwerker optreedt.

Bewaartermijn
Persoonsgegevens worden na afloop van de ingestelde bewaartermijn geanonimiseerd. Financiële gegevens bewaren wij zolang de wet dat vereist.

Jouw rechten
Je hebt recht op inzage, correctie, verwijdering en overdraagbaarheid van je gegevens, en je kunt bezwaar maken. Neem hiervoor contact met ons op. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.`,
    },
    terms: {
      approved: false,
      text: `CONCEPT – laat deze tekst controleren vóór publicatie.

1. Deze voorwaarden gelden voor alle ticketbestellingen bij Aqua Sisters.
2. Een bestelling is definitief zodra de betaling is bevestigd. Je ontvangt dan je tickets per e-mail.
3. Ieder ticket geeft één persoon eenmalig toegang tot het vermelde evenement. Een QR-code is maar één keer geldig.
4. Evenementen zijn uitsluitend toegankelijk voor vrouwen en toegestane kinderen, zoals vermeld bij het evenement.
5. Het dragen van een burkini is verplicht tijdens het zwemmen.
6. Kinderen staan altijd onder toezicht van een volwassene die zelf een ticket heeft.
7. Je dient de huisregels van Aqua Sisters en van de zwemlocatie te volgen. Bij overtreding kan de toegang worden ontzegd zonder restitutie.
8. Aqua Sisters is niet aansprakelijk voor verlies of diefstal van eigendommen.
9. Op annuleringen zijn de annuleringsvoorwaarden van toepassing.`,
    },
    houseRules: {
      approved: false,
      text: `CONCEPT – laat deze tekst controleren vóór publicatie.

• Toegang uitsluitend voor vrouwen en toegestane kinderen.
• Burkini verplicht tijdens het zwemmen.
• Fotograferen en filmen is niet toegestaan.
• Kinderen blijven altijd onder toezicht van hun begeleider.
• Volg altijd de aanwijzingen van het badpersoneel en de organisatie op.
• Neem je ticket (QR-code) mee op je telefoon of geprint.`,
    },
    cancellation: {
      approved: false,
      text: `CONCEPT – laat deze tekst controleren vóór publicatie.

• Tickets kunnen niet worden geruild of terugbetaald, tenzij hieronder anders vermeld.
• Wordt een evenement door Aqua Sisters geannuleerd, dan ontvang je het volledige aankoopbedrag terug.
• Wordt een evenement verplaatst, dan blijft je ticket geldig voor de nieuwe datum. Kun je dan niet, neem contact met ons op.
• Voor tickets voor vrijetijdsevenementen op een specifieke datum geldt wettelijk geen herroepingsrecht.`,
    },
  },
  faq: [
    {
      q: 'Is het evenement echt alleen voor vrouwen?',
      a: 'Ja. Tijdens Aqua Sisters is het zwembad volledig besloten en uitsluitend toegankelijk voor vrouwen en toegestane kinderen.',
    },
    { q: 'Moet ik een burkini dragen?', a: 'Ja, een burkini is verplicht tijdens het zwemmen.' },
    {
      q: 'Mag ik mijn kinderen meenemen?',
      a: 'Kinderen zijn welkom met een kinderticket, onder toezicht van een volwassene. De precieze voorwaarden staan bij het evenement.',
    },
    {
      q: 'Hoe ontvang ik mijn tickets?',
      a: 'Direct na je betaling ontvang je een e-mail met je tickets. Je kunt ze ook altijd bekijken en downloaden via de link in die e-mail.',
    },
    {
      q: 'Heb ik een account nodig?',
      a: 'Nee. Je bestelt zonder account – je naam en e-mailadres zijn genoeg.',
    },
    {
      q: 'Kan ik voor meerdere personen bestellen?',
      a: 'Ja. In één bestelling kun je meerdere volwassen- en kindertickets kopen. Iedere persoon krijgt een eigen QR-code.',
    },
  ],
  emailTemplates: {
    order_received: {
      subject: 'We hebben je bestelling ontvangen – {{bestelnummer}}',
      intro:
        'Hoi {{voornaam}}, we hebben je bestelling ontvangen. Je plekken zijn tijdelijk voor je gereserveerd. Maak het bedrag over volgens de instructies hieronder; na ontvangst sturen we je tickets.',
    },
    tickets: {
      subject: 'Jouw tickets voor {{evenement}} 🌊',
      intro:
        'Hoi {{voornaam}}, je betaling is gelukt en je plekje is gereserveerd! Hieronder vind je je tickets. Iedere persoon heeft een eigen QR-code.',
    },
    payment_reminder: {
      subject: 'Je bestelling is nog niet betaald',
      intro:
        'Hoi {{voornaam}}, we zagen dat je bestelling voor {{evenement}} nog niet is afgerond. Er zijn nog plekken beschikbaar – je kunt opnieuw bestellen via de knop hieronder.',
    },
    event_reminder: {
      subject: 'Tot snel bij {{evenement}}!',
      intro:
        'Hoi {{voornaam}}, nog even en het is zover. Vergeet je burkini en je tickets niet. Wij kijken ernaar uit je te verwelkomen!',
    },
    cancellation: {
      subject: 'Je tickets zijn geannuleerd – {{bestelnummer}}',
      intro: 'Hoi {{voornaam}}, de onderstaande tickets van je bestelling zijn geannuleerd en niet langer geldig.',
    },
    refund: {
      subject: 'Terugbetaling voor bestelling {{bestelnummer}}',
      intro: 'Hoi {{voornaam}}, we hebben een terugbetaling van {{bedrag}} voor je in gang gezet. Afhankelijk van je bank staat het bedrag binnen enkele werkdagen op je rekening.',
    },
    event_changed: {
      subject: 'Wijziging: {{evenement}}',
      intro: 'Hoi {{voornaam}}, er is iets gewijzigd aan het evenement waarvoor je tickets hebt. Bekijk hieronder de actuele gegevens. Je tickets blijven geldig.',
    },
    waitlist: {
      subject: 'Er zijn weer plekken vrij voor {{evenement}}',
      intro: 'Hoi {{voornaam}}, goed nieuws: er zijn weer tickets beschikbaar. Wees er snel bij – wie het eerst betaalt, heeft de plek.',
    },
    over_capacity: {
      subject: 'Je betaling is teruggestort – {{bestelnummer}}',
      intro:
        'Hoi {{voornaam}}, je betaling kwam binnen nadat je reservering was verlopen en het evenement inmiddels vol was. Het spijt ons enorm. We storten het volledige bedrag automatisch terug.',
    },
  },
};
