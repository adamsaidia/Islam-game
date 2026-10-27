// Lessen 8–14: letterverbindingen, harakat, sukun, shadda, tanween, hamza en het lidwoord.
import type { Lesson } from "../types";
import { builder, w } from "./helpers";

const l8 = (() => {
  const { ex, test } = builder(8);
  return {
    id: 8,
    module: "Alfabet herstellen",
    level: "A0",
    title: "Letters verbinden",
    titleAr: "وَصْلُ الْحُرُوفِ",
    goal: "Je kunt losse letters tot een woord verbinden en weet welke letters niet verbinden.",
    minutes: 20,
    skills: ["letters", "writing", "spelling", "reading"],
    sections: [
      {
        title: "Zo werkt verbinden",
        body: [
          "In het Arabisch worden letters binnen een woord aan elkaar geschreven, ook in drukletters. Elke letter kiest automatisch de vorm die bij zijn plek past.",
          "Zes letters verbinden nooit met de letter erna: ا د ذ ر ز و. Na deze letters ontstaat een kleine onderbreking in het woord.",
        ],
        examples: [
          { ar: "ب + ا + ب = بَاب", tr: "bāb", nl: "deur" },
          { ar: "ك + ت + ا + ب = كِتَاب", tr: "kitāb", nl: "boek" },
          { ar: "د + ا + ر = دَار", tr: "dār", nl: "huis (woning)" },
        ],
      },
      {
        title: "De speciale verbinding لا",
        body: [
          "Als lām (ل) gevolgd wordt door alif (ا), schrijf je ze samen als لا (lā). Dit woordje betekent ook 'nee' of 'niet'.",
        ],
        examples: [{ ar: "لَا", tr: "lā", nl: "nee / niet" }],
      },
      {
        title: "Ta marbuta en alif maqsura",
        body: [
          "Twee bijzondere eindletters: ة (ta marbuta) is een 'gesloten t' die je aan het eind van veel vrouwelijke woorden ziet, zoals وَرْدَة. ى (alif maqsura) is een alif in de vorm van een yā' zonder punten, zoals in عَلَى (op). In les 14 leer je ze uitgebreid.",
        ],
      },
    ],
    words: [w("بَاب", "bāb", "deur"), w("كِتَاب", "kitāb", "boek", "zn. m., mv. كُتُب"), w("دَار", "dār", "huis, woning", "zn. v."), w("قَلَم", "qalam", "pen", "zn. m."), w("لَا", "lā", "nee, niet")],
    exercises: [
      ex.type("writing", "Verbind deze letters tot één woord.", ["كتاب"], { promptAr: "ك ت ا ب" }),
      ex.type("writing", "Verbind deze letters tot één woord.", ["درس"], { promptAr: "د ر س" }),
      ex.type("writing", "Verbind deze letters tot één woord.", ["قلم"], { promptAr: "ق ل م" }),
      ex.type("writing", "Verbind deze letters tot één woord.", ["وردة"], { promptAr: "و ر د ة" }),
      ex.order("spelling", "Zet de letters in de juiste volgorde voor بَيْت (huis). Begin rechts.", ["ب", "ي", "ت"]),
      ex.mcq("letters", "Welke letter verbindt NIET met de letter erna?", ["ب", "د", "م", "ك"], 1, { explain: "د hoort bij ا د ذ ر ز و: deze verbinden nooit naar links." }),
      ex.mcq("letters", "Uit hoeveel losse stukjes bestaat dit woord?", ["1", "2", "3", "4"], 2, { promptAr: "دَار", explain: "د, ا en ر verbinden alle drie niet naar links: drie losse stukjes." }),
      ex.mcq("letters", "Welke twee letters vormen samen لا?", ["lām + alif", "alif + lām", "lām + yā'", "kāf + alif"], 0),
      ex.match("letters", "Koppel de vorm aan de positie van bā'.", [
        ["بـ", "begin"],
        ["ـبـ", "midden"],
        ["ـب", "eind"],
        ["ب", "los"],
      ]),
      ex.trace("لا", "Schrijf لا na.", "Begin met de lām van boven naar beneden, maak een lus naar links en eindig met de alif omhoog."),
      ex.type("writing", "Schrijf het woord bāb (deur).", ["باب"]),
      ex.speak("كِتَاب", "boek"),
    ],
    test: [
      test.type("writing", "Verbind deze letters tot één woord.", ["شمس"], { promptAr: "ش م س" }),
      test.type("writing", "Verbind deze letters tot één woord.", ["جمل"], { promptAr: "ج م ل" }),
      test.type("writing", "Verbind deze letters tot één woord.", ["لا"], { promptAr: "ل ا" }),
      test.mcq("letters", "In welk woord staat ع in de middenvorm?", ["بَعْد", "عَيْن", "سَمِعَ"], 0),
      test.mcq("letters", "Uit hoeveel losse stukjes bestaat dit woord?", ["1", "2", "3", "4"], 3, { promptAr: "وَرْدَة", explain: "و, ر en د verbinden niet naar links, dus: و | ر | د | ة." }),
      test.dictation("قَلَم", { explain: "قَلَم = pen" }),
    ],
  } satisfies Lesson;
})();

