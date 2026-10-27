// Lessen 15–20: basiswoordenschat en eerste uitdrukkingen.
import type { Lesson } from "../types";
import { builder, w } from "./helpers";

const l15 = (() => {
  const { ex, test } = builder(15);
  return {
    id: 15,
    module: "Basiswoordenschat",
    level: "A1",
    title: "Begroeten en afscheid nemen",
    titleAr: "التَّحِيَّاتُ",
    goal: "Je kunt iemand begroeten, vragen hoe het gaat en afscheid nemen.",
    minutes: 20,
    skills: ["vocabulary", "speaking", "listening", "writing"],
    sections: [
      {
        title: "Groeten met een vast antwoord",
        body: [
          "Veel Arabische groeten hebben een vast antwoord. Leer ze als paar.",
          "Let op: deze groeten zijn Modern Standaardarabisch en worden overal begrepen. In dialecten bestaan er nog veel andere.",
        ],
        table: [
          ["Groet", "Antwoord", "Betekenis"],
          ["السَّلَامُ عَلَيْكُمْ", "وَعَلَيْكُمُ السَّلَامُ", "vrede zij met u — en met u zij vrede"],
          ["صَبَاحُ الْخَيْرِ", "صَبَاحُ النُّورِ", "goedemorgen"],
          ["مَسَاءُ الْخَيْرِ", "مَسَاءُ النُّورِ", "goedenavond / goedemiddag"],
          ["مَرْحَبًا", "مَرْحَبًا / أَهْلًا", "hallo"],
        ],
      },
      {
        title: "Hoe gaat het?",
        body: [
          "Tegen een man zeg je كَيْفَ حَالُكَ؟ (kayfa ḥāluka), tegen een vrouw كَيْفَ حَالُكِ؟ (kayfa ḥāluki). Het verschil zit alleen in de laatste klinker.",
          "Een gebruikelijk antwoord is: بِخَيْرٍ، الْحَمْدُ لِلَّهِ (goed, God zij dank).",
        ],
        examples: [
          { ar: "كَيْفَ حَالُكَ؟", tr: "kayfa ḥāluka?", nl: "hoe gaat het met je? (m)" },
          { ar: "كَيْفَ حَالُكِ؟", tr: "kayfa ḥāluki?", nl: "hoe gaat het met je? (v)" },
          { ar: "بِخَيْرٍ، شُكْرًا", tr: "bi-khayrin, shukran", nl: "goed, dank je" },
        ],
      },
      {
        title: "Bedanken en afscheid",
        body: ["عَفْوًا betekent 'graag gedaan', maar ook 'pardon'."],
        examples: [
          { ar: "شُكْرًا", tr: "shukran", nl: "dank je" },
          { ar: "عَفْوًا", tr: "ʿafwan", nl: "graag gedaan / pardon" },
          { ar: "مَعَ السَّلَامَةِ", tr: "maʿa s-salāma", nl: "tot ziens (lett. met veiligheid)" },
          { ar: "إِلَى اللِّقَاءِ", tr: "ilā l-liqāʾ", nl: "tot ziens (tot de ontmoeting)" },
        ],
      },
    ],
    words: [
      w("السَّلَامُ عَلَيْكُمْ", "as-salāmu ʿalaykum", "vrede zij met u (groet)"),
      w("صَبَاحُ الْخَيْرِ", "ṣabāḥu l-khayr", "goedemorgen"),
      w("مَسَاءُ الْخَيْرِ", "masāʾu l-khayr", "goedenavond"),
      w("مَرْحَبًا", "marḥaban", "hallo"),
      w("كَيْفَ حَالُكَ؟", "kayfa ḥāluka", "hoe gaat het met je? (m)"),
      w("بِخَيْرٍ", "bi-khayrin", "goed (het gaat goed)"),
      w("عَفْوًا", "ʿafwan", "graag gedaan; pardon"),
      w("مَعَ السَّلَامَةِ", "maʿa s-salāma", "tot ziens"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel de groet aan de betekenis.", [
        ["صَبَاحُ الْخَيْرِ", "goedemorgen"],
        ["مَسَاءُ الْخَيْرِ", "goedenavond"],
        ["مَعَ السَّلَامَةِ", "tot ziens"],
        ["شُكْرًا", "dank je"],
      ]),
      ex.mcq("vocabulary", "Iemand zegt صَبَاحُ الْخَيْرِ. Wat antwoord je?", ["صَبَاحُ النُّورِ", "مَسَاءُ الْخَيْرِ", "عَفْوًا"], 0),
      ex.order("writing", "Zet in de juiste volgorde: het antwoord op 'as-salāmu ʿalaykum'.", ["وَعَلَيْكُمُ", "السَّلَامُ"]),
      ex.type("writing", "Typ: dank je (shukran).", ["شكرا"]),
      ex.type("writing", "Vraag aan een man: hoe gaat het met je?", ["كيف حالك"]),
      ex.mcq("listening", "Luister. Wat betekent dit?", ["goedenavond", "goedemorgen", "dank je"], 0, { audio: "مَسَاءُ الْخَيْرِ" }),
      ex.mcq("grammar", "Aan wie vraag je كَيْفَ حَالُكِ؟", ["aan een man", "aan een vrouw", "aan een groep"], 1),
      ex.type("writing", "Hoe zeg je 'tot ziens'?", ["مع السلامة", "إلى اللقاء"]),
      ex.speak("السَّلَامُ عَلَيْكُمْ", "vrede zij met u"),
      ex.speak("بِخَيْرٍ، الْحَمْدُ لِلَّهِ", "goed, God zij dank"),
    ],
    test: [
      test.type("writing", "Schrijf: goedemorgen.", ["صباح الخير"]),
      test.type("writing", "Wat antwoord je op السَّلَامُ عَلَيْكُمْ?", ["وعليكم السلام"]),
      test.mcq("vocabulary", "Wat betekent عَفْوًا?", ["graag gedaan / pardon", "goedenavond", "tot ziens"], 0),
      test.dictation("شُكْرًا"),
      test.mcq("listening", "Luister. Hoe antwoord je hierop?", ["مَسَاءُ النُّورِ", "صَبَاحُ النُّورِ", "شُكْرًا"], 0, { audio: "مَسَاءُ الْخَيْرِ" }),
      test.speak("صَبَاحُ الْخَيْرِ", "goedemorgen"),
    ],
  } satisfies Lesson;
})();

