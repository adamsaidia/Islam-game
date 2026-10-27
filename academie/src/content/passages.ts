// Leesteksten voor A1-verdieping t/m C1. Ze worden gebruikt in de lessen én in de leesmodule.
// A1–B1: volledig gevocaliseerd. B2–C1: bewust zonder tashkeel, zoals in kranten en boeken.
export type Passage = {
  id: string;
  title: string;
  sentences: { ar: string; nl: string }[];
  gloss: [string, string][];
};

export const joinPassage = (p: Passage) => p.sentences.map((s) => s.ar).join(" ");

export const MY_DAY: Passage = {
  id: "mijn-dag",
  title: "Mijn dag",
  sentences: [
    { ar: "أَسْتَيْقِظُ كُلَّ يَوْمٍ فِي السَّاعَةِ السَّادِسَةِ وَالنِّصْفِ.", nl: "Ik word elke dag om half zeven wakker." },
    { ar: "أَتَنَاوَلُ الْفُطُورَ مَعَ زَوْجَتِي، ثُمَّ أَذْهَبُ إِلَى الْعَمَلِ بِالدَّرَّاجَةِ.", nl: "Ik ontbijt met mijn vrouw, daarna ga ik met de fiets naar mijn werk." },
    { ar: "أَعْمَلُ فِي مَكْتَبٍ مِنَ السَّاعَةِ التَّاسِعَةِ إِلَى السَّاعَةِ الْخَامِسَةِ.", nl: "Ik werk in een kantoor van negen tot vijf uur." },
    { ar: "فِي الْمَسَاءِ أَطْبُخُ الْعَشَاءَ وَأَدْرُسُ الْعَرَبِيَّةَ.", nl: "'s Avonds kook ik het avondeten en studeer ik Arabisch." },
    { ar: "أَنَامُ فِي السَّاعَةِ الْحَادِيَةَ عَشْرَةَ.", nl: "Ik ga om elf uur slapen." },
  ],
  gloss: [
    ["أَسْتَيْقِظُ", "ik word wakker"], ["كُلَّ", "elke"], ["يَوْمٍ", "dag"], ["فِي", "in, om"], ["السَّاعَةِ", "het uur"],
    ["السَّادِسَةِ", "het zesde"], ["وَالنِّصْفِ", "en de helft (half)"], ["أَتَنَاوَلُ", "ik neem (eten)"], ["الْفُطُورَ", "het ontbijt"],
    ["مَعَ", "met"], ["زَوْجَتِي", "mijn vrouw"], ["ثُمَّ", "daarna"], ["أَذْهَبُ", "ik ga"], ["إِلَى", "naar, tot"], ["الْعَمَلِ", "het werk"],
    ["بِالدَّرَّاجَةِ", "met de fiets"], ["أَعْمَلُ", "ik werk"], ["مَكْتَبٍ", "een kantoor"], ["مِنَ", "vanaf"], ["التَّاسِعَةِ", "het negende"],
    ["الْخَامِسَةِ", "het vijfde"], ["الْمَسَاءِ", "de avond"], ["أَطْبُخُ", "ik kook"], ["الْعَشَاءَ", "het avondeten"], ["وَأَدْرُسُ", "en ik studeer"],
    ["الْعَرَبِيَّةَ", "het Arabisch"], ["أَنَامُ", "ik slaap"], ["الْحَادِيَةَ", "elfde (deel 1)"], ["عَشْرَةَ", "elfde (deel 2)"],
  ],
};

