// Lessen 28–30: luisteren, eenvoudige gesprekken en de afsluitende toets.
import type { Lesson } from "../types";
import { builder, w } from "./helpers";

export const CAFE_DIALOGUE: { speaker: string; ar: string; nl: string }[] = [
  { speaker: "Ober", ar: "مَسَاءُ الْخَيْرِ، مَاذَا تُرِيدُ؟", nl: "Goedenavond, wat wilt u?" },
  { speaker: "Klant", ar: "مَسَاءُ النُّورِ. أُرِيدُ قَهْوَةً مِنْ فَضْلِكَ.", nl: "Goedenavond. Ik wil graag koffie, alstublieft." },
  { speaker: "Ober", ar: "بِالسُّكَّرِ؟", nl: "Met suiker?" },
  { speaker: "Klant", ar: "لَا، بِدُونِ سُكَّرٍ. وَكَأْسَ مَاءٍ أَيْضًا.", nl: "Nee, zonder suiker. En ook een glas water." },
  { speaker: "Ober", ar: "حَسَنًا. هَلْ تُرِيدُ شَيْئًا آخَرَ؟", nl: "Goed. Wilt u nog iets anders?" },
  { speaker: "Klant", ar: "لَا، شُكْرًا. بِكَمْ هَذَا؟", nl: "Nee, dank u. Hoeveel kost dit?" },
  { speaker: "Ober", ar: "عَشَرَةُ دَرَاهِمَ.", nl: "Tien dirham." },
];

export const MEETING_DIALOGUE: { speaker: string; ar: string; nl: string }[] = [
  { speaker: "Yusuf", ar: "السَّلَامُ عَلَيْكُمْ.", nl: "Vrede zij met u." },
  { speaker: "Sara", ar: "وَعَلَيْكُمُ السَّلَامُ.", nl: "En met u zij vrede." },
  { speaker: "Yusuf", ar: "أَنَا يُوسُفُ. مَا اسْمُكِ؟", nl: "Ik ben Yusuf. Hoe heet jij?" },
  { speaker: "Sara", ar: "اِسْمِي سَارَةُ. تَشَرَّفْنَا.", nl: "Mijn naam is Sara. Aangenaam." },
  { speaker: "Yusuf", ar: "مِنْ أَيْنَ أَنْتِ يَا سَارَةُ؟", nl: "Waar kom je vandaan, Sara?" },
  { speaker: "Sara", ar: "أَنَا مِنْ هُولَنْدَا، مِنْ رُوتِرْدَام. وَأَنْتَ؟", nl: "Ik kom uit Nederland, uit Rotterdam. En jij?" },
  { speaker: "Yusuf", ar: "أَنَا مِنَ الْمَغْرِبِ. أَنَا طَالِبٌ فِي الْجَامِعَةِ.", nl: "Ik kom uit Marokko. Ik ben student aan de universiteit." },
  { speaker: "Sara", ar: "وَأَنَا مُدَرِّسَةٌ.", nl: "En ik ben lerares." },
];

const joinAr = (d: { ar: string }[]) => d.map((x) => x.ar).join(" ");

