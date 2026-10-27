// De 28 letters van het Arabische alfabet met uitspraak en een voorbeeldwoord.
// Voorbeeldwoorden zijn volledig gevocaliseerd (Modern Standaardarabisch).

export type LetterInfo = {
  char: string;
  name: string;
  nameAr: string;
  /** Transliteratie van de klank. */
  tr: string;
  sound: string;
  connects: boolean;
  example: { ar: string; tr: string; nl: string };
  writeTip: string;
};

export const LETTERS: LetterInfo[] = [
  {
    char: "ا", name: "alif", nameAr: "أَلِف", tr: "ā / ʾ", connects: false,
    sound: "Draagt een klinker of een hamza; als lange klinker klinkt hij als de 'aa' in 'gaan'.",
    example: { ar: "أَسَد", tr: "asad", nl: "leeuw" },
    writeTip: "Eén verticale streep van boven naar beneden. Verbindt nooit met de letter erna.",
  },
  {
    char: "ب", name: "bā'", nameAr: "بَاء", tr: "b", connects: true,
    sound: "Als de Nederlandse 'b' in 'bal'.",
    example: { ar: "بَاب", tr: "bāb", nl: "deur" },
    writeTip: "Schrijf een ondiep schaaltje van rechts naar links; daarna één punt eronder.",
  },
  {
    char: "ت", name: "tā'", nameAr: "تَاء", tr: "t", connects: true,
    sound: "Als de Nederlandse 't', maar zachter, met de tong tegen de tanden.",
    example: { ar: "تُفَّاح", tr: "tuffāḥ", nl: "appels" },
    writeTip: "Dezelfde vorm als bā', met twee punten erboven.",
  },
  {
    char: "ث", name: "thā'", nameAr: "ثَاء", tr: "th", connects: true,
    sound: "Als de Engelse 'th' in 'think': tong tussen de tanden, stemloos.",
    example: { ar: "ثَوْب", tr: "thawb", nl: "gewaad" },
    writeTip: "Dezelfde vorm als bā', met drie punten erboven (als een driehoekje).",
  },
  {
    char: "ج", name: "jīm", nameAr: "جِيم", tr: "j", connects: true,
    sound: "Als de 'j' in het Engelse 'jam' (dzj).",
    example: { ar: "جَمَل", tr: "jamal", nl: "kameel" },
    writeTip: "Begin met een kort streepje naar links, dan een grote bocht omlaag; punt in de bocht.",
  },
  {
    char: "ح", name: "ḥā'", nameAr: "حَاء", tr: "ḥ", connects: true,
    sound: "Een krachtige, hese 'h' diep uit de keel, alsof je op een brilglas blaast. Geen 'ch'!",
    example: { ar: "حَلِيب", tr: "ḥalīb", nl: "melk" },
    writeTip: "Zelfde vorm als jīm, zonder punt.",
  },
  {
    char: "خ", name: "khā'", nameAr: "خَاء", tr: "kh", connects: true,
    sound: "Als de Nederlandse 'g/ch' in 'lachen'.",
    example: { ar: "خُبْز", tr: "khubz", nl: "brood" },
    writeTip: "Zelfde vorm als jīm, met één punt erboven.",
  },
  {
    char: "د", name: "dāl", nameAr: "دَال", tr: "d", connects: false,
    sound: "Als de Nederlandse 'd' in 'dak'.",
    example: { ar: "دَرْس", tr: "dars", nl: "les" },
    writeTip: "Een kleine haak: schuin omlaag en dan naar links. Verbindt niet met de letter erna.",
  },
  {
    char: "ذ", name: "dhāl", nameAr: "ذَال", tr: "dh", connects: false,
    sound: "Als de Engelse 'th' in 'this': tong tussen de tanden, stemhebbend.",
    example: { ar: "ذَهَب", tr: "dhahab", nl: "goud" },
    writeTip: "Zelfde vorm als dāl, met één punt erboven.",
  },
  {
    char: "ر", name: "rā'", nameAr: "رَاء", tr: "r", connects: false,
    sound: "Een gerolde tong-'r', zoals in het Spaanse 'pero'.",
    example: { ar: "رَجُل", tr: "rajul", nl: "man" },
    writeTip: "Een korte boog omlaag die onder de lijn eindigt. Verbindt niet met de letter erna.",
  },
  {
    char: "ز", name: "zāy", nameAr: "زَاي", tr: "z", connects: false,
    sound: "Als de 'z' in 'zon'.",
    example: { ar: "زَيْت", tr: "zayt", nl: "olie" },
    writeTip: "Zelfde vorm als rā', met één punt erboven.",
  },
  {
    char: "س", name: "sīn", nameAr: "سِين", tr: "s", connects: true,
    sound: "Als de 's' in 'soep'.",
    example: { ar: "سَمَك", tr: "samak", nl: "vis" },
    writeTip: "Drie kleine tandjes, gevolgd door een schaal (aan het eind van een woord).",
  },
  {
    char: "ش", name: "shīn", nameAr: "شِين", tr: "sh", connects: true,
    sound: "Als de 'sj' in 'sjaal'.",
    example: { ar: "شَمْس", tr: "shams", nl: "zon" },
    writeTip: "Zelfde vorm als sīn, met drie punten erboven.",
  },
  {
    char: "ص", name: "ṣād", nameAr: "صَاد", tr: "ṣ", connects: true,
    sound: "Een zware, 'donkere' s: tong laag, achterkant van de tong omhoog.",
    example: { ar: "صَدِيق", tr: "ṣadīq", nl: "vriend" },
    writeTip: "Een liggende lus (als een oog), dan een klein tandje en een schaal.",
  },
  {
    char: "ض", name: "ḍād", nameAr: "ضَاد", tr: "ḍ", connects: true,
    sound: "Een zware, 'donkere' d. Arabisch wordt ook wel 'de taal van de ḍād' genoemd.",
    example: { ar: "ضَيْف", tr: "ḍayf", nl: "gast" },
    writeTip: "Zelfde vorm als ṣād, met één punt erboven.",
  },
  {
    char: "ط", name: "ṭā'", nameAr: "طَاء", tr: "ṭ", connects: true,
    sound: "Een zware, 'donkere' t.",
    example: { ar: "طَالِب", tr: "ṭālib", nl: "student" },
    writeTip: "Een liggende lus met een verticale streep erop (streep als laatste).",
  },
  {
    char: "ظ", name: "ẓā'", nameAr: "ظَاء", tr: "ẓ", connects: true,
    sound: "Een zware, 'donkere' dh (als 'this', maar dieper).",
    example: { ar: "ظُهْر", tr: "ẓuhr", nl: "middag" },
    writeTip: "Zelfde vorm als ṭā', met één punt erboven.",
  },
  {
    char: "ع", name: "ʿayn", nameAr: "عَيْن", tr: "ʿ", connects: true,
    sound: "Een klank uit het midden van de keel, door de keel kort samen te knijpen. Bestaat niet in het Nederlands.",
    example: { ar: "عَيْن", tr: "ʿayn", nl: "oog" },
    writeTip: "Een klein open boogje (als een 'c'), dan een grote bocht omlaag.",
  },
  {
    char: "غ", name: "ghayn", nameAr: "غَيْن", tr: "gh", connects: true,
    sound: "Als de Franse 'r' in 'Paris': een gebrouwde, stemhebbende keelklank.",
    example: { ar: "غُرْفَة", tr: "ghurfa", nl: "kamer" },
    writeTip: "Zelfde vorm als ʿayn, met één punt erboven.",
  },
  {
    char: "ف", name: "fā'", nameAr: "فَاء", tr: "f", connects: true,
    sound: "Als de 'f' in 'fiets'.",
    example: { ar: "فِيل", tr: "fīl", nl: "olifant" },
    writeTip: "Een klein rondje, dan een lange lijn naar links; één punt erboven.",
  },
  {
    char: "ق", name: "qāf", nameAr: "قَاف", tr: "q", connects: true,
    sound: "Een 'k' die heel diep achter in de keel wordt gemaakt.",
    example: { ar: "قَلَم", tr: "qalam", nl: "pen" },
    writeTip: "Een rondje met een diepe ronde staart onder de lijn; twee punten erboven.",
  },
  {
    char: "ك", name: "kāf", nameAr: "كَاف", tr: "k", connects: true,
    sound: "Als de 'k' in 'kat'.",
    example: { ar: "كِتَاب", tr: "kitāb", nl: "boek" },
    writeTip: "Een hoge verticale streep met een vlakke voet; los een klein 'hamza-achtig' tekentje erin.",
  },
  {
    char: "ل", name: "lām", nameAr: "لَام", tr: "l", connects: true,
    sound: "Als de 'l' in 'lamp'.",
    example: { ar: "لَيْل", tr: "layl", nl: "nacht" },
    writeTip: "Een hoge streep van boven naar beneden die onderaan in een ronde schaal eindigt.",
  },
  {
    char: "م", name: "mīm", nameAr: "مِيم", tr: "m", connects: true,
    sound: "Als de 'm' in 'maan'.",
    example: { ar: "مَاء", tr: "māʾ", nl: "water" },
    writeTip: "Een klein rondje; aan het eind van een woord met een staartje naar beneden.",
  },
  {
    char: "ن", name: "nūn", nameAr: "نُون", tr: "n", connects: true,
    sound: "Als de 'n' in 'neus'.",
    example: { ar: "نُور", tr: "nūr", nl: "licht" },
    writeTip: "Een diepe ronde schaal met één punt erboven.",
  },
  {
    char: "ه", name: "hā'", nameAr: "هَاء", tr: "h", connects: true,
    sound: "Als de zachte 'h' in 'huis'.",
    example: { ar: "هِلَال", tr: "hilāl", nl: "maansikkel" },
    writeTip: "Losse vorm: een rondje. Vooraan: ـهـ met twee 'ogen'. Let op: de vorm verandert sterk.",
  },
  {
    char: "و", name: "wāw", nameAr: "وَاو", tr: "w / ū", connects: false,
    sound: "Als de Engelse 'w' in 'water'; als lange klinker 'oe' (ū).",
    example: { ar: "وَرْدَة", tr: "warda", nl: "roos" },
    writeTip: "Een rondje met een staart naar beneden. Verbindt niet met de letter erna.",
  },
  {
    char: "ي", name: "yā'", nameAr: "يَاء", tr: "y / ī", connects: true,
    sound: "Als de 'j' in 'ja'; als lange klinker 'ie' (ī).",
    example: { ar: "يَد", tr: "yad", nl: "hand" },
    writeTip: "Een golf die onder de lijn eindigt, met twee punten eronder.",
  },
];

export const letterByChar = (c: string) => LETTERS.find((l) => l.char === c);
