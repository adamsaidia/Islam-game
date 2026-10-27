// Lessen 21–27: basisgrammatica. Nadruk op zelf zinnen maken.
import type { Lesson } from "../types";
import { builder, w } from "./helpers";

const l21 = (() => {
  const { ex, test } = builder(21);
  return {
    id: 21,
    module: "Basisgrammatica",
    level: "A1",
    title: "Persoonlijke voornaamwoorden",
    titleAr: "الضَّمَائِرُ",
    goal: "Je gebruikt ik, jij (m/v), hij, zij, wij, jullie en zij (mv) in eenvoudige zinnen.",
    minutes: 20,
    skills: ["grammar", "writing", "vocabulary"],
    sections: [
      {
        title: "De voornaamwoorden",
        body: [
          "Het Arabisch maakt verschil tussen mannelijk en vrouwelijk, ook bij 'jij'. Er bestaan ook tweevoud-vormen; die leer je later.",
          "In de tegenwoordige tijd is er geen werkwoord 'zijn': أَنَا طَالِبٌ = ik (ben) student.",
        ],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["أَنَا", "anā", "ik"],
          ["أَنْتَ", "anta", "jij (m)"],
          ["أَنْتِ", "anti", "jij (v)"],
          ["هُوَ", "huwa", "hij"],
          ["هِيَ", "hiya", "zij (enkelvoud)"],
          ["نَحْنُ", "naḥnu", "wij"],
          ["أَنْتُمْ", "antum", "jullie (m / gemengd)"],
          ["هُمْ", "hum", "zij (meervoud, m / gemengd)"],
        ],
        examples: [
          { ar: "أَنَا طَالِبٌ.", tr: "anā ṭālibun.", nl: "ik ben student. (m)" },
          { ar: "هِيَ طَالِبَةٌ.", tr: "hiya ṭālibatun.", nl: "zij is student." },
          { ar: "نَحْنُ فِي الْبَيْتِ.", tr: "naḥnu fī l-bayti.", nl: "wij zijn thuis." },
        ],
      },
    ],
    words: [
      w("أَنْتَ", "anta", "jij (m)", "vnw."),
      w("أَنْتِ", "anti", "jij (v)", "vnw."),
      w("هُوَ", "huwa", "hij", "vnw."),
      w("هِيَ", "hiya", "zij (ev.)", "vnw."),
      w("نَحْنُ", "naḥnu", "wij", "vnw."),
      w("أَنْتُمْ", "antum", "jullie", "vnw."),
      w("هُمْ", "hum", "zij (mv.)", "vnw."),
      w("طَالِب", "ṭālib", "student, leerling", "zn. m.; v. طَالِبَة"),
    ],
    exercises: [
      ex.match("grammar", "Koppel voornaamwoord en betekenis.", [["أَنَا", "ik"], ["هُوَ", "hij"], ["هِيَ", "zij (ev.)"], ["نَحْنُ", "wij"]]),
      ex.type("grammar", "Schrijf 'wij'.", ["نحن"]),
      ex.type("grammar", "Schrijf 'zij' (één vrouw).", ["هي"]),
      ex.mcq("grammar", "Welk woord gebruik je voor 'jij' tegen een vrouw?", ["أَنْتِ", "أَنْتَ", "أَنَا"], 0),
      ex.type("writing", "Vertaal: Ik ben student. (m)", ["أنا طالب"]),
      ex.order("writing", "Maak de zin: wij zijn thuis.", ["نَحْنُ", "فِي", "الْبَيْتِ"]),
      ex.mcq("grammar", "Wat betekent هُمْ?", ["zij (meervoud)", "hij", "wij"], 0),
      ex.type("writing", "Vertaal: Hij is leraar.", ["هو مدرس"]),
      ex.speak("أَنَا طَالِبٌ", "ik ben student"),
    ],
    test: [
      test.type("grammar", "Schrijf 'hij'.", ["هو"]),
      test.type("grammar", "Schrijf 'jullie'.", ["أنتم"]),
      test.type("writing", "Vertaal: Zij is lerares.", ["هي مدرسة"]),
      test.mcq("grammar", "Vul in (je praat tegen een vrouw): ___ طَالِبَةٌ", ["أَنْتِ", "أَنْتَ", "هُوَ"], 0),
      test.type("writing", "Vertaal: Wij zijn studenten. (gebruik طُلَّاب)", ["نحن طلاب"]),
    ],
  } satisfies Lesson;
})();