const l16 = (() => {
  const { ex, test } = builder(16);
  return {
    id: 16,
    module: "Basiswoordenschat",
    level: "A1",
    title: "Kennismaken",
    titleAr: "التَّعَارُفُ",
    goal: "Je stelt jezelf voor: naam, herkomst en woonplaats.",
    minutes: 20,
    skills: ["vocabulary", "speaking", "writing", "grammar"],
    sections: [
      {
        title: "Je naam",
        body: [
          "اِسْمِي betekent 'mijn naam (is)'. Het werkwoord 'zijn' is in de tegenwoordige tijd niet nodig.",
          "Vragen: مَا اسْمُكَ؟ (tegen een man) / مَا اسْمُكِ؟ (tegen een vrouw).",
        ],
        examples: [
          { ar: "مَا اسْمُكَ؟", tr: "mā smuka?", nl: "wat is je naam? (m)" },
          { ar: "اِسْمِي آدَمُ.", tr: "ismī Ādamu.", nl: "mijn naam is Adam." },
          { ar: "تَشَرَّفْنَا.", tr: "tasharrafnā.", nl: "aangenaam (kennis te maken)." },
        ],
      },
      {
        title: "Waar kom je vandaan?",
        body: ["مِنْ = van, uit. أَيْنَ = waar. Een land na مِنْ: أَنَا مِنْ هُولَنْدَا."],
        examples: [
          { ar: "مِنْ أَيْنَ أَنْتَ؟", tr: "min ayna anta?", nl: "waar kom jij vandaan? (m)" },
          { ar: "مِنْ أَيْنَ أَنْتِ؟", tr: "min ayna anti?", nl: "waar kom jij vandaan? (v)" },
          { ar: "أَنَا مِنْ هُولَنْدَا.", tr: "anā min hūlandā.", nl: "ik kom uit Nederland." },
          { ar: "أَنَا هُولَنْدِيٌّ / هُولَنْدِيَّةٌ.", tr: "anā hūlandiyyun / hūlandiyyatun.", nl: "ik ben Nederlander / Nederlandse." },
        ],
      },
      {
        title: "Waar woon je?",
        body: ["أَسْكُنُ فِي … = ik woon in …"],
        examples: [
          { ar: "أَيْنَ تَسْكُنُ؟", tr: "ayna taskunu?", nl: "waar woon je? (m)" },
          { ar: "أَسْكُنُ فِي أَمْسْتِرْدَام.", tr: "askunu fī Amsterdam.", nl: "ik woon in Amsterdam." },
        ],
      },
    ],
    words: [
      w("اِسْم", "ism", "naam", "zn. m., mv. أَسْمَاء"),
      w("اِسْمِي", "ismī", "mijn naam"),
      w("أَيْنَ", "ayna", "waar", "vraagwoord"),
      w("مِنْ", "min", "van, uit", "vz."),
      w("هُولَنْدَا", "hūlandā", "Nederland"),
      w("أَسْكُنُ", "askunu", "ik woon", "ww. (سَكَنَ)"),
      w("فِي", "fī", "in", "vz."),
      w("تَشَرَّفْنَا", "tasharrafnā", "aangenaam"),
    ],
    exercises: [
      ex.order("writing", "Maak de vraag: wat is je naam? (m)", ["مَا", "اسْمُكَ"]),
      ex.order("writing", "Maak de zin: ik kom uit Nederland.", ["أَنَا", "مِنْ", "هُولَنْدَا"]),
      ex.type("writing", "Vertaal: Mijn naam is Adam.", ["اسمي آدم"]),
      ex.type("writing", "Vertaal: Ik kom uit Nederland.", ["أنا من هولندا", "من هولندا"]),
      ex.mcq("vocabulary", "Wat betekent مِنْ أَيْنَ أَنْتِ؟", ["Waar kom jij (v) vandaan?", "Waar woon je?", "Wat is je naam?"], 0),
      ex.mcq("listening", "Luister. Waar woont de spreker?", ["Amsterdam", "Rotterdam", "Utrecht"], 0, { audio: "أَسْكُنُ فِي أَمْسْتِرْدَام" }),
      ex.mcq("vocabulary", "Hoe zeg je 'aangenaam'?", ["تَشَرَّفْنَا", "عَفْوًا", "مَرْحَبًا"], 0),
      ex.speak("أَنَا مِنْ هُولَنْدَا", "ik kom uit Nederland"),
      ex.speak("أَسْكُنُ فِي أَمْسْتِرْدَام", "ik woon in Amsterdam"),
    ],
    test: [
      test.type("writing", "Vraag aan een man: wat is je naam?", ["ما اسمك"]),
      test.type("writing", "Vertaal: Ik woon in Amsterdam.", ["أسكن في أمستردام"]),
      test.order("writing", "Maak de vraag: waar woon je?", ["أَيْنَ", "تَسْكُنُ"]),
      test.mcq("grammar", "Hoe zegt een vrouw: 'ik ben Nederlandse'?", ["أَنَا هُولَنْدِيَّةٌ", "أَنَا هُولَنْدِيٌّ", "أَنْتِ هُولَنْدِيَّةٌ"], 0),
      test.speak("اِسْمِي آدَمُ. تَشَرَّفْنَا.", "Mijn naam is Adam. Aangenaam."),
    ],
  } satisfies Lesson;
})();