export const MOROCCO_TRIP: Passage = {
  id: "reis-marokko",
  title: "Een reis naar Marokko",
  sentences: [
    { ar: "فِي الصَّيْفِ الْمَاضِي سَافَرْتُ مَعَ عَائِلَتِي إِلَى الْمَغْرِبِ.", nl: "Afgelopen zomer reisde ik met mijn familie naar Marokko." },
    { ar: "رَكِبْنَا الطَّائِرَةَ مِنْ أَمْسْتِرْدَام إِلَى مَرَّاكُشَ.", nl: "We namen het vliegtuig van Amsterdam naar Marrakesh." },
    { ar: "كَانَ الْجَوُّ حَارًّا جِدًّا.", nl: "Het was erg warm." },
    { ar: "زُرْنَا الْأَسْوَاقَ الْقَدِيمَةَ وَاشْتَرَيْنَا هَدَايَا لِأَصْدِقَائِنَا.", nl: "We bezochten de oude markten en kochten cadeaus voor onze vrienden." },
    { ar: "أَكَلْنَا الطَّاجِينَ فِي مَطْعَمٍ صَغِيرٍ، وَكَانَ لَذِيذًا.", nl: "We aten tajine in een klein restaurant, en het was lekker." },
    { ar: "فِي السَّنَةِ الْقَادِمَةِ سَنَزُورُ الرِّبَاطَ وَطَنْجَةَ.", nl: "Volgend jaar bezoeken we Rabat en Tanger." },
  ],
  gloss: [
    ["فِي", "in"], ["الصَّيْفِ", "de zomer"], ["الْمَاضِي", "vorige, afgelopen"], ["سَافَرْتُ", "ik reisde"], ["مَعَ", "met"], ["عَائِلَتِي", "mijn familie"],
    ["إِلَى", "naar"], ["الْمَغْرِبِ", "Marokko"], ["رَكِبْنَا", "wij stapten in, namen"], ["الطَّائِرَةَ", "het vliegtuig"], ["مِنْ", "van, uit"],
    ["أَمْسْتِرْدَام", "Amsterdam"], ["مَرَّاكُشَ", "Marrakesh"], ["كَانَ", "was"], ["الْجَوُّ", "het weer"], ["حَارًّا", "warm, heet"], ["جِدًّا", "erg"],
    ["زُرْنَا", "wij bezochten"], ["الْأَسْوَاقَ", "de markten"], ["الْقَدِيمَةَ", "oude"], ["وَاشْتَرَيْنَا", "en wij kochten"], ["هَدَايَا", "cadeaus"],
    ["لِأَصْدِقَائِنَا", "voor onze vrienden"], ["أَكَلْنَا", "wij aten"], ["الطَّاجِينَ", "de tajine"], ["مَطْعَمٍ", "een restaurant"], ["صَغِيرٍ", "klein"],
    ["وَكَانَ", "en het was"], ["لَذِيذًا", "lekker"], ["السَّنَةِ", "het jaar"], ["الْقَادِمَةِ", "volgende, komende"], ["سَنَزُورُ", "wij zullen bezoeken"],
    ["الرِّبَاطَ", "Rabat"], ["وَطَنْجَةَ", "en Tanger"],
  ],
};

export const YUSUF_STORY: Passage = {
  id: "yusuf-leert",
  title: "Yusuf leert Nederlands",
  sentences: [
    { ar: "بَدَأَ يُوسُفُ يَتَعَلَّمُ اللُّغَةَ الْهُولَنْدِيَّةَ قَبْلَ سَنَتَيْنِ.", nl: "Yusuf begon twee jaar geleden Nederlands te leren." },
    { ar: "فِي الْبِدَايَةِ كَانَ يَجِدُ الْقَوَاعِدَ صَعْبَةً، لَكِنَّهُ لَمْ يَسْتَسْلِمْ.", nl: "In het begin vond hij de grammatica moeilijk, maar hij gaf niet op." },
    { ar: "كَانَ يَسْتَمِعُ إِلَى الْأَخْبَارِ كُلَّ صَبَاحٍ وَيَكْتُبُ الْكَلِمَاتِ الْجَدِيدَةَ فِي دَفْتَرٍ صَغِيرٍ.", nl: "Hij luisterde elke ochtend naar het nieuws en schreef de nieuwe woorden in een klein schrift." },
    { ar: "الْيَوْمَ يَعْمَلُ مُتَرْجِمًا فِي مَكْتَبٍ لِلْهِجْرَةِ، وَيُسَاعِدُ الْعَائِلَاتِ الْعَرَبِيَّةَ الْجَدِيدَةَ.", nl: "Nu werkt hij als tolk bij een immigratiekantoor en helpt hij nieuwe Arabische gezinnen." },
  ],
  gloss: [
    ["بَدَأَ", "hij begon"], ["يُوسُفُ", "Yusuf"], ["يَتَعَلَّمُ", "(hij) leert"], ["اللُّغَةَ", "de taal"], ["الْهُولَنْدِيَّةَ", "Nederlandse"],
    ["قَبْلَ", "voor, geleden"], ["سَنَتَيْنِ", "twee jaar"], ["فِي", "in"], ["الْبِدَايَةِ", "het begin"], ["كَانَ", "was; (met ww.) deed altijd"],
    ["يَجِدُ", "vindt"], ["الْقَوَاعِدَ", "de (grammatica)regels"], ["صَعْبَةً", "moeilijk"], ["لَكِنَّهُ", "maar hij"], ["لَمْ", "niet (verleden)"],
    ["يَسْتَسْلِمْ", "opgeven"], ["يَسْتَمِعُ", "luistert"], ["إِلَى", "naar"], ["الْأَخْبَارِ", "het nieuws"], ["كُلَّ", "elke"], ["صَبَاحٍ", "ochtend"],
    ["وَيَكْتُبُ", "en schrijft"], ["الْكَلِمَاتِ", "de woorden"], ["الْجَدِيدَةَ", "nieuwe"], ["دَفْتَرٍ", "een schrift"], ["صَغِيرٍ", "klein"],
    ["الْيَوْمَ", "vandaag, nu"], ["يَعْمَلُ", "werkt"], ["مُتَرْجِمًا", "als tolk/vertaler"], ["مَكْتَبٍ", "een kantoor"], ["لِلْهِجْرَةِ", "voor immigratie"],
    ["وَيُسَاعِدُ", "en helpt"], ["الْعَائِلَاتِ", "de gezinnen"], ["الْعَرَبِيَّةَ", "Arabische"],
  ],
};