const l9 = (() => {
  const { ex, test } = builder(9);
  return {
    id: 9,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Korte klinkers: fatha, kasra, damma",
    titleAr: "الْفَتْحَةُ وَالْكَسْرَةُ وَالضَّمَّةُ",
    goal: "Je leest en schrijft woorden met de drie korte klinkers.",
    minutes: 20,
    skills: ["reading", "spelling", "listening"],
    sections: [
      {
        title: "Drie korte klinkers",
        body: [
          "In het Arabisch schrijf je korte klinkers niet als letters, maar als kleine tekentjes boven of onder een letter: de harakat.",
          "In kranten en boeken laat men deze tekens meestal weg. Daarom leer je ze nu goed, zodat je later kunt lezen zonder.",
        ],
        table: [
          ["Teken", "Naam", "Klank", "Voorbeeld"],
          ["بَ", "fatha (فَتْحَة)", "a", "ba"],
          ["بِ", "kasra (كَسْرَة)", "i", "bi"],
          ["بُ", "damma (ضَمَّة)", "u", "bu"],
        ],
      },
      {
        title: "Woorden met korte klinkers",
        body: ["Lees deze woorden hardop. Elke letter heeft hier een eigen klinker."],
        examples: [
          { ar: "كَتَبَ", tr: "kataba", nl: "hij schreef" },
          { ar: "ذَهَبَ", tr: "dhahaba", nl: "hij ging" },
          { ar: "جَلَسَ", tr: "jalasa", nl: "hij ging zitten" },
          { ar: "فَتَحَ", tr: "fataḥa", nl: "hij opende" },
          { ar: "كُتُب", tr: "kutub", nl: "boeken" },
          { ar: "عِنَب", tr: "ʿinab", nl: "druiven" },
        ],
      },
    ],
    words: [
      w("كَتَبَ", "kataba", "hij schreef", "ww. verleden tijd"),
      w("ذَهَبَ", "dhahaba", "hij ging", "ww. verleden tijd"),
      w("جَلَسَ", "jalasa", "hij ging zitten", "ww. verleden tijd"),
      w("فَتَحَ", "fataḥa", "hij opende", "ww. verleden tijd"),
      w("كُتُب", "kutub", "boeken", "mv. van كِتَاب"),
      w("عِنَب", "ʿinab", "druiven"),
    ],
    exercises: [
      ex.match("reading", "Koppel aan de juiste klank.", [["بَ", "ba"], ["بِ", "bi"], ["بُ", "bu"]]),
      ex.mcq("reading", "Hoe spreek je dit uit?", ["ba", "bi", "bu"], 1, { promptAr: "بِ" }),
      ex.mcq("reading", "Hoe spreek je dit uit?", ["tu", "ta", "ti"], 0, { promptAr: "تُ" }),
      ex.mcq("reading", "Hoe lees je dit woord?", ["kataba", "kutub", "kitāb"], 1, { promptAr: "كُتُب" }),
      ex.mcq("reading", "Hoe lees je dit woord?", ["jalasa", "julisa", "jalisa"], 0, { promptAr: "جَلَسَ" }),
      ex.type("spelling", "Schrijf 'ba' (bā' met fatha).", ["بَ"], { requireHarakat: true, hint: "Typ eerst ب en dan de fatha  َ op het toetsenbord." }),
      ex.type("spelling", "Schrijf 'kataba' (hij schreef) met alle harakat.", ["كَتَبَ"], { requireHarakat: true }),
      ex.dictation("ذَهَبَ", { requireHarakat: true }),
      ex.dictation("فَتَحَ", { requireHarakat: true }),
      ex.mcq("vocabulary", "Wat betekent كُتُب?", ["boeken", "hij schreef", "pen"], 0),
      ex.speak("جَلَسَ", "hij ging zitten"),
    ],
    test: [
      test.mcq("reading", "Hoe spreek je dit uit?", ["ta", "ti", "tu"], 1, { promptAr: "تِ" }),
      test.mcq("reading", "Welke schrijfwijze is 'fataḥa' (hij opende)?", ["فَتَحَ", "فُتِحَ", "فِتَح"], 0),
      test.dictation("جَلَسَ", { requireHarakat: true }),
      test.type("spelling", "Schrijf 'kutub' (boeken) met harakat.", ["كُتُب"], { requireHarakat: true }),
      test.mcq("reading", "Waar staat de kasra?", ["boven de letter", "onder de letter", "naast de letter"], 1),
    ],
  } satisfies Lesson;
})();

