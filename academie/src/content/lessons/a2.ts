// Lessen 41–50: A2 (elementair). Toekomst, gebiedende wijs, أَنْ + werkwoord, dagelijkse situaties.
import type { Lesson } from "../types";
import { joinPassage, MOROCCO_TRIP } from "../passages";
import { builder, w } from "./helpers";

const M = "A2 Elementair";

const l41 = (() => {
  const { ex, test } = builder(41);
  return {
    id: 41, module: M, level: "A2",
    title: "De toekomst", titleAr: "الْمُسْتَقْبَلُ",
    goal: "Je praat over plannen met سَـ / سَوْفَ en ontkent de toekomst met لَنْ.",
    minutes: 25, skills: ["grammar", "writing", "speaking"],
    sections: [
      {
        title: "سَـ en سَوْفَ",
        body: [
          "Zet سَـ (vast aan het werkwoord) of سَوْفَ (los) vóór de tegenwoordige tijd: سَأَذْهَبُ / سَوْفَ أَذْهَبُ = ik zal gaan.",
          "Ontkennen doe je met لَنْ + de aanvoegende wijs (الْمَنْصُوب): de laatste klinker wordt -a, en -ūna wordt -ū: لَنْ أَذْهَبَ، لَنْ يَذْهَبُوا.",
        ],
        examples: [
          { ar: "سَأُسَافِرُ إِلَى الْمَغْرِبِ غَدًا.", tr: "sa-usāfiru ilā l-maghribi ghadan.", nl: "Ik reis morgen naar Marokko." },
          { ar: "سَوْفَ نَزُورُ جَدَّتِي الْأُسْبُوعَ الْقَادِمَ.", tr: "sawfa nazūru jaddatī l-usbūʿa l-qādima.", nl: "Volgende week bezoeken we mijn oma." },
          { ar: "لَنْ أَنْسَى هَذَا الْيَوْمَ.", tr: "lan ansā hādhā l-yawma.", nl: "Ik zal deze dag niet vergeten." },
        ],
      },
    ],
    words: [
      w("يُسَافِرُ", "yusāfiru", "hij reist", "ww. (سَافَرَ)"),
      w("يَزُورُ", "yazūru", "hij bezoekt", "ww. (زَارَ)"),
      w("الْقَادِم", "al-qādim", "de volgende, komende", "bn."),
      w("الْمُسْتَقْبَل", "al-mustaqbal", "de toekomst"),
      w("يَنْسَى", "yansā", "hij vergeet", "ww. (نَسِيَ)"),
      w("بَعْدَ غَدٍ", "baʿda ghadin", "overmorgen"),
    ],
    exercises: [
      ex.type("grammar", "Zet in de toekomst met سَـ: أَذْهَبُ", ["سأذهب"]),
      ex.type("grammar", "Zet in de toekomst met سَـ: نَدْرُسُ", ["سندرس"]),
      ex.mcq("grammar", "Welke zin gaat over de toekomst?", ["سَأَكْتُبُ رِسَالَةً", "كَتَبْتُ رِسَالَةً", "لَا أَكْتُبُ رِسَالَةً"], 0),
      ex.type("grammar", "Ontken met لَنْ: سَأَذْهَبُ", ["لن أذهب"]),
      ex.mcq("grammar", "Welke vorm is correct na لَنْ?", ["لَنْ يَذْهَبُوا", "لَنْ يَذْهَبُونَ", "لَنْ ذَهَبُوا"], 0),
      ex.type("writing", "Vertaal: Morgen reis ik naar Marokko. (toekomst)", ["سأسافر إلى المغرب غدا", "غدا سأسافر إلى المغرب", "سوف أسافر إلى المغرب غدا"]),
      ex.order("writing", "Maak de zin: volgende week bezoeken we mijn oma.", ["سَوْفَ", "نَزُورُ", "جَدَّتِي", "الْأُسْبُوعَ", "الْقَادِمَ"]),
      ex.dictation("بَعْدَ غَدٍ", { answers: ["بعد غد"] }),
      ex.speak("سَأَدْرُسُ الْعَرَبِيَّةَ كُلَّ يَوْمٍ", "Ik zal elke dag Arabisch studeren."),
    ],
    test: [
      test.type("grammar", "Zet in de toekomst met سَـ: يَعْمَلُ", ["سيعمل"]),
      test.type("grammar", "Ontken met لَنْ: سَنَأْكُلُ", ["لن نأكل"]),
      test.mcq("grammar", "Wat betekent لَنْ أَنْسَى?", ["ik zal niet vergeten", "ik vergat niet", "ik vergeet niet"], 0),
      test.type("writing", "Vertaal: Volgende week bezoeken wij onze oma. (toekomst)", ["سنزور جدتنا الأسبوع القادم", "سوف نزور جدتنا الأسبوع القادم", "الأسبوع القادم سنزور جدتنا"]),
      test.speak("لَنْ أَذْهَبَ إِلَى الْعَمَلِ غَدًا", "Ik ga morgen niet naar mijn werk."),
    ],
  } satisfies Lesson;
})();