export const SALMA_WORK: Passage = {
  id: "salma-werk",
  title: "Het werk van Salma",
  sentences: [
    { ar: "تَعْمَلُ سَلْمَى مُهَنْدِسَةً فِي شَرِكَةٍ كَبِيرَةٍ فِي رُوتِرْدَام.", nl: "Salma werkt als ingenieur bij een groot bedrijf in Rotterdam." },
    { ar: "يَبْدَأُ عَمَلُهَا فِي السَّاعَةِ الثَّامِنَةِ صَبَاحًا.", nl: "Haar werk begint om acht uur 's ochtends." },
    { ar: "تَحْضُرُ اجْتِمَاعًا مَعَ زُمَلَائِهَا كُلَّ يَوْمِ اثْنَيْنِ.", nl: "Ze woont elke maandag een vergadering bij met haar collega's." },
    { ar: "رَاتِبُهَا جَيِّدٌ، لَكِنَّ الْعَمَلَ مُتْعِبٌ أَحْيَانًا.", nl: "Haar salaris is goed, maar het werk is soms vermoeiend." },
    { ar: "فِي الْمَسَاءِ تَدْرُسُ لِلْحُصُولِ عَلَى شَهَادَةِ الْمَاجِسْتِيرِ.", nl: "'s Avonds studeert ze voor haar masterdiploma." },
  ],
  gloss: [
    ["تَعْمَلُ", "zij werkt"], ["سَلْمَى", "Salma"], ["مُهَنْدِسَةً", "als ingenieur"], ["فِي", "in, bij, om"], ["شَرِكَةٍ", "een bedrijf"],
    ["كَبِيرَةٍ", "groot"], ["رُوتِرْدَام", "Rotterdam"], ["يَبْدَأُ", "begint"], ["عَمَلُهَا", "haar werk"], ["السَّاعَةِ", "het uur"],
    ["الثَّامِنَةِ", "het achtste"], ["صَبَاحًا", "'s ochtends"], ["تَحْضُرُ", "zij woont bij"], ["اجْتِمَاعًا", "een vergadering"], ["مَعَ", "met"],
    ["زُمَلَائِهَا", "haar collega's"], ["كُلَّ", "elke"], ["يَوْمِ", "dag"], ["اثْنَيْنِ", "maandag (lett. twee)"], ["رَاتِبُهَا", "haar salaris"],
    ["جَيِّدٌ", "goed"], ["لَكِنَّ", "maar"], ["الْعَمَلَ", "het werk"], ["مُتْعِبٌ", "vermoeiend"], ["أَحْيَانًا", "soms"], ["الْمَسَاءِ", "de avond"],
    ["تَدْرُسُ", "zij studeert"], ["لِلْحُصُولِ", "om te behalen"], ["عَلَى", "op"], ["شَهَادَةِ", "diploma van"], ["الْمَاجِسْتِيرِ", "de master"],
  ],
};