const l22 = (() => {
  const { ex, test } = builder(22);
  return {
    id: 22,
    module: "Basisgrammatica",
    level: "A1",
    title: "Mannelijk en vrouwelijk",
    titleAr: "الْمُذَكَّرُ وَالْمُؤَنَّثُ",
    goal: "Je maakt woorden vrouwelijk met ة en laat bijvoeglijke naamwoorden overeenkomen.",
    minutes: 20,
    skills: ["grammar", "writing"],
    sections: [
      {
        title: "Vrouwelijk maken met ة",
        body: [
          "Veel woorden maak je vrouwelijk door ة toe te voegen: طَالِب → طَالِبَة, مُدَرِّس → مُدَرِّسَة.",
          "Een bijvoeglijk naamwoord volgt het geslacht van het woord waar het bij hoort: الْوَلَدُ صَغِيرٌ (de jongen is klein), الْبِنْتُ صَغِيرَةٌ (het meisje is klein).",
          "Sommige woorden zijn vrouwelijk zonder ة: أُمّ (moeder), بِنْت (meisje), شَمْس (zon), دَار (huis).",
        ],
        table: [
          ["Mannelijk", "Vrouwelijk", "Betekenis"],
          ["طَالِب", "طَالِبَة", "student"],
          ["مُدَرِّس", "مُدَرِّسَة", "leraar / lerares"],
          ["كَبِير", "كَبِيرَة", "groot"],
          ["صَغِير", "صَغِيرَة", "klein"],
          ["جَمِيل", "جَمِيلَة", "mooi"],
        ],
      },
    ],
    words: [w("الْوَلَد", "al-walad", "de jongen"), w("الْبِنْت", "al-bint", "het meisje"), w("جَدِيد", "jadīd", "nieuw", "bn.; v. جَدِيدَة")],
    exercises: [
      ex.type("grammar", "Maak vrouwelijk: طَالِب", ["طالبة"]),
      ex.type("grammar", "Maak vrouwelijk: كَبِير", ["كبيرة"]),
      ex.type("grammar", "Maak vrouwelijk: جَمِيل", ["جميلة"]),
      ex.mcq("grammar", "Welk woord is vrouwelijk zonder ة?", ["شَمْس", "قَلَم", "كِتَاب"], 0),
      ex.type("writing", "Vertaal: Zij is groot.", ["هي كبيرة"]),
      ex.type("writing", "Vertaal: Hij is klein.", ["هو صغير"]),
      ex.order("writing", "Maak de zin: het meisje is mooi.", ["الْبِنْتُ", "جَمِيلَةٌ"]),
      ex.mcq("grammar", "Vul in: الْغُرْفَةُ ___ (de kamer is groot)", ["كَبِيرَةٌ", "كَبِيرٌ"], 0),
      ex.speak("هِيَ مُدَرِّسَةٌ", "zij is lerares"),
    ],
    test: [
      test.type("grammar", "Maak vrouwelijk: مُدَرِّس", ["مدرسة"]),
      test.mcq("grammar", "Vul in: الشَّمْسُ ___ (de zon is groot)", ["كَبِيرٌ", "كَبِيرَةٌ"], 1, { explain: "شَمْس is vrouwelijk, ook zonder ة." }),
      test.type("writing", "Vertaal: De jongen is klein.", ["الولد صغير"]),
      test.type("writing", "Vertaal: De kamer is mooi.", ["الغرفة جميلة"]),
      test.type("writing", "Vertaal: Het meisje is groot.", ["البنت كبيرة"]),
    ],
  } satisfies Lesson;
})();

