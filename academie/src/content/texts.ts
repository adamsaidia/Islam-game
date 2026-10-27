// Leesteksten in vijf fasen: van volledige harakat naar zelfstandig lezen zonder.
import { CAFE_DIALOGUE, MEETING_DIALOGUE, FINAL_TEXT } from "./lessons/communication";
import { AI_DEBATE, ARABIC_LANGUAGE, CITY_VILLAGE, HOMEWORK, MOROCCO_TRIP, MY_DAY, NEWS, SALMA_WORK, STUDY_ABSTRACT, YUSUF_STORY, type Passage } from "./passages";

const fromPassage = (p: Passage, stage: ReadingStage, minLesson: number, questions: ReadingText["questions"]): ReadingText => ({
  id: p.id,
  title: p.title,
  stage,
  minLesson,
  sentences: p.sentences,
  gloss: p.gloss,
  questions,
});

export type ReadingStage = 1 | 2 | 3 | 4 | 5;

export const STAGES: Record<ReadingStage, { title: string; desc: string; harakat: "full" | "partial" | "none"; translation: boolean }> = {
  1: { title: "Fase 1 — volledige harakat", desc: "Alle klinkertekens staan erbij.", harakat: "full", translation: true },
  2: { title: "Fase 2 — gedeeltelijke harakat", desc: "Alleen lastige klinkers, shadda en tanween.", harakat: "partial", translation: true },
  3: { title: "Fase 3 — zonder harakat, met hulp", desc: "Geen klinkertekens; tik op een woord voor hulp.", harakat: "none", translation: true },
  4: { title: "Fase 4 — zonder harakat en vertaling", desc: "Probeer de tekst zelfstandig te begrijpen.", harakat: "none", translation: false },
  5: { title: "Fase 5 — langere teksten", desc: "Langere tekst, zelfstandig lezen.", harakat: "none", translation: false },
};

export type ReadingText = {
  id: string;
  title: string;
  stage: ReadingStage;
  minLesson: number;
  sentences: { ar: string; nl: string }[];
  /** Woord (zoals in de tekst, met harakat) → betekenis in deze context. */
  gloss: [string, string][];
  questions: { q: string; options: string[]; answer: number }[];
};

