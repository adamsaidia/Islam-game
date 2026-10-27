// Lessen 31–40: A1-verdieping. Werkwoorden, ontkenning, meervoud, idafa, getallen, tijd, kleuren.
import type { Lesson } from "../types";
import { joinPassage, MY_DAY } from "../passages";
import { builder, w } from "./helpers";

const M = "A1 verdieping";

const l31 = (() => {
  const { ex, test } = builder(31);
  return {
    id: 31, module: M, level: "A1",
    title: "De tegenwoordige tijd", titleAr: "الْفِعْلُ الْمُضَارِعُ",
    goal: "Je vervoegt regelmatige werkwoorden in de tegenwoordige tijd voor alle personen.",
    minutes: 25, skills: ["grammar", "writing", "listening"],
    sections: [
      {
        title: "Voorvoegsels en achtervoegsels",
        body: [
          "De tegenwoordige tijd (الْمُضَارِع) maak je met een voorvoegsel: أَ (ik), تَ (jij, zij ev.), يَ (hij, zij mv.), نَ (wij). Sommige personen krijgen ook een achtervoegsel.",
          "De klinker van de middelste wortelletter verschilt per werkwoord: يَكْتُبُ (u), يَشْرَبُ (a), يَجْلِسُ (i). Leer die klinker samen met het werkwoord.",
          "Het werkwoord staat vaak vooraan in de zin: يَدْرُسُ الطَّالِبُ (de student studeert). Onderwerp eerst mag ook: الطَّالِبُ يَدْرُسُ.",
        ],
        table: [
          ["Persoon", "يَكْتُبُ (schrijven)", "Uitspraak"],
          ["أَنَا", "أَكْتُبُ", "aktubu"],
          ["أَنْتَ", "تَكْتُبُ", "taktubu"],
          ["أَنْتِ", "تَكْتُبِينَ", "taktubīna"],
          ["هُوَ", "يَكْتُبُ", "yaktubu"],
          ["هِيَ", "تَكْتُبُ", "taktubu"],
          ["نَحْنُ", "نَكْتُبُ", "naktubu"],
          ["أَنْتُمْ", "تَكْتُبُونَ", "taktubūna"],
          ["هُمْ", "يَكْتُبُونَ", "yaktubūna"],
        ],
      },
    ],
    words: [
      w("يَكْتُبُ", "yaktubu", "hij schrijft", "ww. (كَتَبَ)"),
      w("يَقْرَأُ", "yaqraʾu", "hij leest", "ww. (قَرَأَ)"),
      w("يَشْرَبُ", "yashrabu", "hij drinkt", "ww. (شَرِبَ)"),
      w("يَذْهَبُ", "yadhhabu", "hij gaat", "ww. (ذَهَبَ)"),
      w("يَدْرُسُ", "yadrusu", "hij studeert", "ww. (دَرَسَ)"),
      w("يَأْكُلُ", "yaʾkulu", "hij eet", "ww. (أَكَلَ)"),
      w("يَعْمَلُ", "yaʿmalu", "hij werkt", "ww. (عَمِلَ)"),
    ],
    exercises: [
      ex.mcq("grammar", "Hoe zeg je 'wij schrijven'?", ["نَكْتُبُ", "يَكْتُبُونَ", "تَكْتُبُ"], 0),
      ex.type("grammar", "Vervoeg يَشْرَبُ voor أَنَا.", ["أشرب"]),
      ex.type("grammar", "Vervoeg يَذْهَبُ voor هِيَ.", ["تذهب"]),
      ex.type("grammar", "Vervoeg يَدْرُسُ voor هُمْ.", ["يدرسون"]),
      ex.type("grammar", "Vervoeg يَكْتُبُ voor أَنْتِ.", ["تكتبين"]),
      ex.order("writing", "Maak de zin: ik lees een boek.", ["أَنَا", "أَقْرَأُ", "كِتَابًا"]),
      ex.type("writing", "Vertaal: Wij wonen in Nederland.", ["نسكن في هولندا", "نحن نسكن في هولندا"]),
      ex.type("writing", "Vertaal: Zij (één vrouw) werkt in het ziekenhuis.", ["تعمل في المستشفى", "هي تعمل في المستشفى"]),
      ex.mcq("listening", "Luister. Wie drinkt thee?", ["zij (meervoud)", "hij", "wij"], 0, { audio: "يَشْرَبُونَ الشَّايَ" }),
      ex.speak("أَنَا أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ", "Ik studeer de Arabische taal."),
    ],
    test: [
      test.type("grammar", "Vervoeg يَعْمَلُ voor نَحْنُ.", ["نعمل"]),
      test.type("grammar", "Vervoeg يَأْكُلُ voor أَنْتُمْ.", ["تأكلون"]),
      test.mcq("grammar", "Welke vorm hoort bij أَنْتِ?", ["تَسْكُنِينَ", "تَسْكُنُ", "يَسْكُنُ"], 0),
      test.type("writing", "Vertaal: Hij drinkt koffie.", ["يشرب قهوة", "هو يشرب قهوة", "يشرب القهوة", "هو يشرب القهوة"]),
      test.type("writing", "Vertaal: Ik ga naar de universiteit.", ["أذهب إلى الجامعة", "أنا أذهب إلى الجامعة"]),
    ],
  } satisfies Lesson;
})();

