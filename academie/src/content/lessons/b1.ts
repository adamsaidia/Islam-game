// Lessen 51–58: B1 (zelfstandig). Wortels, werkwoordsvormen, deelwoorden, i'rab, werk, nieuws.
import type { Lesson } from "../types";
import { joinPassage, NEWS, SALMA_WORK, YUSUF_STORY } from "../passages";
import { builder, w } from "./helpers";

const M = "B1 Zelfstandig";

const l51 = (() => {
  const { ex, test } = builder(51);
  return {
    id: 51, module: M, level: "B1",
    title: "Woordwortels", titleAr: "الْجَذْرُ",
    goal: "Je herkent de drieletterige wortel van een woord en leidt betekenissen af uit patronen.",
    minutes: 25, skills: ["vocabulary", "grammar", "reading"],
    sections: [
      {
        title: "Eén wortel, veel woorden",
        body: [
          "De meeste Arabische woorden zijn gebouwd op een wortel (جَذْر) van drie medeklinkers. De wortel draagt de basisbetekenis; het patroon (وَزْن) eromheen bepaalt de soort woord.",
          "Als je de wortel herkent, kun je onbekende woorden vaak raden. Dit is de sleutel tot lezen zonder harakat en zonder woordenboek.",
        ],
        table: [
          ["Wortel", "Woord", "Patroon", "Betekenis"],
          ["ك ت ب", "كَتَبَ", "فَعَلَ", "hij schreef"],
          ["ك ت ب", "كَاتِب", "فَاعِل", "schrijver"],
          ["ك ت ب", "مَكْتُوب", "مَفْعُول", "geschreven; brief"],
          ["ك ت ب", "مَكْتَب", "مَفْعَل", "bureau, kantoor (plaats)"],
          ["ك ت ب", "مَكْتَبَة", "مَفْعَلَة", "bibliotheek, boekhandel"],
          ["د ر س", "مَدْرَسَة", "مَفْعَلَة", "school (plaats van studeren)"],
          ["ع ل م", "عِلْم", "فِعْل", "wetenschap, kennis"],
          ["ع ل م", "عَالِم", "فَاعِل", "geleerde"],
        ],
      },
      {
        title: "Drie handige patronen",
        body: [
          "فَاعِل = degene die iets doet (طَالِب: student, lett. 'zoeker').",
          "مَفْعُول = degene/datgene waaraan iets gedaan is (مَفْتُوح: geopend).",
          "مَفْعَل / مَفْعَلَة = plaats waar iets gebeurt (مَلْعَب: speelveld, van لَعِبَ: spelen).",
        ],
      },
    ],
    words: [
      w("جَذْر", "jadhr", "wortel", "zn. m., mv. جُذُور"),
      w("كَاتِب", "kātib", "schrijver", "zn. m."),
      w("مَكْتَبَة", "maktaba", "bibliotheek, boekhandel", "zn. v."),
      w("عِلْم", "ʿilm", "wetenschap, kennis", "zn. m."),
      w("عَالِم", "ʿālim", "geleerde, wetenschapper", "zn. m."),
      w("مَلْعَب", "malʿab", "speelveld, stadion", "zn. m."),
    ],
    exercises: [
      ex.mcq("grammar", "Wat is de wortel van مَكْتَبَة?", ["ك ت ب", "م ك ت", "ك ت ة"], 0),
      ex.type("grammar", "Typ de drie wortelletters van مَدْرَسَة (met spaties).", ["د ر س"]),
      ex.type("grammar", "Typ de drie wortelletters van مُعَلِّم (leraar).", ["ع ل م"]),
      ex.mcq("vocabulary", "Wat betekent كَاتِب waarschijnlijk?", ["schrijver", "bibliotheek", "geschreven"], 0),
      ex.mcq("grammar", "Het patroon مَفْعَل geeft vaak:", ["een plaats", "een persoon die iets doet", "een meervoud"], 0),
      ex.type("grammar", "Maak een 'doener' (فَاعِل) van de wortel ع ل م.", ["عالم"]),
      ex.type("grammar", "Maak een plaats (مَفْعَل) van de wortel ل ع ب (spelen).", ["ملعب"]),
      ex.type("grammar", "Maak مَفْعُول van de wortel ك ت ب.", ["مكتوب"]),
      ex.match("vocabulary", "Koppel woord en betekenis.", [["مَكْتَب", "kantoor"], ["مَكْتَبَة", "bibliotheek"], ["كَاتِب", "schrijver"], ["مَكْتُوب", "geschreven"]]),
      ex.speak("ذَهَبَ الْكَاتِبُ إِلَى الْمَكْتَبَةِ", "De schrijver ging naar de bibliotheek."),
    ],
    test: [
      test.type("grammar", "Typ de wortelletters van مَطْبَخ (met spaties).", ["ط ب خ"]),
      test.mcq("vocabulary", "Wat is een مَلْعَب?", ["een speelveld of stadion", "een speler", "een spel"], 0),
      test.type("grammar", "Maak فَاعِل van de wortel ط ل ب.", ["طالب"]),
      test.mcq("grammar", "Welk woord hoort NIET bij de wortel ع ل م?", ["عَمَل", "عِلْم", "مُعَلِّم"], 0),
      test.type("grammar", "Maak مَفْعُول van de wortel ف ت ح.", ["مفتوح"]),
    ],
  } satisfies Lesson;
})();