const l10 = (() => {
  const { ex, test } = builder(10);
  return {
    id: 10,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Lange klinkers",
    titleAr: "حُرُوفُ الْمَدِّ",
    goal: "Je hoort en schrijft het verschil tussen korte en lange klinkers.",
    minutes: 20,
    skills: ["reading", "spelling", "listening", "vocabulary"],
    sections: [
      {
        title: "Lang = korte klinker + letter",
        body: [
          "Een lange klinker maak je door een korte klinker te laten volgen door de bijpassende letter. Spreek hem twee keer zo lang uit.",
          "Het verschil tussen kort en lang verandert de betekenis, dus luister goed.",
        ],
        table: [
          ["Combinatie", "Klank", "Voorbeeld"],
          ["ـَا", "ā (lang aa)", "بَاب — bāb"],
          ["ـُو", "ū (lang oe)", "نُور — nūr"],
          ["ـِي", "ī (lang ie)", "فِيل — fīl"],
        ],
      },
      {
        title: "Nieuwe woorden",
        body: ["Drie handige bijvoeglijke naamwoorden met een lange ī."],
        examples: [
          { ar: "كَبِير", tr: "kabīr", nl: "groot" },
          { ar: "صَغِير", tr: "ṣaghīr", nl: "klein" },
          { ar: "جَمِيل", tr: "jamīl", nl: "mooi" },
          { ar: "سُوق", tr: "sūq", nl: "markt" },
          { ar: "قَالَ", tr: "qāla", nl: "hij zei" },
        ],
      },
    ],
    words: [
      w("كَبِير", "kabīr", "groot", "bn."),
      w("صَغِير", "ṣaghīr", "klein", "bn."),
      w("جَمِيل", "jamīl", "mooi", "bn."),
      w("سُوق", "sūq", "markt", "zn. m./v."),
      w("قَالَ", "qāla", "hij zei", "ww. verleden tijd"),
      w("نُور", "nūr", "licht", "zn. m."),
    ],
    exercises: [
      ex.mcq("reading", "Welke klinker is lang in dit woord?", ["de i (ki)", "de ā (tā)", "geen van beide"], 1, { promptAr: "كِتَاب" }),
      ex.mcq("reading", "Hoe lees je dit?", ["fil", "fīl", "fal"], 1, { promptAr: "فِيل" }),
      ex.mcq("reading", "Welk woord heeft een lange ā?", ["قَلَم", "قَالَ", "كَتَبَ"], 1),
      ex.dictation("بَاب"),
      ex.dictation("سُوق"),
      ex.type("spelling", "Schrijf 'kabīr' (groot).", ["كبير"]),
      ex.type("spelling", "Schrijf 'nūr' (licht).", ["نور"]),
      ex.match("vocabulary", "Koppel woord en betekenis.", [["كَبِير", "groot"], ["صَغِير", "klein"], ["جَمِيل", "mooi"]]),
      ex.type("vocabulary", "Hoe zeg je 'mooi'?", ["جميل"]),
      ex.speak("جَمِيل", "mooi"),
    ],
    test: [
      test.dictation("صَغِير"),
      test.dictation("نُور"),
      test.mcq("listening", "Welk woord hoor je?", ["سُوق", "سَمَك", "سِين"], 0, { audio: "سُوق" }),
      test.type("spelling", "Schrijf 'fīl' (olifant).", ["فيل"]),
      test.type("vocabulary", "Hoe zeg je 'groot'?", ["كبير"]),
    ],
  } satisfies Lesson;
})();