const l42 = (() => {
  const { ex, test } = builder(42);
  return {
    id: 42, module: M, level: "A2",
    title: "De gebiedende wijs", titleAr: "فِعْلُ الْأَمْرِ",
    goal: "Je geeft opdrachten en verboden aan een man, een vrouw en een groep.",
    minutes: 25, skills: ["grammar", "writing", "listening"],
    sections: [
      {
        title: "Zo maak je de gebiedende wijs",
        body: [
          "Neem de tegenwoordige tijd voor 'jij', haal het voorvoegsel تَـ weg en zet er een hulp-alif voor: تَكْتُبُ → اُكْتُبْ. Als de middelste klinker u is, krijgt de alif een damma (اُ), anders een kasra (اِ): اِجْلِسْ، اِشْرَبْ.",
          "Tegen een vrouw: -ī (اُكْتُبِي). Tegen een groep: -ū (اُكْتُبُوا).",
          "Een verbod: لَا + de verkorte vorm: لَا تَكْتُبْ (schrijf niet), لَا تَتَكَلَّمِي (praat niet, v).",
          "Onregelmatig en veel gebruikt: خُذْ (neem), كُلْ (eet), تَعَالَ (kom).",
        ],
        table: [
          ["Werkwoord", "m", "v", "mv"],
          ["كَتَبَ (schrijven)", "اُكْتُبْ", "اُكْتُبِي", "اُكْتُبُوا"],
          ["جَلَسَ (zitten)", "اِجْلِسْ", "اِجْلِسِي", "اِجْلِسُوا"],
          ["فَتَحَ (openen)", "اِفْتَحْ", "اِفْتَحِي", "اِفْتَحُوا"],
        ],
      },
    ],
    words: [
      w("اُكْتُبْ", "uktub", "schrijf!"),
      w("اِجْلِسْ", "ijlis", "ga zitten!"),
      w("اِفْتَحْ", "iftaḥ", "open!"),
      w("خُذْ", "khudh", "neem!"),
      w("تَعَالَ", "taʿāla", "kom (hier)!"),
      w("يَتَكَلَّمُ", "yatakallamu", "hij praat", "ww. (تَكَلَّمَ)"),
    ],
    exercises: [
      ex.type("grammar", "Gebiedende wijs (m) van تَكْتُبُ:", ["اكتب"]),
      ex.type("grammar", "Gebiedende wijs (m) van تَجْلِسُ:", ["اجلس"]),
      ex.type("grammar", "Gebiedende wijs (v) van تَشْرَبِينَ:", ["اشربي"]),
      ex.type("grammar", "Gebiedende wijs (mv) van تَدْرُسُونَ:", ["ادرسوا"]),
      ex.mcq("grammar", "Hoe zeg je 'schrijf niet!' tegen een man?", ["لَا تَكْتُبْ", "لَا اُكْتُبْ", "لَمْ تَكْتُبْ"], 0),
      ex.mcq("vocabulary", "Wat betekent خُذْ?", ["neem", "kom", "eet"], 0),
      ex.type("writing", "Vertaal: Ga zitten, alsjeblieft. (tegen een man)", ["اجلس من فضلك"]),
      ex.mcq("listening", "Luister. Wat vraagt de spreker?", ["het raam openen", "de deur dichtdoen", "gaan zitten"], 0, { audio: "اِفْتَحِ النَّافِذَةَ مِنْ فَضْلِكَ" }),
      ex.speak("تَعَالَ هُنَا مِنْ فَضْلِكَ", "Kom hier, alsjeblieft."),
    ],
    test: [
      test.type("grammar", "Gebiedende wijs (m) van تَقْرَأُ:", ["اقرأ"]),
      test.type("grammar", "Gebiedende wijs (v) van تَذْهَبِينَ:", ["اذهبي"]),
      test.type("writing", "Vertaal: Praat niet! (tegen een vrouw)", ["لا تتكلمي"]),
      test.mcq("grammar", "Welke vorm gebruik je tegen een groep?", ["اُكْتُبُوا", "اُكْتُبِي", "اُكْتُبْ"], 0),
      test.speak("اِفْتَحِ الْبَابَ مِنْ فَضْلِكَ", "Doe de deur open, alsjeblieft."),
    ],
  } satisfies Lesson;
})();