const l32 = (() => {
  const { ex, test } = builder(32);
  return {
    id: 32, module: M, level: "A1",
    title: "De verleden tijd", titleAr: "الْفِعْلُ الْمَاضِي",
    goal: "Je vervoegt regelmatige werkwoorden in de verleden tijd en vertelt wat je gedaan hebt.",
    minutes: 25, skills: ["grammar", "writing", "spelling"],
    sections: [
      {
        title: "Achtervoegsels aan de stam",
        body: [
          "De verleden tijd (الْمَاضِي) is de basisvorm van het werkwoord: كَتَبَ = hij schreef. Voor de andere personen komt er een achtervoegsel achter.",
          "Let op de stille alif na de uitgang -ū (zij mv.): كَتَبُوا. Die alif spreek je niet uit; het is een schrijfregel.",
          "Handige tijdwoorden: أَمْسِ (gisteren), الْأُسْبُوعَ الْمَاضِيَ (vorige week).",
        ],
        table: [
          ["Persoon", "كَتَبَ (schreef)", "Uitspraak"],
          ["أَنَا", "كَتَبْتُ", "katabtu"],
          ["أَنْتَ", "كَتَبْتَ", "katabta"],
          ["أَنْتِ", "كَتَبْتِ", "katabti"],
          ["هُوَ", "كَتَبَ", "kataba"],
          ["هِيَ", "كَتَبَتْ", "katabat"],
          ["نَحْنُ", "كَتَبْنَا", "katabnā"],
          ["أَنْتُمْ", "كَتَبْتُمْ", "katabtum"],
          ["هُمْ", "كَتَبُوا", "katabū"],
        ],
      },
    ],
    words: [
      w("أَمْسِ", "amsi", "gisteren"),
      w("أَكَلَ", "akala", "hij at", "ww., ond. tt. يَأْكُلُ"),
      w("عَمِلَ", "ʿamila", "hij werkte", "ww., ond. tt. يَعْمَلُ"),
      w("قَرَأَ", "qaraʾa", "hij las", "ww., ond. tt. يَقْرَأُ"),
      w("شَرِبَ", "shariba", "hij dronk", "ww., ond. tt. يَشْرَبُ"),
      w("الْمَاضِي", "al-māḍī", "het verleden; vorige", "bn./zn."),
    ],
    exercises: [
      ex.type("grammar", "Vervoeg ذَهَبَ voor أَنَا.", ["ذهبت"]),
      ex.type("grammar", "Vervoeg شَرِبَ voor هِيَ.", ["شربت"]),
      ex.type("grammar", "Vervoeg كَتَبَ voor نَحْنُ.", ["كتبنا"]),
      ex.type("grammar", "Vervoeg أَكَلَ voor هُمْ.", ["أكلوا"], { hint: "Vergeet de stille alif aan het eind niet." }),
      ex.mcq("spelling", "Waarom staat er een alif aan het eind van كَتَبُوا?", ["een schrijfregel: na de uitgang -ū van 'zij (mv.)' komt een stille alif", "het is een lange ā", "het is tanween"], 0),
      ex.mcq("grammar", "Welke vorm zeg je tegen een vrouw?", ["كَتَبْتِ", "كَتَبْتَ", "كَتَبَتْ"], 0),
      ex.type("writing", "Vertaal: Gisteren ging ik naar de markt.", ["ذهبت إلى السوق أمس", "أمس ذهبت إلى السوق"]),
      ex.order("writing", "Maak de zin: ik las een mooi boek.", ["قَرَأْتُ", "كِتَابًا", "جَمِيلًا"]),
      ex.dictation("دَرَسْنَا أَمْسِ"),
      ex.speak("ذَهَبْتُ إِلَى الْمَدْرَسَةِ", "Ik ging naar school."),
    ],
    test: [
      test.type("grammar", "Vervoeg عَمِلَ voor أَنْتَ.", ["عملت"]),
      test.type("grammar", "Vervoeg قَرَأَ voor هُوَ.", ["قرأ"]),
      test.type("grammar", "Vervoeg جَلَسَ voor أَنْتُمْ.", ["جلستم"]),
      test.type("writing", "Vertaal: Wij aten rijst.", ["أكلنا أرزا", "أكلنا الأرز", "أكلنا أرز"]),
      test.mcq("grammar", "Wat betekent شَرِبَتْ?", ["zij dronk", "ik dronk", "jij dronk"], 0),
    ],
  } satisfies Lesson;
})();