const l17 = (() => {
  const { ex, test } = builder(17);
  return {
    id: 17,
    module: "Basiswoordenschat",
    level: "A1",
    title: "Familie",
    titleAr: "الْعَائِلَةُ",
    goal: "Je benoemt familieleden en zegt wie er bij je familie hoort.",
    minutes: 20,
    skills: ["vocabulary", "writing", "listening", "speaking"],
    sections: [
      {
        title: "Familieleden",
        body: [
          "Met ـِي achter een woord zeg je 'mijn': أُمّ → أُمِّي (mijn moeder). Let op: أَب → أَبِي en أَخ → أَخِي.",
          "عِنْدِي betekent 'ik heb' (letterlijk: bij mij).",
        ],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["أَب", "ab", "vader"],
          ["أُمّ", "umm", "moeder"],
          ["أَخ", "akh", "broer"],
          ["أُخْت", "ukht", "zus"],
          ["اِبْن", "ibn", "zoon"],
          ["بِنْت", "bint", "dochter, meisje"],
          ["جَدّ", "jadd", "opa"],
          ["جَدَّة", "jadda", "oma"],
          ["زَوْج", "zawj", "echtgenoot"],
          ["زَوْجَة", "zawja", "echtgenote"],
        ],
        examples: [
          { ar: "هَذَا أَبِي.", tr: "hādhā abī.", nl: "dit is mijn vader." },
          { ar: "هَذِهِ أُمِّي.", tr: "hādhihi ummī.", nl: "dit is mijn moeder." },
          { ar: "عِنْدِي أَخٌ وَاحِدٌ.", tr: "ʿindī akhun wāḥidun.", nl: "ik heb één broer." },
        ],
      },
    ],
    words: [
      w("أَب", "ab", "vader", "zn. m.; mijn vader: أَبِي"),
      w("أُمّ", "umm", "moeder", "zn. v.; mijn moeder: أُمِّي"),
      w("أَخ", "akh", "broer", "zn. m.; mijn broer: أَخِي"),
      w("أُخْت", "ukht", "zus", "zn. v."),
      w("اِبْن", "ibn", "zoon", "zn. m."),
      w("جَدّ", "jadd", "opa", "zn. m."),
      w("جَدَّة", "jadda", "oma", "zn. v."),
      w("زَوْج", "zawj", "echtgenoot", "zn. m."),
      w("زَوْجَة", "zawja", "echtgenote", "zn. v."),
      w("عَائِلَة", "ʿāʾila", "familie", "zn. v."),
      w("عِنْدِي", "ʿindī", "ik heb (bij mij)"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel woord en betekenis.", [["أَب", "vader"], ["أُمّ", "moeder"], ["أَخ", "broer"], ["أُخْت", "zus"]]),
      ex.type("vocabulary", "Hoe zeg je 'moeder'?", ["أم"]),
      ex.type("vocabulary", "Hoe zeg je 'mijn broer'?", ["أخي"]),
      ex.mcq("vocabulary", "Wat betekent جَدَّة?", ["oma", "opa", "zus"], 0),
      ex.dictation("أُخْتِي", { explain: "أُخْتِي = mijn zus" }),
      ex.order("writing", "Maak de zin: ik heb één broer.", ["عِنْدِي", "أَخٌ", "وَاحِدٌ"]),
      ex.mcq("vocabulary", "Wat betekent عَائِلَة?", ["familie", "school", "vriend"], 0),
      ex.speak("هَذِهِ أُمِّي", "dit is mijn moeder"),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'dochter'?", ["بنت", "ابنة"]),
      test.type("vocabulary", "Hoe zeg je 'mijn vader'?", ["أبي"]),
      test.mcq("listening", "Luister. Wie wordt bedoeld?", ["mijn opa", "mijn oma", "mijn broer"], 0, { audio: "جَدِّي" }),
      test.type("writing", "Vertaal: Ik heb één broer.", ["عندي أخ واحد"]),
    ],
  } satisfies Lesson;
})();