const l52 = (() => {
  const { ex, test } = builder(52);
  return {
    id: 52, module: M, level: "B1",
    title: "Werkwoordsvormen II–V", titleAr: "الْأَوْزَانُ: الثَّانِي إِلَى الْخَامِسِ",
    goal: "Je herkent en gebruikt de werkwoordsvormen II, III, IV en V.",
    minutes: 30, skills: ["grammar", "writing", "vocabulary"],
    sections: [
      {
        title: "Afgeleide werkwoorden",
        body: [
          "Van één wortel kun je meerdere werkwoorden maken. Westerse grammatica's nummeren ze met Romeinse cijfers. Elke vorm heeft een typische betekenis, maar leer ze vooral per werkwoord.",
          "In de tegenwoordige tijd hebben vorm II, III en IV een damma op het voorvoegsel: يُدَرِّسُ، يُسَاعِدُ، يُرْسِلُ. Vorm V heeft يَتَـ: يَتَعَلَّمُ.",
        ],
        table: [
          ["Vorm", "Verleden", "Tegenwoordig", "Typische betekenis", "Voorbeeld"],
          ["I", "فَعَلَ", "يَفْعَلُ", "basis", "دَرَسَ: studeren"],
          ["II", "فَعَّلَ", "يُفَعِّلُ", "laten doen, intensief", "دَرَّسَ: les geven"],
          ["III", "فَاعَلَ", "يُفَاعِلُ", "met/tegen iemand", "سَاعَدَ: helpen"],
          ["IV", "أَفْعَلَ", "يُفْعِلُ", "laten doen", "أَرْسَلَ: sturen"],
          ["V", "تَفَعَّلَ", "يَتَفَعَّلُ", "wederkerend van II", "تَعَلَّمَ: (zelf) leren"],
        ],
        examples: [
          { ar: "عَلَّمَنِي أَبِي الْقِرَاءَةَ.", nl: "Mijn vader leerde mij lezen. (vorm II)" },
          { ar: "سَاعَدْتُ جَارِي.", nl: "Ik hielp mijn buurman. (vorm III)" },
          { ar: "أَرْسَلْتُ رِسَالَةً.", nl: "Ik stuurde een bericht. (vorm IV)" },
          { ar: "تَكَلَّمْنَا بِالْعَرَبِيَّةِ.", nl: "We spraken Arabisch. (vorm V)" },
        ],
      },
    ],
    words: [
      w("دَرَّسَ", "darrasa", "les geven", "ww. II, ond. tt. يُدَرِّسُ"),
      w("عَلَّمَ", "ʿallama", "onderwijzen", "ww. II, ond. tt. يُعَلِّمُ"),
      w("سَاعَدَ", "sāʿada", "helpen", "ww. III, ond. tt. يُسَاعِدُ"),
      w("شَاهَدَ", "shāhada", "kijken naar", "ww. III, ond. tt. يُشَاهِدُ"),
      w("أَرْسَلَ", "arsala", "sturen", "ww. IV, ond. tt. يُرْسِلُ"),
      w("أَكْمَلَ", "akmala", "afmaken, voltooien", "ww. IV, ond. tt. يُكْمِلُ"),
      w("أَخْبَرَ", "akhbara", "vertellen, informeren", "ww. IV, ond. tt. يُخْبِرُ"),
      w("تَعَلَّمَ", "taʿallama", "leren", "ww. V, ond. tt. يَتَعَلَّمُ"),
      w("تَذَكَّرَ", "tadhakkara", "zich herinneren", "ww. V, ond. tt. يَتَذَكَّرُ"),
    ],
    exercises: [
      ex.mcq("grammar", "Welke vorm is دَرَّسَ?", ["II", "III", "IV"], 0),
      ex.mcq("grammar", "Wat betekent تَعَلَّمَ?", ["(zelf) leren", "onderwijzen", "weten"], 0),
      ex.type("grammar", "Tegenwoordige tijd (هُوَ) van سَاعَدَ:", ["يساعد"]),
      ex.type("grammar", "Tegenwoordige tijd (نَحْنُ) van أَرْسَلَ:", ["نرسل"]),
      ex.type("grammar", "Tegenwoordige tijd (هِيَ) van تَكَلَّمَ:", ["تتكلم"]),
      ex.type("writing", "Vertaal: Ik heb de les afgemaakt.", ["أكملت الدرس"]),
      ex.type("writing", "Vertaal: Hij geeft les in het Arabisch.", ["يدرس العربية", "هو يدرس العربية", "يدرس اللغة العربية"]),
      ex.order("writing", "Maak de zin: wij kijken naar een Arabische film.", ["نُشَاهِدُ", "فِيلْمًا", "عَرَبِيًّا"]),
      ex.match("grammar", "Koppel vorm en voorbeeld.", [["II", "عَلَّمَ"], ["III", "سَاعَدَ"], ["IV", "أَرْسَلَ"], ["V", "تَذَكَّرَ"]]),
      ex.speak("أَتَعَلَّمُ الْعَرَبِيَّةَ مُنْذُ سَنَةٍ", "Ik leer al een jaar Arabisch."),
    ],
    test: [
      test.mcq("grammar", "Welke vorm is سَافَرَ?", ["III", "II", "V"], 0),
      test.type("grammar", "Tegenwoordige tijd (هُمْ) van تَعَلَّمَ:", ["يتعلمون"]),
      test.type("writing", "Vertaal: Help me, alsjeblieft. (tegen een man)", ["ساعدني من فضلك"]),
      test.mcq("vocabulary", "Wat betekent أَخْبَرَنِي?", ["hij vertelde het mij", "hij hielp mij", "hij stuurde mij"], 0),
      test.type("writing", "Vertaal: Wij spreken Arabisch.", ["نتكلم العربية", "نحن نتكلم العربية", "نتكلم اللغة العربية"]),
    ],
  } satisfies Lesson;
})();