const l33 = (() => {
  const { ex, test } = builder(33);
  return {
    id: 33, module: M, level: "A1",
    title: "Ontkenning: lā, lam en laysa", titleAr: "النَّفْيُ",
    goal: "Je ontkent zinnen in de tegenwoordige tijd, de verleden tijd en naamwoordzinnen.",
    minutes: 25, skills: ["grammar", "writing"],
    sections: [
      {
        title: "Drie manieren van ontkennen",
        body: [
          "لَا + tegenwoordige tijd: لَا أَعْرِفُ (ik weet het niet).",
          "لَمْ + 'gebiedende' vorm (الْمَجْزُوم) voor de verleden tijd: لَمْ أَذْهَبْ (ik ging niet). De laatste klinker wordt een sukun, en -ūna wordt -ū: لَمْ يَكْتُبُوا. Je hoort ook مَا + verleden tijd: مَا ذَهَبْتُ.",
          "لَيْسَ ontkent een naamwoordzin ('is niet'). Het gezegde krijgt dan -an: الْبَيْتُ لَيْسَ كَبِيرًا.",
        ],
        table: [
          ["Persoon", "لَيْسَ", "Voorbeeld"],
          ["أَنَا", "لَسْتُ", "لَسْتُ طَالِبًا"],
          ["أَنْتَ", "لَسْتَ", "لَسْتَ مَرِيضًا"],
          ["أَنْتِ", "لَسْتِ", "لَسْتِ وَحْدَكِ"],
          ["هُوَ", "لَيْسَ", "لَيْسَ هُنَا"],
          ["هِيَ", "لَيْسَتْ", "لَيْسَتْ مُدَرِّسَةً"],
          ["نَحْنُ", "لَسْنَا", "لَسْنَا فِي الْبَيْتِ"],
          ["هُمْ", "لَيْسُوا", "لَيْسُوا مِنْ هُنَا"],
        ],
      },
    ],
    words: [
      w("يَعْرِفُ", "yaʿrifu", "hij weet, kent", "ww. (عَرَفَ)"),
      w("يُحِبُّ", "yuḥibbu", "hij houdt van", "ww. (أَحَبَّ)"),
      w("لَمْ", "lam", "niet (verleden tijd)"),
      w("لَيْسَ", "laysa", "is niet"),
      w("هُنَا", "hunā", "hier"),
    ],
    exercises: [
      ex.mcq("grammar", "Hoe ontken je أَشْرَبُ الْقَهْوَةَ?", ["لَا أَشْرَبُ الْقَهْوَةَ", "لَيْسَ أَشْرَبُ الْقَهْوَةَ", "لَمْ أَشْرَبُ الْقَهْوَةَ"], 0),
      ex.type("writing", "Vertaal: Ik weet het niet.", ["لا أعرف"]),
      ex.type("grammar", "Ontken met لَمْ: ذَهَبْتُ", ["لم أذهب"]),
      ex.mcq("grammar", "Welke vorm is correct na لَمْ?", ["لَمْ يَكْتُبْ", "لَمْ يَكْتُبُ", "لَمْ كَتَبَ"], 0),
      ex.type("writing", "Vertaal: Ik ben geen student. (m)", ["لست طالبا"]),
      ex.type("writing", "Vertaal: Het huis is niet groot.", ["البيت ليس كبيرا", "ليس البيت كبيرا"]),
      ex.mcq("grammar", "Welke vorm van لَيْسَ hoort bij هِيَ?", ["لَيْسَتْ", "لَسْتُ", "لَيْسُوا"], 0),
      ex.order("writing", "Maak de zin: hij houdt niet van koffie.", ["هُوَ", "لَا", "يُحِبُّ", "الْقَهْوَةَ"]),
      ex.speak("لَا، لَسْتُ مِنْ مِصْرَ", "Nee, ik kom niet uit Egypte."),
    ],
    test: [
      test.type("grammar", "Ontken met لَا: يَعْمَلُ", ["لا يعمل"]),
      test.type("grammar", "Ontken met لَمْ: كَتَبُوا", ["لم يكتبوا"]),
      test.type("writing", "Vertaal: Wij zijn niet thuis.", ["لسنا في البيت"]),
      test.mcq("grammar", "Wat betekent لَمْ نَأْكُلْ?", ["wij hebben niet gegeten", "wij eten niet", "wij zullen niet eten"], 0),
      test.type("writing", "Vertaal: Zij (één vrouw) is geen lerares.", ["ليست مدرسة", "هي ليست مدرسة"]),
    ],
  } satisfies Lesson;
})();