const l28 = (() => {
  const { ex, test } = builder(28);
  const all = joinAr(CAFE_DIALOGUE);
  return {
    id: 28,
    module: "Luisteren & gesprekken",
    level: "A1",
    title: "Luisteren: in het café",
    titleAr: "فِي الْمَقْهَى",
    goal: "Je begrijpt een kort gesprek in een café en kunt zelf iets bestellen.",
    minutes: 25,
    skills: ["listening", "speaking", "vocabulary", "writing"],
    sections: [
      {
        title: "Het gesprek",
        body: [
          "Luister eerst zonder mee te lezen. Speel daarna elke zin los af en lees mee. Zet de snelheid lager als het te snel gaat.",
          "Nieuwe woorden: مَاذَا (wat, vóór een werkwoord), بِـ (met), بِدُونِ (zonder), كَأْس (glas), أَيْضًا (ook), شَيْء آخَر (iets anders), بِكَمْ (voor hoeveel), دِرْهَم (dirham).",
        ],
        examples: CAFE_DIALOGUE.map((d) => ({ ar: d.ar, nl: `${d.speaker}: ${d.nl}` })),
      },
    ],
    words: [
      w("مَاذَا", "mādhā", "wat (vóór een werkwoord)", "vraagwoord"),
      w("بِدُونِ", "bi-dūni", "zonder", "vz."),
      w("كَأْس", "kaʾs", "glas", "zn. v."),
      w("أَيْضًا", "ayḍan", "ook", "bijwoord"),
      w("شَيْء", "shayʾ", "iets, ding", "zn. m., mv. أَشْيَاء"),
      w("بِكَمْ", "bi-kam", "voor hoeveel? (prijs)"),
      w("حَسَنًا", "ḥasanan", "goed, oké"),
    ],
    exercises: [
      ex.mcq("listening", "Luister naar het hele gesprek. Wat bestelt de klant?", ["koffie", "thee", "sap"], 0, { audio: all }),
      ex.mcq("listening", "Wil de klant suiker?", ["nee", "ja", "dat zegt hij niet"], 0, { audio: CAFE_DIALOGUE[3].ar }),
      ex.mcq("listening", "Wat bestelt de klant nog meer?", ["een glas water", "een broodje", "melk"], 0, { audio: CAFE_DIALOGUE[3].ar }),
      ex.mcq("listening", "Hoeveel kost het?", ["10 dirham", "2 dirham", "7 dirham"], 0, { audio: CAFE_DIALOGUE[6].ar }),
      ex.dictation("بِدُونِ سُكَّرٍ"),
      ex.dictation("مَاذَا تُرِيدُ؟"),
      ex.type("writing", "Vertaal: Hoeveel kost dit?", ["بكم هذا"]),
      ex.order("writing", "Maak de zin: ik wil koffie zonder suiker.", ["أُرِيدُ", "قَهْوَةً", "بِدُونِ", "سُكَّرٍ"]),
      ex.speak("لَا، شُكْرًا. بِكَمْ هَذَا؟", "Nee, dank u. Hoeveel kost dit?"),
    ],
    test: [
      test.dictation("كَأْسَ مَاءٍ", { answers: ["كأس ماء"] }),
      test.mcq("listening", "Luister. Wat betekent dit?", ["Wilt u nog iets anders?", "Wat wilt u?", "Hoeveel kost dit?"], 0, { audio: CAFE_DIALOGUE[4].ar }),
      test.type("writing", "Vertaal: Wat wil je?", ["ماذا تريد"]),
      test.type("writing", "Vertaal: Ik wil thee, alsjeblieft.", ["أريد شايا من فضلك", "أريد شاي من فضلك"]),
      test.speak("أُرِيدُ قَهْوَةً بِدُونِ سُكَّرٍ", "Ik wil koffie zonder suiker."),
    ],
  } satisfies Lesson;
})();