const l53 = (() => {
  const { ex, test } = builder(53);
  return {
    id: 53, module: M, level: "B1",
    title: "Werkwoordsvormen VI–X", titleAr: "الْأَوْزَانُ: السَّادِسُ إِلَى الْعَاشِرِ",
    goal: "Je herkent en gebruikt de werkwoordsvormen VI, VII, VIII en X.",
    minutes: 30, skills: ["grammar", "writing", "vocabulary"],
    sections: [
      {
        title: "De overige vormen",
        body: [
          "Vorm IX (اِفْعَلَّ) is zeldzaam en wordt vooral voor kleuren gebruikt (اِحْمَرَّ: rood worden).",
          "Vormen VII, VIII en X beginnen met een hulp-alif (zonder hamza): اِنْكَسَرَ، اِجْتَمَعَ، اِسْتَخْدَمَ.",
        ],
        table: [
          ["Vorm", "Verleden", "Tegenwoordig", "Typische betekenis", "Voorbeeld"],
          ["VI", "تَفَاعَلَ", "يَتَفَاعَلُ", "wederzijds", "تَعَاوَنَ: samenwerken"],
          ["VII", "اِنْفَعَلَ", "يَنْفَعِلُ", "passief / vanzelf", "اِنْكَسَرَ: breken (intr.)"],
          ["VIII", "اِفْتَعَلَ", "يَفْتَعِلُ", "wederkerend, divers", "اِجْتَمَعَ: bijeenkomen"],
          ["X", "اِسْتَفْعَلَ", "يَسْتَفْعِلُ", "vragen om, gebruiken", "اِسْتَخْدَمَ: gebruiken"],
        ],
        examples: [
          { ar: "تَعَاوَنَ الطُّلَّابُ فِي الْمَشْرُوعِ.", nl: "De studenten werkten samen aan het project. (VI)" },
          { ar: "اِنْكَسَرَ الْكُوبُ.", nl: "Het glas brak. (VII)" },
          { ar: "اِجْتَمَعْنَا فِي الْمَكْتَبِ.", nl: "We kwamen bijeen in het kantoor. (VIII)" },
          { ar: "أَسْتَخْدِمُ هَذَا التَّطْبِيقَ كُلَّ يَوْمٍ.", nl: "Ik gebruik deze app elke dag. (X)" },
        ],
      },
    ],
    words: [
      w("تَعَاوَنَ", "taʿāwana", "samenwerken", "ww. VI"),
      w("اِنْكَسَرَ", "inkasara", "breken (vanzelf)", "ww. VII"),
      w("اِنْتَقَلَ", "intaqala", "verhuizen", "ww. VIII, ond. tt. يَنْتَقِلُ"),
      w("اِجْتَمَعَ", "ijtamaʿa", "bijeenkomen", "ww. VIII"),
      w("اِنْتَظَرَ", "intaẓara", "wachten (op)", "ww. VIII, ond. tt. يَنْتَظِرُ"),
      w("اِشْتَرَى", "ishtarā", "kopen", "ww. VIII, ond. tt. يَشْتَرِي"),
      w("اِسْتَخْدَمَ", "istakhdama", "gebruiken", "ww. X"),
      w("اِسْتَقْبَلَ", "istaqbala", "ontvangen", "ww. X"),
      w("تَطْبِيق", "taṭbīq", "app; toepassing", "zn. m."),
    ],
    exercises: [
      ex.mcq("grammar", "Welke vorm is اِسْتَخْدَمَ?", ["X", "VIII", "VII"], 0),
      ex.mcq("grammar", "Welke vorm drukt vaak wederzijdsheid uit?", ["VI", "VII", "X"], 0),
      ex.type("grammar", "Tegenwoordige tijd (هُوَ) van اِسْتَخْدَمَ:", ["يستخدم"]),
      ex.type("grammar", "Tegenwoordige tijd (هُوَ) van اِنْتَظَرَ:", ["ينتظر"]),
      ex.type("grammar", "Tegenwoordige tijd (نَحْنُ) van اِجْتَمَعَ:", ["نجتمع"]),
      ex.mcq("grammar", "Wat betekent اِنْكَسَرَ الْكُوبُ?", ["het glas brak", "hij brak het glas", "het glas is nieuw"], 0),
      ex.type("writing", "Vertaal: Ik wacht op de bus.", ["أنتظر الحافلة"]),
      ex.type("writing", "Vertaal: Wij werken samen.", ["نتعاون", "نحن نتعاون"]),
      ex.order("writing", "Maak de zin: wij zijn naar een nieuw huis verhuisd.", ["اِنْتَقَلْنَا", "إِلَى", "بَيْتٍ", "جَدِيدٍ"]),
      ex.speak("أَسْتَخْدِمُ هَذَا التَّطْبِيقَ كُلَّ يَوْمٍ", "Ik gebruik deze app elke dag."),
    ],
    test: [
      test.mcq("grammar", "Welke vorm is اِسْتَقْبَلَ?", ["X", "VI", "VIII"], 0),
      test.type("grammar", "Tegenwoordige tijd (هِيَ) van اِشْتَرَى:", ["تشتري"]),
      test.type("writing", "Vertaal: Hij gebruikt de computer.", ["يستخدم الحاسوب", "يستخدم الكمبيوتر", "هو يستخدم الحاسوب"]),
      test.type("grammar", "Verleden tijd (هُمْ) van اِجْتَمَعَ:", ["اجتمعوا"]),
      test.speak("اِنْتَظَرْتُكَ طَوِيلًا", "Ik heb lang op je gewacht."),
    ],
  } satisfies Lesson;
})();

