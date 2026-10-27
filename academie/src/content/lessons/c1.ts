// Lessen 65–70: C1 (vergevorderd). Academisch schrijven, stijl, spreekwoorden, discussie, lange teksten.
import type { Lesson } from "../types";
import { AI_DEBATE, ARABIC_LANGUAGE, joinPassage, STUDY_ABSTRACT } from "../passages";
import { builder, w } from "./helpers";

const M = "C1 Vergevorderd";

const l65 = (() => {
  const { ex, test } = builder(65);
  const passage = joinPassage(STUDY_ABSTRACT);
  return {
    id: 65, module: M, level: "C1",
    title: "Academisch schrijven", titleAr: "الْكِتَابَةُ الْأَكَادِيمِيَّةُ",
    goal: "Je structureert een betoog of verslag en gebruikt formele verbindingswoorden; je herkent dialect dat niet in formele tekst hoort.",
    minutes: 35, skills: ["writing", "reading_unvowelled", "vocabulary"],
    sections: [
      {
        title: "Structuur en register",
        body: [
          "Een academische tekst heeft een inleiding (مُقَدِّمَة), een kern (عَرْض) en een slot (خَاتِمَة).",
          "Formeel Arabisch gebruikt vaak de masdar en de lijdende vorm, en vermijdt dialectwoorden. 'Ik ga schrijven' is in het Levantijnse dialect رَاحْ أَكْتُبْ; in Modern Standaardarabisch is het سَأَكْتُبُ.",
          "Oefen daarna in Schrijven → Vrij schrijven met een eigen essay; de AI-correctie let ook op register.",
        ],
        table: [
          ["Arabisch", "Nederlands"],
          ["تَهْدِفُ هَذِهِ الدِّرَاسَةُ إِلَى", "dit onderzoek heeft tot doel"],
          ["أَوَّلًا … ثَانِيًا …", "ten eerste … ten tweede …"],
          ["عِلَاوَةً عَلَى ذَلِكَ", "bovendien"],
          ["فِي الْمُقَابِلِ", "daarentegen"],
          ["تَجْدُرُ الْإِشَارَةُ إِلَى أَنَّ", "het verdient vermelding dat"],
          ["يَتَّضِحُ مِمَّا سَبَقَ أَنَّ", "uit het voorgaande blijkt dat"],
          ["فِي الْخِتَامِ", "tot slot"],
        ],
      },
      { title: "Voorbeeld: samenvatting van een onderzoek (zonder harakat)", body: [passage] },
    ],
    words: [
      w("مُقَدِّمَة", "muqaddima", "inleiding", "zn. v."),
      w("خَاتِمَة", "khātima", "slot, conclusie", "zn. v."),
      w("دِرَاسَة", "dirāsa", "studie, onderzoek", "zn. v."),
      w("نَتِيجَة", "natīja", "resultaat", "zn. v., mv. نَتَائِج"),
      w("تَحْلِيل", "taḥlīl", "analyse", "masdar II"),
      w("أَثَر", "athar", "invloed, effect", "zn. m."),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel de formele uitdrukkingen.", [["فِي الْخِتَامِ", "tot slot"], ["عِلَاوَةً عَلَى ذَلِكَ", "bovendien"], ["فِي الْمُقَابِلِ", "daarentegen"], ["أَوَّلًا", "ten eerste"]]),
      ex.type("writing", "Vertaal: Tot slot", ["في الختام", "ختاما", "وفي الختام"]),
      ex.type("writing", "Vertaal: Bovendien", ["علاوة على ذلك", "إضافة إلى ذلك"]),
      ex.mcq("writing", "Welke zin past in een academische inleiding?", ["تَهْدِفُ هَذِهِ الدِّرَاسَةُ إِلَى تَحْلِيلِ الْمُشْكِلَةِ", "رَاحْ أَكْتُبْ عَنِ الْمُشْكِلَةِ", "شُو رَأْيَكْ بِالْمُشْكِلَةِ؟"], 0, { explain: "De andere twee zinnen zijn dialect (Levantijns)." }),
      ex.mcq("vocabulary", "Welk woord is dialect en hoort niet in formele tekst?", ["رَاحْ (zal)", "سَوْفَ", "سَـ"], 0),
      ex.type("writing", "Vertaal: Uit het voorgaande blijkt dat…", ["يتضح مما سبق أن"]),
      ex.mcq("reading_unvowelled", "Hoeveel studenten namen deel aan het onderzoek?", ["200", "300", "2000"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Welke vaardigheid verbetert door sociale media?", ["luisteren", "schrijven", "spreken"], 0, { passage }),
      ex.order("writing", "Maak de formule: het verdient vermelding dat…", ["تَجْدُرُ", "الْإِشَارَةُ", "إِلَى", "أَنَّ"]),
      ex.speak("فِي الْخِتَامِ، يُمْكِنُ الْقَوْلُ إِنَّ التَّعْلِيمَ أَسَاسُ التَّقَدُّمِ", "Tot slot kan men stellen dat onderwijs de basis van vooruitgang is."),
    ],
    test: [
      test.type("writing", "Vertaal: daarentegen", ["في المقابل", "بالمقابل", "على العكس"]),
      test.type("writing", "Vertaal: Dit onderzoek heeft tot doel…", ["تهدف هذه الدراسة إلى"]),
      test.mcq("reading_unvowelled", "Is er een duidelijk effect op schrijven?", ["nee", "ja, positief", "ja, negatief"], 0, { passage }),
      test.mcq("writing", "Wat is de Arabische term voor 'conclusie / slot'?", ["خَاتِمَة", "مُقَدِّمَة", "عَرْض"], 0),
      test.speak("تَهْدِفُ هَذِهِ الدِّرَاسَةُ إِلَى تَحْلِيلِ أَثَرِ التِّكْنُولُوجْيَا", "Dit onderzoek heeft tot doel de invloed van technologie te analyseren."),
    ],
  } satisfies Lesson;
})();

const l66 = (() => {
  const { ex, test } = builder(66);
  return {
    id: 66, module: M, level: "C1",
    title: "Stijl en retoriek", titleAr: "الْبَلَاغَةُ",
    goal: "Je herkent de belangrijkste stijlfiguren van de Arabische retoriek: vergelijking, metafoor, tegenstelling en rijm.",
    minutes: 30, skills: ["reading", "vocabulary", "writing"],
    sections: [
      {
        title: "Vier stijlfiguren",
        body: [
          "تَشْبِيه (vergelijking) met كَـ، مِثْلَ of كَأَنَّ: الْعِلْمُ كَالنُّورِ (kennis is als licht).",
          "اِسْتِعَارَة (metafoor): een vergelijking zonder vergelijkingswoord: رَأَيْتُ أَسَدًا يَخْطُبُ (ik zag een leeuw een toespraak houden = een dappere man).",
          "طِبَاق (tegenstelling): twee tegengestelde woorden samen: اللَّيْلُ وَالنَّهَارُ، الْغِنَى وَالْفَقْرُ.",
          "سَجْع (rijmend proza): zinsdelen die op dezelfde klank eindigen: مَنْ جَدَّ وَجَدَ، وَمَنْ زَرَعَ حَصَدَ.",
          "كِنَايَة (omschrijving): iets indirect zeggen: هُوَ كَثِيرُ الرَّمَادِ (hij heeft veel as = hij is gastvrij, kookt veel voor gasten).",
        ],
      },
    ],
    words: [w("تَشْبِيه", "tashbīh", "vergelijking"), w("اِسْتِعَارَة", "istiʿāra", "metafoor"), w("طِبَاق", "ṭibāq", "tegenstelling"), w("سَجْع", "sajʿ", "rijmend proza"), w("كِنَايَة", "kināya", "omschrijving"), w("الْفَقْر", "al-faqr", "armoede"), w("الْغِنَى", "al-ghinā", "rijkdom")],
    exercises: [
      ex.mcq("reading", "Welke stijlfiguur is الْعِلْمُ كَالنُّورِ?", ["تَشْبِيه (vergelijking)", "طِبَاق (tegenstelling)", "سَجْع (rijm)"], 0),
      ex.mcq("reading", "Welke stijlfiguur is اللَّيْلُ وَالنَّهَارُ?", ["طِبَاق", "تَشْبِيه", "كِنَايَة"], 0),
      ex.mcq("reading", "Welke stijlfiguur is مَنْ جَدَّ وَجَدَ، وَمَنْ زَرَعَ حَصَدَ?", ["سَجْع", "اِسْتِعَارَة", "تَشْبِيه"], 0),
      ex.mcq("reading", "Wat betekent رَأَيْتُ أَسَدًا يَخْطُبُ figuurlijk?", ["een dappere man hield een toespraak", "een leeuw brulde", "ik zag een leeuw in de dierentuin"], 0),
      ex.type("writing", "Maak een vergelijking met كَـ: 'De leraar is als een vader.'", ["المعلم كالأب", "المدرس كالأب", "المعلم مثل الأب", "المدرس مثل الأب"]),
      ex.type("vocabulary", "Geef het tegendeel (طِبَاق) van النَّهَار:", ["الليل"]),
      ex.match("vocabulary", "Koppel de termen.", [["تَشْبِيه", "vergelijking"], ["اِسْتِعَارَة", "metafoor"], ["طِبَاق", "tegenstelling"], ["سَجْع", "rijmend proza"]]),
      ex.order("reading", "Zet het spreekwoord in de juiste volgorde.", ["مَنْ", "جَدَّ", "وَجَدَ"]),
      ex.speak("مَنْ جَدَّ وَجَدَ، وَمَنْ زَرَعَ حَصَدَ", "Wie zich inspant, vindt; wie zaait, oogst."),
    ],
    test: [
      test.mcq("reading", "Welke stijlfiguur is كَأَنَّ وَجْهَهَا الْقَمَرُ?", ["تَشْبِيه", "طِبَاق", "سَجْع"], 0),
      test.type("vocabulary", "Geef het tegendeel van الْغِنَى:", ["الفقر"]),
      test.mcq("reading", "Wat is een كِنَايَة?", ["iets indirect omschrijven", "een rijm", "een tegenstelling"], 0),
      test.mcq("reading", "Welke stijlfiguur gebruikt geen vergelijkingswoord?", ["اِسْتِعَارَة", "تَشْبِيه"], 0),
      test.speak("الْعِلْمُ كَالنُّورِ", "Kennis is als licht."),
    ],
  } satisfies Lesson;
})();

const l67 = (() => {
  const { ex, test } = builder(67);
  return {
    id: 67, module: M, level: "C1",
    title: "Spreekwoorden en klassieke uitdrukkingen", titleAr: "الْأَمْثَالُ وَالْحِكَمُ",
    goal: "Je kent bekende Arabische spreekwoorden en een klassieke dichtregel, en gebruikt ze op het juiste moment.",
    minutes: 30, skills: ["vocabulary", "reading", "speaking"],
    sections: [
      {
        title: "Spreekwoorden",
        body: ["Deze spreekwoorden zijn algemeen bekend in de Arabische wereld en worden in Modern Standaardarabisch geciteerd."],
        table: [
          ["Arabisch", "Betekenis"],
          ["الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ", "Tijd is als een zwaard: als jij hem niet snijdt, snijdt hij jou."],
          ["مَنْ جَدَّ وَجَدَ", "Wie zich inspant, bereikt iets."],
          ["الصَّبْرُ مِفْتَاحُ الْفَرَجِ", "Geduld is de sleutel tot verlichting."],
          ["خَيْرُ الْكَلَامِ مَا قَلَّ وَدَلَّ", "De beste woorden zijn kort en veelzeggend."],
          ["لِكُلِّ جَوَادٍ كَبْوَةٌ", "Elk paard struikelt wel eens. (Iedereen maakt fouten.)"],
          ["فِي التَّأَنِّي السَّلَامَةُ وَفِي الْعَجَلَةِ النَّدَامَةُ", "In kalmte ligt veiligheid, in haast spijt."],
          ["رُبَّ أَخٍ لَكَ لَمْ تَلِدْهُ أُمُّكَ", "Menig broer is niet uit je moeder geboren. (Een vriend als een broer.)"],
        ],
      },
      {
        title: "Een beroemde dichtregel (al-Mutanabbī, 10e eeuw)",
        body: [
          "الْخَيْلُ وَاللَّيْلُ وَالْبَيْدَاءُ تَعْرِفُنِي ✦ وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطَاسُ وَالْقَلَمُ",
          "'De paarden, de nacht en de woestijn kennen mij, en het zwaard, de lans, het perkament en de pen.' De dichter roemt zichzelf als strijder én schrijver.",
        ],
      },
    ],
    words: [w("مَثَل", "mathal", "spreekwoord", "zn. m., mv. أَمْثَال"), w("الصَّبْر", "aṣ-ṣabr", "geduld"), w("الْفَرَج", "al-faraj", "verlichting, uitkomst"), w("جَوَاد", "jawād", "(edel) paard"), w("كَبْوَة", "kabwa", "struikeling"), w("النَّدَامَة", "an-nadāma", "spijt"), w("الْعَجَلَة", "al-ʿajala", "haast")],
    exercises: [
      ex.match("vocabulary", "Koppel spreekwoord en betekenis.", [
        ["مَنْ جَدَّ وَجَدَ", "inspanning loont"],
        ["الصَّبْرُ مِفْتَاحُ الْفَرَجِ", "geduld brengt uitkomst"],
        ["لِكُلِّ جَوَادٍ كَبْوَةٌ", "iedereen maakt fouten"],
      ]),
      ex.type("vocabulary", "Maak af: مَنْ جَدَّ ___", ["وجد"]),
      ex.type("vocabulary", "Maak af: الصَّبْرُ مِفْتَاحُ ___", ["الفرج"]),
      ex.mcq("vocabulary", "Welk spreekwoord past bij 'haastige spoed is zelden goed'?", ["فِي التَّأَنِّي السَّلَامَةُ وَفِي الْعَجَلَةِ النَّدَامَةُ", "مَنْ جَدَّ وَجَدَ", "خَيْرُ الْكَلَامِ مَا قَلَّ وَدَلَّ"], 0),
      ex.mcq("vocabulary", "Een vriend maakt een fout op zijn werk. Wat zeg je troostend?", ["لِكُلِّ جَوَادٍ كَبْوَةٌ", "الْوَقْتُ كَالسَّيْفِ", "مَنْ جَدَّ وَجَدَ"], 0),
      ex.mcq("reading", "Waarover gaat de dichtregel van al-Mutanabbī?", ["hij roemt zichzelf als strijder en schrijver", "hij klaagt over de nacht", "hij beschrijft een reis door de stad"], 0),
      ex.order("reading", "Zet het spreekwoord in de juiste volgorde.", ["الصَّبْرُ", "مِفْتَاحُ", "الْفَرَجِ"]),
      ex.speak("الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ", "Tijd is als een zwaard: als jij hem niet snijdt, snijdt hij jou."),
    ],
    test: [
      test.type("vocabulary", "Maak af: لِكُلِّ جَوَادٍ ___", ["كبوة"]),
      test.type("vocabulary", "Maak af: خَيْرُ الْكَلَامِ مَا قَلَّ ___", ["ودل"]),
      test.mcq("vocabulary", "Wat betekent رُبَّ أَخٍ لَكَ لَمْ تَلِدْهُ أُمُّكَ?", ["een goede vriend is als een broer", "je broer is je beste vriend", "je moeder heeft veel kinderen"], 0),
      test.mcq("vocabulary", "Wat betekent الصَّبْر?", ["geduld", "haast", "spijt"], 0),
      test.speak("الْخَيْلُ وَاللَّيْلُ وَالْبَيْدَاءُ تَعْرِفُنِي", "De paarden, de nacht en de woestijn kennen mij."),
    ],
  } satisfies Lesson;
})();

const l68 = (() => {
  const { ex, test } = builder(68);
  const passage = joinPassage(AI_DEBATE);
  return {
    id: 68, module: M, level: "C1",
    title: "Discussiëren over actuele onderwerpen", titleAr: "النِّقَاشُ فِي الْقَضَايَا الْمُعَاصِرَةِ",
    goal: "Je discussieert over klimaat en technologie met precieze woordenschat en beleefde tegenargumenten.",
    minutes: 35, skills: ["speaking", "vocabulary", "reading_unvowelled", "writing"],
    sections: [
      {
        title: "Woordenschat",
        body: [],
        table: [
          ["Arabisch", "Nederlands"],
          ["تَغَيُّرُ الْمُنَاخِ", "klimaatverandering"],
          ["الطَّاقَةُ الْمُتَجَدِّدَةُ", "hernieuwbare energie"],
          ["الذَّكَاءُ الِاصْطِنَاعِيُّ", "kunstmatige intelligentie"],
          ["وَسَائِلُ التَّوَاصُلِ الِاجْتِمَاعِيِّ", "sociale media"],
          ["الْخُصُوصِيَّةُ", "privacy"],
          ["التَّنْمِيَةُ الْمُسْتَدَامَةُ", "duurzame ontwikkeling"],
          ["الْإِيجَابِيَّاتُ وَالسَّلْبِيَّاتُ", "voor- en nadelen"],
        ],
      },
      {
        title: "Discussiëren",
        body: [],
        examples: [
          { ar: "هَذَا صَحِيحٌ إِلَى حَدٍّ مَا، لَكِنْ…", nl: "Dat klopt tot op zekere hoogte, maar…" },
          { ar: "أَوَدُّ أَنْ أُضِيفَ أَنَّ…", nl: "Ik wil graag toevoegen dat…" },
          { ar: "مَا الدَّلِيلُ عَلَى ذَلِكَ؟", nl: "Wat is het bewijs daarvoor?" },
          { ar: "لَا يُمْكِنُ إِنْكَارُ أَنَّ…", nl: "Het valt niet te ontkennen dat…" },
        ],
      },
      { title: "Leestekst (zonder harakat)", body: [passage] },
    ],
    words: [
      w("تَغَيُّرُ الْمُنَاخِ", "taghayyuru l-munākh", "klimaatverandering"),
      w("الطَّاقَةُ الْمُتَجَدِّدَةُ", "aṭ-ṭāqa l-mutajaddida", "hernieuwbare energie"),
      w("الذَّكَاءُ الِاصْطِنَاعِيُّ", "adh-dhakāʾ l-iṣṭināʿiyy", "kunstmatige intelligentie"),
      w("الْخُصُوصِيَّة", "al-khuṣūṣiyya", "privacy"),
      w("خَبِير", "khabīr", "expert", "zn. m., mv. خُبَرَاء"),
      w("قَانُون", "qānūn", "wet", "zn. m., mv. قَوَانِين"),
      w("دَلِيل", "dalīl", "bewijs; gids", "zn. m."),
    ],
    exercises: [
      ex.mcq("reading_unvowelled", "Wat vrezen sommige mensen volgens de tekst?", ["dat AI miljoenen werknemers vervangt", "dat AI te duur is", "dat er geen experts zijn"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Waartoe roepen velen op?", ["wetten voor privacy en verantwoord gebruik", "een verbod op AI", "meer banen in de techniek"], 0, { passage }),
      ex.type("writing", "Vertaal: klimaatverandering", ["تغير المناخ"]),
      ex.type("writing", "Vertaal: kunstmatige intelligentie", ["الذكاء الاصطناعي"]),
      ex.type("writing", "Vertaal: Dat klopt tot op zekere hoogte.", ["هذا صحيح إلى حد ما"]),
      ex.mcq("vocabulary", "Wat betekent مَا الدَّلِيلُ عَلَى ذَلِكَ؟", ["Wat is het bewijs daarvoor?", "Wat is de oplossing?", "Waar is de gids?"], 0),
      ex.order("writing", "Maak de zin: het valt niet te ontkennen dat…", ["لَا", "يُمْكِنُ", "إِنْكَارُ", "أَنَّ"]),
      ex.match("vocabulary", "Koppel de begrippen.", [["الْخُصُوصِيَّةُ", "privacy"], ["الطَّاقَةُ الْمُتَجَدِّدَةُ", "hernieuwbare energie"], ["التَّنْمِيَةُ الْمُسْتَدَامَةُ", "duurzame ontwikkeling"]]),
      ex.speak("أَوَدُّ أَنْ أُضِيفَ أَنَّ الطَّاقَةَ الْمُتَجَدِّدَةَ ضَرُورِيَّةٌ", "Ik wil graag toevoegen dat hernieuwbare energie noodzakelijk is."),
    ],
    test: [
      test.type("writing", "Vertaal: hernieuwbare energie", ["الطاقة المتجددة"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Deze technologie verandert onze manier van werken snel.", "Deze technologie werkt langzaam.", "Wij veranderen de technologie."], 0, { promptAr: "هذه التكنولوجيا تغير طريقة عملنا بسرعة" }),
      test.type("writing", "Vertaal: voor- en nadelen", ["الإيجابيات والسلبيات"]),
      test.type("writing", "Vertaal: Ik wil graag toevoegen dat…", ["أود أن أضيف أن"]),
      test.speak("لَا يُمْكِنُ إِنْكَارُ أَنَّ الْمُنَاخَ يَتَغَيَّرُ", "Het valt niet te ontkennen dat het klimaat verandert."),
    ],
  } satisfies Lesson;
})();

const l69 = (() => {
  const { ex, test } = builder(69);
  const passage = joinPassage(ARABIC_LANGUAGE);
  return {
    id: 69, module: M, level: "C1",
    title: "Lange teksten zonder harakat", titleAr: "قِرَاءَةُ النُّصُوصِ الطَّوِيلَةِ",
    goal: "Je leest een lange informatieve tekst zonder harakat en zonder vertaling, en vat hem samen.",
    minutes: 35, skills: ["reading_unvowelled", "vocabulary", "writing", "speaking"],
    sections: [
      {
        title: "Strategie",
        body: [
          "1. Lees de tekst één keer helemaal, zonder te stoppen. 2. Zoek de werkwoorden en hun onderwerp. 3. Herken wortels van onbekende woorden. 4. Lees daarna hardop en kies bewust de naamvalsuitgangen.",
          "Gebruik tik-op-woord alleen als je na twee keer lezen nog vastzit.",
        ],
      },
      { title: "Tekst", body: [passage] },
    ],
    words: [w("اِنْتِشَار", "intishār", "verspreiding", "masdar VIII"), w("لَهْجَة", "lahja", "dialect", "zn. v., mv. لَهَجَات"), w("الْفُصْحَى", "al-fuṣḥā", "het standaardarabisch"), w("تَشْكِيل", "tashkīl", "vocalisatie (harakat)", "masdar II"), w("تَحَدٍّ", "taḥaddin", "uitdaging", "zn. m., mv. تَحَدِّيَات"), w("مُمَارَسَة", "mumārasa", "oefening, praktijk", "masdar III")],
    exercises: [
      ex.mcq("reading_unvowelled", "Hoeveel mensen spreken Arabisch volgens de tekst?", ["meer dan 300 miljoen", "ongeveer 20 miljoen", "meer dan een miljard"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Bij hoeveel VN-talen hoort Arabisch?", ["een van de zes officiële talen", "een van de twee", "het is geen VN-taal"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat is de rol van de fuṣḥā?", ["taal van schrijven, media en onderwijs", "alleen de taal van poëzie", "een lokaal dialect"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat is de grootste uitdaging voor leerders?", ["teksten lezen zonder klinkertekens", "de uitspraak van ʿayn", "het alfabet"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat helpt volgens de schrijver?", ["regelmatig oefenen", "dialecten vermijden", "alleen met harakat lezen"], 0, { passage }),
      ex.nl("vocabulary", "Wat betekent تشكيل? (in het Nederlands)", ["klinkertekens", "vocalisatie", "harakat", "tashkeel"]),
      ex.type("writing", "Vertaal: officiële taal", ["لغة رسمية"]),
      ex.type("writing", "Vertaal: lokale dialecten", ["اللهجات المحلية", "لهجات محلية"]),
      ex.speak("تَبْقَى الْفُصْحَى لُغَةَ الْكِتَابَةِ وَالْإِعْلَامِ وَالتَّعْلِيمِ", "Het standaardarabisch blijft de taal van schrijven, media en onderwijs."),
    ],
    test: [
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Regelmatig oefenen maakt deze vaardigheid mogelijk.", "Deze vaardigheid is onmogelijk.", "Oefenen kost veel tijd."], 0, { promptAr: "الممارسة المنتظمة تجعل هذه المهارة ممكنة" }),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De fuṣḥā is een brug tussen de Arabische volkeren.", "De dialecten verbinden de volkeren.", "Er zijn veel bruggen in Arabische landen."], 0, { promptAr: "الفصحى جسر يربط بين الشعوب العربية" }),
      test.type("writing", "Vertaal: Ondanks de verscheidenheid aan dialecten…", ["على الرغم من تنوع اللهجات", "بالرغم من تنوع اللهجات", "رغم تنوع اللهجات"]),
      test.type("vocabulary", "Hoe zeg je 'uitdagingen'?", ["تحديات"]),
      test.speak("وَيُوَاجِهُ مُتَعَلِّمُو الْعَرَبِيَّةِ تَحَدِّيَاتٍ عِدَّةً", "Leerders van het Arabisch staan voor verschillende uitdagingen."),
    ],
  } satisfies Lesson;
})();

const l70 = (() => {
  const { ex, test } = builder(70);
  return {
    id: 70, module: M, level: "C1",
    title: "Niveautoets C1", titleAr: "اخْتِبَارُ الْمُسْتَوَى C1",
    goal: "Je laat zien dat je C1 beheerst: lange teksten zonder harakat, formeel schrijven, stijl en discussie.",
    minutes: 45, skills: ["reading_unvowelled", "writing", "grammar", "speaking", "vocabulary"],
    sections: [
      {
        title: "Laatste stap van het curriculum",
        body: [
          "Deze toets combineert alles. Bij de vertaalopdrachten zijn meerdere formuleringen goed; laat bij twijfel de AI beoordelen (indien geconfigureerd).",
          "Na deze toets: lees elke dag een Arabisch nieuwsartikel zonder harakat en voer wekelijks een vrij gesprek met de AI-docent.",
        ],
      },
    ],
    words: [w("مُعَاصِر", "muʿāṣir", "hedendaags", "bn."), w("قَضِيَّة", "qaḍiyya", "kwestie, zaak", "zn. v., mv. قَضَايَا")],
    exercises: [
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Er wordt verwacht dat de prijzen volgend jaar stijgen.", "De prijzen zijn vorig jaar gedaald.", "Hij verwacht een nieuw jaar."], 0, { promptAr: "يتوقع أن ترتفع الأسعار في العام المقبل" }),
      ex.type("writing", "Vertaal: Het verdient vermelding dat het onderzoek klein was.", ["تجدر الإشارة إلى أن الدراسة كانت صغيرة"]),
      ex.type("writing", "Vertaal: Als de regering zou investeren, zouden de jongeren blijven.", ["لو استثمرت الحكومة لبقي الشباب"]),
      ex.mcq("reading", "Welke stijlfiguur is الْحَيَاةُ رِحْلَةٌ? (het leven is een reis)", ["تَشْبِيه بَلِيغ (vergelijking zonder vergelijkingswoord)", "طِبَاق", "سَجْع"], 0),
      ex.type("vocabulary", "Maak af: الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ ___", ["قطعك"]),
      ex.speak("هَذَا صَحِيحٌ إِلَى حَدٍّ مَا، لَكِنَّ الْمَسْأَلَةَ أَعْقَدُ مِنْ ذَلِكَ", "Dat klopt tot op zekere hoogte, maar de kwestie is complexer dan dat."),
    ],
    test: [
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Het onderzoek wijst erop dat lezen het geheugen verbetert.", "Het geheugen helpt bij lezen.", "Lezen is slecht voor het geheugen."], 0, { promptAr: "تشير الدراسة إلى أن القراءة تحسن الذاكرة" }),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ondanks de kritiek werd het project voortgezet.", "Door de kritiek werd het project gestopt.", "Het project kreeg geen kritiek."], 0, { promptAr: "على الرغم من الانتقادات، تم استكمال المشروع" }),
      test.type("writing", "Vertaal: Uit het voorgaande blijkt dat onderwijs belangrijk is.", ["يتضح مما سبق أن التعليم مهم"]),
      test.type("writing", "Vertaal: Tot slot kan men zeggen dat…", ["في الختام يمكن القول إن", "ختاما يمكن القول إن"]),
      test.type("grammar", "Lijdende vorm (tegenwoordig, هُوَ) van يَقُولُ, mét harakat:", ["يُقَالُ"], { requireHarakat: true }),
      test.mcq("grammar", "Vul in: لَا شَكَّ أَنَّ ___ ضَرُورِيٌّ", ["التَّعْلِيمَ", "التَّعْلِيمُ", "التَّعْلِيمِ"], 0),
      test.type("vocabulary", "Maak af: فِي التَّأَنِّي السَّلَامَةُ وَفِي الْعَجَلَةِ ___", ["الندامة"]),
      test.type("writing", "Vertaal: kunstmatige intelligentie en privacy", ["الذكاء الاصطناعي والخصوصية"]),
      test.mcq("vocabulary", "Welke uitdrukking is formeel Standaardarabisch?", ["عِلَاوَةً عَلَى ذَلِكَ", "كَمَانْ (ook, dialect)", "هَيْكْ (zo, dialect)"], 0),
      test.speak("تُعَدُّ اللُّغَةُ الْعَرَبِيَّةُ مِنْ أَكْثَرِ اللُّغَاتِ انْتِشَارًا فِي الْعَالَمِ", "Het Arabisch is een van de meest verspreide talen ter wereld."),
    ],
  } satisfies Lesson;
})();

export const c1Lessons: Lesson[] = [l65, l66, l67, l68, l69, l70];