const l43 = (() => {
  const { ex, test } = builder(43);
  return {
    id: 43, module: M, level: "A2",
    title: "Willen, kunnen, moeten", titleAr: "أَنْ وَالْفِعْلُ الْمُضَارِعُ الْمَنْصُوبُ",
    goal: "Je zegt wat je wilt, kunt, moet en graag doet met أَنْ + werkwoord.",
    minutes: 25, skills: ["grammar", "writing", "speaking"],
    sections: [
      {
        title: "أَنْ + werkwoord",
        body: [
          "Na أَنْ ('om te / dat') staat het werkwoord in de aanvoegende wijs: laatste klinker -a, -ūna → -ū, -īna → -ī.",
          "Veelgebruikt: أُرِيدُ أَنْ (ik wil), أُحِبُّ أَنْ (ik doe graag), أَسْتَطِيعُ أَنْ (ik kan), يَجِبُ أَنْ (het moet), يُمْكِنُ أَنْ (het kan).",
          "In plaats van أَنْ + werkwoord kun je ook een masdar (zelfstandig gebruikt werkwoord) gebruiken: أُحِبُّ الْقِرَاءَةَ (ik lees graag).",
        ],
        examples: [
          { ar: "أُرِيدُ أَنْ أَتَعَلَّمَ الْعَرَبِيَّةَ.", nl: "Ik wil Arabisch leren." },
          { ar: "يَجِبُ أَنْ أَعْمَلَ الْيَوْمَ.", nl: "Ik moet vandaag werken." },
          { ar: "هَلْ يُمْكِنُ أَنْ أَدْخُلَ؟", nl: "Mag ik binnenkomen?" },
          { ar: "يُرِيدُونَ أَنْ يَأْكُلُوا.", nl: "Zij willen eten." },
        ],
      },
    ],
    words: [
      w("أَسْتَطِيعُ", "astaṭīʿu", "ik kan", "ww. (اِسْتَطَاعَ)"),
      w("يَجِبُ", "yajibu", "het moet"),
      w("يُمْكِنُ", "yumkinu", "het is mogelijk, het kan"),
      w("يَدْخُلُ", "yadkhulu", "hij gaat naar binnen", "ww. (دَخَلَ)"),
      w("الْقِرَاءَة", "al-qirāʾa", "het lezen", "masdar"),
      w("أَتَعَلَّمُ", "ataʿallamu", "ik leer", "ww. (تَعَلَّمَ)"),
    ],
    exercises: [
      ex.type("writing", "Vertaal: Ik wil slapen.", ["أريد أن أنام"]),
      ex.type("writing", "Vertaal: Ik moet werken.", ["يجب أن أعمل", "علي أن أعمل"]),
      ex.mcq("grammar", "Welke vorm is correct?", ["أُرِيدُ أَنْ أَذْهَبَ", "أُرِيدُ أَنْ أَذْهَبُ", "أُرِيدُ أَنْ ذَهَبْتُ"], 0),
      ex.mcq("grammar", "Welke vorm is correct?", ["يُرِيدُونَ أَنْ يَأْكُلُوا", "يُرِيدُونَ أَنْ يَأْكُلُونَ"], 0),
      ex.type("writing", "Vertaal: Mag ik binnenkomen? (met يُمْكِنُ)", ["هل يمكن أن أدخل", "هل يمكنني أن أدخل", "يمكن أن أدخل"]),
      ex.type("writing", "Vertaal: Ik kan Arabisch lezen.", ["أستطيع أن أقرأ العربية", "أستطيع قراءة العربية"]),
      ex.order("writing", "Maak de zin: ik drink graag thee.", ["أُحِبُّ", "أَنْ", "أَشْرَبَ", "الشَّايَ"]),
      ex.dictation("أَسْتَطِيعُ"),
      ex.speak("أُرِيدُ أَنْ أَتَعَلَّمَ الْعَرَبِيَّةَ", "Ik wil Arabisch leren."),
    ],
    test: [
      test.type("writing", "Vertaal: Wij willen eten.", ["نريد أن نأكل"]),
      test.type("writing", "Vertaal: Je moet studeren. (m)", ["يجب أن تدرس"]),
      test.mcq("grammar", "Vul in: يُحِبُّ أَنْ ___", ["يَقْرَأَ", "يَقْرَأُ", "قَرَأَ"], 0),
      test.type("writing", "Vertaal: Ik lees graag. (أُحِبُّ + masdar)", ["أحب القراءة"]),
      test.speak("هَلْ يُمْكِنُ أَنْ أَدْخُلَ؟", "Mag ik binnenkomen?"),
    ],
  } satisfies Lesson;
})();

const SHOP: { speaker: string; ar: string; nl: string }[] = [
  { speaker: "Verkoper", ar: "أَهْلًا، كَيْفَ أُسَاعِدُكَ؟", nl: "Hallo, waarmee kan ik u helpen?" },
  { speaker: "Klant", ar: "أُرِيدُ كِيلُو تُفَّاحٍ وَنِصْفَ كِيلُو بَصَلٍ.", nl: "Ik wil een kilo appels en een halve kilo uien." },
  { speaker: "Verkoper", ar: "تَفَضَّلْ. هَلْ تُرِيدُ شَيْئًا آخَرَ؟", nl: "Alstublieft. Wilt u nog iets anders?" },
  { speaker: "Klant", ar: "بِكَمِ الْبُرْتُقَالُ؟", nl: "Hoeveel kosten de sinaasappels?" },
  { speaker: "Verkoper", ar: "الْكِيلُو بِعَشَرَةِ دَرَاهِمَ.", nl: "Tien dirham per kilo." },
  { speaker: "Klant", ar: "هَذَا غَالٍ قَلِيلًا. هَلْ هُنَاكَ تَخْفِيضٌ؟", nl: "Dat is een beetje duur. Is er korting?" },
  { speaker: "Verkoper", ar: "حَسَنًا، ثَمَانِيَةُ دَرَاهِمَ لَكَ.", nl: "Goed, acht dirham voor u." },
  { speaker: "Klant", ar: "شُكْرًا، سَآخُذُ كِيلُو.", nl: "Dank u, ik neem een kilo." },
];