export const NEWS: Passage = {
  id: "nieuws",
  title: "Het nieuws",
  sentences: [
    { ar: "أَعْلَنَتِ الْحُكُومَةُ الْهُولَنْدِيَّةُ أَمْسِ عَنْ خُطَّةٍ جَدِيدَةٍ لِبِنَاءِ مِئَةِ أَلْفِ بَيْتٍ.", nl: "De Nederlandse regering heeft gisteren een nieuw plan aangekondigd om honderdduizend woningen te bouwen." },
    { ar: "وَقَالَ وَزِيرُ الْإِسْكَانِ إِنَّ الْمَشْرُوعَ سَيَبْدَأُ فِي الْعَامِ الْقَادِمِ.", nl: "De minister van Volkshuisvesting zei dat het project volgend jaar begint." },
    { ar: "وَفِي الْأَخْبَارِ الْجَوِّيَّةِ، يُتَوَقَّعُ أَنْ يَكُونَ الطَّقْسُ مُمْطِرًا خِلَالَ عُطْلَةِ نِهَايَةِ الْأُسْبُوعِ.", nl: "En in het weerbericht: er wordt regenachtig weer verwacht tijdens het weekend." },
  ],
  gloss: [
    ["أَعْلَنَتِ", "kondigde aan"], ["الْحُكُومَةُ", "de regering"], ["الْهُولَنْدِيَّةُ", "Nederlandse"], ["أَمْسِ", "gisteren"], ["عَنْ", "(aankondigen) van"],
    ["خُطَّةٍ", "een plan"], ["جَدِيدَةٍ", "nieuw"], ["لِبِنَاءِ", "voor het bouwen van"], ["مِئَةِ", "honderd"], ["أَلْفِ", "duizend"], ["بَيْتٍ", "huis, woning"],
    ["وَقَالَ", "en (hij) zei"], ["وَزِيرُ", "minister van"], ["الْإِسْكَانِ", "de huisvesting"], ["إِنَّ", "dat"], ["الْمَشْرُوعَ", "het project"],
    ["سَيَبْدَأُ", "zal beginnen"], ["فِي", "in"], ["الْعَامِ", "het jaar"], ["الْقَادِمِ", "komende"], ["وَفِي", "en in"], ["الْأَخْبَارِ", "het nieuws"],
    ["الْجَوِّيَّةِ", "weer- (bn.)"], ["يُتَوَقَّعُ", "er wordt verwacht"], ["أَنْ", "dat"], ["يَكُونَ", "is (zal zijn)"], ["الطَّقْسُ", "het weer"],
    ["مُمْطِرًا", "regenachtig"], ["خِلَالَ", "tijdens"], ["عُطْلَةِ", "vakantie, vrije dagen van"], ["نِهَايَةِ", "einde van"], ["الْأُسْبُوعِ", "de week"],
  ],
};

export const HOMEWORK: Passage = {
  id: "thuiswerken",
  title: "Thuiswerken: een mening",
  sentences: [
    { ar: "في رأيي، للعمل من البيت فوائد كثيرة.", nl: "Naar mijn mening heeft thuiswerken veel voordelen." },
    { ar: "من ناحية، يوفر الموظف وقتا طويلا لأنه لا يحتاج إلى التنقل كل يوم.", nl: "Aan de ene kant bespaart de werknemer veel tijd, omdat hij niet elke dag hoeft te reizen." },
    { ar: "ومن ناحية أخرى، قد يشعر بالوحدة لأنه لا يرى زملاءه.", nl: "Aan de andere kant kan hij zich eenzaam voelen, omdat hij zijn collega's niet ziet." },
    { ar: "لذلك أعتقد أن الحل الأفضل هو العمل من البيت يومين أو ثلاثة أيام في الأسبوع.", nl: "Daarom denk ik dat de beste oplossing is om twee of drie dagen per week thuis te werken." },
  ],
  gloss: [
    ["في", "in"], ["رأيي", "mijn mening"], ["للعمل", "voor het werken (heeft)"], ["من", "van(uit)"], ["البيت", "het huis"], ["فوائد", "voordelen"],
    ["كثيرة", "veel"], ["ناحية", "kant"], ["يوفر", "bespaart"], ["الموظف", "de werknemer"], ["وقتا", "tijd"], ["طويلا", "lang, veel"],
    ["لأنه", "omdat hij"], ["لا", "niet"], ["يحتاج", "heeft nodig"], ["إلى", "naar, tot"], ["التنقل", "het pendelen, reizen"], ["كل", "elke"],
    ["يوم", "dag"], ["ومن", "en van(uit)"], ["أخرى", "andere"], ["قد", "kan (misschien)"], ["يشعر", "voelt"], ["بالوحدة", "eenzaamheid"],
    ["يرى", "ziet"], ["زملاءه", "zijn collega's"], ["لذلك", "daarom"], ["أعتقد", "ik denk"], ["أن", "dat"], ["الحل", "de oplossing"],
    ["الأفضل", "de beste"], ["هو", "is (hij)"], ["العمل", "het werken"], ["يومين", "twee dagen"], ["أو", "of"], ["ثلاثة", "drie"],
    ["أيام", "dagen"], ["الأسبوع", "de week"],
  ],
};