const l18 = (() => {
  const { ex, test } = builder(18);
  return {
    id: 18,
    module: "Basiswoordenschat",
    level: "A1",
    title: "Getallen 1–10",
    titleAr: "الْأَعْدَادُ مِنْ ١ إِلَى ١٠",
    goal: "Je kent de getallen 1 tot en met 10 in woorden en in Arabische cijfers.",
    minutes: 15,
    skills: ["vocabulary", "listening", "spelling"],
    sections: [
      {
        title: "Getallen en cijfers",
        body: [
          "In veel Arabische landen gebruikt men deze cijfers (ook links-naar-rechts geschreven!): ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ١٠. In Noord-Afrika gebruikt men vaak gewoon 1 2 3.",
          "Hieronder staat de vorm die je gebruikt als je telt. Later leer je dat 3 t/m 10 van vorm wisselen afhankelijk van het geslacht van het getelde woord.",
        ],
        table: [
          ["Cijfer", "Arabisch", "Uitspraak"],
          ["١", "وَاحِد", "wāḥid"],
          ["٢", "اِثْنَانِ", "ithnāni"],
          ["٣", "ثَلَاثَة", "thalātha"],
          ["٤", "أَرْبَعَة", "arbaʿa"],
          ["٥", "خَمْسَة", "khamsa"],
          ["٦", "سِتَّة", "sitta"],
          ["٧", "سَبْعَة", "sabʿa"],
          ["٨", "ثَمَانِيَة", "thamāniya"],
          ["٩", "تِسْعَة", "tisʿa"],
          ["١٠", "عَشَرَة", "ʿashara"],
        ],
      },
    ],
    words: [
      w("وَاحِد", "wāḥid", "één"),
      w("اِثْنَانِ", "ithnāni", "twee"),
      w("ثَلَاثَة", "thalātha", "drie"),
      w("أَرْبَعَة", "arbaʿa", "vier"),
      w("خَمْسَة", "khamsa", "vijf"),
      w("سِتَّة", "sitta", "zes"),
      w("سَبْعَة", "sabʿa", "zeven"),
      w("ثَمَانِيَة", "thamāniya", "acht"),
      w("تِسْعَة", "tisʿa", "negen"),
      w("عَشَرَة", "ʿashara", "tien"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel cijfer en woord.", [["١", "وَاحِد"], ["٣", "ثَلَاثَة"], ["٥", "خَمْسَة"], ["٨", "ثَمَانِيَة"]]),
      ex.type("vocabulary", "Schrijf 'drie' in Arabische letters.", ["ثلاثة"]),
      ex.type("vocabulary", "Schrijf ٥ in letters.", ["خمسة"]),
      ex.dictation("سَبْعَة"),
      ex.mcq("vocabulary", "Welk woord hoort bij ٨?", ["ثَمَانِيَة", "تِسْعَة", "سِتَّة"], 0),
      ex.mcq("vocabulary", "Welk getal is ٤?", ["4", "6", "3"], 0),
      ex.type("vocabulary", "Typ het Arabische cijfer voor 9.", ["٩"], { hint: "Het cijfer staat op het toetsenbord onder '123'." }),
      ex.mcq("listening", "Luister. Welk getal hoor je?", ["10", "2", "6"], 0, { audio: "عَشَرَة" }),
      ex.speak("وَاحِد، اِثْنَانِ، ثَلَاثَة، أَرْبَعَة، خَمْسَة", "één tot en met vijf"),
    ],
    test: [
      test.dictation("عَشَرَة"),
      test.type("vocabulary", "Schrijf 'zes' in letters.", ["ستة"]),
      test.mcq("vocabulary", "Hoe zeg je ٧?", ["سَبْعَة", "تِسْعَة", "أَرْبَعَة"], 0),
      test.type("vocabulary", "Schrijf 'twee' in letters.", ["اثنان", "اثنين"]),
      test.mcq("listening", "Luister. Welk getal hoor je?", ["4", "5", "9"], 0, { audio: "أَرْبَعَة" }),
    ],
  } satisfies Lesson;
})();

const l19 = (() => {
  const { ex, test } = builder(19);
  return {
    id: 19,
    module: "Basiswoordenschat",
    level: "A1",
    title: "In huis",
    titleAr: "فِي الْبَيْتِ",
    goal: "Je benoemt ruimtes en voorwerpen in huis en herkent of een woord mannelijk of vrouwelijk is.",
    minutes: 20,
    skills: ["vocabulary", "writing", "grammar"],
    sections: [
      {
        title: "Ruimtes en voorwerpen",
        body: ["Woorden op ة zijn bijna altijd vrouwelijk. Dat heb je straks nodig voor bijvoeglijke naamwoorden."],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands", "Geslacht"],
          ["بَيْت", "bayt", "huis", "m"],
          ["غُرْفَة", "ghurfa", "kamer", "v"],
          ["مَطْبَخ", "maṭbakh", "keuken", "m"],
          ["حَمَّام", "ḥammām", "badkamer", "m"],
          ["نَافِذَة", "nāfidha", "raam", "v"],
          ["كُرْسِيّ", "kursiyy", "stoel", "m"],
          ["طَاوِلَة", "ṭāwila", "tafel", "v"],
          ["سَرِير", "sarīr", "bed", "m"],
          ["هَاتِف", "hātif", "telefoon", "m"],
          ["مِفْتَاح", "miftāḥ", "sleutel", "m"],
        ],
        examples: [{ ar: "بَيْتٌ كَبِيرٌ", tr: "baytun kabīrun", nl: "een groot huis" }],
      },
    ],
    words: [
      w("بَيْت", "bayt", "huis", "zn. m., mv. بُيُوت"),
      w("غُرْفَة", "ghurfa", "kamer", "zn. v., mv. غُرَف"),
      w("مَطْبَخ", "maṭbakh", "keuken", "zn. m."),
      w("نَافِذَة", "nāfidha", "raam", "zn. v., mv. نَوَافِذ"),
      w("كُرْسِيّ", "kursiyy", "stoel", "zn. m., mv. كَرَاسِيّ"),
      w("طَاوِلَة", "ṭāwila", "tafel", "zn. v."),
      w("سَرِير", "sarīr", "bed", "zn. m."),
      w("هَاتِف", "hātif", "telefoon", "zn. m."),
      w("مِفْتَاح", "miftāḥ", "sleutel", "zn. m., mv. مَفَاتِيح"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel woord en betekenis.", [["مَطْبَخ", "keuken"], ["سَرِير", "bed"], ["هَاتِف", "telefoon"], ["مِفْتَاح", "sleutel"]]),
      ex.type("vocabulary", "Hoe zeg je 'tafel'?", ["طاولة"]),
      ex.type("vocabulary", "Hoe zeg je 'stoel'?", ["كرسي"]),
      ex.mcq("vocabulary", "Wat betekent نَافِذَة?", ["raam", "deur", "kamer"], 0),
      ex.dictation("مِفْتَاح"),
      ex.type("vocabulary", "Schrijf 'de keuken' (met lidwoord).", ["المطبخ"]),
      ex.mcq("grammar", "Welk woord is vrouwelijk?", ["طَاوِلَة", "كُرْسِيّ", "بَاب"], 0, { explain: "طَاوِلَة eindigt op ta marbuta (ة)." }),
      ex.speak("بَيْتٌ كَبِيرٌ", "een groot huis"),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'raam'?", ["نافذة"]),
      test.type("vocabulary", "Hoe zeg je 'telefoon'?", ["هاتف"]),
      test.mcq("vocabulary", "Wat betekent سَرِير?", ["bed", "stoel", "sleutel"], 0),
      test.dictation("غُرْفَة"),
    ],
  } satisfies Lesson;
})();

const l20 = (() => {
  const { ex, test } = builder(20);
  return {
    id: 20,
    module: "Basiswoordenschat",
    level: "A1",
    title: "Eten en drinken",
    titleAr: "الطَّعَامُ وَالشَّرَابُ",
    goal: "Je benoemt eten en drinken en kunt beleefd iets bestellen.",
    minutes: 20,
    skills: ["vocabulary", "writing", "listening", "speaking"],
    sections: [
      {
        title: "Woorden",
        body: [],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["خُبْز", "khubz", "brood"],
          ["حَلِيب", "ḥalīb", "melk"],
          ["قَهْوَة", "qahwa", "koffie"],
          ["شَاي", "shāy", "thee"],
          ["عَصِير", "ʿaṣīr", "sap"],
          ["أَرُزّ", "aruzz", "rijst"],
          ["لَحْم", "laḥm", "vlees"],
          ["دَجَاج", "dajāj", "kip"],
          ["فَاكِهَة", "fākiha", "fruit"],
        ],
      },
      {
        title: "Iets bestellen",
        body: [
          "أُرِيدُ = ik wil. Het woord erna staat in de 4e naamval (accusatief) en krijgt -an: أُرِيدُ قَهْوَةً.",
          "مِنْ فَضْلِكَ (tegen een man) / مِنْ فَضْلِكِ (tegen een vrouw) = alsjeblieft.",
        ],
        examples: [
          { ar: "أُرِيدُ قَهْوَةً مِنْ فَضْلِكَ.", tr: "urīdu qahwatan min faḍlika.", nl: "ik wil graag koffie, alstublieft." },
          { ar: "أُرِيدُ مَاءً.", tr: "urīdu māʾan.", nl: "ik wil water." },
          { ar: "أَنَا جَائِعٌ.", tr: "anā jāʾiʿun.", nl: "ik heb honger. (m)" },
        ],
      },
    ],
    words: [
      w("خُبْز", "khubz", "brood", "zn. m."),
      w("حَلِيب", "ḥalīb", "melk", "zn. m."),
      w("قَهْوَة", "qahwa", "koffie", "zn. v."),
      w("شَاي", "shāy", "thee", "zn. m."),
      w("عَصِير", "ʿaṣīr", "sap", "zn. m."),
      w("أَرُزّ", "aruzz", "rijst", "zn. m."),
      w("لَحْم", "laḥm", "vlees", "zn. m."),
      w("دَجَاج", "dajāj", "kip", "zn. m."),
      w("فَاكِهَة", "fākiha", "fruit", "zn. v."),
      w("أُرِيدُ", "urīdu", "ik wil", "ww. (أَرَادَ)"),
      w("مِنْ فَضْلِكَ", "min faḍlika", "alsjeblieft (tegen een man)"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel woord en betekenis.", [["خُبْز", "brood"], ["حَلِيب", "melk"], ["أَرُزّ", "rijst"], ["دَجَاج", "kip"]]),
      ex.type("vocabulary", "Hoe zeg je 'koffie'?", ["قهوة"]),
      ex.type("vocabulary", "Hoe zeg je 'thee'?", ["شاي"]),
      ex.order("writing", "Maak de zin: ik wil thee, alsjeblieft.", ["أُرِيدُ", "شَايًا", "مِنْ", "فَضْلِكَ"]),
      ex.type("writing", "Vertaal: Ik wil water.", ["أريد ماء", "أريد الماء"]),
      ex.dictation("عَصِير"),
      ex.mcq("listening", "Luister. Wat wil de spreker?", ["rijst en kip", "brood en melk", "vlees en fruit"], 0, { audio: "أُرِيدُ أَرُزًّا وَدَجَاجًا" }),
      ex.speak("أُرِيدُ قَهْوَةً مِنْ فَضْلِكَ", "ik wil graag koffie, alstublieft"),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'brood'?", ["خبز"]),
      test.type("vocabulary", "Hoe zeg je 'melk'?", ["حليب"]),
      test.mcq("vocabulary", "Wat betekent لَحْم?", ["vlees", "vis", "kip"], 0),
      test.type("writing", "Vertaal: Ik wil koffie.", ["أريد قهوة"]),
      test.mcq("listening", "Luister. Wat wil de spreker?", ["sap", "thee", "water"], 0, { audio: "أُرِيدُ عَصِيرًا" }),
    ],
  } satisfies Lesson;
})();

export const vocabularyLessons: Lesson[] = [l15, l16, l17, l18, l19, l20];