export const TEXTS: ReadingText[] = [
  {
    id: "familie",
    title: "Mijn familie",
    stage: 1,
    minLesson: 17,
    sentences: [
      { ar: "أَنَا آدَمُ. هَذِهِ عَائِلَتِي.", nl: "Ik ben Adam. Dit is mijn familie." },
      { ar: "أَبِي مُدَرِّسٌ، وَأُمِّي طَبِيبَةٌ.", nl: "Mijn vader is leraar, en mijn moeder is arts." },
      { ar: "عِنْدِي أَخٌ وَاحِدٌ وَأُخْتٌ وَاحِدَةٌ.", nl: "Ik heb één broer en één zus." },
      { ar: "أَخِي صَغِيرٌ، وَأُخْتِي طَالِبَةٌ.", nl: "Mijn broer is klein, en mijn zus is studente." },
      { ar: "جَدِّي وَجَدَّتِي يَسْكُنَانِ فِي الْمَغْرِبِ.", nl: "Mijn opa en oma wonen in Marokko." },
    ],
    gloss: [
      ["أَنَا", "ik"], ["آدَمُ", "Adam"], ["هَذِهِ", "dit (v)"], ["عَائِلَتِي", "mijn familie"],
      ["أَبِي", "mijn vader"], ["مُدَرِّسٌ", "leraar"], ["وَأُمِّي", "en mijn moeder"], ["طَبِيبَةٌ", "arts (v)"],
      ["عِنْدِي", "ik heb"], ["أَخٌ", "een broer"], ["وَاحِدٌ", "één (m)"], ["وَأُخْتٌ", "en een zus"], ["وَاحِدَةٌ", "één (v)"],
      ["أَخِي", "mijn broer"], ["صَغِيرٌ", "klein"], ["وَأُخْتِي", "en mijn zus"], ["طَالِبَةٌ", "studente"],
      ["جَدِّي", "mijn opa"], ["وَجَدَّتِي", "en mijn oma"], ["يَسْكُنَانِ", "zij (twee) wonen"], ["فِي", "in"], ["الْمَغْرِبِ", "Marokko"],
    ],
    questions: [
      { q: "Wat doet de vader van Adam?", options: ["Hij is leraar.", "Hij is arts.", "Hij is student."], answer: 0 },
      { q: "Wat doet zijn moeder?", options: ["Zij is arts.", "Zij is lerares.", "Zij is studente."], answer: 0 },
      { q: "Waar wonen zijn opa en oma?", options: ["In Marokko.", "In Nederland.", "Bij Adam thuis."], answer: 0 },
    ],
  },
  {
    id: "cafe",
    title: "In het café",
    stage: 1,
    minLesson: 28,
    sentences: CAFE_DIALOGUE.map((d) => ({ ar: d.ar, nl: `${d.speaker}: ${d.nl}` })),
    gloss: [
      ["مَسَاءُ", "avond"], ["الْخَيْرِ", "het goede"], ["مَاذَا", "wat"], ["تُرِيدُ", "wil je / wilt u"], ["النُّورِ", "het licht"],
      ["أُرِيدُ", "ik wil"], ["قَهْوَةً", "koffie"], ["مِنْ", "van"], ["فَضْلِكَ", "je goedheid (min faḍlika = alsjeblieft)"],
      ["بِالسُّكَّرِ", "met suiker"], ["لَا", "nee"], ["بِدُونِ", "zonder"], ["سُكَّرٍ", "suiker"], ["وَكَأْسَ", "en een glas"],
      ["مَاءٍ", "water"], ["أَيْضًا", "ook"], ["حَسَنًا", "goed, oké"], ["هَلْ", "(vraagwoord ja/nee)"], ["شَيْئًا", "iets"],
      ["آخَرَ", "anders, ander"], ["شُكْرًا", "dank je"], ["بِكَمْ", "voor hoeveel"], ["هَذَا", "dit"], ["عَشَرَةُ", "tien"], ["دَرَاهِمَ", "dirham (mv.)"],
    ],
    questions: [
      { q: "Wat bestelt de klant?", options: ["Koffie zonder suiker en een glas water.", "Thee met suiker.", "Alleen water."], answer: 0 },
      { q: "Hoeveel moet hij betalen?", options: ["Tien dirham.", "Vijf dirham.", "Niets."], answer: 0 },
    ],
  },
  {
    id: "huis",
    title: "Mijn huis",
    stage: 2,
    minLesson: 24,
    sentences: [
      { ar: "هَذَا بَيْتِي.", nl: "Dit is mijn huis." },
      { ar: "بَيْتِي لَيْسَ كَبِيرًا، لَكِنَّهُ جَمِيلٌ.", nl: "Mijn huis is niet groot, maar het is mooi." },
      { ar: "فِي الْبَيْتِ ثَلَاثُ غُرَفٍ وَمَطْبَخٌ وَحَمَّامٌ.", nl: "In het huis zijn drie kamers, een keuken en een badkamer." },
      { ar: "غُرْفَتِي صَغِيرَةٌ، وَفِيهَا سَرِيرٌ وَمَكْتَبٌ وَكُرْسِيٌّ.", nl: "Mijn kamer is klein; er staan een bed, een bureau en een stoel." },
      { ar: "النَّافِذَةُ كَبِيرَةٌ، وَمِنْهَا أَرَى الشَّارِعَ.", nl: "Het raam is groot, en daardoor zie ik de straat." },
    ],
    gloss: [
      ["هَذَا", "dit"], ["بَيْتِي", "mijn huis"], ["لَيْسَ", "is niet"], ["كَبِيرًا", "groot"], ["لَكِنَّهُ", "maar het (hij)"], ["جَمِيلٌ", "mooi"],
      ["فِي", "in"], ["الْبَيْتِ", "het huis"], ["ثَلَاثُ", "drie"], ["غُرَفٍ", "kamers"], ["وَمَطْبَخٌ", "en een keuken"], ["وَحَمَّامٌ", "en een badkamer"],
      ["غُرْفَتِي", "mijn kamer"], ["صَغِيرَةٌ", "klein (v)"], ["وَفِيهَا", "en daarin"], ["سَرِيرٌ", "een bed"], ["وَمَكْتَبٌ", "en een bureau"], ["وَكُرْسِيٌّ", "en een stoel"],
      ["النَّافِذَةُ", "het raam"], ["كَبِيرَةٌ", "groot (v)"], ["وَمِنْهَا", "en daaruit / daardoor"], ["أَرَى", "ik zie"], ["الشَّارِعَ", "de straat"],
    ],
    questions: [
      { q: "Hoeveel kamers heeft het huis?", options: ["Drie.", "Twee.", "Vier."], answer: 0 },
      { q: "Wat staat er in de kamer van de schrijver?", options: ["Een bed, een bureau en een stoel.", "Een tafel en een bank.", "Alleen een bed."], answer: 0 },
      { q: "Wat ziet de schrijver door het raam?", options: ["De straat.", "De zee.", "Een tuin."], answer: 0 },
    ],
  },
  {
    id: "dag-sara",
    title: "Een dag van Sara",
    stage: 3,
    minLesson: 27,
    sentences: [
      { ar: "تَسْتَيْقِظُ سَارَةُ فِي السَّاعَةِ السَّابِعَةِ.", nl: "Sara wordt om zeven uur wakker." },
      { ar: "تَشْرَبُ الشَّايَ وَتَأْكُلُ الْخُبْزَ مَعَ الْجُبْنِ.", nl: "Ze drinkt thee en eet brood met kaas." },
      { ar: "ثُمَّ تَذْهَبُ إِلَى الْجَامِعَةِ بِالْحَافِلَةِ.", nl: "Daarna gaat ze met de bus naar de universiteit." },
      { ar: "تَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.", nl: "Ze studeert de Arabische taal." },
      { ar: "فِي الْمَسَاءِ تَرْجِعُ إِلَى الْبَيْتِ وَتَقْرَأُ كِتَابًا.", nl: "'s Avonds gaat ze terug naar huis en leest ze een boek." },
    ],
    gloss: [
      ["تَسْتَيْقِظُ", "zij wordt wakker"], ["سَارَةُ", "Sara"], ["فِي", "in, om"], ["السَّاعَةِ", "het uur"], ["السَّابِعَةِ", "het zevende"],
      ["تَشْرَبُ", "zij drinkt"], ["الشَّايَ", "de thee"], ["وَتَأْكُلُ", "en zij eet"], ["الْخُبْزَ", "het brood"], ["مَعَ", "met"], ["الْجُبْنِ", "de kaas"],
      ["ثُمَّ", "daarna"], ["تَذْهَبُ", "zij gaat"], ["إِلَى", "naar"], ["الْجَامِعَةِ", "de universiteit"], ["بِالْحَافِلَةِ", "met de bus"],
      ["تَدْرُسُ", "zij studeert"], ["اللُّغَةَ", "de taal"], ["الْعَرَبِيَّةَ", "de Arabische"],
      ["الْمَسَاءِ", "de avond"], ["تَرْجِعُ", "zij keert terug"], ["الْبَيْتِ", "het huis"], ["وَتَقْرَأُ", "en zij leest"], ["كِتَابًا", "een boek"],
    ],
    questions: [
      { q: "Hoe laat wordt Sara wakker?", options: ["Om zeven uur.", "Om acht uur.", "Om zes uur."], answer: 0 },
      { q: "Hoe gaat ze naar de universiteit?", options: ["Met de bus.", "Te voet.", "Met de auto."], answer: 0 },
      { q: "Wat studeert ze?", options: ["Arabisch.", "Engels.", "Wiskunde."], answer: 0 },
      { q: "Wat doet ze 's avonds?", options: ["Ze leest een boek.", "Ze kijkt televisie.", "Ze kookt."], answer: 0 },
    ],
  },
  {
    id: "kennismaking",
    title: "Yusuf en Sara",
    stage: 4,
    minLesson: 29,
    sentences: MEETING_DIALOGUE.map((d) => ({ ar: d.ar, nl: `${d.speaker}: ${d.nl}` })),
    gloss: [
      ["السَّلَامُ", "de vrede"], ["عَلَيْكُمْ", "over jullie / u"], ["وَعَلَيْكُمُ", "en over jullie / u"],
      ["أَنَا", "ik"], ["يُوسُفُ", "Yusuf"], ["مَا", "wat"], ["اسْمُكِ", "jouw (v) naam"], ["اِسْمِي", "mijn naam"], ["سَارَةُ", "Sara"],
      ["تَشَرَّفْنَا", "aangenaam"], ["مِنْ", "van, uit"], ["أَيْنَ", "waar"], ["أَنْتِ", "jij (v)"], ["يَا", "(aanspreking)"], ["هُولَنْدَا", "Nederland"],
      ["رُوتِرْدَام", "Rotterdam"], ["وَأَنْتَ", "en jij (m)"], ["مِنَ", "uit"], ["الْمَغْرِبِ", "Marokko"], ["طَالِبٌ", "student"], ["فِي", "in, aan"],
      ["الْجَامِعَةِ", "de universiteit"], ["وَأَنَا", "en ik"], ["مُدَرِّسَةٌ", "lerares"],
    ],
    questions: [
      { q: "Waar komt Sara vandaan?", options: ["Uit Rotterdam.", "Uit Marokko.", "Uit Amsterdam."], answer: 0 },
      { q: "Wat is Yusuf?", options: ["Student.", "Leraar.", "Arts."], answer: 0 },
    ],
  },
  {
    id: "markt",
    title: "Op de markt",
    stage: 4,
    minLesson: 30,
    sentences: [
      { ar: "ذَهَبَ أَحْمَدُ إِلَى السُّوقِ يَوْمَ السَّبْتِ.", nl: "Ahmed ging op zaterdag naar de markt." },
      { ar: "اِشْتَرَى تُفَّاحًا وَبُرْتُقَالًا وَخُبْزًا.", nl: "Hij kocht appels, sinaasappels en brood." },
      { ar: "كَانَ السُّوقُ مُزْدَحِمًا جِدًّا.", nl: "De markt was erg druk." },
      { ar: "سَأَلَ الْبَائِعَ: بِكَمْ كِيلُو التُّفَّاحِ؟", nl: "Hij vroeg de verkoper: hoeveel kost een kilo appels?" },
      { ar: "قَالَ الْبَائِعُ: بِخَمْسَةِ دَرَاهِمَ.", nl: "De verkoper zei: vijf dirham." },
      { ar: "دَفَعَ أَحْمَدُ وَرَجَعَ إِلَى الْبَيْتِ سَعِيدًا.", nl: "Ahmed betaalde en ging blij terug naar huis." },
    ],
    gloss: [
      ["ذَهَبَ", "hij ging"], ["أَحْمَدُ", "Ahmed"], ["إِلَى", "naar"], ["السُّوقِ", "de markt"], ["يَوْمَ", "op de dag"], ["السَّبْتِ", "zaterdag"],
      ["اِشْتَرَى", "hij kocht"], ["تُفَّاحًا", "appels"], ["وَبُرْتُقَالًا", "en sinaasappels"], ["وَخُبْزًا", "en brood"],
      ["كَانَ", "was"], ["السُّوقُ", "de markt"], ["مُزْدَحِمًا", "druk"], ["جِدًّا", "erg"],
      ["سَأَلَ", "hij vroeg"], ["الْبَائِعَ", "de verkoper"], ["بِكَمْ", "voor hoeveel"], ["كِيلُو", "kilo"], ["التُّفَّاحِ", "de appels"],
      ["قَالَ", "hij zei"], ["الْبَائِعُ", "de verkoper"], ["بِخَمْسَةِ", "voor vijf"], ["دَرَاهِمَ", "dirham (mv.)"],
      ["دَفَعَ", "hij betaalde"], ["وَرَجَعَ", "en hij keerde terug"], ["الْبَيْتِ", "het huis"], ["سَعِيدًا", "blij"],
    ],
    questions: [
      { q: "Wanneer ging Ahmed naar de markt?", options: ["Op zaterdag.", "Op vrijdag.", "Op zondag."], answer: 0 },
      { q: "Wat kocht hij?", options: ["Appels, sinaasappels en brood.", "Vlees en rijst.", "Alleen appels."], answer: 0 },
      { q: "Hoeveel kost een kilo appels?", options: ["Vijf dirham.", "Tien dirham.", "Zeven dirham."], answer: 0 },
      { q: "Hoe was de markt?", options: ["Erg druk.", "Leeg.", "Gesloten."], answer: 0 },
    ],
  },
  {
    id: "adam",
    title: "Adam stelt zich voor",
    stage: 3,
    minLesson: 30,
    sentences: FINAL_TEXT.split(/(?<=\.)\s+/).map((ar, i) => ({
      ar,
      nl: [
        "Mijn naam is Adam.",
        "Ik kom uit Nederland.",
        "Ik woon in een klein huis met mijn gezin.",
        "Ik heb één zus; haar naam is Maryam.",
        "Zij is studente aan de universiteit.",
        "'s Ochtends drink ik koffie en eet ik brood.",
      ][i],
    })),
    gloss: [
      ["اِسْمِي", "mijn naam"], ["آدَمُ", "Adam"], ["أَنَا", "ik"], ["مِنْ", "uit"], ["هُولَنْدَا", "Nederland"], ["أَسْكُنُ", "ik woon"], ["فِي", "in"],
      ["بَيْتٍ", "een huis"], ["صَغِيرٍ", "klein"], ["مَعَ", "met"], ["أُسْرَتِي", "mijn gezin"], ["عِنْدِي", "ik heb"], ["أُخْتٌ", "een zus"],
      ["وَاحِدَةٌ", "één (v)"], ["اسْمُهَا", "haar naam"], ["مَرْيَمُ", "Maryam"], ["هِيَ", "zij"], ["طَالِبَةٌ", "studente"], ["الْجَامِعَةِ", "de universiteit"],
      ["الصَّبَاحِ", "de ochtend"], ["أَشْرَبُ", "ik drink"], ["قَهْوَةً", "koffie"], ["وَآكُلُ", "en ik eet"], ["خُبْزًا", "brood"],
    ],
    questions: [
      { q: "Met wie woont Adam?", options: ["Met zijn gezin.", "Alleen.", "Met een vriend."], answer: 0 },
      { q: "Wat eet Adam 's ochtends?", options: ["Brood.", "Rijst.", "Fruit."], answer: 0 },
    ],
  },
  {
    id: "brief",
    title: "Een brief aan Yusuf",
    stage: 5,
    minLesson: 30,
    sentences: [
      { ar: "عَزِيزِي يُوسُفُ،", nl: "Beste Yusuf," },
      { ar: "السَّلَامُ عَلَيْكُمْ. كَيْفَ حَالُكَ؟ أَنَا بِخَيْرٍ وَالْحَمْدُ لِلَّهِ.", nl: "Vrede zij met je. Hoe gaat het? Met mij gaat het goed, God zij dank." },
      { ar: "أَكْتُبُ لَكَ هَذِهِ الرِّسَالَةَ مِنْ أَمْسْتِرْدَام.", nl: "Ik schrijf je deze brief vanuit Amsterdam." },
      { ar: "الْجَوُّ هُنَا بَارِدٌ وَمُمْطِرٌ، لَكِنَّ الْمَدِينَةَ جَمِيلَةٌ جِدًّا.", nl: "Het weer is hier koud en regenachtig, maar de stad is heel mooi." },
      { ar: "أَدْرُسُ الْعَرَبِيَّةَ كُلَّ يَوْمٍ سَاعَةً وَاحِدَةً، وَأَقْرَأُ الْآنَ نُصُوصًا قَصِيرَةً بِدُونِ تَشْكِيلٍ.", nl: "Ik studeer elke dag één uur Arabisch, en ik lees nu korte teksten zonder klinkertekens." },
      { ar: "فِي الصَّيْفِ أُرِيدُ أَنْ أَزُورَكَ فِي الْمَغْرِبِ وَأَتَكَلَّمَ مَعَكَ بِالْعَرَبِيَّةِ.", nl: "In de zomer wil ik je in Marokko bezoeken en met je in het Arabisch praten." },
      { ar: "اُكْتُبْ لِي قَرِيبًا.", nl: "Schrijf me snel terug." },
      { ar: "صَدِيقُكَ، آدَمُ", nl: "Je vriend, Adam" },
    ],
    gloss: [
      ["عَزِيزِي", "beste (lett. mijn dierbare)"], ["يُوسُفُ", "Yusuf"], ["كَيْفَ", "hoe"], ["حَالُكَ", "jouw toestand"], ["بِخَيْرٍ", "goed"],
      ["وَالْحَمْدُ", "en de lof"], ["لِلَّهِ", "aan God"], ["أَكْتُبُ", "ik schrijf"], ["لَكَ", "aan jou"], ["هَذِهِ", "deze"], ["الرِّسَالَةَ", "de brief"],
      ["الْجَوُّ", "het weer"], ["هُنَا", "hier"], ["بَارِدٌ", "koud"], ["وَمُمْطِرٌ", "en regenachtig"], ["لَكِنَّ", "maar"], ["الْمَدِينَةَ", "de stad"],
      ["جَمِيلَةٌ", "mooi"], ["جِدًّا", "heel"], ["أَدْرُسُ", "ik studeer"], ["الْعَرَبِيَّةَ", "het Arabisch"], ["كُلَّ", "elke"], ["يَوْمٍ", "dag"],
      ["سَاعَةً", "een uur"], ["وَاحِدَةً", "één"], ["وَأَقْرَأُ", "en ik lees"], ["الْآنَ", "nu"], ["نُصُوصًا", "teksten"], ["قَصِيرَةً", "korte"],
      ["بِدُونِ", "zonder"], ["تَشْكِيلٍ", "klinkertekens (vocalisatie)"], ["الصَّيْفِ", "de zomer"], ["أُرِيدُ", "ik wil"], ["أَنْ", "(om) te"],
      ["أَزُورَكَ", "jou bezoeken"], ["الْمَغْرِبِ", "Marokko"], ["وَأَتَكَلَّمَ", "en praten"], ["مَعَكَ", "met jou"], ["بِالْعَرَبِيَّةِ", "in het Arabisch"],
      ["اُكْتُبْ", "schrijf!"], ["لِي", "aan mij"], ["قَرِيبًا", "binnenkort"], ["صَدِيقُكَ", "je vriend"], ["آدَمُ", "Adam"],
      ["السَّلَامُ", "de vrede"], ["عَلَيْكُمْ", "over jullie / u"], ["أَنَا", "ik"], ["مِنْ", "vanuit"], ["أَمْسْتِرْدَام", "Amsterdam"], ["فِي", "in"],
    ],
    questions: [
      { q: "Vanuit welke stad schrijft Adam?", options: ["Amsterdam.", "Rotterdam.", "Rabat."], answer: 0 },
      { q: "Hoe is het weer?", options: ["Koud en regenachtig.", "Warm en zonnig.", "Het sneeuwt."], answer: 0 },
      { q: "Hoeveel studeert Adam per dag?", options: ["Eén uur.", "Twee uur.", "Een half uur."], answer: 0 },
      { q: "Wat wil Adam in de zomer doen?", options: ["Yusuf bezoeken in Marokko.", "Naar Amsterdam verhuizen.", "Een boek schrijven."], answer: 0 },
    ],
  },
  fromPassage(MY_DAY, 2, 39, [
    { q: "Hoe gaat de schrijver naar zijn werk?", options: ["Met de fiets.", "Met de bus.", "Met de auto."], answer: 0 },
    { q: "Hoe laat gaat hij slapen?", options: ["Om elf uur.", "Om tien uur.", "Om twaalf uur."], answer: 0 },
  ]),
  fromPassage(MOROCCO_TRIP, 3, 50, [
    { q: "Met wie reisde de schrijver?", options: ["Met zijn familie.", "Alleen.", "Met collega's."], answer: 0 },
    { q: "Wat aten ze?", options: ["Tajine.", "Couscous.", "Vis."], answer: 0 },
    { q: "Wat doen ze volgend jaar?", options: ["Rabat en Tanger bezoeken.", "Naar Egypte gaan.", "Thuisblijven."], answer: 0 },
  ]),
  fromPassage(YUSUF_STORY, 3, 58, [
    { q: "Wat deed Yusuf elke ochtend?", options: ["Naar het nieuws luisteren.", "Sporten.", "Naar de universiteit gaan."], answer: 0 },
    { q: "Wat is hij nu van beroep?", options: ["Tolk.", "Leraar.", "Journalist."], answer: 0 },
  ]),
  fromPassage(SALMA_WORK, 4, 56, [
    { q: "Wat is Salma van beroep?", options: ["Ingenieur.", "Arts.", "Lerares."], answer: 0 },
    { q: "Hoe is haar salaris?", options: ["Goed.", "Laag.", "Dat staat er niet."], answer: 0 },
  ]),
  fromPassage(NEWS, 4, 57, [
    { q: "Hoeveel woningen wil de regering bouwen?", options: ["Honderdduizend.", "Tienduizend.", "Een miljoen."], answer: 0 },
    { q: "Hoe wordt het weer in het weekend?", options: ["Regenachtig.", "Zonnig.", "Koud en droog."], answer: 0 },
  ]),
  fromPassage(HOMEWORK, 5, 62, [
    { q: "Wat is volgens de schrijver het voordeel van thuiswerken?", options: ["Je bespaart reistijd.", "Je verdient meer.", "Je ziet collega's vaker."], answer: 0 },
    { q: "Wat raadt hij aan?", options: ["Twee of drie dagen per week thuiswerken.", "Altijd thuiswerken.", "Nooit thuiswerken."], answer: 0 },
  ]),
  fromPassage(CITY_VILLAGE, 5, 64, [
    { q: "Waarom verhuizen jongeren naar de stad?", options: ["Voor werk en onderwijs.", "Voor de rust.", "Omdat het goedkoop is."], answer: 0 },
    { q: "Wat zou jongeren in het dorp houden?", options: ["Investeringen in infrastructuur.", "Lagere huren in de stad.", "Minder scholen."], answer: 0 },
  ]),
  fromPassage(STUDY_ABSTRACT, 5, 65, [
    { q: "Waar gaat het onderzoek over?", options: ["Sociale media en taalleren.", "Gezondheid van studenten.", "Universitaire kosten."], answer: 0 },
    { q: "Welke vaardigheid verbetert?", options: ["Luisteren.", "Schrijven.", "Spreken."], answer: 0 },
  ]),
  fromPassage(AI_DEBATE, 5, 68, [
    { q: "Wat denken sommige experts?", options: ["AI schept nieuwe banen.", "AI verdwijnt snel.", "AI is verboden."], answer: 0 },
    { q: "Wat willen velen?", options: ["Wetten voor privacy en verantwoord gebruik.", "Minder technologie op school.", "Hogere salarissen."], answer: 0 },
  ]),
  fromPassage(ARABIC_LANGUAGE, 5, 69, [
    { q: "In hoeveel landen is Arabisch een officiële taal?", options: ["In meer dan twintig.", "In vijf.", "In honderd."], answer: 0 },
    { q: "Wat is de grootste uitdaging voor leerders?", options: ["Lezen zonder klinkertekens.", "Het alfabet.", "De dialecten verstaan."], answer: 0 },
    { q: "Wat helpt volgens de tekst?", options: ["Regelmatig oefenen.", "Alleen dialect leren.", "Niet lezen."], answer: 0 },
  ]),
];