export const AI_DEBATE: Passage = {
  id: "ki-werk",
  title: "Kunstmatige intelligentie en werk",
  sentences: [
    {
      ar: "يرى بعض الخبراء أن الذكاء الاصطناعي سيخلق فرص عمل جديدة، بينما يخشى آخرون أن يحل محل ملايين الموظفين.",
      nl: "Sommige experts denken dat kunstmatige intelligentie nieuwe banen zal scheppen, terwijl anderen vrezen dat ze miljoenen werknemers zal vervangen.",
    },
    { ar: "ولا يمكن إنكار أن هذه التكنولوجيا تغير طريقة عملنا بسرعة.", nl: "En het valt niet te ontkennen dat deze technologie onze manier van werken snel verandert." },
    { ar: "لذلك يدعو كثيرون إلى وضع قوانين تحمي الخصوصية وتضمن استخداما مسؤولا.", nl: "Daarom pleiten velen voor wetten die de privacy beschermen en verantwoord gebruik garanderen." },
  ],
  gloss: [
    ["يرى", "vindt, ziet"], ["بعض", "sommige"], ["الخبراء", "de experts"], ["أن", "dat"], ["الذكاء", "de intelligentie"], ["الاصطناعي", "kunstmatige"],
    ["سيخلق", "zal scheppen"], ["فرص", "kansen"], ["عمل", "werk"], ["جديدة", "nieuwe"], ["بينما", "terwijl"], ["يخشى", "vreest"],
    ["آخرون", "anderen"], ["يحل", "neemt (de plaats in)"], ["محل", "de plaats van"], ["ملايين", "miljoenen"], ["الموظفين", "de werknemers"],
    ["ولا", "en niet"], ["يمكن", "het is mogelijk"], ["إنكار", "ontkennen"], ["هذه", "deze"], ["التكنولوجيا", "de technologie"], ["تغير", "verandert"],
    ["طريقة", "manier"], ["عملنا", "ons werk"], ["بسرعة", "snel"], ["لذلك", "daarom"], ["يدعو", "roept op"], ["كثيرون", "velen"], ["إلى", "tot"],
    ["وضع", "het opstellen van"], ["قوانين", "wetten"], ["تحمي", "die beschermen"], ["الخصوصية", "de privacy"], ["وتضمن", "en garanderen"],
    ["استخداما", "gebruik"], ["مسؤولا", "verantwoord"],
  ],
};