const l11 = (() => {
  const { ex, test } = builder(11);
  return {
    id: 11,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Sukun: geen klinker",
    titleAr: "السُّكُونُ",
    goal: "Je herkent de sukun en leest lettergrepen die op een medeklinker eindigen.",
    minutes: 15,
    skills: ["reading", "spelling", "vocabulary"],
    sections: [
      {
        title: "Wat is de sukun?",
        body: [
          "De sukun (ـْ) is een klein rondje boven een letter. Het betekent: hier komt géén klinker. De letter sluit de lettergreep af.",
          "Voorbeeld: in بِنْت lees je bi-n-t → bint. De nūn en tā' hebben geen klinker.",
        ],
        examples: [
          { ar: "بِنْت", tr: "bint", nl: "meisje, dochter" },
          { ar: "قَلْب", tr: "qalb", nl: "hart" },
          { ar: "كَلْب", tr: "kalb", nl: "hond" },
          { ar: "مَكْتَب", tr: "maktab", nl: "bureau, kantoor" },
          { ar: "مَسْجِد", tr: "masjid", nl: "moskee" },
        ],
      },
    ],
    words: [
      w("بِنْت", "bint", "meisje, dochter", "zn. v."),
      w("قَلْب", "qalb", "hart", "zn. m."),
      w("كَلْب", "kalb", "hond", "zn. m."),
      w("مَكْتَب", "maktab", "bureau, kantoor", "zn. m."),
      w("مَسْجِد", "masjid", "moskee", "zn. m."),
    ],
    exercises: [
      ex.mcq("reading", "Wat betekent het rondje ْ boven een letter?", ["lange klinker", "geen klinker", "dubbele letter"], 1),
      ex.mcq("reading", "Hoe lees je dit?", ["kalab", "kalb", "kulb"], 1, { promptAr: "كَلْب" }),
      ex.mcq("reading", "Welke letter draagt de sukun?", ["م", "س", "ج"], 1, { promptAr: "مَسْجِد" }),
      ex.dictation("بِنْت", { requireHarakat: true }),
      ex.dictation("مَكْتَب"),
      ex.type("spelling", "Schrijf 'qalb' (hart) met harakat.", ["قَلْب"], { requireHarakat: true }),
      ex.match("vocabulary", "Koppel woord en betekenis.", [["قَلْب", "hart"], ["كَلْب", "hond"], ["مَسْجِد", "moskee"]]),
      ex.speak("مَسْجِد", "moskee"),
    ],
    test: [
      test.dictation("قَلْب"),
      test.type("spelling", "Schrijf 'kalb' (hond) met harakat.", ["كَلْب"], { requireHarakat: true }),
      test.mcq("reading", "Hoe lees je dit?", ["shams", "shamas", "shumus"], 0, { promptAr: "شَمْس" }),
      test.mcq("vocabulary", "Wat betekent بِنْت?", ["meisje / dochter", "huis", "hart"], 0),
      test.type("vocabulary", "Hoe zeg je 'kantoor'?", ["مكتب"]),
    ],
  } satisfies Lesson;
})();