const l23 = (() => {
  const { ex, test } = builder(23);
  return {
    id: 23,
    module: "Basisgrammatica",
    level: "A1",
    title: "Bepaald en onbepaald",
    titleAr: "الْمَعْرِفَةُ وَالنَّكِرَةُ",
    goal: "Je kiest tussen 'een' (tanween) en 'de/het' (ال).",
    minutes: 15,
    skills: ["grammar", "writing", "reading"],
    sections: [
      {
        title: "Een huis of het huis?",
        body: [
          "Onbepaald (een …) herken je aan tanween: بَيْتٌ = een huis. Er bestaat geen apart woord voor 'een'.",
          "Bepaald (de/het) maak je met ال: الْبَيْتُ = het huis. Een woord met ال krijgt nooit tanween.",
        ],
        examples: [
          { ar: "كِتَابٌ", tr: "kitābun", nl: "een boek" },
          { ar: "الْكِتَابُ", tr: "al-kitābu", nl: "het boek" },
          { ar: "قِطَّةٌ", tr: "qiṭṭatun", nl: "een kat" },
          { ar: "الْقِطَّةُ", tr: "al-qiṭṭatu", nl: "de kat" },
          { ar: "الرَّجُلُ", tr: "ar-rajulu", nl: "de man" },
        ],
      },
    ],
    words: [w("رَجُل", "rajul", "man", "zn. m., mv. رِجَال"), w("اِمْرَأَة", "imraʾa", "vrouw", "zn. v.; met ال: الْمَرْأَة")],
    exercises: [
      ex.mcq("grammar", "Wat betekent بَيْتٌ?", ["een huis", "het huis", "huizen"], 0),
      ex.mcq("grammar", "Wat betekent الْبَيْتُ?", ["een huis", "het huis", "mijn huis"], 1),
      ex.type("grammar", "Maak bepaald: قَلَمٌ", ["القلم"]),
      ex.type("writing", "Schrijf: het boek.", ["الكتاب"]),
      ex.mcq("grammar", "Welke vorm is FOUT?", ["الْكِتَابٌ", "الْكِتَابُ", "كِتَابٌ"], 0, { explain: "Een woord met ال krijgt nooit tanween." }),
      ex.type("spelling", "Schrijf 'waladun' (een jongen) met harakat.", ["وَلَدٌ"], { requireHarakat: true }),
      ex.dictation("الشَّمْسُ"),
      ex.speak("الْبَابُ وَالنَّافِذَةُ", "de deur en het raam"),
    ],
    test: [
      test.type("writing", "Schrijf: de deur.", ["الباب"]),
      test.type("writing", "Schrijf: een kamer (zonder harakat).", ["غرفة"]),
      test.mcq("reading", "Hoe lees je dit?", ["ar-rajulu", "al-rajulu", "rajulun"], 0, { promptAr: "الرَّجُلُ" }),
      test.type("grammar", "Maak onbepaald (zonder ال): الْقِطَّةُ", ["قطة"]),
    ],
  } satisfies Lesson;
})();