export const ARABIC_LANGUAGE: Passage = {
  id: "arabische-taal",
  title: "De Arabische taal",
  sentences: [
    { ar: "تعد اللغة العربية من أكثر اللغات انتشارا في العالم، إذ يتحدث بها أكثر من ثلاثمئة مليون شخص.", nl: "Het Arabisch is een van de meest verspreide talen ter wereld: meer dan driehonderd miljoen mensen spreken het." },
    { ar: "وهي لغة رسمية في أكثر من عشرين دولة، كما أنها إحدى اللغات الرسمية الست في الأمم المتحدة.", nl: "Het is een officiële taal in meer dan twintig landen, en ook een van de zes officiële talen van de Verenigde Naties." },
    {
      ar: "وعلى الرغم من تنوع اللهجات المحلية، تبقى الفصحى لغة الكتابة والإعلام والتعليم، مما يجعلها جسرا يربط بين الشعوب العربية.",
      nl: "Ondanks de verscheidenheid aan lokale dialecten blijft het standaardarabisch de taal van schrijven, media en onderwijs, wat het een brug maakt tussen de Arabische volkeren.",
    },
    { ar: "ويواجه متعلمو العربية تحديات عدة، أبرزها قراءة النصوص دون تشكيل.", nl: "Leerders van het Arabisch staan voor verschillende uitdagingen; de grootste is teksten lezen zonder klinkertekens." },
    { ar: "غير أن الممارسة المنتظمة تجعل هذه المهارة ممكنة مع الوقت.", nl: "Maar regelmatig oefenen maakt deze vaardigheid na verloop van tijd haalbaar." },
  ],
  gloss: [
    ["تعد", "wordt beschouwd als"], ["اللغة", "de taal"], ["العربية", "Arabische / het Arabisch"], ["من", "van, (een) van"], ["أكثر", "meer, meest"],
    ["اللغات", "de talen"], ["انتشارا", "verspreid(heid)"], ["في", "in"], ["العالم", "de wereld"], ["إذ", "want, aangezien"], ["يتحدث", "spreekt"],
    ["بها", "het (lett. met haar)"], ["ثلاثمئة", "driehonderd"], ["مليون", "miljoen"], ["شخص", "persoon"], ["وهي", "en het (zij)"], ["لغة", "taal"],
    ["رسمية", "officiële"], ["عشرين", "twintig"], ["دولة", "land, staat"], ["كما", "evenals; ook"], ["أنها", "dat het (zij)"], ["إحدى", "een van (v)"],
    ["الرسمية", "de officiële"], ["الست", "de zes"], ["الأمم", "de naties"], ["المتحدة", "verenigde"], ["وعلى", "en op"], ["الرغم", "ondanks (lett. weerzin)"],
    ["تنوع", "verscheidenheid"], ["اللهجات", "de dialecten"], ["المحلية", "lokale"], ["تبقى", "blijft"], ["الفصحى", "het standaardarabisch"],
    ["الكتابة", "het schrijven"], ["والإعلام", "en de media"], ["والتعليم", "en het onderwijs"], ["مما", "wat (ertoe leidt dat)"], ["يجعلها", "het maakt"],
    ["جسرا", "een brug"], ["يربط", "die verbindt"], ["بين", "tussen"], ["الشعوب", "de volkeren"], ["ويواجه", "en staat voor"], ["متعلمو", "leerders van"],
    ["تحديات", "uitdagingen"], ["عدة", "verschillende"], ["أبرزها", "de belangrijkste ervan"], ["قراءة", "het lezen"], ["النصوص", "de teksten"],
    ["دون", "zonder"], ["تشكيل", "klinkertekens (vocalisatie)"], ["غير", "maar (غير أن)"], ["أن", "dat"], ["الممارسة", "het oefenen"],
    ["المنتظمة", "regelmatige"], ["تجعل", "maakt"], ["هذه", "deze"], ["المهارة", "de vaardigheid"], ["ممكنة", "mogelijk"], ["مع", "met"], ["الوقت", "de tijd"],
  ],
};

export const STUDY_ABSTRACT: Passage = {
  id: "onderzoek",
  title: "Samenvatting van een onderzoek",
  sentences: [
    { ar: "تهدف هذه الدراسة إلى تحليل أثر وسائل التواصل الاجتماعي في تعلم اللغات.", nl: "Dit onderzoek heeft tot doel de invloed van sociale media op het leren van talen te analyseren." },
    { ar: "وقد شارك في الدراسة مئتا طالب من ثلاث جامعات.", nl: "Aan het onderzoek namen tweehonderd studenten van drie universiteiten deel." },
    {
      ar: "وتشير النتائج إلى أن الاستخدام المنتظم لهذه الوسائل يحسن مهارة الاستماع، في حين لا يظهر أثر واضح في مهارة الكتابة.",
      nl: "De resultaten wijzen erop dat regelmatig gebruik van deze media de luistervaardigheid verbetert, terwijl er geen duidelijk effect op de schrijfvaardigheid is.",
    },
  ],
  gloss: [
    ["تهدف", "heeft tot doel"], ["هذه", "deze"], ["الدراسة", "het onderzoek, de studie"], ["إلى", "tot, naar"], ["تحليل", "analyse van"], ["أثر", "invloed, effect"],
    ["وسائل", "middelen"], ["التواصل", "de communicatie"], ["الاجتماعي", "sociale"], ["في", "in, op"], ["تعلم", "het leren van"], ["اللغات", "de talen"],
    ["وقد", "en (heeft) al"], ["شارك", "nam deel"], ["مئتا", "tweehonderd"], ["طالب", "student"], ["من", "van"], ["ثلاث", "drie"], ["جامعات", "universiteiten"],
    ["وتشير", "en wijzen"], ["النتائج", "de resultaten"], ["أن", "dat"], ["الاستخدام", "het gebruik"], ["المنتظم", "regelmatige"], ["لهذه", "van deze"],
    ["الوسائل", "de middelen"], ["يحسن", "verbetert"], ["مهارة", "vaardigheid van"], ["الاستماع", "het luisteren"], ["حين", "(في حين = terwijl)"],
    ["لا", "niet"], ["يظهر", "verschijnt, blijkt"], ["واضح", "duidelijk"], ["الكتابة", "het schrijven"],
  ],
};