const l34 = (() => {
  const { ex, test } = builder(34);
  return {
    id: 34, module: M, level: "A1",
    title: "Meervouden", titleAr: "الْجَمْعُ",
    goal: "Je herkent en maakt klankmeervouden en de meest gebruikte gebroken meervouden.",
    minutes: 25, skills: ["grammar", "vocabulary", "writing"],
    sections: [
      {
        title: "Drie soorten meervoud",
        body: [
          "Mannelijk klankmeervoud (vooral voor personen): -ūna (onderwerp) / -īna (na voorzetsel of als lijdend voorwerp): مُدَرِّسُونَ / مُدَرِّسِينَ.",
          "Vrouwelijk klankmeervoud: ة wordt -āt: مُدَرِّسَة → مُدَرِّسَات, سَيَّارَة → سَيَّارَات.",
          "Gebroken meervoud: de klinkers binnen het woord veranderen. Dit is de meest voorkomende vorm; leer het meervoud samen met het enkelvoud.",
          "Belangrijke regel: een meervoud van dingen (niet-personen) gedraagt zich als vrouwelijk enkelvoud: الْكُتُبُ جَدِيدَةٌ (de boeken zijn nieuw), هَذِهِ بُيُوتٌ.",
        ],
        table: [
          ["Enkelvoud", "Meervoud", "Betekenis"],
          ["كِتَاب", "كُتُب", "boek"],
          ["بَيْت", "بُيُوت", "huis"],
          ["وَلَد", "أَوْلَاد", "jongen, kind"],
          ["رَجُل", "رِجَال", "man"],
          ["قَلَم", "أَقْلَام", "pen"],
          ["طَالِب", "طُلَّاب", "student"],
          ["مَدِينَة", "مُدُن", "stad"],
          ["صَدِيق", "أَصْدِقَاء", "vriend"],
        ],
      },
    ],
    words: [
      w("كُتُب", "kutub", "boeken", "mv. van كِتَاب"),
      w("بُيُوت", "buyūt", "huizen", "mv. van بَيْت"),
      w("أَوْلَاد", "awlād", "jongens, kinderen", "mv. van وَلَد"),
      w("رِجَال", "rijāl", "mannen", "mv. van رَجُل"),
      w("أَقْلَام", "aqlām", "pennen", "mv. van قَلَم"),
      w("طُلَّاب", "ṭullāb", "studenten", "mv. van طَالِب"),
      w("مُدُن", "mudun", "steden", "mv. van مَدِينَة"),
      w("أَصْدِقَاء", "aṣdiqāʾ", "vrienden", "mv. van صَدِيق"),
      w("مُهَنْدِس", "muhandis", "ingenieur", "zn. m., mv. مُهَنْدِسُونَ"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel enkelvoud en meervoud.", [["كِتَاب", "كُتُب"], ["بَيْت", "بُيُوت"], ["وَلَد", "أَوْلَاد"], ["قَلَم", "أَقْلَام"]]),
      ex.type("grammar", "Meervoud van مُدَرِّسَة:", ["مدرسات"]),
      ex.type("grammar", "Meervoud van طَالِب:", ["طلاب"]),
      ex.type("grammar", "Meervoud van مَدِينَة:", ["مدن"]),
      ex.mcq("grammar", "Welk meervoud is een gebroken meervoud?", ["رِجَال", "مُهَنْدِسُونَ", "سَيَّارَات"], 0),
      ex.mcq("grammar", "Vul in: الْكُتُبُ ___ (de boeken zijn nieuw)", ["جَدِيدَةٌ", "جَدِيدُونَ", "جَدِيدٌ"], 0, { explain: "Meervoud van dingen → vrouwelijk enkelvoud." }),
      ex.type("writing", "Vertaal: De leraren (m) zijn in de school.", ["المدرسون في المدرسة"]),
      ex.type("writing", "Vertaal: De auto's zijn nieuw.", ["السيارات جديدة"]),
      ex.dictation("أَصْدِقَائِي", { explain: "أَصْدِقَاء + ي: de hamza komt op een 'stoel' (ئ)." }),
      ex.speak("عِنْدِي أَصْدِقَاءُ كَثِيرُونَ", "Ik heb veel vrienden."),
    ],
    test: [
      test.type("grammar", "Meervoud van بَيْت:", ["بيوت"]),
      test.type("grammar", "Meervoud van وَلَد:", ["أولاد"]),
      test.type("grammar", "Meervoud van مُهَنْدِس (als onderwerp):", ["مهندسون"]),
      test.mcq("grammar", "Welk woord past? هَذِهِ ___ قَدِيمَةٌ (dit zijn oude boeken)", ["كُتُبٌ", "كِتَابٌ", "مُدَرِّسُونَ"], 0),
      test.type("writing", "Vertaal: De studentes zijn hier.", ["الطالبات هنا"]),
    ],
  } satisfies Lesson;
})();

const l35 = (() => {
  const { ex, test } = builder(35);
  return {
    id: 35, module: M, level: "A1",
    title: "Idafa: de bezitsconstructie", titleAr: "الْإِضَافَةُ",
    goal: "Je maakt idafa-constructies zoals 'het boek van de student' en spreekt ة correct uit.",
    minutes: 25, skills: ["grammar", "writing", "reading"],
    sections: [
      {
        title: "Twee zelfstandige naamwoorden achter elkaar",
        body: [
          "In een idafa (إِضَافَة) staan twee zelfstandige naamwoorden naast elkaar: كِتَابُ الطَّالِبِ = het boek van de student.",
          "Het eerste woord krijgt nooit ال en nooit tanween. Het tweede woord staat in de 2e naamval (-i) en bepaalt of het geheel bepaald is.",
          "ة in het eerste woord spreek je uit als -at: سَيَّارَةُ أَبِي (sayyāratu abī).",
          "Een onbepaalde idafa: فِنْجَانُ قَهْوَةٍ = een kopje koffie.",
        ],
        examples: [
          { ar: "كِتَابُ الطَّالِبِ", tr: "kitābu ṭ-ṭālibi", nl: "het boek van de student" },
          { ar: "بَابُ الْبَيْتِ", tr: "bābu l-bayti", nl: "de deur van het huis" },
          { ar: "سَيَّارَةُ أَبِي", tr: "sayyāratu abī", nl: "de auto van mijn vader" },
          { ar: "غُرْفَةُ النَّوْمِ", tr: "ghurfatu n-nawmi", nl: "de slaapkamer" },
          { ar: "عَاصِمَةُ هُولَنْدَا", tr: "ʿāṣimatu hūlandā", nl: "de hoofdstad van Nederland" },
        ],
      },
    ],
    words: [
      w("غُرْفَةُ النَّوْمِ", "ghurfatu n-nawm", "slaapkamer"),
      w("فِنْجَان", "finjān", "kopje", "zn. m."),
      w("عَاصِمَة", "ʿāṣima", "hoofdstad", "zn. v."),
      w("مِفْتَاحُ السَّيَّارَةِ", "miftāḥu s-sayyāra", "autosleutel"),
    ],
    exercises: [
      ex.mcq("grammar", "Wat betekent كِتَابُ الطَّالِبِ?", ["het boek van de student", "de student van het boek", "een student met een boek"], 0),
      ex.mcq("grammar", "Welke vorm is FOUT?", ["الْكِتَابُ الطَّالِبِ", "كِتَابُ الطَّالِبِ", "كِتَابُ طَالِبٍ"], 0, { explain: "Het eerste woord van een idafa krijgt geen ال." }),
      ex.type("writing", "Vertaal: de deur van het huis", ["باب البيت"]),
      ex.type("writing", "Vertaal: de auto van mijn vader", ["سيارة أبي"]),
      ex.type("writing", "Vertaal: de sleutel van de auto", ["مفتاح السيارة"]),
      ex.mcq("reading", "Hoe spreek je de ة uit in سَيَّارَةُ أَبِي?", ["-at (sayyāratu)", "-a (sayyāra)", "-ah (sayyārah)"], 0),
      ex.type("writing", "Vertaal: een kopje koffie", ["فنجان قهوة"]),
      ex.order("writing", "Maak de zin: de hoofdstad van Nederland is Amsterdam.", ["عَاصِمَةُ", "هُولَنْدَا", "أَمْسْتِرْدَام"]),
      ex.speak("هَذِهِ غُرْفَةُ النَّوْمِ", "Dit is de slaapkamer."),
    ],
    test: [
      test.type("writing", "Vertaal: de leraar van de school", ["مدرس المدرسة"]),
      test.type("writing", "Vertaal: de stad Amsterdam", ["مدينة أمستردام"]),
      test.type("writing", "Vertaal: de kamer van mijn zus", ["غرفة أختي"]),
      test.mcq("grammar", "Welke zin betekent 'het huis van de man is groot'?", ["بَيْتُ الرَّجُلِ كَبِيرٌ", "الْبَيْتُ الرَّجُلُ كَبِيرٌ", "بَيْتٌ رَجُلٌ كَبِيرٌ"], 0),
      test.type("writing", "Vertaal: de deur van de keuken", ["باب المطبخ"]),
    ],
  } satisfies Lesson;
})();

const l36 = (() => {
  const { ex, test } = builder(36);
  return {
    id: 36, module: M, level: "A1",
    title: "Getallen 11–100 en leeftijd", titleAr: "الْأَعْدَادُ مِنْ ١١ إِلَى ١٠٠",
    goal: "Je kent de getallen tot 100, zegt je leeftijd en gebruikt het getelde woord in de juiste vorm.",
    minutes: 25, skills: ["vocabulary", "grammar", "listening"],
    sections: [
      {
        title: "Tientallen en samengestelde getallen",
        body: [
          "Tientallen eindigen op -ūna (onderwerp) of -īna (na voorzetsel/lijdend voorwerp): عِشْرُونَ / عِشْرِينَ.",
          "21–99 zeg je 'eenheid en tiental': وَاحِدٌ وَعِشْرُونَ (21), خَمْسَةٌ وَثَلَاثُونَ (35).",
          "Na 11–99 volgt het getelde woord in het enkelvoud met -an: عِشْرُونَ طَالِبًا, ثَلَاثُونَ سَنَةً. Na 3–10 volgt het meervoud: ثَلَاثَةُ كُتُبٍ. Na 100 het enkelvoud: مِئَةُ دِرْهَمٍ.",
        ],
        table: [
          ["Cijfer", "Arabisch", "Uitspraak"],
          ["١١", "أَحَدَ عَشَرَ", "aḥada ʿashara"],
          ["١٢", "اِثْنَا عَشَرَ", "ithnā ʿashara"],
          ["١٣", "ثَلَاثَةَ عَشَرَ", "thalāthata ʿashara"],
          ["٢٠", "عِشْرُونَ", "ʿishrūna"],
          ["٣٠", "ثَلَاثُونَ", "thalāthūna"],
          ["٤٠", "أَرْبَعُونَ", "arbaʿūna"],
          ["٥٠", "خَمْسُونَ", "khamsūna"],
          ["٦٠", "سِتُّونَ", "sittūna"],
          ["٧٠", "سَبْعُونَ", "sabʿūna"],
          ["٨٠", "ثَمَانُونَ", "thamānūna"],
          ["٩٠", "تِسْعُونَ", "tisʿūna"],
          ["١٠٠", "مِئَة", "miʾa"],
        ],
      },
      {
        title: "Je leeftijd",
        body: ["كَمْ عُمْرُكَ؟ (tegen een man) / كَمْ عُمْرُكِ؟ (tegen een vrouw) = hoe oud ben je?"],
        examples: [{ ar: "عُمْرِي ثَلَاثُونَ سَنَةً.", tr: "ʿumrī thalāthūna sanatan.", nl: "Ik ben dertig jaar." }],
      },
    ],
    words: [
      w("عِشْرُونَ", "ʿishrūna", "twintig"),
      w("ثَلَاثُونَ", "thalāthūna", "dertig"),
      w("خَمْسُونَ", "khamsūna", "vijftig"),
      w("مِئَة", "miʾa", "honderd", "ook gespeld: مائة"),
      w("عُمْر", "ʿumr", "leeftijd", "zn. m."),
      w("سَنَة", "sana", "jaar", "zn. v., mv. سَنَوَات"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel cijfer en woord.", [["٢٠", "عِشْرُونَ"], ["٣٠", "ثَلَاثُونَ"], ["٥٠", "خَمْسُونَ"], ["١٠٠", "مِئَة"]]),
      ex.type("vocabulary", "Schrijf 40 in letters.", ["أربعون", "أربعين"]),
      ex.type("vocabulary", "Schrijf 12 in letters.", ["اثنا عشر", "اثني عشر"]),
      ex.dictation("سِتُّونَ"),
      ex.mcq("grammar", "Hoe zeg je 'twintig studenten'?", ["عِشْرُونَ طَالِبًا", "عِشْرُونَ طُلَّابٍ", "عِشْرُونَ طَالِبٌ"], 0),
      ex.mcq("vocabulary", "Wat betekent كَمْ عُمْرُكَ؟", ["Hoe oud ben je?", "Hoe laat is het?", "Hoeveel kost het?"], 0),
      ex.type("writing", "Vertaal: Ik ben dertig jaar.", ["عمري ثلاثون سنة", "عمري ثلاثون عاما"]),
      ex.mcq("listening", "Luister. Hoeveel geld heeft de spreker?", ["50 dirham", "15 dirham", "5 dirham"], 0, { audio: "عِنْدِي خَمْسُونَ دِرْهَمًا" }),
      ex.speak("عُمْرِي ثَلَاثُونَ سَنَةً", "Ik ben dertig jaar."),
    ],
    test: [
      test.type("vocabulary", "Schrijf 70 in letters.", ["سبعون", "سبعين"]),
      test.type("vocabulary", "Schrijf 100 in letters.", ["مئة", "مائة"]),
      test.mcq("grammar", "Welke vorm is correct?", ["ثَلَاثُونَ سَنَةً", "ثَلَاثُونَ سَنَوَاتٍ", "ثَلَاثُونَ سَنَةٌ"], 0),
      test.mcq("listening", "Luister. Welk getal hoor je?", ["90", "19", "9"], 0, { audio: "تِسْعُونَ" }),
      test.type("writing", "Vraag aan een man: hoe oud ben je?", ["كم عمرك"]),
    ],
  } satisfies Lesson;
})();

const l37 = (() => {
  const { ex, test } = builder(37);
  return {
    id: 37, module: M, level: "A1",
    title: "Dagen en klokkijken", titleAr: "الْأَيَّامُ وَالسَّاعَةُ",
    goal: "Je noemt de dagen van de week, zegt hoe laat het is en gebruikt vandaag, morgen en gisteren.",
    minutes: 25, skills: ["vocabulary", "listening", "writing"],
    sections: [
      {
        title: "De dagen van de week",
        body: ["De dagen zijn idafa's met يَوْم (dag). In het Arabisch begint de week vaak op zondag."],
        table: [
          ["Arabisch", "Uitspraak", "Nederlands"],
          ["يَوْمُ الْأَحَدِ", "yawmu l-aḥadi", "zondag"],
          ["يَوْمُ الِاثْنَيْنِ", "yawmu l-ithnayni", "maandag"],
          ["يَوْمُ الثُّلَاثَاءِ", "yawmu th-thulāthāʾi", "dinsdag"],
          ["يَوْمُ الْأَرْبِعَاءِ", "yawmu l-arbiʿāʾi", "woensdag"],
          ["يَوْمُ الْخَمِيسِ", "yawmu l-khamīsi", "donderdag"],
          ["يَوْمُ الْجُمُعَةِ", "yawmu l-jumuʿati", "vrijdag"],
          ["يَوْمُ السَّبْتِ", "yawmu s-sabti", "zaterdag"],
        ],
      },
      {
        title: "Hoe laat is het?",
        body: [
          "كَمِ السَّاعَةُ؟ = hoe laat is het? Je antwoordt met een rangtelwoord: السَّاعَةُ الثَّالِثَةُ (het is drie uur).",
          "وَالنِّصْفُ = half (… en een half), وَالرُّبْعُ = kwart over, إِلَّا رُبْعًا = kwart voor.",
        ],
        examples: [
          { ar: "السَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ", nl: "het is half vier (3:30)" },
          { ar: "السَّاعَةُ السَّابِعَةُ وَالرُّبْعُ", nl: "het is kwart over zeven (7:15)" },
          { ar: "السَّاعَةُ الْعَاشِرَةُ إِلَّا رُبْعًا", nl: "het is kwart voor tien (9:45)" },
        ],
      },
    ],
    words: [
      w("الْيَوْمَ", "al-yawma", "vandaag"),
      w("غَدًا", "ghadan", "morgen"),
      w("أُسْبُوع", "usbūʿ", "week", "zn. m., mv. أَسَابِيع"),
      w("يَوْمُ الْجُمُعَةِ", "yawmu l-jumuʿa", "vrijdag"),
      w("يَوْمُ السَّبْتِ", "yawmu s-sabt", "zaterdag"),
      w("نِصْف", "niṣf", "half, helft"),
      w("رُبْع", "rubʿ", "kwart"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel de dagen.", [["يَوْمُ الْأَحَدِ", "zondag"], ["يَوْمُ الِاثْنَيْنِ", "maandag"], ["يَوْمُ الْخَمِيسِ", "donderdag"], ["يَوْمُ السَّبْتِ", "zaterdag"]]),
      ex.type("vocabulary", "Hoe zeg je 'vrijdag'?", ["يوم الجمعة", "الجمعة"]),
      ex.type("vocabulary", "Hoe zeg je 'morgen'?", ["غدا"]),
      ex.mcq("vocabulary", "Wat betekent السَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ?", ["half vier (3:30)", "kwart over drie (3:15)", "half drie (2:30)"], 0),
      ex.type("writing", "Vertaal: Het is vijf uur.", ["الساعة الخامسة"]),
      ex.mcq("listening", "Luister. Hoe laat is het?", ["9:45", "10:15", "10:45"], 0, { audio: "السَّاعَةُ الْعَاشِرَةُ إِلَّا رُبْعًا" }),
      ex.order("writing", "Maak de zin: ik ga op maandag naar mijn werk.", ["أَذْهَبُ", "إِلَى", "الْعَمَلِ", "يَوْمَ", "الِاثْنَيْنِ"]),
      ex.type("writing", "Vertaal: Vandaag is het zaterdag.", ["اليوم يوم السبت", "اليوم السبت"]),
      ex.speak("كَمِ السَّاعَةُ؟", "Hoe laat is het?"),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'gisteren'?", ["أمس"]),
      test.type("writing", "Vertaal: Het is acht uur.", ["الساعة الثامنة"]),
      test.mcq("vocabulary", "Welke dag is يَوْمُ الْأَرْبِعَاءِ?", ["woensdag", "donderdag", "dinsdag"], 0),
      test.mcq("listening", "Luister. Hoe laat is het?", ["7:15", "7:45", "6:15"], 0, { audio: "السَّاعَةُ السَّابِعَةُ وَالرُّبْعُ" }),
      test.type("writing", "Vraag: Hoe laat is het?", ["كم الساعة"]),
    ],
  } satisfies Lesson;
})();

const l38 = (() => {
  const { ex, test } = builder(38);
  return {
    id: 38, module: M, level: "A1",
    title: "Kleuren en kleding", titleAr: "الْأَلْوَانُ وَالْمَلَابِسُ",
    goal: "Je beschrijft kleding met kleuren en kent de vrouwelijke vorm van kleuren.",
    minutes: 20, skills: ["vocabulary", "grammar", "writing"],
    sections: [
      {
        title: "Kleuren: een eigen patroon",
        body: [
          "Kleuren hebben het patroon أَفْعَل (m) en فَعْلَاء (v): أَحْمَر → حَمْرَاء.",
          "Kleuren krijgen geen tanween: قَمِيصٌ أَحْمَرُ (een rood overhemd), سَيَّارَةٌ بَيْضَاءُ (een witte auto).",
        ],
        table: [
          ["Mannelijk", "Vrouwelijk", "Nederlands"],
          ["أَحْمَر", "حَمْرَاء", "rood"],
          ["أَزْرَق", "زَرْقَاء", "blauw"],
          ["أَخْضَر", "خَضْرَاء", "groen"],
          ["أَصْفَر", "صَفْرَاء", "geel"],
          ["أَبْيَض", "بَيْضَاء", "wit"],
          ["أَسْوَد", "سَوْدَاء", "zwart"],
        ],
      },
      {
        title: "Kleding",
        body: ["أَلْبَسُ = ik draag (لَبِسَ / يَلْبَسُ)."],
        examples: [
          { ar: "قَمِيص", nl: "overhemd" },
          { ar: "بِنْطَال", nl: "broek" },
          { ar: "فُسْتَان", nl: "jurk" },
          { ar: "حِذَاء", nl: "schoen(en)" },
          { ar: "مِعْطَف", nl: "jas" },
        ],
      },
    ],
    words: [
      w("أَحْمَر", "aḥmar", "rood", "bn.; v. حَمْرَاء"),
      w("أَزْرَق", "azraq", "blauw", "bn.; v. زَرْقَاء"),
      w("أَخْضَر", "akhḍar", "groen", "bn.; v. خَضْرَاء"),
      w("أَبْيَض", "abyaḍ", "wit", "bn.; v. بَيْضَاء"),
      w("أَسْوَد", "aswad", "zwart", "bn.; v. سَوْدَاء"),
      w("قَمِيص", "qamīṣ", "overhemd", "zn. m."),
      w("فُسْتَان", "fustān", "jurk", "zn. m."),
      w("مِعْطَف", "miʿṭaf", "jas", "zn. m."),
      w("أَلْبَسُ", "albasu", "ik draag", "ww. (لَبِسَ)"),
    ],
    exercises: [
      ex.match("vocabulary", "Koppel de kleuren.", [["أَحْمَر", "rood"], ["أَزْرَق", "blauw"], ["أَخْضَر", "groen"], ["أَسْوَد", "zwart"]]),
      ex.type("grammar", "Maak vrouwelijk: أَحْمَر", ["حمراء"]),
      ex.type("grammar", "Maak vrouwelijk: أَبْيَض", ["بيضاء"]),
      ex.mcq("grammar", "Vul in: سَيَّارَةٌ ___ (een zwarte auto)", ["سَوْدَاءُ", "أَسْوَدُ", "سَوْدَاءٌ"], 0),
      ex.type("writing", "Vertaal: een blauw overhemd", ["قميص أزرق"]),
      ex.type("writing", "Vertaal: Ik draag een rode jurk.", ["ألبس فستانا أحمر", "ألبس فستان أحمر"]),
      ex.dictation("مِعْطَف"),
      ex.mcq("vocabulary", "Wat betekent حِذَاء?", ["schoen", "jas", "broek"], 0),
      ex.speak("أَلْبَسُ قَمِيصًا أَبْيَضَ", "Ik draag een wit overhemd."),
    ],
    test: [
      test.type("vocabulary", "Hoe zeg je 'groen' (m)?", ["أخضر"]),
      test.type("grammar", "Maak vrouwelijk: أَصْفَر", ["صفراء"]),
      test.type("writing", "Vertaal: een witte auto", ["سيارة بيضاء"]),
      test.mcq("grammar", "Welke vorm is correct?", ["قَمِيصٌ أَحْمَرُ", "قَمِيصٌ أَحْمَرٌ", "قَمِيصٌ حَمْرَاءُ"], 0),
      test.type("vocabulary", "Hoe zeg je 'broek'?", ["بنطال", "بنطلون"]),
    ],
  } satisfies Lesson;
})();

const l39 = (() => {
  const { ex, test } = builder(39);
  const passage = joinPassage(MY_DAY);
  return {
    id: 39, module: M, level: "A1",
    title: "Mijn dag", titleAr: "يَوْمِي",
    goal: "Je beschrijft je dagelijkse routine en begrijpt een tekst over iemands dag.",
    minutes: 25, skills: ["reading", "writing", "speaking", "reading_unvowelled"],
    sections: [
      {
        title: "Leestekst",
        body: [passage, "Nieuwe woorden: أَسْتَيْقِظُ (ik word wakker), أَتَنَاوَلُ الْفُطُورَ (ik ontbijt), دَرَّاجَة (fiets), أَطْبُخُ (ik kook), الْعَشَاء (avondeten), أَنَامُ (ik slaap)."],
      },
    ],
    words: [
      w("أَسْتَيْقِظُ", "astayqiẓu", "ik word wakker", "ww. (اِسْتَيْقَظَ)"),
      w("الْفُطُور", "al-fuṭūr", "het ontbijt"),
      w("دَرَّاجَة", "darrāja", "fiets", "zn. v."),
      w("أَطْبُخُ", "aṭbukhu", "ik kook", "ww. (طَبَخَ)"),
      w("الْعَشَاء", "al-ʿashāʾ", "het avondeten"),
      w("أَنَامُ", "anāmu", "ik slaap", "ww. (نَامَ)"),
      w("كُلَّ يَوْمٍ", "kulla yawmin", "elke dag"),
    ],
    exercises: [
      ex.mcq("reading", "Hoe laat wordt de schrijver wakker?", ["om half zeven", "om zes uur", "om zeven uur"], 0, { passage }),
      ex.mcq("reading", "Hoe gaat hij naar zijn werk?", ["met de fiets", "met de bus", "te voet"], 0, { passage }),
      ex.mcq("reading", "Wat doet hij 's avonds?", ["koken en Arabisch studeren", "sporten", "televisie kijken"], 0, { passage }),
      ex.type("writing", "Vertaal: Ik ga met de fiets naar mijn werk.", ["أذهب إلى العمل بالدراجة"]),
      ex.type("writing", "Vertaal: Ik kook het avondeten.", ["أطبخ العشاء"]),
      ex.order("writing", "Maak de zin: ik slaap om tien uur.", ["أَنَامُ", "فِي", "السَّاعَةِ", "الْعَاشِرَةِ"]),
      ex.dictation("كُلَّ يَوْمٍ", { answers: ["كل يوم"] }),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik werk in een kantoor.", "Ik woon in een kantoor.", "Mijn kantoor is groot."], 0, { promptAr: "أعمل في مكتب" }),
      ex.type("writing", "Vertaal: Ik word om zeven uur wakker.", ["أستيقظ في الساعة السابعة"]),
      ex.speak("أَسْتَيْقِظُ كُلَّ يَوْمٍ فِي السَّاعَةِ السَّابِعَةِ", "Ik word elke dag om zeven uur wakker."),
    ],
    test: [
      test.type("writing", "Vertaal: Ik slaap om elf uur.", ["أنام في الساعة الحادية عشرة"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik ontbijt met mijn vrouw.", "Mijn vrouw kookt het ontbijt.", "Ik eet met mijn vriend."], 0, { promptAr: "أتناول الفطور مع زوجتي" }),
      test.type("writing", "Vertaal: 's Avonds studeer ik Arabisch.", ["في المساء أدرس العربية", "أدرس العربية في المساء"]),
      test.mcq("listening", "Luister. Hoe gaat de spreker naar het werk?", ["met de bus", "met de fiets", "met de trein"], 0, { audio: "أَذْهَبُ إِلَى الْعَمَلِ بِالْحَافِلَةِ" }),
      test.speak("أَتَنَاوَلُ الْفُطُورَ ثُمَّ أَذْهَبُ إِلَى الْعَمَلِ", "Ik ontbijt en daarna ga ik naar mijn werk."),
    ],
  } satisfies Lesson;
})();

const l40 = (() => {
  const { ex, test } = builder(40);
  return {
    id: 40, module: M, level: "A1",
    title: "Niveautoets A1", titleAr: "اخْتِبَارُ الْمُسْتَوَى A1",
    goal: "Je laat zien dat je het hele A1-niveau beheerst: werkwoorden, ontkenning, meervoud, idafa, getallen en tijd.",
    minutes: 30, skills: ["grammar", "writing", "reading", "listening", "speaking"],
    sections: [
      {
        title: "Overzicht A1",
        body: [
          "Tegenwoordige tijd: أَكْتُبُ، تَكْتُبُ، يَكْتُبُ … Verleden tijd: كَتَبْتُ، كَتَبَ، كَتَبُوا …",
          "Ontkenning: لَا يَعْمَلُ / لَمْ يَعْمَلْ / لَيْسَ كَبِيرًا. Meervoud van dingen → vrouwelijk enkelvoud. Idafa: سَيَّارَةُ أَبِي.",
          "Deze toets telt als niveau-evaluatie: haal je hem, dan staat A1 op je dashboard als afgerond.",
        ],
      },
    ],
    words: [w("اخْتِبَار", "ikhtibār", "toets, test", "zn. m."), w("مُسْتَوَى", "mustawā", "niveau", "zn. m.")],
    exercises: [
      ex.type("grammar", "Vervoeg يَدْرُسُ voor نَحْنُ.", ["ندرس"]),
      ex.type("grammar", "Vervoeg ذَهَبَ voor هُمْ.", ["ذهبوا"]),
      ex.type("writing", "Vertaal: Ik heb niet gegeten. (met لَمْ)", ["لم آكل"], { hint: "أَكَلَ → يَأْكُلُ → ik: آكُلُ" }),
      ex.type("writing", "Vertaal: de deur van de kamer", ["باب الغرفة"]),
      ex.mcq("grammar", "Vul in: السَّيَّارَاتُ ___", ["جَدِيدَةٌ", "جَدِيدُونَ"], 0),
      ex.type("vocabulary", "Schrijf 25 in letters.", ["خمسة وعشرون", "خمس وعشرون", "خمسة وعشرين"]),
      ex.mcq("listening", "Luister. Wanneer gaat de spreker naar de markt?", ["op vrijdag", "op zondag", "vandaag"], 0, { audio: "أَذْهَبُ إِلَى السُّوقِ يَوْمَ الْجُمُعَةِ" }),
      ex.speak("لَسْتُ مِنْ هُنَا، أَنَا مِنْ هُولَنْدَا", "Ik kom niet van hier, ik kom uit Nederland."),
    ],
    test: [
      test.type("grammar", "Vervoeg يَعْمَلُ voor أَنْتِ.", ["تعملين"]),
      test.type("grammar", "Vervoeg شَرِبَ voor نَحْنُ.", ["شربنا"]),
      test.type("writing", "Vertaal: Ik weet het niet.", ["لا أعرف"]),
      test.type("writing", "Vertaal: Hij is niet thuis.", ["ليس في البيت", "هو ليس في البيت"]),
      test.type("grammar", "Meervoud van كِتَاب:", ["كتب"]),
      test.type("writing", "Vertaal: de auto van mijn broer", ["سيارة أخي"]),
      test.mcq("grammar", "Hoe zeg je 'dertig jaar'?", ["ثَلَاثُونَ سَنَةً", "ثَلَاثُونَ سَنَوَاتٍ", "ثَلَاثُ سَنَةٍ"], 0),
      test.mcq("listening", "Luister. Hoe laat is het?", ["half negen (8:30)", "kwart over acht", "negen uur"], 0, { audio: "السَّاعَةُ الثَّامِنَةُ وَالنِّصْفُ" }),
      test.type("writing", "Vertaal: een groene jas", ["معطف أخضر"]),
      test.speak("أَمْسِ ذَهَبْتُ إِلَى السُّوقِ وَاشْتَرَيْتُ خُبْزًا", "Gisteren ging ik naar de markt en kocht ik brood."),
    ],
  } satisfies Lesson;
})();

export const a1plusLessons: Lesson[] = [l31, l32, l33, l34, l35, l36, l37, l38, l39, l40];