const l24 = (() => {
  const { ex, test } = builder(24);
  return {
    id: 24,
    module: "Basisgrammatica",
    level: "A1",
    title: "De naamwoordzin",
    titleAr: "الْجُمْلَةُ الِاسْمِيَّةُ",
    goal: "Je maakt zinnen als 'het huis is groot' en kent het verschil met 'het grote huis'.",
    minutes: 25,
    skills: ["grammar", "writing", "reading"],
    sections: [
      {
        title: "Onderwerp + gezegde, zonder 'zijn'",
        body: [
          "Een naamwoordzin (جُمْلَة اسْمِيَّة) bestaat uit een onderwerp (مُبْتَدَأ) en een gezegde (خَبَر). Het onderwerp is meestal bepaald (met ال), het gezegde onbepaald (met tanween).",
          "Let op het verschil:",
        ],
        table: [
          ["Arabisch", "Nederlands", "Waarom"],
          ["بَيْتٌ كَبِيرٌ", "een groot huis", "beide onbepaald: woordgroep"],
          ["الْبَيْتُ الْكَبِيرُ", "het grote huis", "beide bepaald: woordgroep"],
          ["الْبَيْتُ كَبِيرٌ", "het huis is groot", "bepaald + onbepaald: zin"],
        ],
      },
      {
        title: "Nieuwe bijvoeglijke naamwoorden",
        body: [],
        examples: [
          { ar: "قَرِيب", tr: "qarīb", nl: "dichtbij" },
          { ar: "بَعِيد", tr: "baʿīd", nl: "ver" },
          { ar: "جَدِيد", tr: "jadīd", nl: "nieuw" },
          { ar: "مَفْتُوح", tr: "maftūḥ", nl: "open" },
          { ar: "الْجَوُّ جَمِيلٌ.", tr: "al-jawwu jamīlun.", nl: "het weer is mooi." },
        ],
      },
    ],
    words: [
      w("قَرِيب", "qarīb", "dichtbij", "bn."),
      w("بَعِيد", "baʿīd", "ver", "bn."),
      w("مَفْتُوح", "maftūḥ", "open", "bn."),
      w("جَوّ", "jaww", "weer, sfeer", "zn. m."),
      w("سَيَّارَة", "sayyāra", "auto", "zn. v."),
    ],
    exercises: [
      ex.mcq("grammar", "Wat betekent الْبَيْتُ كَبِيرٌ?", ["het huis is groot", "het grote huis", "een groot huis"], 0),
      ex.mcq("grammar", "Wat betekent الْبَيْتُ الْكَبِيرُ?", ["het huis is groot", "het grote huis", "een groot huis"], 1),
      ex.type("writing", "Vertaal: De pen is nieuw.", ["القلم جديد"]),
      ex.type("writing", "Vertaal: Het boek is klein.", ["الكتاب صغير"]),
      ex.order("writing", "Maak de zin: de school is dichtbij.", ["الْمَدْرَسَةُ", "قَرِيبَةٌ"]),
      ex.type("writing", "Vertaal: De school is ver.", ["المدرسة بعيدة"]),
      ex.mcq("grammar", "Welke zin betekent 'de deur is open'?", ["الْبَابُ مَفْتُوحٌ", "الْبَابُ الْمَفْتُوحُ"], 0),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De auto is nieuw.", "De nieuwe auto.", "Een nieuwe auto."], 0, { promptAr: "السيارة جديدة" }),
      ex.speak("الْجَوُّ جَمِيلٌ", "het weer is mooi"),
    ],
    test: [
      test.type("writing", "Vertaal: Het huis is mooi.", ["البيت جميل"]),
      test.type("writing", "Vertaal: De kamer is groot.", ["الغرفة كبيرة"]),
      test.mcq("grammar", "Hoe zeg je 'een nieuwe pen'?", ["قَلَمٌ جَدِيدٌ", "الْقَلَمُ جَدِيدٌ", "الْقَلَمُ الْجَدِيدُ"], 0),
      test.order("writing", "Maak de zin: de auto is nieuw.", ["السَّيَّارَةُ", "جَدِيدَةٌ"]),
      test.type("writing", "Vertaal: De keuken is klein.", ["المطبخ صغير"]),
    ],
  } satisfies Lesson;
})();