export const CITY_VILLAGE: Passage = {
  id: "stad-dorp",
  title: "Stad of dorp?",
  sentences: [
    { ar: "انتقل كثير من الشباب في السنوات الأخيرة من القرى إلى المدن الكبرى بحثا عن العمل والتعليم.", nl: "De afgelopen jaren zijn veel jongeren van de dorpen naar de grote steden verhuisd, op zoek naar werk en onderwijs." },
    { ar: "وعلى الرغم من أن المدينة توفر فرصا أكثر، فإن الحياة فيها أغلى وأكثر ازدحاما.", nl: "Hoewel de stad meer kansen biedt, is het leven er duurder en drukker." },
    { ar: "أما القرية فتتميز بالهدوء والعلاقات الاجتماعية القوية، لكنها تعاني من قلة الخدمات.", nl: "Het dorp daarentegen onderscheidt zich door rust en sterke sociale banden, maar heeft te lijden onder een gebrek aan voorzieningen." },
    { ar: "ولو استثمرت الدولة في البنية التحتية للقرى، لبقي عدد أكبر من الشباب فيها.", nl: "Als de staat in de infrastructuur van de dorpen zou investeren, zouden meer jongeren daar blijven." },
  ],
  gloss: [
    ["انتقل", "verhuisde"], ["كثير", "veel"], ["من", "van"], ["الشباب", "de jongeren"], ["في", "in"], ["السنوات", "de jaren"], ["الأخيرة", "laatste"],
    ["القرى", "de dorpen"], ["إلى", "naar"], ["المدن", "de steden"], ["الكبرى", "grote"], ["بحثا", "op zoek"], ["عن", "naar (zoeken)"], ["العمل", "het werk"],
    ["والتعليم", "en het onderwijs"], ["وعلى", "en op"], ["الرغم", "(على الرغم = ondanks)"], ["أن", "dat"], ["المدينة", "de stad"], ["توفر", "biedt"],
    ["فرصا", "kansen"], ["أكثر", "meer"], ["فإن", "toch (is)"], ["الحياة", "het leven"], ["فيها", "erin"], ["أغلى", "duurder"], ["وأكثر", "en meer"],
    ["ازدحاما", "drukte"], ["أما", "wat betreft"], ["القرية", "het dorp"], ["فتتميز", "dan onderscheidt zich"], ["بالهدوء", "door de rust"],
    ["والعلاقات", "en de relaties"], ["الاجتماعية", "sociale"], ["القوية", "sterke"], ["لكنها", "maar zij (het)"], ["تعاني", "lijdt"], ["قلة", "gebrek aan"],
    ["الخدمات", "de voorzieningen"], ["ولو", "en als (irreëel)"], ["استثمرت", "investeerde"], ["الدولة", "de staat"], ["البنية", "de structuur"],
    ["التحتية", "onder- (infrastructuur)"], ["للقرى", "van de dorpen"], ["لبقي", "dan zou blijven"], ["عدد", "aantal"], ["أكبر", "groter"],
  ],
};

export const ALL_PASSAGES = [MY_DAY, MOROCCO_TRIP, YUSUF_STORY, SALMA_WORK, NEWS, HOMEWORK, AI_DEBATE, ARABIC_LANGUAGE, STUDY_ABSTRACT, CITY_VILLAGE];