const l54 = (() => {
  const { ex, test } = builder(54);
  return {
    id: 54, module: M, level: "B1",
    title: "Deelwoorden en masdar", titleAr: "اسْمُ الْفَاعِلِ وَالْمَفْعُولِ وَالْمَصْدَرُ",
    goal: "Je vormt actieve en passieve deelwoorden en het zelfstandig naamwoord van het werkwoord (masdar).",
    minutes: 30, skills: ["grammar", "vocabulary", "writing"],
    sections: [
      {
        title: "Deelwoorden",
        body: [
          "Vorm I: actief فَاعِل (كَاتِب: schrijvend, schrijver), passief مَفْعُول (مَكْتُوب: geschreven).",
          "Afgeleide vormen krijgen مُـ: actief met kasra voor de laatste letter, passief met fatha: مُسْتَخْدِم (gebruiker) / مُسْتَخْدَم (gebruikt).",
        ],
        table: [
          ["Vorm", "Actief", "Passief"],
          ["II", "مُدَرِّس (leraar)", "مُدَرَّس (onderwezen)"],
          ["III", "مُسَاعِد (assistent)", "مُسَاعَد (geholpen)"],
          ["IV", "مُرْسِل (afzender)", "مُرْسَل (verstuurd)"],
          ["V", "مُتَعَلِّم (leerder)", "—"],
          ["X", "مُسْتَخْدِم (gebruiker)", "مُسْتَخْدَم (gebruikt)"],
        ],
      },
      {
        title: "De masdar (verbaal zelfstandig naamwoord)",
        body: ["De masdar is 'het …-en': الْقِرَاءَةُ مُفِيدَةٌ (lezen is nuttig). Bij vorm I moet je hem per werkwoord leren; bij de afgeleide vormen volgt hij een vast patroon."],
        table: [
          ["Vorm", "Patroon", "Voorbeeld"],
          ["I", "wisselend", "كِتَابَة، دِرَاسَة، قِرَاءَة"],
          ["II", "تَفْعِيل", "تَعْلِيم، تَدْرِيس"],
          ["III", "مُفَاعَلَة", "مُسَاعَدَة، مُشَاهَدَة"],
          ["IV", "إِفْعَال", "إِرْسَال"],
          ["V", "تَفَعُّل", "تَعَلُّم"],
          ["VIII", "اِفْتِعَال", "اِجْتِمَاع، اِنْتِظَار"],
          ["X", "اِسْتِفْعَال", "اِسْتِخْدَام"],
        ],
      },
    ],
    words: [
      w("مَشْهُور", "mashhūr", "beroemd", "bn. (passief deelwoord)"),
      w("مُفِيد", "mufīd", "nuttig", "bn."),
      w("مُمْتِع", "mumtiʿ", "leuk, boeiend", "bn."),
      w("تَعَلُّم", "taʿallum", "het leren", "masdar V"),
      w("مُسْتَخْدِم", "mustakhdim", "gebruiker", "actief deelwoord X"),
      w("اِسْتِخْدَام", "istikhdām", "gebruik", "masdar X"),
    ],
    exercises: [
      ex.type("grammar", "Masdar van عَلَّمَ (vorm II):", ["تعليم"]),
      ex.type("grammar", "Masdar van سَاعَدَ (vorm III):", ["مساعدة"]),
      ex.type("grammar", "Masdar van اِسْتَخْدَمَ (vorm X):", ["استخدام"]),
      ex.type("grammar", "Actief deelwoord van سَاعَدَ:", ["مساعد"]),
      ex.mcq("vocabulary", "Wat betekent مَشْهُور?", ["beroemd", "vermoeid", "gebruikt"], 0),
      ex.mcq("grammar", "Welk woord is een masdar?", ["تَعَلُّم", "مُتَعَلِّم", "يَتَعَلَّمُ"], 0),
      ex.type("writing", "Vertaal: Arabisch leren is leuk.", ["تعلم العربية ممتع", "تعلم اللغة العربية ممتع"]),
      ex.order("writing", "Maak de zin: de deur is geopend.", ["الْبَابُ", "مَفْتُوحٌ"]),
      ex.speak("الْقِرَاءَةُ مُفِيدَةٌ جِدًّا", "Lezen is erg nuttig."),
    ],
    test: [
      test.type("grammar", "Masdar van أَرْسَلَ (vorm IV):", ["إرسال"]),
      test.type("grammar", "Masdar van اِجْتَمَعَ (vorm VIII):", ["اجتماع"]),
      test.type("grammar", "Passief deelwoord van كَتَبَ:", ["مكتوب"]),
      test.mcq("vocabulary", "Wat betekent مُسْتَخْدِم?", ["gebruiker", "gebruik", "gebruikt"], 0),
      test.type("writing", "Vertaal: Lezen is nuttig.", ["القراءة مفيدة"]),
    ],
  } satisfies Lesson;
})();

