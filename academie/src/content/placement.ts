// Instaptoets: meet elke vaardigheid apart en bepaalt welke lessen je kunt overslaan.
import type { Exercise, Skill } from "./types";

export type PlacementSection = {
  key: string;
  title: string;
  skill: Skill;
  intro: string;
  items: Exercise[];
  /** Lessen die je mag overslaan als je deze sectie beheerst (≥ 80%). */
  lessons: number[];
  optional?: boolean;
};

let n = 0;
const id = () => `P-${++n}`;
const mcq = (skill: Skill, prompt: string, options: string[], answer: number, x: Partial<Exercise> = {}): Exercise =>
  ({ kind: "mcq", id: id(), skill, prompt, options, answer, ...x }) as Exercise;
const type = (skill: Skill, prompt: string, answers: string[], x: Partial<Exercise> = {}): Exercise =>
  ({ kind: "type", id: id(), skill, prompt, answers, ...x }) as Exercise;
const dict = (text: string): Exercise => ({ kind: "type", id: id(), skill: "spelling", prompt: "Luister en schrijf wat je hoort.", audio: text, answers: [text] });
const speak = (text: string, nl: string): Exercise => ({ kind: "speak", id: id(), skill: "speaking", prompt: "Zeg dit hardop.", text, nl });

export const PLACEMENT: PlacementSection[] = [
  {
    key: "letters",
    title: "Letters en uitspraak",
    skill: "letters",
    intro: "Herken je de letters in hun verschillende vormen?",
    lessons: [1, 2, 3, 4, 5, 6, 7, 8],
    items: [
      mcq("letters", "Hoe heet deze letter?", ["ʿayn", "ghayn", "ḥā'", "hamza"], 0, { promptAr: "ع" }),
      mcq("letters", "Luister. Welke letter is het?", ["خ", "ح", "ج", "ه"], 0, { audio: "خَاء" }),
      mcq("letters", "Welke letter zie je (middenvorm)?", ["ظ", "ط", "ض", "ز"], 0, { promptAr: "‍ظ‍" }),
      mcq("letters", "Welke letter verbindt NIET met de letter erna?", ["و", "ن", "ل", "ق"], 0),
      type("spelling", "Typ de letter qāf.", ["ق"]),
    ],
  },
  {
    key: "reading",
    title: "Lezen met harakat",
    skill: "reading",
    intro: "Hoe lees je deze woorden met klinkertekens?",
    lessons: [9, 10, 11, 12, 13, 14],
    items: [
      mcq("reading", "Hoe lees je dit?", ["kutub", "kataba", "kitāb"], 0, { promptAr: "كُتُب" }),
      mcq("reading", "Hoe lees je dit?", ["mudarris", "madrasa", "mudīr"], 0, { promptAr: "مُدَرِّس" }),
      mcq("reading", "Hoe lees je dit?", ["ash-shamsu", "al-shamsu", "as-samsu"], 0, { promptAr: "الشَّمْسُ" }),
      mcq("reading", "Hoe lees je dit?", ["shukran", "shukrun", "shakara"], 0, { promptAr: "شُكْرًا" }),
      mcq("reading", "Hoe lees je dit?", ["mustashfā", "mustashfī", "mastashfa"], 0, { promptAr: "مُسْتَشْفَى" }),
    ],
  },
  {
    key: "unvowelled",
    title: "Lezen zonder harakat",
    skill: "reading_unvowelled",
    intro: "Begrijp je korte zinnen zonder klinkertekens?",
    lessons: [],
    items: [
      mcq("reading_unvowelled", "Wat betekent dit?", ["Het huis is groot.", "Het grote huis.", "Een groot huis."], 0, { promptAr: "البيت كبير" }),
      mcq("reading_unvowelled", "Wat betekent dit?", ["Ik kom uit Nederland.", "Ik woon in Nederland.", "Waar kom je vandaan?"], 0, { promptAr: "أنا من هولندا" }),
      mcq("reading_unvowelled", "Wat betekent dit?", ["Het boek ligt op de tafel.", "De tafel is van het boek.", "Het boek is onder de tafel."], 0, { promptAr: "الكتاب على الطاولة" }),
      mcq("reading_unvowelled", "Wat betekent dit?", ["Ahmed ging naar de markt.", "Ahmed is op de markt geboren.", "De markt is van Ahmed."], 0, { promptAr: "ذهب أحمد إلى السوق" }),
      mcq("reading_unvowelled", "Wat betekent dit?", ["Sara studeert Arabisch aan de universiteit.", "Sara geeft Arabische les.", "Sara woont bij de universiteit."], 0, { promptAr: "تدرس سارة اللغة العربية في الجامعة" }),
    ],
  },
  {
    key: "spelling",
    title: "Spelling (dictee)",
    skill: "spelling",
    intro: "Schrijf de woorden die je hoort. Harakat zijn niet nodig, hamza en ة wel.",
    lessons: [],
    items: [dict("مَدْرَسَة"), dict("سُؤَال"), dict("عَلَى"), dict("مَسْجِد")],
  },
  {
    key: "vocabulary",
    title: "Woordenschat",
    skill: "vocabulary",
    intro: "Ken je deze basiswoorden?",
    lessons: [15, 16, 17, 18, 19, 20],
    items: [
      type("vocabulary", "Schrijf in het Arabisch: boek", ["كتاب"]),
      mcq("vocabulary", "Wat betekent قَهْوَة?", ["koffie", "thee", "water"], 0),
      type("vocabulary", "Schrijf in het Arabisch: huis", ["بيت", "منزل", "دار"]),
      mcq("vocabulary", "Wat betekent نَافِذَة?", ["raam", "deur", "tafel"], 0),
      type("vocabulary", "Schrijf in het Arabisch: dank je", ["شكرا"]),
      mcq("vocabulary", "Wat betekent ثَلَاثَة?", ["drie", "dertig", "derde"], 0),
    ],
  },
  {
    key: "grammar",
    title: "Grammatica",
    skill: "grammar",
    intro: "Basisgrammatica: geslacht, lidwoord, bezit en zinsbouw.",
    lessons: [21, 22, 23, 24, 25, 26, 27],
    items: [
      mcq("grammar", "Vul in: ___ سَيَّارَةٌ (dit is een auto)", ["هَذِهِ", "هَذَا"], 0),
      mcq("grammar", "Welke vorm is FOUT?", ["الْكِتَابٌ", "الْكِتَابُ", "كِتَابٌ"], 0),
      type("grammar", "Vertaal: mijn kamer", ["غرفتي"]),
      mcq("grammar", "Vul in: الْبِنْتُ ___ (het meisje is mooi)", ["جَمِيلَةٌ", "جَمِيلٌ", "الْجَمِيلُ"], 0),
      type("grammar", "Vertaal: Wij zijn thuis (in het huis).", ["نحن في البيت"]),
      mcq("grammar", "Wat betekent الْبَيْتُ الْكَبِيرُ?", ["het grote huis", "het huis is groot", "een groot huis"], 0),
    ],
  },
  {
    key: "listening",
    title: "Luisteren",
    skill: "listening",
    intro: "Zet je geluid aan. Je mag elk fragment opnieuw afspelen.",
    lessons: [28],
    items: [
      mcq("listening", "Wat hoor je?", ["goedemorgen", "goedenavond", "tot ziens"], 0, { audio: "صَبَاحُ الْخَيْرِ" }),
      mcq("listening", "Wat wil de spreker?", ["koffie zonder suiker", "thee met suiker", "water"], 0, { audio: "أُرِيدُ قَهْوَةً بِدُونِ سُكَّرٍ" }),
      mcq("listening", "Wat vertelt de spreker?", ["Hij woont in Amsterdam met zijn gezin.", "Hij werkt in Amsterdam.", "Hij komt uit Marokko."], 0, { audio: "أَسْكُنُ فِي أَمْسْتِرْدَام مَعَ أُسْرَتِي" }),
      mcq("listening", "Hoeveel broers en zussen heeft de spreker?", ["twee zussen en één broer", "één zus en twee broers", "geen"], 0, { audio: "عِنْدِي أُخْتَانِ وَأَخٌ وَاحِدٌ" }),
    ],
  },
  {
    key: "speaking",
    title: "Spreken",
    skill: "speaking",
    intro: "Spreek de zinnen in. De browser zet je stem om in tekst; we vergelijken die met de zin. Dit meet verstaanbaarheid, geen exacte uitspraak.",
    lessons: [29],
    optional: true,
    items: [speak("السَّلَامُ عَلَيْكُمْ", "Vrede zij met u."), speak("أَنَا مِنْ هُولَنْدَا", "Ik kom uit Nederland."), speak("أُرِيدُ قَهْوَةً مِنْ فَضْلِكَ", "Ik wil graag koffie.")],
  },
];