const l25 = (() => {
  const { ex, test } = builder(25);
  return {
    id: 25,
    module: "Basisgrammatica",
    level: "A1",
    title: "Dit is … en vraagwoorden",
    titleAr: "اسْمُ الْإِشَارَةِ وَأَدَوَاتُ الِاسْتِفْهَامِ",
    goal: "Je wijst dingen aan (hādhā / hādhihi) en stelt vragen met wat, wie, waar, hoe en hoeveel.",
    minutes: 20,
    skills: ["grammar", "writing", "speaking"],
    sections: [
      {
        title: "Dit (hier)",
        body: [
          "هَذَا (hādhā) gebruik je bij een mannelijk woord, هَذِهِ (hādhihi) bij een vrouwelijk woord. Let op: je spreekt een lange ā uit na de hā', maar die wordt niet als alif geschreven (in sommige boeken zie je een kleine alif: هٰذَا).",
          "هَذَا كِتَابٌ = dit is een boek. هَذِهِ سَيَّارَةٌ = dit is een auto.",
        ],
      },
      {
        title: "Vraagwoorden",
        body: ["Met هَلْ maak je een ja/nee-vraag. Antwoord: نَعَمْ (ja) of لَا (nee)."],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["مَا", "mā", "wat (vóór een zelfstandig naamwoord)"],
          ["مَنْ", "man", "wie"],
          ["أَيْنَ", "ayna", "waar"],
          ["كَيْفَ", "kayfa", "hoe"],
          ["مَتَى", "matā", "wanneer"],
          ["لِمَاذَا", "limādhā", "waarom"],
          ["كَمْ", "kam", "hoeveel"],
          ["هَلْ", "hal", "(ja/nee-vraag)"],
        ],
        examples: [
          { ar: "مَا هَذَا؟ هَذَا قَلَمٌ.", tr: "mā hādhā? hādhā qalamun.", nl: "wat is dit? dit is een pen." },
          { ar: "مَنْ هَذِهِ؟ هَذِهِ أُخْتِي.", tr: "man hādhihi? hādhihi ukhtī.", nl: "wie is dit? dit is mijn zus." },
          { ar: "هَلْ هَذَا بَيْتٌ؟ نَعَمْ.", tr: "hal hādhā baytun? naʿam.", nl: "is dit een huis? ja." },
        ],
      },
    ],
    words: [
      w("هَذَا", "hādhā", "dit (m)", "aanw. vnw."),
      w("هَذِهِ", "hādhihi", "dit (v)", "aanw. vnw."),
      w("مَا", "mā", "wat", "vraagwoord"),
      w("مَنْ", "man", "wie", "vraagwoord"),
      w("مَتَى", "matā", "wanneer", "vraagwoord"),
      w("لِمَاذَا", "limādhā", "waarom", "vraagwoord"),
      w("كَمْ", "kam", "hoeveel", "vraagwoord"),
      w("نَعَمْ", "naʿam", "ja"),
    ],
    exercises: [
      ex.mcq("grammar", "Vul in: ___ سَيَّارَةٌ (dit is een auto)", ["هَذِهِ", "هَذَا"], 0, { explain: "سَيَّارَة is vrouwelijk (ة)." }),
      ex.mcq("grammar", "Vul in: ___ بَابٌ (dit is een deur)", ["هَذِهِ", "هَذَا"], 1),
      ex.type("writing", "Vertaal: Dit is een boek.", ["هذا كتاب"]),
      ex.type("writing", "Vertaal: Wat is dit?", ["ما هذا"]),
      ex.type("writing", "Vertaal: Wie is dit? (over een vrouw)", ["من هذه"]),
      ex.match("grammar", "Koppel vraagwoord en betekenis.", [["لِمَاذَا", "waarom"], ["مَتَى", "wanneer"], ["كَمْ", "hoeveel"], ["أَيْنَ", "waar"]]),
      ex.order("writing", "Maak de vraag: waar is de keuken?", ["أَيْنَ", "الْمَطْبَخُ"]),
      ex.type("writing", "Vertaal: Is dit een pen?", ["هل هذا قلم"]),
      ex.speak("مَا هَذَا؟", "wat is dit?"),
    ],
    test: [
      test.type("writing", "Vertaal: Dit is een kamer.", ["هذه غرفة"]),
      test.mcq("grammar", "Hoe vraag je 'waar'?", ["أَيْنَ", "مَتَى", "مَنْ"], 0),
      test.type("writing", "Vertaal: Wat is dit?", ["ما هذا"]),
      test.mcq("grammar", "Wat betekent كَمْ?", ["hoeveel", "hoe", "wie"], 0),
      test.type("writing", "Vertaal: Is dit een huis?", ["هل هذا بيت"]),
    ],
  } satisfies Lesson;
})();