const l55 = (() => {
  const { ex, test } = builder(55);
  return {
    id: 55, module: M, level: "B1",
    title: "Naamvallen: i'rab in de praktijk", titleAr: "الْإِعْرَابُ",
    goal: "Je kiest de juiste naamvalsuitgang na werkwoorden, voorzetsels, كَانَ en إِنَّ.",
    minutes: 30, skills: ["grammar", "reading", "writing"],
    sections: [
      {
        title: "Drie naamvallen",
        body: [
          "مَرْفُوع (nominatief, -u): onderwerp en gezegde van een naamwoordzin. مَنْصُوب (accusatief, -a): lijdend voorwerp, na إِنَّ, gezegde van كَانَ. مَجْرُور (genitief, -i): na een voorzetsel en als tweede deel van een idafa.",
          "Zonder harakat zie je deze uitgangen niet. Toch bepalen ze hoe je hardop leest. Daarom lezen gevorderden 'met hun grammaticakennis'.",
        ],
        table: [
          ["Situatie", "Naamval", "Voorbeeld"],
          ["onderwerp", "مَرْفُوع (-u)", "جَاءَ الطَّالِبُ"],
          ["lijdend voorwerp", "مَنْصُوب (-a)", "رَأَيْتُ الطَّالِبَ"],
          ["na voorzetsel", "مَجْرُور (-i)", "سَلَّمْتُ عَلَى الطَّالِبِ"],
          ["na كَانَ (gezegde)", "مَنْصُوب", "كَانَ الْجَوُّ جَمِيلًا"],
          ["na إِنَّ (onderwerp)", "مَنْصُوب", "إِنَّ الْجَوَّ جَمِيلٌ"],
        ],
      },
      {
        title: "Uitzonderingen om te kennen",
        body: [
          "Diptoten (مَمْنُوعٌ مِنَ الصَّرْفِ) krijgen geen tanween en hebben -a in plaats van -i als ze onbepaald zijn: أَحْمَدُ، فِي مَسَاجِدَ كَثِيرَةٍ.",
          "Mannelijk klankmeervoud en tweevoud gebruiken andere uitgangen: -ūna / -īna, -āni / -ayni.",
        ],
      },
    ],
    words: [w("مَرْفُوع", "marfūʿ", "nominatief"), w("مَنْصُوب", "manṣūb", "accusatief"), w("مَجْرُور", "majrūr", "genitief"), w("الطَّقْس", "aṭ-ṭaqs", "het weer")],
    exercises: [
      ex.mcq("grammar", "Welke naamval heeft الْكِتَابَ in قَرَأْتُ الْكِتَابَ?", ["accusatief (مَنْصُوب)", "nominatief (مَرْفُوع)", "genitief (مَجْرُور)"], 0),
      ex.mcq("grammar", "Kies de uitgang: ذَهَبْتُ إِلَى الْمَدْرَسَـ…", ["ـةِ", "ـةُ", "ـةَ"], 0),
      ex.mcq("grammar", "Vul in: كَانَ الطَّقْسُ ___", ["جَمِيلًا", "جَمِيلٌ", "جَمِيلٍ"], 0),
      ex.mcq("grammar", "Vul in: إِنَّ ___ مُفِيدٌ", ["الدَّرْسَ", "الدَّرْسُ", "الدَّرْسِ"], 0),
      ex.type("grammar", "Schrijf الْمُدَرِّس met de juiste naamvalsuitgang in: رَأَيْتُ ___", ["الْمُدَرِّسَ"], { checkEnding: true, hint: "Alleen de laatste klinker telt; andere harakat mag je weglaten." }),
      ex.type("grammar", "Schrijf الطَّالِب met de juiste naamvalsuitgang in: سَلَّمْتُ عَلَى ___", ["الطَّالِبِ"], { checkEnding: true }),
      ex.mcq("grammar", "Waarom heeft أَحْمَدُ geen tanween?", ["het is een diptoot", "het heeft ال", "het is een werkwoord"], 0),
      ex.mcq("grammar", "Kies: تَعَلَّمْتُ مِنَ الْمُهَنْدِسِـ…", ["ـينَ", "ـونَ"], 0),
      ex.type("writing", "Vertaal: Het weer was koud.", ["كان الجو باردا", "كان الطقس باردا"]),
      ex.speak("إِنَّ اللُّغَةَ الْعَرَبِيَّةَ جَمِيلَةٌ", "De Arabische taal is (zeker) mooi."),
    ],
    test: [
      test.mcq("grammar", "Welke naamval volgt na een voorzetsel?", ["genitief", "accusatief", "nominatief"], 0),
      test.mcq("grammar", "Vul in: كَانَتِ السَّيَّارَةُ ___", ["جَدِيدَةً", "جَدِيدَةٌ"], 0),
      test.mcq("grammar", "Vul in: قَابَلْتُ ___ (ik ontmoette twee leraren)", ["مُدَرِّسَيْنِ", "مُدَرِّسَانِ"], 0),
      test.type("grammar", "Schrijf الْبَيْت met de juiste naamvalsuitgang in: إِنَّ ___ كَبِيرٌ", ["الْبَيْتَ"], { checkEnding: true }),
      test.type("writing", "Vertaal (met إِنَّ): De les is nuttig.", ["إن الدرس مفيد"]),
    ],
  } satisfies Lesson;
})();