const l12 = (() => {
  const { ex, test } = builder(12);
  return {
    id: 12,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Shadda: dubbele letter",
    titleAr: "الشَّدَّةُ",
    goal: "Je leest en schrijft woorden met een shadda.",
    minutes: 15,
    skills: ["reading", "spelling", "vocabulary"],
    sections: [
      {
        title: "Twee keer dezelfde letter",
        body: [
          "De shadda (ـّ) lijkt op een kleine w. Hij betekent dat de letter dubbel wordt uitgesproken: de eerste helft sluit een lettergreep af, de tweede helft begint de volgende.",
          "Een klinker staat meestal boven de shadda (fatha, damma) of eronder (kasra). مُدَرِّس lees je als mu-dar-ris.",
        ],
        examples: [
          { ar: "مُدَرِّس", tr: "mudarris", nl: "leraar" },
          { ar: "حَمَّام", tr: "ḥammām", nl: "badkamer" },
          { ar: "سُكَّر", tr: "sukkar", nl: "suiker" },
          { ar: "قِطَّة", tr: "qiṭṭa", nl: "kat" },
          { ar: "أُمّ", tr: "umm", nl: "moeder" },
        ],
      },
    ],
    words: [
      w("مُدَرِّس", "mudarris", "leraar", "zn. m.; v. مُدَرِّسَة"),
      w("حَمَّام", "ḥammām", "badkamer", "zn. m."),
      w("سُكَّر", "sukkar", "suiker", "zn. m."),
      w("قِطَّة", "qiṭṭa", "kat", "zn. v."),
      w("أُمّ", "umm", "moeder", "zn. v."),
    ],
    exercises: [
      ex.mcq("reading", "Wat doet de shadda?", ["de letter wordt dubbel", "de letter valt weg", "de klinker wordt lang"], 0),
      ex.mcq("reading", "Hoe lees je dit?", ["mudaris", "mudarris", "madrasa"], 1, { promptAr: "مُدَرِّس" }),
      ex.mcq("reading", "Op welke letter staat de shadda?", ["ح", "م", "ا"], 1, { promptAr: "حَمَّام" }),
      ex.dictation("سُكَّر"),
      ex.type("spelling", "Schrijf 'umm' (moeder) met harakat.", ["أُمّ"], { requireHarakat: true, hint: "Begin met أ (alif met hamza)." }),
      ex.type("spelling", "Schrijf 'qiṭṭa' (kat).", ["قطة"]),
      ex.match("vocabulary", "Koppel woord en betekenis.", [["حَمَّام", "badkamer"], ["سُكَّر", "suiker"], ["قِطَّة", "kat"]]),
      ex.speak("مُدَرِّس", "leraar"),
    ],
    test: [
      test.dictation("قِطَّة"),
      test.mcq("vocabulary", "Welk woord betekent 'leraar'?", ["مُدَرِّس", "مَدْرَسَة", "دَرْس"], 0),
      test.type("spelling", "Schrijf 'sukkar' (suiker) met harakat.", ["سُكَّر"], { requireHarakat: true }),
      test.mcq("reading", "Hoe lees je dit?", ["ḥamām", "ḥammām", "ḥummām"], 1, { promptAr: "حَمَّام" }),
    ],
  } satisfies Lesson;
})();