const l26 = (() => {
  const { ex, test } = builder(26);
  return {
    id: 26,
    module: "Basisgrammatica",
    level: "A1",
    title: "Mijn, jouw, zijn, haar: bezittelijke uitgangen",
    titleAr: "الضَّمَائِرُ الْمُتَّصِلَةُ",
    goal: "Je plakt bezittelijke uitgangen aan woorden, ook aan woorden op ة.",
    minutes: 25,
    skills: ["grammar", "writing", "spelling"],
    sections: [
      {
        title: "Uitgangen achter het woord",
        body: [
          "Bezit druk je uit met een uitgang achter het woord. Het woord krijgt dan geen ال.",
          "Belangrijk: ة wordt een gewone ت als er iets achter komt: سَيَّارَة → سَيَّارَتِي (mijn auto).",
        ],
        table: [
          ["Uitgang", "Betekenis", "Voorbeeld", "Uitspraak"],
          ["ـِي", "mijn", "كِتَابِي", "kitābī"],
          ["ـُكَ", "jouw (m)", "كِتَابُكَ", "kitābuka"],
          ["ـُكِ", "jouw (v)", "كِتَابُكِ", "kitābuki"],
          ["ـُهُ", "zijn", "كِتَابُهُ", "kitābuhu"],
          ["ـُهَا", "haar", "كِتَابُهَا", "kitābuhā"],
          ["ـُنَا", "ons/onze", "كِتَابُنَا", "kitābunā"],
          ["ـُكُمْ", "jullie", "كِتَابُكُمْ", "kitābukum"],
          ["ـُهُمْ", "hun", "كِتَابُهُمْ", "kitābuhum"],
        ],
        examples: [
          { ar: "سَيَّارَتِي", tr: "sayyāratī", nl: "mijn auto" },
          { ar: "مَدْرَسَتُنَا", tr: "madrasatunā", nl: "onze school" },
          { ar: "هَذَا بَيْتُنَا.", tr: "hādhā baytunā.", nl: "dit is ons huis." },
        ],
      },
    ],
    words: [w("كِتَابِي", "kitābī", "mijn boek"), w("بَيْتُنَا", "baytunā", "ons huis")],
    exercises: [
      ex.type("grammar", "Schrijf: mijn pen.", ["قلمي"]),
      ex.type("grammar", "Schrijf: haar boek.", ["كتابها"]),
      ex.type("grammar", "Schrijf: zijn huis.", ["بيته"]),
      ex.type("grammar", "Schrijf: onze school.", ["مدرستنا"], { hint: "Let op: ة wordt ت." }),
      ex.mcq("grammar", "Wat betekent سَيَّارَتُكِ?", ["jouw (v) auto", "jouw (m) auto", "mijn auto"], 0),
      ex.mcq("grammar", "Welke vorm is FOUT?", ["الْكِتَابِي", "كِتَابِي", "كِتَابُهُ"], 0, { explain: "Met een bezittelijke uitgang gebruik je geen ال." }),
      ex.order("writing", "Maak de zin: dit is ons huis.", ["هَذَا", "بَيْتُنَا"]),
      ex.type("writing", "Vertaal: Mijn kamer is klein.", ["غرفتي صغيرة"]),
      ex.speak("هَذِهِ غُرْفَتِي", "dit is mijn kamer"),
    ],
    test: [
      test.type("grammar", "Schrijf: mijn kamer.", ["غرفتي"]),
      test.type("grammar", "Schrijf: jouw (m) naam.", ["اسمك"]),
      test.type("grammar", "Schrijf: hun huis.", ["بيتهم"]),
      test.mcq("grammar", "Wat betekent أُمُّهُ?", ["zijn moeder", "haar moeder", "mijn moeder"], 0),
      test.type("writing", "Vertaal: Haar auto is nieuw.", ["سيارتها جديدة"]),
    ],
  } satisfies Lesson;
})();