const l56 = (() => {
  const { ex, test } = builder(56);
  const passage = joinPassage(SALMA_WORK);
  return {
    id: 56, module: M, level: "B1",
    title: "Werk en studie", titleAr: "الْعَمَلُ وَالدِّرَاسَةُ",
    goal: "Je praat over je werk en studie en begrijpt een tekst over iemands baan.",
    minutes: 25, skills: ["vocabulary", "reading", "reading_unvowelled", "writing", "speaking"],
    sections: [
      { title: "Leestekst: het werk van Salma", body: [passage] },
      {
        title: "Woorden rond werk",
        body: [],
        examples: [
          { ar: "وَظِيفَة", nl: "baan, functie" },
          { ar: "مُقَابَلَةُ عَمَلٍ", nl: "sollicitatiegesprek" },
          { ar: "سِيرَة ذَاتِيَّة", nl: "cv" },
          { ar: "أَبْحَثُ عَنْ عَمَلٍ", nl: "ik zoek werk" },
        ],
      },
    ],
    words: [
      w("شَرِكَة", "sharika", "bedrijf", "zn. v., mv. شَرِكَات"),
      w("اِجْتِمَاع", "ijtimāʿ", "vergadering", "zn. m."),
      w("زَمِيل", "zamīl", "collega", "zn. m., mv. زُمَلَاء"),
      w("رَاتِب", "rātib", "salaris", "zn. m."),
      w("مُتْعِب", "mutʿib", "vermoeiend", "bn."),
      w("أَحْيَانًا", "aḥyānan", "soms"),
      w("شَهَادَة", "shahāda", "diploma", "zn. v."),
      w("وَظِيفَة", "waẓīfa", "baan", "zn. v."),
      w("سِيرَة ذَاتِيَّة", "sīra dhātiyya", "cv"),
    ],
    exercises: [
      ex.mcq("reading", "Waar werkt Salma?", ["bij een groot bedrijf in Rotterdam", "in een ziekenhuis", "op een school"], 0, { passage }),
      ex.mcq("reading", "Wanneer heeft ze een vergadering?", ["elke maandag", "elke dag om acht uur", "op vrijdag"], 0, { passage }),
      ex.mcq("reading", "Wat doet ze 's avonds?", ["ze studeert voor haar master", "ze werkt over", "ze sport"], 0, { passage }),
      ex.type("writing", "Vertaal: Ik werk bij een groot bedrijf.", ["أعمل في شركة كبيرة"]),
      ex.type("writing", "Vertaal: Mijn collega's zijn aardig. (لُطَفَاء)", ["زملائي لطفاء"]),
      ex.type("vocabulary", "Hoe zeg je 'cv'?", ["سيرة ذاتية"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik heb morgen een sollicitatiegesprek.", "Ik heb morgen een vergadering.", "Morgen begin ik met werken."], 0, { promptAr: "عندي مقابلة عمل غدا" }),
      ex.order("writing", "Maak de zin: haar salaris is goed.", ["رَاتِبُهَا", "جَيِّدٌ"]),
      ex.speak("أَعْمَلُ فِي هَذِهِ الشَّرِكَةِ مُنْذُ خَمْسِ سَنَوَاتٍ", "Ik werk al vijf jaar bij dit bedrijf."),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'salaris'?", ["راتب"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Het werk is soms vermoeiend.", "Het werk is nooit leuk.", "Ik werk soms thuis."], 0, { promptAr: "العمل متعب أحيانا" }),
      test.type("writing", "Vertaal: De vergadering is om tien uur.", ["الاجتماع في الساعة العاشرة"]),
      test.type("writing", "Vertaal: Ik zoek een baan.", ["أبحث عن وظيفة", "أبحث عن عمل"]),
      test.speak("عِنْدِي مُقَابَلَةُ عَمَلٍ غَدًا", "Ik heb morgen een sollicitatiegesprek."),
    ],
  } satisfies Lesson;
})();

