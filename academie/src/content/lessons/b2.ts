// Lessen 59–64: B2 (gevorderd). Passief, voorwaarden, verbindingswoorden, betogen, ḥāl.
// Langere teksten staan bewust zonder harakat.
import type { Lesson } from "../types";
import { CITY_VILLAGE, HOMEWORK, joinPassage } from "../passages";
import { builder, w } from "./helpers";

const M = "B2 Gevorderd";

const l59 = (() => {
  const { ex, test } = builder(59);
  return {
    id: 59, module: M, level: "B2",
    title: "De lijdende vorm", titleAr: "الْمَبْنِيُّ لِلْمَجْهُولِ",
    goal: "Je herkent en maakt de lijdende vorm in verleden en tegenwoordige tijd, en de constructie met تَمَّ.",
    minutes: 30, skills: ["grammar", "reading_unvowelled", "writing"],
    sections: [
      {
        title: "Klinkers veranderen",
        body: [
          "Verleden tijd: u – i – a: كَتَبَ → كُتِبَ (werd geschreven), فَتَحَ → فُتِحَ. Tegenwoordige tijd: u – a – a: يَكْتُبُ → يُكْتَبُ (wordt geschreven).",
          "Afgeleide vormen werken net zo: أَرْسَلَ → أُرْسِلَ، اِسْتَخْدَمَ → اُسْتُخْدِمَ.",
          "Zonder harakat zien actief en passief er hetzelfde uit (كتب). De context beslist. In kranten zie je daarom vaak تَمَّ + masdar: تَمَّ بِنَاءُ الْجِسْرِ (de brug is gebouwd).",
          "Een onpersoonlijk passief met بِـ: يُتَكَلَّمُ بِالْعَرَبِيَّةِ (er wordt Arabisch gesproken).",
        ],
        examples: [
          { ar: "كُتِبَتِ الرِّسَالَةُ بِالْعَرَبِيَّةِ.", nl: "De brief is in het Arabisch geschreven." },
          { ar: "يُقَالُ إِنَّ الْمَطْعَمَ مُمْتَازٌ.", nl: "Er wordt gezegd dat het restaurant uitstekend is." },
          { ar: "تَمَّ افْتِتَاحُ الْمَتْحَفِ عَامَ ١٩٩٠.", nl: "Het museum is in 1990 geopend." },
          { ar: "يُتَكَلَّمُ بِالْعَرَبِيَّةِ فِي أَكْثَرَ مِنْ عِشْرِينَ دَوْلَةً.", nl: "Er wordt in meer dan twintig landen Arabisch gesproken." },
        ],
      },
    ],
    words: [
      w("يُقَالُ", "yuqālu", "er wordt gezegd"),
      w("تَمَّ", "tamma", "werd voltooid; (met masdar) is …-d"),
      w("اِفْتِتَاح", "iftitāḥ", "opening", "masdar VIII"),
      w("مَتْحَف", "matḥaf", "museum", "zn. m., mv. مَتَاحِف"),
      w("دَوْلَة", "dawla", "staat, land", "zn. v., mv. دُوَل"),
      w("إِغْلَاق", "ighlāq", "sluiting", "masdar IV"),
    ],
    exercises: [
      ex.mcq("grammar", "Wat betekent كُتِبَ?", ["werd geschreven", "hij schreef", "schrijf!"], 0),
      ex.type("grammar", "Lijdende vorm (verleden, هُوَ) van كَتَبَ, mét harakat:", ["كُتِبَ"], { requireHarakat: true }),
      ex.type("grammar", "Lijdende vorm (verleden, هُوَ) van فَتَحَ, mét harakat:", ["فُتِحَ"], { requireHarakat: true }),
      ex.type("grammar", "Lijdende vorm (tegenwoordig, هُوَ) van يَكْتُبُ, mét harakat:", ["يُكْتَبُ"], { requireHarakat: true }),
      ex.mcq("grammar", "Hoe zeg je 'er wordt gezegd'?", ["يُقَالُ", "يَقُولُ", "قَالَ"], 0),
      ex.type("writing", "Vertaal met تَمَّ: Het huis is gebouwd.", ["تم بناء البيت"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Het museum is in 1990 geopend.", "Hij opende het museum in 1990.", "Het museum gaat in 1990 open."], 0, { promptAr: "تم افتتاح المتحف عام ١٩٩٠" }),
      ex.mcq("grammar", "Welke zin is passief?", ["سُرِقَتِ السَّيَّارَةُ", "سَرَقَ اللِّصُّ السَّيَّارَةَ"], 0),
      ex.order("writing", "Maak de zin: de brief is in het Arabisch geschreven.", ["كُتِبَتِ", "الرِّسَالَةُ", "بِالْعَرَبِيَّةِ"]),
      ex.speak("يُتَكَلَّمُ بِالْعَرَبِيَّةِ فِي أَكْثَرَ مِنْ عِشْرِينَ دَوْلَةً", "Er wordt in meer dan twintig landen Arabisch gesproken."),
    ],
    test: [
      test.type("grammar", "Lijdende vorm (verleden, هُوَ) van أَرْسَلَ, mét harakat:", ["أُرْسِلَ"], { requireHarakat: true }),
      test.mcq("grammar", "Wat betekent يُتَوَقَّعُ?", ["er wordt verwacht", "hij verwacht", "het werd verwacht"], 0),
      test.type("writing", "Vertaal met تَمَّ: Het project is afgerond.", ["تم إنجاز المشروع", "تم إكمال المشروع", "تم الانتهاء من المشروع"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De weg is afgesloten vanwege de sneeuw.", "De sneeuw heeft de weg geopend.", "Hij sloot de weg af."], 0, { promptAr: "تم إغلاق الطريق بسبب الثلج" }),
      test.type("writing", "Vertaal: De brief is verstuurd.", ["أرسلت الرسالة", "تم إرسال الرسالة"]),
    ],
  } satisfies Lesson;
})();

const l60 = (() => {
  const { ex, test } = builder(60);
  return {
    id: 60, module: M, level: "B2",
    title: "Voorwaardelijke zinnen", titleAr: "الْجُمْلَةُ الشَّرْطِيَّةُ",
    goal: "Je maakt reële en onwerkelijke voorwaardelijke zinnen met إِذَا، إِنْ en لَوْ.",
    minutes: 30, skills: ["grammar", "writing", "listening"],
    sections: [
      {
        title: "Drie woorden voor 'als'",
        body: [
          "إِذَا: een reële of verwachte voorwaarde, meestal met de verleden tijd (die dan géén verleden betekent): إِذَا دَرَسْتَ نَجَحْتَ (als je studeert, slaag je).",
          "إِنْ: formeler, met de verkorte vorm (مَجْزُوم) of de verleden tijd: إِنْ تَدْرُسْ تَنْجَحْ.",
          "لَوْ: een onwerkelijke voorwaarde. De hoofdzin begint met لَـ: لَوْ كَانَ عِنْدِي وَقْتٌ لَسَافَرْتُ (als ik tijd had, zou ik reizen).",
          "Gebruik فَـ voor het antwoord als dat een naamwoordzin, toekomst, gebiedende wijs of verbod is: إِذَا تَعِبْتَ فَاسْتَرِحْ.",
        ],
        examples: [
          { ar: "إِذَا كَانَ الْجَوُّ جَمِيلًا فَسَنَخْرُجُ.", nl: "Als het weer mooi is, gaan we naar buiten." },
          { ar: "لَوْ عَرَفْتُ لَأَخْبَرْتُكَ.", nl: "Als ik het had geweten, had ik het je verteld." },
          { ar: "إِنْ تَزُرْنِي أَزُرْكَ.", nl: "Als jij mij bezoekt, bezoek ik jou." },
        ],
      },
    ],
    words: [w("إِذَا", "idhā", "als (reëel)"), w("لَوْ", "law", "als (onwerkelijk)"), w("يَخْرُجُ", "yakhruju", "hij gaat naar buiten", "ww. (خَرَجَ)"), w("اِسْتَرَاحَ", "istarāḥa", "uitrusten", "ww. X"), w("غَنِيّ", "ghaniyy", "rijk", "bn.")],
    exercises: [
      ex.mcq("grammar", "Welk woord gebruik je voor een onwerkelijke voorwaarde?", ["لَوْ", "إِذَا", "إِنْ"], 0),
      ex.type("writing", "Vertaal: Als je studeert, slaag je. (m)", ["إذا درست نجحت", "إذا درست فستنجح", "إن تدرس تنجح"]),
      ex.mcq("grammar", "Vul in: لَوْ كُنْتُ غَنِيًّا ___ بَيْتًا كَبِيرًا", ["لَاشْتَرَيْتُ", "اِشْتَرِ", "أَشْتَرِي"], 0),
      ex.type("writing", "Vertaal: Als het regent, blijf ik thuis.", ["إذا أمطرت بقيت في البيت", "إذا نزل المطر سأبقى في البيت", "إذا أمطرت فسأبقى في البيت"]),
      ex.mcq("grammar", "Waarom staat er فَـ in إِذَا تَعِبْتَ فَاسْتَرِحْ?", ["het antwoord is een gebiedende wijs", "het is een vraag", "het is verleden tijd"], 0),
      ex.order("writing", "Maak de zin: als ik tijd had, zou ik reizen.", ["لَوْ", "كَانَ", "عِنْدِي", "وَقْتٌ", "لَسَافَرْتُ"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Als jij mij bezoekt, bezoek ik jou.", "Jij hebt mij bezocht.", "Bezoek mij!"], 0, { promptAr: "إن تزرني أزرك" }),
      ex.type("writing", "Vertaal: Als ik tijd had, zou ik meer lezen.", ["لو كان عندي وقت لقرأت أكثر", "لو كان لدي وقت لقرأت أكثر"]),
      ex.speak("إِذَا كَانَ الْجَوُّ جَمِيلًا فَسَنَخْرُجُ", "Als het weer mooi is, gaan we naar buiten."),
    ],
    test: [
      test.type("writing", "Vertaal: Als je moe bent, rust dan uit. (m)", ["إذا تعبت فاسترح"]),
      test.mcq("grammar", "Vul in: إِنْ ___ تَنْجَحْ", ["تَدْرُسْ", "تَدْرُسُونَ", "يَدْرُسُ"], 0),
      test.mcq("listening", "Luister. Wat betekent dit?", ["Als ik het had geweten, had ik het je verteld.", "Ik wist het en vertelde het je.", "Vertel het mij als je het weet."], 0, { audio: "لَوْ عَرَفْتُ لَأَخْبَرْتُكَ" }),
      test.mcq("grammar", "Welke zin is onwerkelijk?", ["لَوْ كُنْتُ هُنَاكَ لَسَاعَدْتُكَ", "إِذَا كُنْتَ هُنَاكَ فَسَاعِدْنِي"], 0),
      test.speak("لَوْ كَانَ عِنْدِي وَقْتٌ لَسَافَرْتُ", "Als ik tijd had, zou ik reizen."),
    ],
  } satisfies Lesson;
})();

const l61 = (() => {
  const { ex, test } = builder(61);
  return {
    id: 61, module: M, level: "B2",
    title: "Verbindingswoorden", titleAr: "أَدَوَاتُ الرَّبْطِ",
    goal: "Je verbindt zinnen logisch met woorden als omdat, daarom, ondanks, terwijl en wat betreft.",
    minutes: 25, skills: ["grammar", "writing", "reading_unvowelled"],
    sections: [
      {
        title: "Logische verbanden",
        body: [
          "لِأَنَّ (omdat) wordt gevolgd door een naamwoord of voornaamwoord in de accusatief: لِأَنَّ الْجَوَّ بَارِدٌ، لِأَنَّهُ مَرِيضٌ.",
          "بِسَبَبِ (vanwege) en عَلَى الرَّغْمِ مِنْ (ondanks) worden gevolgd door een zelfstandig naamwoord.",
          "أَمَّا … فَـ = wat … betreft: أَمَّا أَخِي فَيَعْمَلُ فِي لَنْدَنَ.",
        ],
        table: [
          ["Arabisch", "Nederlands"],
          ["لِأَنَّ", "omdat"],
          ["لِذَلِكَ", "daarom"],
          ["بِسَبَبِ", "vanwege"],
          ["عَلَى الرَّغْمِ مِنْ", "ondanks"],
          ["بَيْنَمَا", "terwijl"],
          ["إِضَافَةً إِلَى ذَلِكَ", "bovendien"],
          ["أَمَّا … فَـ", "wat … betreft"],
          ["حَتَّى", "zodat; tot; zelfs"],
        ],
        examples: [
          { ar: "لَمْ أَخْرُجْ لِأَنَّ الْجَوَّ كَانَ بَارِدًا.", nl: "Ik ging niet naar buiten, omdat het koud was." },
          { ar: "كَانَ الْجَوُّ بَارِدًا، لِذَلِكَ بَقِيتُ فِي الْبَيْتِ.", nl: "Het was koud, daarom bleef ik thuis." },
          { ar: "خَرَجْتُ عَلَى الرَّغْمِ مِنَ الْمَطَرِ.", nl: "Ik ging naar buiten ondanks de regen." },
        ],
      },
    ],
    words: [w("لِأَنَّ", "li-anna", "omdat"), w("لِذَلِكَ", "li-dhālika", "daarom"), w("بِسَبَبِ", "bi-sababi", "vanwege"), w("عَلَى الرَّغْمِ مِنْ", "ʿalā r-raghmi min", "ondanks"), w("بَيْنَمَا", "baynamā", "terwijl"), w("ضَجِيج", "ḍajīj", "lawaai", "zn. m."), w("مَجَّانِيّ", "majjāniyy", "gratis", "bn.")],
    exercises: [
      ex.mcq("grammar", "Vul in: لَمْ أَنَمْ ___ الضَّجِيجِ", ["بِسَبَبِ", "لِأَنَّ", "لِذَلِكَ"], 0),
      ex.mcq("grammar", "Vul in: بَقِيتُ فِي الْبَيْتِ ___ الْجَوَّ بَارِدٌ", ["لِأَنَّ", "بِسَبَبِ", "لِذَلِكَ"], 0),
      ex.type("writing", "Vertaal: daarom", ["لذلك", "ولذلك"]),
      ex.type("writing", "Vertaal: ondanks de regen", ["على الرغم من المطر", "بالرغم من المطر", "رغم المطر"]),
      ex.type("writing", "Verbind met بَيْنَمَا: Ik lees. Mijn broer slaapt.", ["أقرأ بينما ينام أخي", "أقرأ بينما أخي نائم"]),
      ex.mcq("grammar", "Wat volgt na أَمَّا …?", ["فَـ", "لِـ", "وَ"], 0),
      ex.order("writing", "Maak de zin: wat mijn broer betreft, hij werkt in Londen.", ["أَمَّا", "أَخِي", "فَيَعْمَلُ", "فِي", "لَنْدَنَ"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Bovendien is de studie gratis.", "De studie is duur.", "Daarom is de studie moeilijk."], 0, { promptAr: "إضافة إلى ذلك، الدراسة مجانية" }),
      ex.speak("كَانَ الْجَوُّ بَارِدًا، لِذَلِكَ بَقِيتُ فِي الْبَيْتِ", "Het was koud, daarom bleef ik thuis."),
    ],
    test: [
      test.type("writing", "Vertaal: omdat", ["لأن"]),
      test.type("writing", "Vertaal: vanwege het werk", ["بسبب العمل"]),
      test.mcq("grammar", "Vul in: ___ التَّعَبِ، أَكْمَلَ عَمَلَهُ", ["عَلَى الرَّغْمِ مِنَ", "لِأَنَّ", "لِذَلِكَ"], 0),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ondanks de vermoeidheid maakte hij zijn werk af.", "Door de vermoeidheid stopte hij.", "Hij was moe na het werk."], 0, { promptAr: "على الرغم من التعب، أكمل عمله" }),
      test.type("writing", "Vertaal: Het was koud, daarom bleef ik thuis.", ["كان الجو باردا لذلك بقيت في البيت", "كان الطقس باردا لذلك بقيت في البيت"]),
    ],
  } satisfies Lesson;
})();

const l62 = (() => {
  const { ex, test } = builder(62);
  const passage = joinPassage(HOMEWORK);
  return {
    id: 62, module: M, level: "B2",
    title: "Je mening geven", titleAr: "التَّعْبِيرُ عَنِ الرَّأْيِ",
    goal: "Je geeft en onderbouwt je mening en reageert op die van anderen.",
    minutes: 30, skills: ["speaking", "writing", "reading_unvowelled"],
    sections: [
      {
        title: "Uitdrukkingen",
        body: ["Na أَعْتَقِدُ أَنَّ en أَظُنُّ أَنَّ staat het onderwerp in de accusatief (net als na إِنَّ)."],
        table: [
          ["Arabisch", "Nederlands"],
          ["فِي رَأْيِي", "naar mijn mening"],
          ["أَعْتَقِدُ أَنَّ", "ik denk / geloof dat"],
          ["أَتَّفِقُ مَعَكَ", "ik ben het met je eens"],
          ["لَا أَتَّفِقُ مَعَكَ", "ik ben het niet met je eens"],
          ["مِنْ نَاحِيَةٍ … وَمِنْ نَاحِيَةٍ أُخْرَى", "aan de ene kant … aan de andere kant"],
          ["مِنَ الْمُهِمِّ أَنْ", "het is belangrijk om"],
          ["لَا شَكَّ أَنَّ", "het lijdt geen twijfel dat"],
        ],
      },
      { title: "Leestekst (zonder harakat)", body: [passage] },
    ],
    words: [w("رَأْي", "raʾy", "mening", "zn. m., mv. آرَاء"), w("أَعْتَقِدُ", "aʿtaqidu", "ik geloof, denk", "ww. VIII"), w("أَتَّفِقُ", "attafiqu", "ik ben het eens", "ww. VIII"), w("فَائِدَة", "fāʾida", "voordeel, nut", "zn. v., mv. فَوَائِد"), w("حَلّ", "ḥall", "oplossing", "zn. m."), w("الْوَحْدَة", "al-waḥda", "eenzaamheid")],
    exercises: [
      ex.mcq("reading_unvowelled", "Wat is volgens de schrijver een voordeel van thuiswerken?", ["je bespaart reistijd", "je verdient meer", "je ziet je collega's vaker"], 0, { passage }),
      ex.mcq("reading_unvowelled", "En een nadeel?", ["je kunt je eenzaam voelen", "het kost veel geld", "je werkt minder"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat is volgens de schrijver de beste oplossing?", ["twee of drie dagen per week thuiswerken", "altijd thuiswerken", "nooit thuiswerken"], 0, { passage }),
      ex.type("writing", "Vertaal: Naar mijn mening is Arabisch mooi.", ["في رأيي العربية جميلة", "في رأيي اللغة العربية جميلة"]),
      ex.type("writing", "Vertaal: Ik ben het met je eens. (m)", ["أتفق معك", "أنا أتفق معك"]),
      ex.mcq("grammar", "Vul in: أَعْتَقِدُ أَنَّ ___ مُفِيدَةٌ", ["الْقِرَاءَةَ", "الْقِرَاءَةُ"], 0),
      ex.type("writing", "Vertaal: Het is belangrijk om te lezen.", ["من المهم أن نقرأ", "من المهم القراءة", "من المهم أن تقرأ"]),
      ex.match("vocabulary", "Koppel de uitdrukkingen.", [["فِي رَأْيِي", "naar mijn mening"], ["لَا شَكَّ أَنَّ", "zonder twijfel"], ["مِنْ نَاحِيَةٍ", "aan de ene kant"]]),
      ex.speak("لَا أَتَّفِقُ مَعَكَ تَمَامًا", "Ik ben het niet helemaal met je eens."),
    ],
    test: [
      test.type("writing", "Vertaal: Ik ben het niet met je eens. (m)", ["لا أتفق معك"]),
      test.type("writing", "Vertaal: aan de ene kant", ["من ناحية", "من جهة"]),
      test.type("writing", "Vertaal: zonder twijfel", ["لا شك", "بلا شك", "دون شك"]),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Ik denk dat de beste oplossing samenwerken is.", "Er is geen oplossing.", "Hij werkt liever alleen."], 0, { promptAr: "أعتقد أن الحل الأفضل هو التعاون" }),
      test.speak("فِي رَأْيِي، مِنَ الْمُهِمِّ أَنْ نَقْرَأَ كُلَّ يَوْمٍ", "Naar mijn mening is het belangrijk om elke dag te lezen."),
    ],
  } satisfies Lesson;
})();

const l63 = (() => {
  const { ex, test } = builder(63);
  return {
    id: 63, module: M, level: "B2",
    title: "Toestand en doel: ḥāl en lām", titleAr: "الْحَالُ وَلَامُ التَّعْلِيلِ",
    goal: "Je beschrijft hoe iemand iets doet (ḥāl) en waarom (لِـ + werkwoord).",
    minutes: 25, skills: ["grammar", "writing", "reading_unvowelled"],
    sections: [
      {
        title: "De ḥāl: in welke toestand?",
        body: [
          "De ḥāl (الْحَال) beschrijft de toestand van het onderwerp of voorwerp tijdens de handeling. Het is een onbepaald bijvoeglijk naamwoord of deelwoord in de accusatief: رَجَعَ أَحْمَدُ سَعِيدًا (Ahmed kwam blij terug).",
          "Het volgt het geslacht en getal: دَخَلَتِ الْبِنْتُ مُبْتَسِمَةً، خَرَجَ الطُّلَّابُ فَرِحِينَ.",
          "Ook een zin kan een ḥāl zijn, met وَ: جَاءَ وَهُوَ يَرْكُضُ (hij kwam rennend aan).",
        ],
      },
      {
        title: "Doel: لِـ + werkwoord",
        body: ["لِـ + aanvoegende wijs = om te: ذَهَبْتُ إِلَى السُّوقِ لِأَشْتَرِيَ خُبْزًا. Of met een masdar: لِشِرَاءِ الْخُبْزِ."],
      },
    ],
    words: [w("مُبْتَسِم", "mubtasim", "glimlachend", "deelwoord VIII"), w("سَعِيد", "saʿīd", "blij, gelukkig", "bn."), w("مُسْرِع", "musriʿ", "haastig, snel", "deelwoord IV"), w("ضَاحِك", "ḍāḥik", "lachend", "deelwoord I"), w("فَرِح", "fariḥ", "blij", "bn.")],
    exercises: [
      ex.mcq("grammar", "Welk woord is de ḥāl in رَجَعَ أَحْمَدُ سَعِيدًا?", ["سَعِيدًا", "رَجَعَ", "أَحْمَدُ"], 0),
      ex.mcq("grammar", "Vul in: دَخَلَتِ الْبِنْتُ ___", ["مُبْتَسِمَةً", "مُبْتَسِمَةٌ", "مُبْتَسِمًا"], 0),
      ex.type("writing", "Vertaal: Hij kwam lachend binnen.", ["دخل ضاحكا"]),
      ex.type("writing", "Vertaal: Ik ging naar de markt om brood te kopen.", ["ذهبت إلى السوق لأشتري خبزا", "ذهبت إلى السوق لشراء الخبز", "ذهبت إلى السوق لأشتري الخبز"]),
      ex.mcq("grammar", "Wat betekent جَاءَ وَهُوَ يَرْكُضُ?", ["hij kwam rennend aan", "hij kwam en ging rennen", "hij rende weg"], 0),
      ex.order("writing", "Maak de zin: ik reisde naar Egypte om Arabisch te studeren.", ["سَافَرْتُ", "إِلَى", "مِصْرَ", "لِأَدْرُسَ", "الْعَرَبِيَّةَ"]),
      ex.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["De kinderen kwamen blij uit school.", "De kinderen gingen blij naar school.", "De school was blij."], 0, { promptAr: "خرج الأطفال من المدرسة فرحين" }),
      ex.type("writing", "Vertaal: Ze kwam haastig. (مُسْرِعَة)", ["جاءت مسرعة"]),
      ex.speak("رَجَعَ أَحْمَدُ مِنَ السَّفَرِ سَعِيدًا", "Ahmed kwam blij terug van de reis."),
    ],
    test: [
      test.mcq("grammar", "In welke naamval staat de ḥāl?", ["accusatief", "nominatief", "genitief"], 0),
      test.type("writing", "Vertaal: Ik studeer Arabisch om boeken te lezen.", ["أدرس العربية لأقرأ الكتب", "أدرس العربية لقراءة الكتب"]),
      test.mcq("grammar", "Vul in: رَجَعَ الطُّلَّابُ ___", ["فَرِحِينَ", "فَرِحُونَ"], 0),
      test.type("writing", "Vertaal: Hij antwoordde glimlachend.", ["أجاب مبتسما"]),
      test.speak("ذَهَبْتُ إِلَى الْمَكْتَبَةِ لِأَقْرَأَ", "Ik ging naar de bibliotheek om te lezen."),
    ],
  } satisfies Lesson;
})();

const l64 = (() => {
  const { ex, test } = builder(64);
  const passage = joinPassage(CITY_VILLAGE);
  return {
    id: 64, module: M, level: "B2",
    title: "Niveautoets B2", titleAr: "اخْتِبَارُ الْمُسْتَوَى B2",
    goal: "Je begrijpt een betogende tekst zonder harakat en gebruikt passief, voorwaarden en verbindingswoorden zelf.",
    minutes: 40, skills: ["reading_unvowelled", "grammar", "writing", "speaking"],
    sections: [{ title: "Leestekst: stad of dorp? (zonder harakat)", body: [passage] }],
    words: [w("الْبِنْيَة التَّحْتِيَّة", "al-binya t-taḥtiyya", "de infrastructuur"), w("الْهُدُوء", "al-hudūʾ", "de rust"), w("الْخِدْمَات", "al-khidmāt", "de voorzieningen, diensten"), w("اِسْتَثْمَرَ", "istathmara", "investeren", "ww. X")],
    exercises: [
      ex.mcq("reading_unvowelled", "Waarom verhuizen jongeren naar de stad?", ["voor werk en onderwijs", "voor de rust", "omdat het goedkoper is"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat is een nadeel van de stad?", ["het leven is duurder en drukker", "er zijn weinig kansen", "er is geen onderwijs"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat is het probleem van het dorp?", ["gebrek aan voorzieningen", "te veel lawaai", "zwakke sociale banden"], 0, { passage }),
      ex.mcq("reading_unvowelled", "Wat stelt de schrijver voor?", ["investeren in infrastructuur in dorpen", "meer huizen in de stad", "jongeren verbieden te verhuizen"], 0, { passage }),
      ex.type("writing", "Vertaal: de infrastructuur", ["البنية التحتية"]),
      ex.speak("لَوِ اسْتَثْمَرَتِ الدَّوْلَةُ فِي الْقُرَى لَبَقِيَ الشَّبَابُ فِيهَا", "Als de staat in de dorpen zou investeren, zouden de jongeren er blijven."),
    ],
    test: [
      test.type("grammar", "Lijdende vorm (verleden, هُوَ) van فَتَحَ, mét harakat:", ["فُتِحَ"], { requireHarakat: true }),
      test.type("writing", "Vertaal met تَمَّ: De school is gesloten.", ["تم إغلاق المدرسة"]),
      test.type("writing", "Vertaal: Als ik rijk was, zou ik reizen.", ["لو كنت غنيا لسافرت"]),
      test.type("writing", "Vertaal: ondanks de drukte", ["على الرغم من الازدحام", "بالرغم من الازدحام", "رغم الازدحام"]),
      test.mcq("grammar", "Vul in: أَعْتَقِدُ أَنَّ ___ مُهِمٌّ", ["التَّعْلِيمَ", "التَّعْلِيمُ", "التَّعْلِيمِ"], 0),
      test.mcq("grammar", "Vul in: دَخَلَ الْأَطْفَالُ ___", ["فَرِحِينَ", "فَرِحُونَ", "فَرِحٌ"], 0),
      test.mcq("reading_unvowelled", "Lees zonder harakat. Wat betekent dit?", ["Het dorp onderscheidt zich door rust.", "Het dorp is erg druk.", "Het dorp heeft veel voorzieningen."], 0, { promptAr: "تتميز القرية بالهدوء" }),
      test.type("writing", "Vertaal: daarom denk ik dat…", ["لذلك أعتقد أن", "لذلك أظن أن"]),
      test.mcq("grammar", "Wat betekent يُقَالُ إِنَّ…?", ["er wordt gezegd dat…", "hij zegt dat…", "zeg dat…"], 0),
      test.speak("مِنْ نَاحِيَةٍ تُوَفِّرُ الْمَدِينَةُ فُرَصًا كَثِيرَةً", "Aan de ene kant biedt de stad veel kansen."),
    ],
  } satisfies Lesson;
})();

export const b2Lessons: Lesson[] = [l59, l60, l61, l62, l63, l64];
