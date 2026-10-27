// Gespreksscenario's voor de AI-spreektrainer.
export type Scenario = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1";
  description: string;
  /** Rol en doel voor de AI-docent (Engels/Nederlands mengsel is ok voor het model). */
  role: string;
  opener: { ar: string; nl: string };
  useful: { ar: string; nl: string }[];
};

export const SCENARIOS: Scenario[] = [
  {
    id: "kennismaken",
    title: "Kennismaken",
    level: "A1",
    description: "Stel jezelf voor: naam, herkomst, woonplaats.",
    role: "Je bent een vriendelijke nieuwe collega die de leerling voor het eerst ontmoet. Vraag naar naam, herkomst en woonplaats.",
    opener: { ar: "السَّلَامُ عَلَيْكُمْ! أَنَا سَلْمَى. مَا اسْمُكَ؟", nl: "Vrede zij met u! Ik ben Salma. Wat is je naam?" },
    useful: [
      { ar: "اِسْمِي …", nl: "mijn naam is …" },
      { ar: "أَنَا مِنْ هُولَنْدَا", nl: "ik kom uit Nederland" },
      { ar: "أَسْكُنُ فِي …", nl: "ik woon in …" },
    ],
  },
  {
    id: "familie",
    title: "Familie",
    level: "A1",
    description: "Vertel over je familie en gezin.",
    role: "Je bent een buurvrouw die nieuwsgierig is naar de familie van de leerling. Vraag naar ouders, broers, zussen en kinderen.",
    opener: { ar: "مَرْحَبًا! هَلْ عِنْدَكَ إِخْوَةٌ؟", nl: "Hallo! Heb jij broers of zussen?" },
    useful: [
      { ar: "عِنْدِي أَخٌ وَأُخْتٌ", nl: "ik heb een broer en een zus" },
      { ar: "أَبِي مُدَرِّسٌ", nl: "mijn vader is leraar" },
    ],
  },
  {
    id: "cafe",
    title: "In het café",
    level: "A1",
    description: "Bestel iets te drinken en te eten.",
    role: "Je bent een ober in een café. Neem de bestelling op, stel vragen over suiker, grootte en extra's, en noem de prijs.",
    opener: { ar: "أَهْلًا وَسَهْلًا! مَاذَا تُرِيدُ أَنْ تَشْرَبَ؟", nl: "Welkom! Wat wil je drinken?" },
    useful: [
      { ar: "أُرِيدُ … مِنْ فَضْلِكَ", nl: "ik wil graag …" },
      { ar: "بِكَمْ هَذَا؟", nl: "hoeveel kost dit?" },
    ],
  },
  {
    id: "boodschappen",
    title: "Boodschappen doen",
    level: "A2",
    description: "Koop fruit en groente op de markt en vraag naar prijzen.",
    role: "Je bent een marktkoopman. Bied fruit en groente aan, noem prijzen en vraag hoeveel de klant wil.",
    opener: { ar: "تَفَضَّلْ! عِنْدِي تُفَّاحٌ وَبُرْتُقَالٌ طَازَجٌ. مَاذَا تُرِيدُ؟", nl: "Alsjeblieft! Ik heb verse appels en sinaasappels. Wat wil je?" },
    useful: [
      { ar: "كِيلُو تُفَّاحٍ مِنْ فَضْلِكَ", nl: "een kilo appels alsjeblieft" },
      { ar: "هَذَا غَالٍ!", nl: "dat is duur!" },
    ],
  },
  {
    id: "reizen",
    title: "Op reis",
    level: "A2",
    description: "Vraag de weg, koop een kaartje, check in bij een hotel.",
    role: "Je bent een receptionist in een hotel in Amman. Help de gast met inchecken, de kamer, ontbijttijden en de weg naar het centrum.",
    opener: { ar: "مَسَاءُ الْخَيْرِ، أَهْلًا بِكَ فِي الْفُنْدُقِ. هَلْ عِنْدَكَ حَجْزٌ؟", nl: "Goedenavond, welkom in het hotel. Heb je een reservering?" },
    useful: [
      { ar: "عِنْدِي حَجْزٌ بِاسْمِ …", nl: "ik heb een reservering op naam van …" },
      { ar: "أَيْنَ …؟", nl: "waar is …?" },
    ],
  },
  {
    id: "werk",
    title: "Werk",
    level: "A2",
    description: "Praat over je beroep en werkdag.",
    role: "Je bent een kennis die vraagt naar het werk van de leerling: beroep, werkplek, werktijden en wat de leerling er leuk aan vindt.",
    opener: { ar: "مَاذَا تَعْمَلُ؟", nl: "Wat voor werk doe je?" },
    useful: [
      { ar: "أَعْمَلُ … فِي …", nl: "ik werk als … bij/in …" },
      { ar: "أُحِبُّ عَمَلِي", nl: "ik hou van mijn werk" },
    ],
  },
  {
    id: "studie",
    title: "Studie",
    level: "A2",
    description: "Praat over wat en waarom je studeert, ook over Arabisch.",
    role: "Je bent een medestudent. Vraag wat de leerling studeert, waarom hij/zij Arabisch leert en hoe het gaat.",
    opener: { ar: "لِمَاذَا تَتَعَلَّمُ اللُّغَةَ الْعَرَبِيَّةَ؟", nl: "Waarom leer je Arabisch?" },
    useful: [
      { ar: "أَتَعَلَّمُ الْعَرَبِيَّةَ لِأَنَّ …", nl: "ik leer Arabisch omdat …" },
      { ar: "الْعَرَبِيَّةُ صَعْبَةٌ لَكِنَّهَا جَمِيلَةٌ", nl: "Arabisch is moeilijk maar mooi" },
    ],
  },
  {
    id: "gezondheid",
    title: "Bij de dokter",
    level: "B1",
    description: "Leg uit wat je klachten zijn.",
    role: "Je bent een huisarts. Vraag naar klachten, hoe lang ze al bestaan, en geef eenvoudig advies.",
    opener: { ar: "تَفَضَّلْ، اِجْلِسْ. مِمَّ تَشْكُو؟", nl: "Kom binnen, ga zitten. Waar heb je last van?" },
    useful: [
      { ar: "عِنْدِي صُدَاعٌ", nl: "ik heb hoofdpijn" },
      { ar: "مُنْذُ يَوْمَيْنِ", nl: "sinds twee dagen" },
    ],
  },
  {
    id: "hobbys",
    title: "Hobby's en vrije tijd",
    level: "A2",
    description: "Vertel wat je graag doet in je vrije tijd.",
    role: "Je bent een vriend die vraagt naar hobby's, sport, lezen, films en weekendplannen.",
    opener: { ar: "مَاذَا تُحِبُّ أَنْ تَفْعَلَ فِي وَقْتِ الْفَرَاغِ؟", nl: "Wat doe je graag in je vrije tijd?" },
    useful: [
      { ar: "أُحِبُّ الْقِرَاءَةَ", nl: "ik lees graag" },
      { ar: "فِي نِهَايَةِ الْأُسْبُوعِ …", nl: "in het weekend …" },
    ],
  },
  {
    id: "dagelijks",
    title: "Mijn dag",
    level: "A2",
    description: "Beschrijf je dagelijkse routine.",
    role: "Je bent een taalmaatje dat vraagt naar de dagelijkse routine van de leerling: opstaan, eten, werk/studie, avond.",
    opener: { ar: "مَتَى تَسْتَيْقِظُ فِي الصَّبَاحِ؟", nl: "Hoe laat word je 's ochtends wakker?" },
    useful: [
      { ar: "أَسْتَيْقِظُ فِي السَّاعَةِ …", nl: "ik word om … uur wakker" },
      { ar: "ثُمَّ …", nl: "daarna …" },
    ],
  },
  {
    id: "vrij",
    title: "Vrij gesprek",
    level: "B1",
    description: "Praat over elk onderwerp dat je wilt.",
    role: "Je bent een geduldige taaldocent. Voer een natuurlijk gesprek over het onderwerp dat de leerling kiest.",
    opener: { ar: "أَهْلًا! عَنْ أَيِّ مَوْضُوعٍ تُرِيدُ أَنْ نَتَكَلَّمَ الْيَوْمَ؟", nl: "Hoi! Over welk onderwerp wil je vandaag praten?" },
    useful: [{ ar: "أُرِيدُ أَنْ نَتَكَلَّمَ عَنْ …", nl: "ik wil praten over …" }],
  },
];