const l27 = (() => {
  const { ex, test } = builder(27);
  const passage = "الْكِتَابُ عَلَى الطَّاوِلَةِ. الْقِطَّةُ تَحْتَ الْكُرْسِيِّ. أَنَا فِي الْغُرْفَةِ مَعَ أَخِي.";
  return {
    id: 27,
    module: "Basisgrammatica",
    level: "A1",
    title: "Voorzetsels en korte zinnen lezen",
    titleAr: "حُرُوفُ الْجَرِّ",
    goal: "Je gebruikt voorzetsels en begrijpt korte zinnen, ook zonder harakat.",
    minutes: 25,
    skills: ["grammar", "reading", "reading_unvowelled", "writing"],
    sections: [
      {
        title: "Voorzetsels",
        body: [
          "Na een voorzetsel staat het woord in de 2e naamval (genitief): de uitgang wordt -i. الْبَيْتُ → فِي الْبَيْتِ (in het huis).",
          "Zonder harakat zie je dat niet. Daarom is het belangrijk dat je de regel kent: dan 'hoor' je de juiste klinker vanzelf.",
        ],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["فِي", "fī", "in"],
          ["عَلَى", "ʿalā", "op"],
          ["مِنْ", "min", "van, uit"],
          ["إِلَى", "ilā", "naar"],
          ["مَعَ", "maʿa", "met (samen met)"],
          ["تَحْتَ", "taḥta", "onder"],
          ["فَوْقَ", "fawqa", "boven"],
          ["بِجَانِبِ", "bi-jānibi", "naast"],
        ],
      },
      {
        title: "Leestekst",
        body: [passage],
      },
    ],
    words: [
      w("إِلَى", "ilā", "naar", "vz."),
      w("مَعَ", "maʿa", "met", "vz."),
      w("تَحْتَ", "taḥta", "onder", "vz."),
      w("فَوْقَ", "fawqa", "boven", "vz."),
      w("بِجَانِبِ", "bi-jānibi", "naast", "vz."),
      w("حَقِيبَة", "ḥaqība", "tas", "zn. v."),
    ],
    exercises: [
      ex.match("grammar", "Koppel voorzetsel en betekenis.", [["فِي", "in"], ["عَلَى", "op"], ["تَحْتَ", "onder"], ["مَعَ", "met"]]),
      ex.type("writing", "Vertaal: in het huis.", ["في البيت"]),
      ex.type("writing", "Vertaal: op de tafel.", ["على الطاولة"]),
      ex.mcq("reading", "Lees de tekst. Waar is de kat?", ["onder de stoel", "op de tafel", "in de keuken"], 0, { passage }),
      ex.mcq("reading", "Met wie is de schrijver in de kamer?", ["met zijn broer", "met zijn moeder", "alleen"], 0, { passage }),
      ex.order("writing", "Maak de zin: het boek ligt op de tafel.", ["الْكِتَابُ", "عَلَى", "الطَّاوِلَةِ"]),
      ex.type("writing", "Vertaal: naar de school.", ["إلى المدرسة"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De pen is in de tas.", "De tas is op de pen.", "De pen is onder de tas."], 0, { promptAr: "القلم في الحقيبة" }),
      ex.speak("أَنَا فِي الْبَيْتِ", "ik ben thuis"),
    ],
    test: [
      test.type("writing", "Vertaal: met mijn moeder.", ["مع أمي"]),
      test.type("writing", "Vertaal: uit Nederland.", ["من هولندا"]),
      test.mcq("grammar", "Wat betekent تَحْتَ?", ["onder", "boven", "naast"], 0),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De jongen is op school.", "De school is groot.", "De jongen gaat naar huis."], 0, { promptAr: "الولد في المدرسة" }),
      test.type("writing", "Vertaal: De telefoon is naast het bed.", ["الهاتف بجانب السرير"]),
    ],
  } satisfies Lesson;
})();

export const grammarLessons: Lesson[] = [l21, l22, l23, l24, l25, l26, l27];