const l57 = (() => {
  const { ex, test } = builder(57);
  const passage = joinPassage(NEWS);
  return {
    id: 57, module: M, level: "B1",
    title: "Nieuws lezen", titleAr: "قِرَاءَةُ الْأَخْبَارِ",
    goal: "Je begrijpt een kort nieuwsbericht zonder harakat en kent typische nieuwswoorden.",
    minutes: 30, skills: ["reading_unvowelled", "vocabulary", "listening"],
    sections: [
      {
        title: "Nieuwstaal",
        body: [
          "Nieuwsberichten gebruiken vaste formules: أَعْلَنَ (aankondigen), قَالَ … إِنَّ (zei dat), وَفْقًا لِـ (volgens), يُتَوَقَّعُ أَنْ (er wordt verwacht dat).",
          "Zinnen beginnen vaak met وَ (en). Dat is gewoon stijl; vertaal het meestal niet.",
          "Lees de tekst hieronder zonder harakat. Gebruik de tekst met harakat in de leesmodule als je vastloopt.",
        ],
      },
      { title: "Bericht", body: [passage] },
    ],
    words: [
      w("أَعْلَنَ", "aʿlana", "aankondigen", "ww. IV"),
      w("الْحُكُومَة", "al-ḥukūma", "de regering", "zn. v."),
      w("خُطَّة", "khuṭṭa", "plan", "zn. v."),
      w("وَزِير", "wazīr", "minister", "zn. m., mv. وُزَرَاء"),
      w("مَشْرُوع", "mashrūʿ", "project", "zn. m., mv. مَشَارِيع"),
      w("الْأَخْبَار", "al-akhbār", "het nieuws"),
      w("يُتَوَقَّعُ", "yutawaqqaʿu", "er wordt verwacht"),
      w("وَفْقًا لِـ", "wafqan li-", "volgens"),
      w("أَلْف", "alf", "duizend", "mv. آلَاف"),
    ],
    exercises: [
      ex.mcq("reading_unvowelled", "Wat heeft de regering aangekondigd?", ["een plan om 100.000 woningen te bouwen", "nieuwe belastingen", "een nieuwe minister"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wanneer begint het project?", ["volgend jaar", "morgen", "volgende week"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat voor weer wordt verwacht?", ["regen in het weekend", "zon de hele week", "sneeuw"], 0, { passage }),
      ex.type("vocabulary", "Hoe zeg je 'de regering'?", ["الحكومة"]),
      ex.type("vocabulary", "Hoe zeg je 'de minister'?", ["الوزير"]),
      ex.type("vocabulary", "Hoe zeg je 'het nieuws'?", ["الأخبار"]),
      ex.mcq("vocabulary", "Wat betekent وَفْقًا لِـ?", ["volgens", "tegen", "tijdens"], 0),
      ex.order("writing", "Maak de zin: de regering kondigde een nieuw plan aan.", ["أَعْلَنَتِ", "الْحُكُومَةُ", "عَنْ", "خُطَّةٍ", "جَدِيدَةٍ"]),
      ex.mcq("listening", "Luister. Waar gaat dit over?", ["het weer", "woningbouw", "verkiezingen"], 0, { audio: NEWS.sentences[2].ar }),
      ex.speak("أَعْلَنَتِ الْحُكُومَةُ عَنْ خُطَّةٍ جَدِيدَةٍ", "De regering heeft een nieuw plan aangekondigd."),
    ],
    test: [
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Het project begint volgend jaar.", "Het project is vorig jaar begonnen.", "Het project is gestopt."], 0, { promptAr: "سيبدأ المشروع في العام القادم" }),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Er wordt regenachtig weer verwacht.", "Het regent niet.", "Het weer was mooi."], 0, { promptAr: "يتوقع أن يكون الطقس ممطرا" }),
      test.type("vocabulary", "Hoe zeg je 'project'?", ["مشروع"]),
      test.type("writing", "Vertaal: honderdduizend huizen", ["مئة ألف بيت", "مائة ألف بيت"]),
      test.mcq("vocabulary", "Wat betekent أَعْلَنَ?", ["hij kondigde aan", "hij bouwde", "hij vroeg"], 0),
    ],
  } satisfies Lesson;
})();