const l29 = (() => {
  const { ex, test } = builder(29);
  const passage = joinAr(MEETING_DIALOGUE);
  return {
    id: 29,
    module: "Luisteren & gesprekken",
    level: "A1",
    title: "Gesprek: elkaar leren kennen",
    titleAr: "حِوَارٌ: التَّعَارُفُ",
    goal: "Je voert een kort kennismakingsgesprek en begrijpt het zonder harakat.",
    minutes: 25,
    skills: ["speaking", "reading", "reading_unvowelled", "writing", "listening"],
    sections: [
      {
        title: "Het gesprek",
        body: [
          "Yusuf en Sara ontmoeten elkaar. Lees en luister. Let op: يَا (yā) gebruik je als je iemand aanspreekt: يَا سَارَةُ.",
          "مِنْ + ال wordt مِنَ الْ…: مِنَ الْمَغْرِبِ (uit Marokko).",
        ],
        examples: MEETING_DIALOGUE.map((d) => ({ ar: d.ar, nl: `${d.speaker}: ${d.nl}` })),
      },
      {
        title: "Rollenspel",
        body: [
          "Speel de rol van Sara. Zeg haar zinnen hardop, maar met jouw eigen naam en woonplaats. Met een AI-sleutel kun je dit gesprek daarna vrij oefenen in de Spreektrainer (scenario 'Kennismaken').",
        ],
      },
    ],
    words: [
      w("الْمَغْرِب", "al-maghrib", "Marokko"),
      w("جَامِعَة", "jāmiʿa", "universiteit", "zn. v."),
      w("يَا", "yā", "(aanspreekwoord: o …)"),
      w("وَأَنْتَ؟", "wa-anta?", "en jij? (m)"),
    ],
    exercises: [
      ex.mcq("reading", "Waar komt Sara vandaan?", ["uit Rotterdam, Nederland", "uit Marokko", "uit Amsterdam"], 0, { passage }),
      ex.mcq("reading", "Wat doet Yusuf?", ["hij is student", "hij is leraar", "hij werkt in een café"], 0, { passage }),
      ex.mcq("reading", "Wat is Sara van beroep?", ["lerares", "studente", "arts"], 0, { passage }),
      ex.mcq("listening", "Luister. Waar komt Yusuf vandaan?", ["Marokko", "Nederland", "Egypte"], 0, { audio: MEETING_DIALOGUE[6].ar }),
      ex.type("writing", "Vertaal: Mijn naam is Sara.", ["اسمي سارة"]),
      ex.order("writing", "Maak de zin: ik ben student aan de universiteit.", ["أَنَا", "طَالِبٌ", "فِي", "الْجَامِعَةِ"]),
      ex.type("writing", "Vertaal: Ik ben lerares.", ["أنا مدرسة"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat zegt Sara?", ["Ik kom uit Nederland, uit Rotterdam. En jij?", "Ik woon in Rotterdam.", "Waar kom jij vandaan?"], 0, { promptAr: "أنا من هولندا، من روتردام. وأنت؟" }),
      ex.speak("أَنَا مِنْ هُولَنْدَا. وَأَنْتَ؟", "Ik kom uit Nederland. En jij?"),
      ex.speak("اِسْمِي سَارَةُ. تَشَرَّفْنَا.", "Mijn naam is Sara. Aangenaam."),
    ],
    test: [
      test.type("writing", "Vertaal: Waar kom jij (v) vandaan?", ["من أين أنت"]),
      test.type("writing", "Vertaal: Ik ben student aan de universiteit.", ["أنا طالب في الجامعة"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik kom uit Marokko.", "Ik woon in Marokko.", "Marokko is mooi."], 0, { promptAr: "أنا من المغرب" }),
      test.speak("تَشَرَّفْنَا", "aangenaam"),
      test.type("writing", "Vraag aan een man: en jij?", ["وأنت"]),
    ],
  } satisfies Lesson;
})();

export const FINAL_TEXT =
  "اِسْمِي آدَمُ. أَنَا مِنْ هُولَنْدَا. أَسْكُنُ فِي بَيْتٍ صَغِيرٍ مَعَ أُسْرَتِي. عِنْدِي أُخْتٌ وَاحِدَةٌ، اسْمُهَا مَرْيَمُ. هِيَ طَالِبَةٌ فِي الْجَامِعَةِ. فِي الصَّبَاحِ أَشْرَبُ قَهْوَةً وَآكُلُ خُبْزًا.";

const l30 = (() => {
  const { ex, test } = builder(30);
  return {
    id: 30,
    module: "Luisteren & gesprekken",
    level: "A1",
    title: "Herhaling en eindtoets beginnersdeel",
    titleAr: "مُرَاجَعَةٌ وَاخْتِبَارٌ",
    goal: "Je laat zien dat je de stof van les 1–29 beheerst: lezen (ook zonder harakat), schrijven, luisteren en spreken.",
    minutes: 30,
    skills: ["reading", "reading_unvowelled", "writing", "grammar", "listening", "speaking", "vocabulary"],
    sections: [
      {
        title: "Wat je nu kunt",
        body: [
          "Je kent alle letters en harakat, je kunt jezelf voorstellen, over je familie en je huis praten, iets bestellen, en eenvoudige zinnen maken met voornaamwoorden, ال, bijvoeglijke naamwoorden en voorzetsels.",
          "Deze les herhaalt alles in één tekst. Lees de tekst eerst met harakat en daarna zonder (gebruik de knop 'harakat' bovenaan).",
          "Nieuwe woorden: أُسْرَة (gezin), أَشْرَبُ (ik drink), آكُلُ (ik eet), الصَّبَاح (de ochtend).",
        ],
      },
      { title: "Leestekst", body: [FINAL_TEXT] },
    ],
    words: [
      w("أُسْرَة", "usra", "gezin", "zn. v."),
      w("أَشْرَبُ", "ashrabu", "ik drink", "ww. (شَرِبَ)"),
      w("آكُلُ", "ākulu", "ik eet", "ww. (أَكَلَ)"),
      w("صَبَاح", "ṣabāḥ", "ochtend", "zn. m."),
    ],
    exercises: [
      ex.mcq("reading", "Waar woont Adam?", ["in een klein huis", "in een groot huis", "in Marokko"], 0, { passage: FINAL_TEXT }),
      ex.mcq("reading", "Hoeveel zussen heeft Adam?", ["één", "twee", "geen"], 0, { passage: FINAL_TEXT }),
      ex.mcq("reading", "Wat doet Maryam?", ["zij studeert aan de universiteit", "zij is lerares", "zij werkt in een café"], 0, { passage: FINAL_TEXT }),
      ex.mcq("reading", "Wat drinkt Adam 's ochtends?", ["koffie", "thee", "melk"], 0, { passage: FINAL_TEXT }),
      ex.dictation("أَسْكُنُ فِي بَيْتٍ صَغِيرٍ", { answers: ["أسكن في بيت صغير"] }),
      ex.type("writing", "Vertaal: Ik heb één zus.", ["عندي أخت واحدة"]),
      ex.type("writing", "Vertaal: Haar naam is Maryam.", ["اسمها مريم"]),
      ex.order("writing", "Maak de zin: in de ochtend eet ik brood.", ["فِي", "الصَّبَاحِ", "آكُلُ", "خُبْزًا"]),
      ex.speak("أَنَا مِنْ هُولَنْدَا. أَسْكُنُ فِي بَيْتٍ صَغِيرٍ.", "Ik kom uit Nederland. Ik woon in een klein huis."),
    ],
    test: [
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Zij is studente aan de universiteit.", "Zij woont bij de universiteit.", "De universiteit is groot."], 0, { promptAr: "هي طالبة في الجامعة" }),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik woon met mijn gezin.", "Mijn gezin is klein.", "Ik heb een groot gezin."], 0, { promptAr: "أسكن مع أسرتي" }),
      test.type("writing", "Vertaal: Ik kom uit Nederland.", ["أنا من هولندا"]),
      test.type("writing", "Vertaal: De kamer is klein.", ["الغرفة صغيرة"]),
      test.type("grammar", "Schrijf: onze school.", ["مدرستنا"]),
      test.mcq("grammar", "Vul in: ___ سَيَّارَةٌ جَدِيدَةٌ (dit is een nieuwe auto)", ["هَذِهِ", "هَذَا"], 0),
      test.dictation("عِنْدِي أَخٌ وَاحِدٌ", { answers: ["عندي أخ واحد"] }),
      test.mcq("listening", "Luister. Wat zegt de spreker?", ["Ik drink 's ochtends koffie.", "Ik eet 's ochtends brood.", "Ik wil thee."], 0, { audio: "فِي الصَّبَاحِ أَشْرَبُ قَهْوَةً" }),
      test.mcq("reading", "Hoe lees je dit?", ["ash-shams", "al-shams", "as-sams"], 0, { promptAr: "الشَّمْسُ" }),
      test.speak("السَّلَامُ عَلَيْكُمْ. اِسْمِي آدَمُ. أَنَا مِنْ هُولَنْدَا.", "Vrede zij met u. Mijn naam is Adam. Ik kom uit Nederland."),
    ],
  } satisfies Lesson;
})();

export const communicationLessons: Lesson[] = [l28, l29, l30];