const l13 = (() => {
  const { ex, test } = builder(13);
  return {
    id: 13,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Tanween: -un, -in, -an",
    titleAr: "التَّنْوِينُ",
    goal: "Je leest tanween correct en weet wanneer er een extra alif komt.",
    minutes: 20,
    skills: ["reading", "spelling", "grammar"],
    sections: [
      {
        title: "Een dubbele klinker met een n-klank",
        body: [
          "Tanween is een verdubbelde klinker aan het eind van een woord. Je spreekt er een n achter uit. Het geeft meestal aan dat het woord onbepaald is (een …).",
          "Bij -an (ـً) schrijf je een extra alif: شُكْرًا. Uitzondering: na ة en meestal na ـاء komt geen extra alif: مَدِينَةً, مَاءً.",
          "Aan het eind van een zin of als je pauzeert, spreek je tanween meestal niet uit (behalve -an, dat dan als -ā klinkt).",
        ],
        table: [
          ["Teken", "Klank", "Voorbeeld"],
          ["ـٌ", "-un", "كِتَابٌ — kitābun"],
          ["ـٍ", "-in", "كِتَابٍ — kitābin"],
          ["ـً", "-an", "كِتَابًا — kitāban"],
        ],
      },
      {
        title: "Handige uitdrukkingen met -an",
        body: ["Deze woorden hoor je elke dag."],
        examples: [
          { ar: "شُكْرًا", tr: "shukran", nl: "dank je" },
          { ar: "جِدًّا", tr: "jiddan", nl: "heel, erg" },
          { ar: "أَهْلًا", tr: "ahlan", nl: "welkom, hoi" },
          { ar: "وَلَدٌ", tr: "waladun", nl: "een jongen" },
        ],
      },
    ],
    words: [
      w("شُكْرًا", "shukran", "dank je"),
      w("جِدًّا", "jiddan", "heel, erg", "bijwoord"),
      w("أَهْلًا", "ahlan", "welkom, hoi"),
      w("وَلَد", "walad", "jongen", "zn. m., mv. أَوْلَاد"),
      w("مَدِينَة", "madīna", "stad", "zn. v., mv. مُدُن"),
    ],
    exercises: [
      ex.mcq("reading", "Hoe lees je dit?", ["kitābun", "kitāban", "kitābin"], 0, { promptAr: "كِتَابٌ" }),
      ex.mcq("reading", "Hoe lees je dit?", ["baytun", "baytin", "baytan"], 1, { promptAr: "بَيْتٍ" }),
      ex.match("reading", "Koppel het teken aan de klank.", [["بٌ", "-bun"], ["بٍ", "-bin"], ["بًا", "-ban"]]),
      ex.mcq("grammar", "Waarom staat er een alif aan het eind van شُكْرًا?", ["tanween -an krijgt een extra alif", "het is een lange ā", "het is een fout"], 0),
      ex.mcq("grammar", "Wat geeft tanween meestal aan?", ["onbepaald (een …)", "bepaald (de/het)", "meervoud"], 0),
      ex.type("spelling", "Schrijf 'waladun' (een jongen) met harakat.", ["وَلَدٌ"], { requireHarakat: true }),
      ex.dictation("شُكْرًا"),
      ex.dictation("أَهْلًا"),
      ex.speak("شُكْرًا جِدًّا", "heel erg bedankt"),
    ],
    test: [
      test.mcq("reading", "Hoe lees je dit?", ["madīnatun", "madīnatin", "madīnatan"], 2, { promptAr: "مَدِينَةً" }),
      test.type("spelling", "Schrijf 'jiddan' (erg) met harakat.", ["جِدًّا"], { requireHarakat: true }),
      test.mcq("spelling", "Welke spelling is correct?", ["مَدِينَةً", "مَدِينَةًا"], 0, { explain: "Na ta marbuta (ة) schrijf je geen extra alif." }),
      test.type("vocabulary", "Hoe zeg je 'dank je'?", ["شكرا"]),
    ],
  } satisfies Lesson;
})();