const l58 = (() => {
  const { ex, test } = builder(58);
  const passage = joinPassage(YUSUF_STORY);
  return {
    id: 58, module: M, level: "B1",
    title: "Niveautoets B1", titleAr: "اخْتِبَارُ الْمُسْتَوَى B1",
    goal: "Je laat zien dat je B1 beheerst: wortels en vormen, deelwoorden, naamvallen en teksten over werk en nieuws.",
    minutes: 40, skills: ["reading", "reading_unvowelled", "grammar", "writing", "speaking"],
    sections: [{ title: "Leestekst: Yusuf leert Nederlands", body: [passage] }],
    words: [w("يَسْتَسْلِمُ", "yastaslimu", "hij geeft op", "ww. X"), w("مُتَرْجِم", "mutarjim", "tolk, vertaler", "zn. m."), w("دَفْتَر", "daftar", "schrift", "zn. m."), w("الْهِجْرَة", "al-hijra", "de migratie")],
    exercises: [
      ex.mcq("reading", "Wanneer begon Yusuf Nederlands te leren?", ["twee jaar geleden", "vorig jaar", "toen hij klein was"], 0, { passage }),
      ex.mcq("reading", "Wat vond hij in het begin moeilijk?", ["de grammatica", "de uitspraak", "de woorden"], 0, { passage }),
      ex.mcq("reading", "Wat doet hij nu?", ["hij werkt als tolk", "hij geeft Arabische les", "hij studeert nog"], 0, { passage }),
      ex.type("grammar", "Typ de wortelletters van يَسْتَمِعُ (luisteren, vorm VIII), met spaties.", ["س م ع"]),
      ex.type("writing", "Vertaal: Hij gaf niet op.", ["لم يستسلم"]),
      ex.speak("كَانَ يَسْتَمِعُ إِلَى الْأَخْبَارِ كُلَّ صَبَاحٍ", "Hij luisterde elke ochtend naar het nieuws."),
    ],
    test: [
      test.type("grammar", "Typ de wortelletters van مَدْخَل (ingang).", ["د خ ل"]),
      test.type("grammar", "Masdar van تَعَلَّمَ:", ["تعلم"]),
      test.mcq("grammar", "Welke vorm is اِنْتَظَرَ?", ["VIII", "VII", "X"], 0),
      test.mcq("grammar", "Vul in: كَانَ الدَّرْسُ ___", ["صَعْبًا", "صَعْبٌ", "صَعْبٍ"], 0),
      test.type("writing", "Vertaal: Ik gebruik deze app elke dag.", ["أستخدم هذا التطبيق كل يوم"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Hij werkt als tolk bij een immigratiekantoor.", "Hij zoekt werk als tolk.", "Hij studeert vertalen."], 0, { promptAr: "يعمل مترجما في مكتب للهجرة" }),
      test.type("vocabulary", "Hoe zeg je 'collega'?", ["زميل"]),
      test.mcq("vocabulary", "Wat betekent مَشْهُور?", ["beroemd", "druk", "geopend"], 0),
      test.type("writing", "Vertaal: De regering kondigde een nieuw plan aan.", ["أعلنت الحكومة عن خطة جديدة", "أعلنت الحكومة خطة جديدة"]),
      test.speak("فِي الْبِدَايَةِ كَانَتِ الْقَوَاعِدُ صَعْبَةً", "In het begin was de grammatica moeilijk."),
    ],
  } satisfies Lesson;
})();

export const b1Lessons: Lesson[] = [l51, l52, l53, l54, l55, l56, l57, l58];