const l44 = (() => {
  const { ex, test } = builder(44);
  const all = SHOP.map((s) => s.ar).join(" ");
  return {
    id: 44, module: M, level: "A2",
    title: "Boodschappen doen", titleAr: "التَّسَوُّقُ",
    goal: "Je koopt iets op de markt, vraagt naar prijzen en onderhandelt.",
    minutes: 25, skills: ["listening", "speaking", "vocabulary", "writing"],
    sections: [
      {
        title: "Op de markt",
        body: ["Luister eerst naar het hele gesprek. Speel daarna elke zin los af. Let op: غَالٍ (duur) verliest zijn ي: het is غَالِي in pauzevorm."],
        examples: SHOP.map((s) => ({ ar: s.ar, nl: `${s.speaker}: ${s.nl}` })),
      },
    ],
    words: [
      w("الْبَائِع", "al-bāʾiʿ", "de verkoper"),
      w("الزَّبُون", "az-zabūn", "de klant"),
      w("بَصَل", "baṣal", "uien"),
      w("نِصْفُ كِيلُو", "niṣfu kīlū", "een halve kilo"),
      w("غَالٍ", "ghālin", "duur"),
      w("رَخِيص", "rakhīṣ", "goedkoop", "bn."),
      w("تَخْفِيض", "takhfīḍ", "korting", "zn. m."),
      w("هُنَاكَ", "hunāka", "daar; er is"),
    ],
    exercises: [
      ex.mcq("listening", "Luister naar het hele gesprek. Wat koopt de klant eerst?", ["appels en uien", "sinaasappels", "tomaten"], 0, { audio: all }),
      ex.mcq("listening", "Luister. Hoeveel kosten de sinaasappels eerst?", ["10 dirham per kilo", "8 dirham per kilo", "18 dirham"], 0, { audio: SHOP[4].ar }),
      ex.mcq("listening", "Luister. Wat is de nieuwe prijs?", ["8 dirham", "10 dirham", "5 dirham"], 0, { audio: SHOP[6].ar }),
      ex.type("writing", "Vertaal: Hoeveel kosten de sinaasappels?", ["بكم البرتقال"]),
      ex.type("writing", "Vertaal: Dit is goedkoop.", ["هذا رخيص"]),
      ex.type("writing", "Vertaal: Ik wil een halve kilo uien.", ["أريد نصف كيلو بصل"]),
      ex.order("writing", "Maak de vraag: is er korting?", ["هَلْ", "هُنَاكَ", "تَخْفِيضٌ"]),
      ex.dictation("كَيْفَ أُسَاعِدُكَ؟", { answers: ["كيف أساعدك"] }),
      ex.mcq("vocabulary", "Wat betekent غَالٍ?", ["duur", "goedkoop", "vers"], 0),
      ex.speak("بِكَمِ الْكِيلُو؟", "Hoeveel kost een kilo?"),
    ],
    test: [
      test.dictation("نِصْفَ كِيلُو", { answers: ["نصف كيلو"] }),
      test.type("writing", "Vertaal: Is er korting?", ["هل هناك تخفيض", "هل يوجد تخفيض"]),
      test.mcq("listening", "Luister. Wat zegt de klant?", ["Dat is een beetje duur.", "Dat is goedkoop.", "Ik neem twee kilo."], 0, { audio: SHOP[5].ar }),
      test.type("writing", "Vertaal: Waarmee kan ik je helpen? (tegen een man)", ["كيف أساعدك", "هل أساعدك", "كيف يمكن أن أساعدك"]),
      test.speak("شُكْرًا، سَآخُذُ كِيلُو", "Dank u, ik neem een kilo."),
    ],
  } satisfies Lesson;
})();