const l14 = (() => {
  const { ex, test } = builder(14);
  return {
    id: 14,
    module: "Harakat & uitspraak",
    level: "A0",
    title: "Hamza, ta marbuta, alif maqsura en het lidwoord",
    titleAr: "الْهَمْزَةُ وَالتَّاءُ الْمَرْبُوطَةُ وَأَلْ",
    goal: "Je spelt hamza, ة en ى correct en spreekt het lidwoord ال goed uit bij zon- en maanletters.",
    minutes: 25,
    skills: ["reading", "spelling", "grammar"],
    sections: [
      {
        title: "Hamza (ء)",
        body: [
          "De hamza is een korte stop in je keel, zoals tussen 'be-amen'. Hij staat los (ء) of op een 'drager': أ (boven alif), إ (onder alif), ؤ (op wāw) of ئ (op yā' zonder punten).",
          "Welke drager je gebruikt, hangt af van de klinkers eromheen. Voor nu: leer de woorden zoals ze geschreven worden.",
        ],
        examples: [
          { ar: "أَنَا", tr: "anā", nl: "ik" },
          { ar: "سُؤَال", tr: "suʾāl", nl: "vraag" },
          { ar: "مَاء", tr: "māʾ", nl: "water" },
        ],
      },
      {
        title: "Ta marbuta (ة) en alif maqsura (ى)",
        body: [
          "ة klinkt aan het eind meestal als -a (madrasa). Gevolgd door een uitgang of in een samenstelling klinkt hij als -at: مَدْرَسَتِي (madrasatī, mijn school).",
          "ى klinkt als een lange ā en staat alleen aan het eind van een woord: عَلَى (ʿalā, op), مُسْتَشْفَى (mustashfā, ziekenhuis).",
        ],
        examples: [
          { ar: "مَدْرَسَة", tr: "madrasa", nl: "school" },
          { ar: "عَلَى", tr: "ʿalā", nl: "op" },
          { ar: "مُسْتَشْفَى", tr: "mustashfā", nl: "ziekenhuis" },
        ],
      },
      {
        title: "Het lidwoord ال: maan- en zonletters",
        body: [
          "ال betekent 'de/het' en wordt aan het woord vastgeschreven.",
          "Bij maanletters spreek je de l uit: الْقَمَر (al-qamar, de maan).",
          "Bij zonletters (ت ث د ذ ر ز س ش ص ض ط ظ ل ن) neemt de l de klank van de volgende letter over; die letter krijgt een shadda: الشَّمْس (ash-shams, de zon).",
        ],
        examples: [
          { ar: "الْقَمَر", tr: "al-qamar", nl: "de maan" },
          { ar: "الْبَيْت", tr: "al-bayt", nl: "het huis" },
          { ar: "الشَّمْس", tr: "ash-shams", nl: "de zon" },
          { ar: "النُّور", tr: "an-nūr", nl: "het licht" },
        ],
      },
    ],
    words: [
      w("أَنَا", "anā", "ik", "vnw."),
      w("سُؤَال", "suʾāl", "vraag", "zn. m., mv. أَسْئِلَة"),
      w("مَاء", "māʾ", "water", "zn. m."),
      w("مَدْرَسَة", "madrasa", "school", "zn. v., mv. مَدَارِس"),
      w("عَلَى", "ʿalā", "op", "vz."),
      w("مُسْتَشْفَى", "mustashfā", "ziekenhuis", "zn. m."),
      w("قَمَر", "qamar", "maan", "zn. m."),
    ],
    exercises: [
      ex.mcq("reading", "Hoe spreek je dit uit?", ["ash-shams", "al-shams", "as-shams"], 0, { promptAr: "الشَّمْس" }),
      ex.mcq("reading", "Hoe spreek je dit uit?", ["aq-qamar", "al-qamar", "a-qamar"], 1, { promptAr: "الْقَمَر" }),
      ex.mcq("grammar", "Is ر een zonletter of een maanletter?", ["zonletter", "maanletter"], 0, { explain: "ر is een zonletter: الرَّجُل = ar-rajul." }),
      ex.mcq("grammar", "Is ب een zonletter of een maanletter?", ["zonletter", "maanletter"], 1, { explain: "ب is een maanletter: الْبَيْت = al-bayt." }),
      ex.type("spelling", "Schrijf 'madrasa' (school).", ["مدرسة"], { hint: "Eindigt op ta marbuta ة." }),
      ex.type("spelling", "Schrijf 'ʿalā' (op).", ["على"], { hint: "Eindigt op alif maqsura ى." }),
      ex.dictation("سُؤَال"),
      ex.type("spelling", "Schrijf 'anā' (ik).", ["أنا"]),
      ex.mcq("spelling", "Welke letter staat aan het eind van مُسْتَشْفَى?", ["yā' (ي)", "alif maqsura (ى)", "ta marbuta (ة)"], 1),
      ex.speak("الشَّمْسُ وَالْقَمَرُ", "de zon en de maan"),
    ],
    test: [
      test.mcq("reading", "Hoe spreek je dit uit?", ["al-nūr", "an-nūr", "a-nūr"], 1, { promptAr: "النُّور" }),
      test.type("spelling", "Schrijf 'al-bayt' (het huis).", ["البيت"]),
      test.dictation("مَدْرَسَة"),
      test.mcq("reading", "Hoe spreek je dit uit?", ["al-dars", "ad-dars", "ad-dāris"], 1, { promptAr: "الدَّرْس" }),
      test.type("spelling", "Schrijf 'māʾ' (water).", ["ماء"]),
    ],
  } satisfies Lesson;
})();

export const readingLessons: Lesson[] = [l8, l9, l10, l11, l12, l13, l14];