const l45 = (() => {
  const { ex, test } = builder(45);
  return {
    id: 45, module: M, level: "A2",
    title: "De weg vragen en reizen", titleAr: "السُّؤَالُ عَنِ الطَّرِيقِ",
    goal: "Je vraagt de weg, begrijpt een routebeschrijving en koopt een kaartje.",
    minutes: 25, skills: ["listening", "vocabulary", "writing", "speaking"],
    sections: [
      {
        title: "Richtingen",
        body: ["Met عَفْوًا (pardon) begin je beleefd een vraag aan een onbekende."],
        table: [
          ["Arabisch", "Nederlands"],
          ["عَلَى الْيَمِينِ", "rechts"],
          ["عَلَى الْيَسَارِ", "links"],
          ["مُسْتَقِيمًا", "rechtdoor"],
          ["بِجَانِبِ", "naast"],
          ["أَمَامَ", "voor (tegenover)"],
          ["خَلْفَ", "achter"],
        ],
        examples: [
          { ar: "عَفْوًا، أَيْنَ مَحَطَّةُ الْقِطَارِ؟", nl: "Pardon, waar is het treinstation?" },
          { ar: "اِذْهَبْ مُسْتَقِيمًا، ثُمَّ خُذِ الشَّارِعَ الْأَوَّلَ عَلَى الْيَمِينِ.", nl: "Ga rechtdoor en neem dan de eerste straat rechts." },
          { ar: "الْمَحَطَّةُ عَلَى الْيَسَارِ، بِجَانِبِ الْبَنْكِ.", nl: "Het station is links, naast de bank." },
          { ar: "لَيْسَتْ بَعِيدَةً، خَمْسُ دَقَائِقَ مَشْيًا.", nl: "Het is niet ver, vijf minuten lopen." },
        ],
      },
      {
        title: "Op reis",
        body: [],
        examples: [
          { ar: "تَذْكِرَة", nl: "kaartje" },
          { ar: "ذَهَابًا وَإِيَابًا", nl: "retour (heen en terug)" },
          { ar: "الْمَطَار", nl: "het vliegveld" },
          { ar: "الْفُنْدُق", nl: "het hotel" },
          { ar: "جَوَازُ السَّفَرِ", nl: "het paspoort" },
        ],
      },
    ],
    words: [
      w("مَحَطَّة", "maḥaṭṭa", "station", "zn. v."),
      w("قِطَار", "qiṭār", "trein", "zn. m."),
      w("شَارِع", "shāriʿ", "straat", "zn. m., mv. شَوَارِع"),
      w("يَمِين", "yamīn", "rechts"),
      w("يَسَار", "yasār", "links"),
      w("تَذْكِرَة", "tadhkira", "kaartje", "zn. v., mv. تَذَاكِر"),
      w("مَطَار", "maṭār", "vliegveld", "zn. m."),
      w("فُنْدُق", "funduq", "hotel", "zn. m."),
      w("جَوَازُ السَّفَرِ", "jawāzu s-safar", "paspoort"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel de richtingen.", [["عَلَى الْيَمِينِ", "rechts"], ["عَلَى الْيَسَارِ", "links"], ["مُسْتَقِيمًا", "rechtdoor"], ["خَلْفَ", "achter"]]),
      ex.type("writing", "Vertaal: Waar is het station?", ["أين المحطة", "أين محطة القطار"]),
      ex.type("writing", "Vertaal: Ga rechtdoor. (tegen een man)", ["اذهب مستقيما", "امش مستقيما"]),
      ex.mcq("listening", "Luister. Waar moet je heen?", ["tweede straat links", "eerste straat rechts", "rechtdoor"], 0, { audio: "خُذِ الشَّارِعَ الثَّانِيَ عَلَى الْيَسَارِ" }),
      ex.mcq("vocabulary", "Wat betekent تَذْكِرَةٌ ذَهَابًا وَإِيَابًا?", ["een retourtje", "een enkele reis", "een paspoort"], 0),
      ex.dictation("الْمَطَارُ", { answers: ["المطار"] }),
      ex.order("writing", "Maak de zin: ik wil een kaartje naar Rabat.", ["أُرِيدُ", "تَذْكِرَةً", "إِلَى", "الرِّبَاطِ"]),
      ex.mcq("listening", "Luister. Hoe ver is het?", ["vijf minuten lopen", "vijftien minuten met de bus", "heel ver"], 0, { audio: "لَيْسَتْ بَعِيدَةً، خَمْسُ دَقَائِقَ مَشْيًا" }),
      ex.speak("عَفْوًا، أَيْنَ الْفُنْدُقُ؟", "Pardon, waar is het hotel?"),
    ],
    test: [
      test.type("writing", "Vertaal: links", ["على اليسار", "يسار", "اليسار"]),
      test.type("writing", "Vertaal: Is het ver? (het station, v)", ["هل هي بعيدة", "هل المحطة بعيدة"]),
      test.mcq("listening", "Luister. Waar is het station?", ["naast de bank", "achter het hotel", "tegenover de school"], 0, { audio: "الْمَحَطَّةُ بِجَانِبِ الْبَنْكِ" }),
      test.type("writing", "Vertaal: Ik wil een kaartje naar Amsterdam.", ["أريد تذكرة إلى أمستردام"]),
      test.mcq("vocabulary", "Hoe zeg je 'paspoort'?", ["جَوَازُ السَّفَرِ", "تَذْكِرَة", "مَطَار"], 0),
    ],
  } satisfies Lesson;
})();

const l46 = (() => {
  const { ex, test } = builder(46);
  return {
    id: 46, module: M, level: "A2",
    title: "Het tweevoud", titleAr: "الْمُثَنَّى",
    goal: "Je gebruikt het tweevoud bij zelfstandige naamwoorden, bijvoeglijke naamwoorden en werkwoorden.",
    minutes: 20, skills: ["grammar", "writing"],
    sections: [
      {
        title: "Twee van iets",
        body: [
          "Het Arabisch heeft een aparte vorm voor 'twee': -āni als onderwerp, -ayni na een voorzetsel of als lijdend voorwerp. كِتَابٌ → كِتَابَانِ / كِتَابَيْنِ.",
          "Bij ة wordt het -atāni / -atayni: سَيَّارَتَانِ. Een bijvoeglijk naamwoord volgt: وَلَدَانِ صَغِيرَانِ.",
          "Voornaamwoord: هُمَا (zij twee), أَنْتُمَا (jullie twee). Werkwoord: يَكْتُبَانِ (zij twee schrijven), كَتَبَا (zij twee schreven).",
          "In een idafa valt de ن weg: كِتَابَا الطَّالِبِ (de twee boeken van de student).",
        ],
        examples: [
          { ar: "عِنْدِي أُخْتَانِ.", nl: "Ik heb twee zussen." },
          { ar: "سَكَنْتُ فِي مَدِينَتَيْنِ.", nl: "Ik heb in twee steden gewoond." },
          { ar: "هُمَا يَدْرُسَانِ فِي الْجَامِعَةِ.", nl: "Zij (twee) studeren aan de universiteit." },
        ],
      },
    ],
    words: [w("هُمَا", "humā", "zij (twee)", "vnw."), w("أُخْتَانِ", "ukhtāni", "twee zussen"), w("يَوْمَانِ", "yawmāni", "twee dagen")],
    exercises: [
      ex.type("grammar", "Tweevoud (als onderwerp) van كِتَاب:", ["كتابان"]),
      ex.type("grammar", "Tweevoud (als onderwerp) van سَيَّارَة:", ["سيارتان"]),
      ex.mcq("grammar", "Welke vorm na فِي?", ["فِي غُرْفَتَيْنِ", "فِي غُرْفَتَانِ"], 0),
      ex.type("writing", "Vertaal: twee grote huizen (als onderwerp)", ["بيتان كبيران"]),
      ex.mcq("grammar", "Wat betekent هُمَا يَدْرُسَانِ?", ["zij (twee) studeren", "zij (mv.) studeren", "wij studeren"], 0),
      ex.type("grammar", "Vervoeg يَكْتُبُ voor هُمَا:", ["يكتبان"]),
      ex.order("writing", "Maak de zin: ik heb twee nieuwe auto's.", ["عِنْدِي", "سَيَّارَتَانِ", "جَدِيدَتَانِ"]),
      ex.dictation("طَالِبَتَانِ"),
      ex.speak("عِنْدِي أُخْتَانِ وَأَخٌ وَاحِدٌ", "Ik heb twee zussen en één broer."),
    ],
    test: [
      test.type("grammar", "Tweevoud (als onderwerp) van قَلَم:", ["قلمان"]),
      test.type("grammar", "Vul in: مَعَ ___ (met twee leraren, m)", ["مدرسين"]),
      test.mcq("grammar", "Wat betekent كَتَبَا?", ["zij (twee) schreven", "hij schreef", "zij (mv.) schreven"], 0),
      test.type("writing", "Vertaal: twee kleine meisjes (als onderwerp)", ["بنتان صغيرتان"]),
      test.speak("سَكَنْتُ فِي مَدِينَتَيْنِ", "Ik heb in twee steden gewoond."),
    ],
  } satisfies Lesson;
})();

const l47 = (() => {
  const { ex, test } = builder(47);
  return {
    id: 47, module: M, level: "A2",
    title: "Vergelijken: groter, mooist", titleAr: "اسْمُ التَّفْضِيلِ",
    goal: "Je vergelijkt dingen en personen met de vergrotende en overtreffende trap.",
    minutes: 20, skills: ["grammar", "writing", "speaking"],
    sections: [
      {
        title: "Het patroon أَفْعَلُ",
        body: [
          "De vergrotende trap volgt het patroon أَفْعَلُ: كَبِير → أَكْبَرُ. Gebruik مِنْ voor 'dan': أَكْبَرُ مِنْ (groter dan).",
          "Deze vorm verandert niet voor vrouwelijk in een vergelijking: أُخْتِي أَكْبَرُ مِنِّي.",
          "Overtreffende trap: الْأَكْبَرُ (de grootste), of أَفْعَلُ + onbepaald enkelvoud: أَكْبَرُ مَدِينَةٍ (de grootste stad).",
          "Onregelmatig: جَيِّد (goed) → أَحْسَنُ of أَفْضَلُ (beter).",
        ],
        table: [
          ["Basis", "Vergrotend", "Nederlands"],
          ["كَبِير", "أَكْبَرُ", "groter"],
          ["صَغِير", "أَصْغَرُ", "kleiner"],
          ["جَمِيل", "أَجْمَلُ", "mooier"],
          ["طَوِيل", "أَطْوَلُ", "langer"],
          ["سَهْل", "أَسْهَلُ", "makkelijker"],
          ["صَعْب", "أَصْعَبُ", "moeilijker"],
          ["كَثِير", "أَكْثَرُ", "meer"],
        ],
        examples: [
          { ar: "أَمْسْتِرْدَام أَكْبَرُ مِنْ أُوتْرِخْت.", nl: "Amsterdam is groter dan Utrecht." },
          { ar: "هَذِهِ أَجْمَلُ مَدِينَةٍ فِي هُولَنْدَا.", nl: "Dit is de mooiste stad van Nederland." },
          { ar: "أَخِي أَطْوَلُ مِنِّي.", nl: "Mijn broer is langer dan ik." },
        ],
      },
    ],
    words: [w("طَوِيل", "ṭawīl", "lang", "bn."), w("سَهْل", "sahl", "makkelijk", "bn."), w("صَعْب", "ṣaʿb", "moeilijk", "bn."), w("أَفْضَلُ", "afḍalu", "beter, best"), w("مِنِّي", "minnī", "dan ik")],
    exercises: [
      ex.type("grammar", "Vergrotende trap van كَبِير:", ["أكبر"]),
      ex.type("grammar", "Vergrotende trap van صَغِير:", ["أصغر"]),
      ex.type("grammar", "Vergrotende trap van سَهْل:", ["أسهل"]),
      ex.mcq("grammar", "Wat betekent أَطْوَلُ مِنِّي?", ["langer dan ik", "de langste", "lang zoals ik"], 0),
      ex.type("writing", "Vertaal: Amsterdam is groter dan Utrecht.", ["أمستردام أكبر من أوترخت"]),
      ex.mcq("grammar", "Wat is de vergrotende trap van جَيِّد?", ["أَحْسَنُ", "جَيِّدَةٌ", "الْجَيِّدُ"], 0),
      ex.order("writing", "Maak de zin: dit is de mooiste stad in Nederland.", ["هَذِهِ", "أَجْمَلُ", "مَدِينَةٍ", "فِي", "هُولَنْدَا"]),
      ex.type("writing", "Vertaal: Arabisch is moeilijker dan Engels.", ["العربية أصعب من الإنجليزية", "اللغة العربية أصعب من اللغة الإنجليزية", "العربية أصعب من الإنكليزية"]),
      ex.speak("أَخِي أَكْبَرُ مِنِّي", "Mijn broer is ouder (groter) dan ik."),
    ],
    test: [
      test.type("grammar", "Vergrotende trap van جَمِيل:", ["أجمل"]),
      test.type("grammar", "Vergrotende trap van صَعْب:", ["أصعب"]),
      test.mcq("grammar", "Hoe zeg je 'de grootste stad'?", ["أَكْبَرُ مَدِينَةٍ", "مَدِينَةٌ أَكْبَرُ", "الْمَدِينَةُ كَبِيرَةٌ"], 0),
      test.type("writing", "Vertaal: Mijn zus is kleiner dan ik.", ["أختي أصغر مني"]),
      test.speak("الْقِطَارُ أَسْرَعُ مِنَ الْحَافِلَةِ", "De trein is sneller dan de bus."),
    ],
  } satisfies Lesson;
})();

const l48 = (() => {
  const { ex, test } = builder(48);
  return {
    id: 48, module: M, level: "A2",
    title: "Betrekkelijke voornaamwoorden", titleAr: "الِاسْمُ الْمَوْصُولُ",
    goal: "Je verbindt zinnen met 'die' en 'dat' (الَّذِي، الَّتِي، الَّذِينَ).",
    minutes: 25, skills: ["grammar", "writing", "reading"],
    sections: [
      {
        title: "الَّذِي en zijn vormen",
        body: [
          "الَّذِي (m ev.), الَّتِي (v ev., en meervoud van dingen), الَّذِينَ (m mv.). Ze komen alleen na een bepaald woord (met ال of een naam).",
          "Na een onbepaald woord gebruik je géén betrekkelijk voornaamwoord: رَأَيْتُ رَجُلًا يَقْرَأُ (ik zag een man die las).",
          "Als het verwijswoord lijdend voorwerp is, komt er een terugverwijzend voornaamwoord: الْكِتَابُ الَّذِي قَرَأْتُهُ (het boek dat ik (het) las).",
        ],
        examples: [
          { ar: "الرَّجُلُ الَّذِي يَسْكُنُ بِجَانِبِنَا مُدَرِّسٌ.", nl: "De man die naast ons woont, is leraar." },
          { ar: "الْبِنْتُ الَّتِي تَدْرُسُ مَعِي مِنْ مِصْرَ.", nl: "Het meisje dat met mij studeert, komt uit Egypte." },
          { ar: "الطُّلَّابُ الَّذِينَ نَجَحُوا سُعَدَاءُ.", nl: "De studenten die geslaagd zijn, zijn blij." },
          { ar: "هَذَا هُوَ الْكِتَابُ الَّذِي اشْتَرَيْتُهُ.", nl: "Dit is het boek dat ik gekocht heb." },
        ],
      },
    ],
    words: [w("الَّذِي", "alladhī", "die, dat (m)"), w("الَّتِي", "allatī", "die, dat (v)"), w("الَّذِينَ", "alladhīna", "die (m mv.)"), w("نَجَحَ", "najaḥa", "hij slaagde", "ww., ond. tt. يَنْجَحُ"), w("رَأَيْتُ", "raʾaytu", "ik zag", "ww. (رَأَى)")],
    exercises: [
      ex.mcq("grammar", "Vul in: الْبِنْتُ ___ تَدْرُسُ مَعِي", ["الَّتِي", "الَّذِي", "الَّذِينَ"], 0),
      ex.mcq("grammar", "Vul in: الطُّلَّابُ ___ نَجَحُوا", ["الَّذِينَ", "الَّتِي", "الَّذِي"], 0),
      ex.mcq("grammar", "Vul in: الْكُتُبُ ___ قَرَأْتُهَا", ["الَّتِي", "الَّذِينَ", "الَّذِي"], 0, { explain: "Meervoud van dingen → vrouwelijk enkelvoud → الَّتِي." }),
      ex.type("writing", "Vertaal: de man die naast ons woont", ["الرجل الذي يسكن بجانبنا"]),
      ex.type("writing", "Vertaal: het boek dat ik las", ["الكتاب الذي قرأته"]),
      ex.mcq("grammar", "Wanneer gebruik je GEEN الَّذِي?", ["na een onbepaald woord", "na een bepaald woord", "na een naam"], 0),
      ex.order("writing", "Maak de zin: dit is de stad waarin ik woon.", ["هَذِهِ", "هِيَ", "الْمَدِينَةُ", "الَّتِي", "أَسْكُنُ", "فِيهَا"]),
      ex.dictation("الَّذِينَ"),
      ex.speak("الرَّجُلُ الَّذِي يَسْكُنُ بِجَانِبِنَا مُدَرِّسٌ", "De man die naast ons woont, is leraar."),
    ],
    test: [
      test.type("grammar", "Vul in (m ev.): الْقَلَمُ ___ عَلَى الطَّاوِلَةِ لِي", ["الذي"]),
      test.type("writing", "Vertaal: de lerares die Arabisch geeft (تُدَرِّسُ)", ["المدرسة التي تدرس العربية"]),
      test.mcq("grammar", "Welke zin is correct?", ["رَأَيْتُ رَجُلًا يَقْرَأُ", "رَأَيْتُ رَجُلًا الَّذِي يَقْرَأُ"], 0),
      test.type("writing", "Vertaal: de studenten (m) die geslaagd zijn", ["الطلاب الذين نجحوا"]),
      test.speak("هَذَا هُوَ الْكِتَابُ الَّذِي اشْتَرَيْتُهُ", "Dit is het boek dat ik gekocht heb."),
    ],
  } satisfies Lesson;
})();

const l49 = (() => {
  const { ex, test } = builder(49);
  return {
    id: 49, module: M, level: "A2",
    title: "Gezondheid en de dokter", titleAr: "الصِّحَّةُ",
    goal: "Je beschrijft klachten, begrijpt eenvoudig medisch advies en vraagt naar de apotheek.",
    minutes: 25, skills: ["vocabulary", "listening", "speaking", "writing"],
    sections: [
      {
        title: "Het lichaam en klachten",
        body: ["عِنْدِي أَلَمٌ فِي … = ik heb pijn in … / … يُؤْلِمُنِي = … doet me pijn. مُنْذُ = sinds."],
        table: [
          ["Arabisch", "Nederlands"],
          ["رَأْس", "hoofd"],
          ["بَطْن", "buik"],
          ["ظَهْر", "rug"],
          ["حَلْق", "keel"],
          ["أَسْنَان", "tanden"],
          ["صُدَاع", "hoofdpijn"],
          ["حُمَّى", "koorts"],
          ["زُكَام", "verkoudheid"],
        ],
        examples: [
          { ar: "عِنْدِي صُدَاعٌ مُنْذُ ثَلَاثَةِ أَيَّامٍ.", nl: "Ik heb al drie dagen hoofdpijn." },
          { ar: "خُذْ هَذَا الدَّوَاءَ ثَلَاثَ مَرَّاتٍ فِي الْيَوْمِ.", nl: "Neem dit medicijn drie keer per dag." },
          { ar: "سَلَامَتُكَ!", nl: "Beterschap! (tegen een man)" },
        ],
      },
    ],
    words: [
      w("رَأْس", "raʾs", "hoofd", "zn. m."),
      w("ظَهْر", "ẓahr", "rug", "zn. m."),
      w("صُدَاع", "ṣudāʿ", "hoofdpijn", "zn. m."),
      w("أَلَم", "alam", "pijn", "zn. m."),
      w("حُمَّى", "ḥummā", "koorts", "zn. v."),
      w("مَرِيض", "marīḍ", "ziek; patiënt", "bn./zn."),
      w("طَبِيب", "ṭabīb", "dokter", "zn. m."),
      w("دَوَاء", "dawāʾ", "medicijn", "zn. m."),
      w("صَيْدَلِيَّة", "ṣaydaliyya", "apotheek", "zn. v."),
      w("مُنْذُ", "mundhu", "sinds, al"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel het lichaamsdeel.", [["رَأْس", "hoofd"], ["بَطْن", "buik"], ["ظَهْر", "rug"], ["حَلْق", "keel"]]),
      ex.type("writing", "Vertaal: Ik heb hoofdpijn.", ["عندي صداع"]),
      ex.type("writing", "Vertaal: Ik ben ziek. (m)", ["أنا مريض"]),
      ex.mcq("listening", "Luister. Wat is de klacht?", ["koorts, sinds twee dagen", "buikpijn, sinds gisteren", "keelpijn, sinds een week"], 0, { audio: "عِنْدِي حُمَّى مُنْذُ يَوْمَيْنِ" }),
      ex.mcq("vocabulary", "Wat zeg je tegen een zieke man?", ["سَلَامَتُكَ", "مَعَ السَّلَامَةِ", "صَبَاحُ الْخَيْرِ"], 0),
      ex.type("writing", "Vertaal: Ik heb pijn in mijn rug.", ["عندي ألم في ظهري"]),
      ex.order("writing", "Maak de zin: neem dit medicijn drie keer per dag.", ["خُذْ", "هَذَا", "الدَّوَاءَ", "ثَلَاثَ", "مَرَّاتٍ", "فِي", "الْيَوْمِ"]),
      ex.dictation("صَيْدَلِيَّة"),
      ex.speak("أَشْعُرُ بِالتَّعَبِ", "Ik voel me moe."),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'medicijn'?", ["دواء"]),
      test.type("writing", "Vertaal: sinds drie dagen", ["منذ ثلاثة أيام"]),
      test.mcq("vocabulary", "Wat betekent رَأْسِي يُؤْلِمُنِي?", ["mijn hoofd doet pijn", "mijn rug doet pijn", "ik heb koorts"], 0),
      test.type("writing", "Vertaal: Waar is de apotheek?", ["أين الصيدلية"]),
      test.speak("عِنْدِي أَلَمٌ فِي حَلْقِي", "Ik heb keelpijn."),
    ],
  } satisfies Lesson;
})();

const l50 = (() => {
  const { ex, test } = builder(50);
  const passage = joinPassage(MOROCCO_TRIP);
  return {
    id: 50, module: M, level: "A2",
    title: "Niveautoets A2", titleAr: "اخْتِبَارُ الْمُسْتَوَى A2",
    goal: "Je laat zien dat je A2 beheerst: verleden en toekomst, gebiedende wijs, tweevoud, vergelijken, betrekkelijke zinnen en dagelijkse situaties.",
    minutes: 35, skills: ["reading", "grammar", "writing", "listening", "speaking"],
    sections: [{ title: "Leestekst: een reis naar Marokko", body: [passage, "Lees de tekst eerst met harakat, daarna zonder (knop rechtsboven)."] }],
    words: [w("رَكِبَ", "rakiba", "hij stapte in (vervoer)", "ww."), w("هَدِيَّة", "hadiyya", "cadeau", "zn. v., mv. هَدَايَا"), w("مَطْعَم", "maṭʿam", "restaurant", "zn. m."), w("لَذِيذ", "ladhīdh", "lekker", "bn."), w("حَارّ", "ḥārr", "heet, warm", "bn.")],
    exercises: [
      ex.mcq("reading", "Hoe reisde de familie naar Marokko?", ["met het vliegtuig", "met de auto", "met de boot"], 0, { passage }),
      ex.mcq("reading", "Wat kochten ze op de markten?", ["cadeaus voor vrienden", "kleding voor zichzelf", "eten"], 0, { passage }),
      ex.mcq("reading", "Welke steden bezoeken ze volgend jaar?", ["Rabat en Tanger", "Marrakesh en Fes", "Casablanca"], 0, { passage }),
      ex.type("writing", "Vertaal: Het was erg warm.", ["كان الجو حارا جدا", "كان الطقس حارا جدا"]),
      ex.type("grammar", "Zet in de toekomst: نَزُورُ", ["سنزور"]),
      ex.type("writing", "Vertaal: Het eten was lekker.", ["كان الطعام لذيذا", "كان الأكل لذيذا"]),
      ex.speak("زُرْنَا الْأَسْوَاقَ الْقَدِيمَةَ", "We bezochten de oude markten."),
    ],
    test: [
      test.type("grammar", "Gebiedende wijs (m) van تَشْرَبُ:", ["اشرب"]),
      test.type("writing", "Vertaal: Ik zal morgen niet gaan. (met لَنْ)", ["لن أذهب غدا"]),
      test.type("writing", "Vertaal: Ik wil Arabisch leren.", ["أريد أن أتعلم العربية", "أريد أن أتعلم اللغة العربية"]),
      test.type("grammar", "Tweevoud (als onderwerp) van بِنْت:", ["بنتان"]),
      test.type("writing", "Vertaal: De trein is sneller dan de bus.", ["القطار أسرع من الحافلة"]),
      test.mcq("grammar", "Vul in: الْمَدِينَةُ ___ زُرْنَاهَا جَمِيلَةٌ", ["الَّتِي", "الَّذِي", "الَّذِينَ"], 0),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["We aten in een klein restaurant.", "We kochten een klein restaurant.", "Het restaurant was groot."], 0, { promptAr: "أكلنا في مطعم صغير" }),
      test.mcq("listening", "Luister. Wat is het probleem?", ["hoofdpijn sinds gisteren", "koorts sinds een week", "buikpijn"], 0, { audio: "عِنْدِي صُدَاعٌ مُنْذُ أَمْسِ" }),
      test.type("writing", "Vertaal: Waar is het hotel?", ["أين الفندق"]),
      test.speak("فِي السَّنَةِ الْقَادِمَةِ سَأُسَافِرُ إِلَى مِصْرَ", "Volgend jaar reis ik naar Egypte."),
    ],
  } satisfies Lesson;
})();

export const a2Lessons: Lesson[] = [l41, l42, l43, l44, l45, l46, l47, l48, l49, l50];
