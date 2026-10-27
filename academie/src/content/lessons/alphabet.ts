// Lessen 1–7: de 28 letters, gegenereerd uit de letterdata zodat vorm, klank en
// voorbeeldwoorden altijd consistent zijn.
import { letterForm } from "@/lib/arabic";
import { seeded, shuffle } from "@/lib/random";
import { LETTERS, letterByChar, type LetterInfo } from "../letters";
import type { Exercise, Lesson, Section } from "../types";

/** Letters die vaak verward worden; gebruikt als afleiders. */
const CONFUSABLE: Record<string, string[]> = {
  ب: ["ت", "ث", "ن", "ي"], ت: ["ب", "ث", "ن"], ث: ["ت", "ب", "ش"], ن: ["ب", "ت", "ي"], ي: ["ب", "ن", "ى"],
  ج: ["ح", "خ"], ح: ["ج", "خ", "ه"], خ: ["ح", "ج", "غ"],
  د: ["ذ", "ر"], ذ: ["د", "ز"], ر: ["ز", "د", "و"], ز: ["ر", "ذ"],
  س: ["ش", "ص"], ش: ["س", "ث"], ص: ["ض", "س"], ض: ["ص", "د"],
  ط: ["ظ", "ت"], ظ: ["ط", "ذ", "ز"], ع: ["غ", "ء"], غ: ["ع", "خ"],
  ف: ["ق", "و"], ق: ["ف", "ك"], ك: ["ق", "ل"], ل: ["ك", "ا"],
  م: ["ن", "ه"], ه: ["ح", "ة"], و: ["ر", "ؤ"], ا: ["ل", "أ"],
};

function distractors(c: string, pool: string[], rnd: () => number, n = 3): string[] {
  const conf = (CONFUSABLE[c] ?? []).filter((x) => letterByChar(x));
  const rest = shuffle(pool.filter((x) => x !== c && !conf.includes(x)), rnd);
  return [...conf, ...rest].filter((x) => x !== c).slice(0, n);
}

function mcqOptions(correct: string, wrong: string[], rnd: () => number) {
  const options = shuffle([correct, ...wrong], rnd);
  return { options, answer: options.indexOf(correct) };
}

function formsTable(letters: LetterInfo[]): string[][] {
  return [
    ["Letter", "Los", "Begin", "Midden", "Eind"],
    ...letters.map((l) =>
      l.connects
        ? [l.name, l.char, letterForm(l.char, "initial"), letterForm(l.char, "medial"), letterForm(l.char, "final")]
        : [l.name, l.char, l.char, letterForm(l.char, "final"), letterForm(l.char, "final")],
    ),
  ];
}

export function makeLetterLesson(
  id: number,
  title: string,
  titleAr: string,
  chars: string[],
  extraSections: Section[] = [],
): Lesson {
  const rnd = seeded(id * 7919);
  const letters = chars.map((c) => letterByChar(c)!);
  const allChars = LETTERS.map((l) => l.char);
  const ex: Exercise[] = [];
  let n = 0;
  const nid = () => `L${id}-e${++n}`;

  ex.push({
    kind: "match",
    id: nid(),
    skill: "letters",
    prompt: "Koppel elke letter aan zijn naam.",
    pairs: letters.map((l) => [l.char, l.name]),
  });

  for (const l of letters) {
    const { options, answer } = mcqOptions(l.char, distractors(l.char, allChars, rnd), rnd);
    ex.push({
      kind: "mcq",
      id: nid(),
      skill: "listening",
      prompt: "Luister naar de lettername. Welke letter is het?",
      audio: l.nameAr,
      options,
      answer,
      explain: `${l.name} (${l.nameAr}): ${l.sound}`,
    });
  }

  for (const l of letters) {
    const pos = l.connects ? (rnd() < 0.5 ? "medial" : "final") : "final";
    const { options, answer } = mcqOptions(l.char, distractors(l.char, allChars, rnd), rnd);
    ex.push({
      kind: "mcq",
      id: nid(),
      skill: "letters",
      prompt: pos === "medial" ? "Welke letter zie je hier in de middenvorm?" : "Welke letter zie je hier in de eindvorm?",
      promptAr: letterForm(l.char, pos),
      options,
      answer,
      explain: l.connects
        ? `Dit is ${l.name}. Begin: ${letterForm(l.char, "initial")}  midden: ${letterForm(l.char, "medial")}  eind: ${letterForm(l.char, "final")}`
        : `Dit is ${l.name}. Deze letter verbindt niet met de letter erna.`,
    });
  }

  for (const l of letters) {
    ex.push({ kind: "trace", id: nid(), skill: "writing", prompt: `Schrijf de letter ${l.name} na.`, glyph: l.char, tip: l.writeTip });
  }

  for (const l of letters) {
    ex.push({
      kind: "type",
      id: nid(),
      skill: "spelling",
      prompt: `Typ de letter ${l.name} (klank: ${l.tr}).`,
      answers: [l.char],
      hint: "Gebruik het Arabische toetsenbord onder het invoerveld.",
    });
  }

  for (const l of letters) {
    const first0 = Array.from(l.example.ar)[0];
    const first = /[أإآ]/.test(first0) ? "ا" : first0;
    const wrong = distractors(first, allChars, rnd);
    const { options, answer } = mcqOptions(first, wrong, rnd);
    ex.push({
      kind: "mcq",
      id: nid(),
      skill: "reading",
      prompt: `Met welke letter begint dit woord? (${l.example.nl})`,
      promptAr: l.example.ar,
      audio: l.example.ar,
      options,
      answer,
      explain: `${l.example.ar} (${l.example.tr}) = ${l.example.nl}. Het begint met ${letterByChar(first)?.name ?? first}${first0 !== first ? " (met een hamza erop: " + first0 + ")" : ""}.`,
    });
  }

  ex.push({
    kind: "speak",
    id: nid(),
    skill: "speaking",
    prompt: "Zeg dit woord hardop.",
    text: letters[0].example.ar,
    nl: letters[0].example.nl,
  });

  // Toets: andere vraagvormen dan de oefeningen.
  const test: Exercise[] = [];
  let t = 0;
  const tid = () => `L${id}-t${++t}`;
  for (const l of letters) {
    const names = shuffle(
      [l.name, ...distractors(l.char, allChars, rnd).map((c) => letterByChar(c)?.name ?? c)],
      rnd,
    ).slice(0, 4);
    if (!names.includes(l.name)) names[0] = l.name;
    test.push({
      kind: "mcq",
      id: tid(),
      skill: "letters",
      prompt: "Hoe heet deze letter (beginvorm)?",
      promptAr: l.connects ? letterForm(l.char, "initial") : l.char,
      options: names,
      answer: names.indexOf(l.name),
    });
    test.push({
      kind: "type",
      id: tid(),
      skill: "listening",
      prompt: "Luister en typ de letter die je hoort.",
      audio: l.nameAr,
      answers: [l.char],
    });
  }
  const wordLetter = letters[letters.length - 1];
  test.push({
    kind: "mcq",
    id: tid(),
    skill: "reading",
    prompt: "Welk woord begint met de letter " + wordLetter.name + "?",
    ...mcqOptions(
      wordLetter.example.ar,
      LETTERS.filter((x) => x.char !== wordLetter.char && !chars.includes(Array.from(x.example.ar)[0]))
        .slice(id, id + 3)
        .map((x) => x.example.ar),
      rnd,
    ),
  });

  const sections: Section[] = [
    {
      title: "Wat je leert",
      body: [
        `In deze les herhaal je de letters ${letters.map((l) => `${l.char} (${l.name})`).join(", ")}.`,
        "Arabisch schrijf en lees je van rechts naar links. De meeste letters hebben vier vormen: los, aan het begin, in het midden en aan het eind van een woord.",
      ],
    },
    ...letters.map((l) => ({
      title: `${l.char}  ${l.name} — ${l.nameAr}`,
      body: [`Klank: ${l.sound}`, `Schrijven: ${l.writeTip}`],
      examples: [l.example],
    })),
    { title: "De vormen op een rij", body: ["Let op hoe de letter verandert als hij aan andere letters vast zit."], table: formsTable(letters) },
    ...extraSections,
  ];

  return {
    id,
    module: "Alfabet herstellen",
    level: "A0",
    title,
    titleAr,
    goal: `Je herkent, schrijft en spreekt ${letters.map((l) => l.char).join(" ")} correct uit, in alle posities.`,
    minutes: 20,
    skills: ["letters", "reading", "writing", "spelling", "listening"],
    sections,
    words: letters.map((l) => ({
      id: `w-${l.example.ar}`,
      ar: l.example.ar,
      tr: l.example.tr,
      nl: l.example.nl,
      info: `voorbeeldwoord bij ${l.name}`,
    })),
    exercises: ex,
    test,
  };
}

export const alphabetLessons: Lesson[] = [
  makeLetterLesson(1, "Alif, bā', tā', thā'", "ا ب ت ث", ["ا", "ب", "ت", "ث"], [
    {
      title: "Eén vorm, verschillende punten",
      body: [
        "ب ت ث hebben dezelfde basisvorm. Alleen het aantal en de plaats van de punten verschilt: één punt onder (ب), twee punten boven (ت), drie punten boven (ث).",
        "De alif (ا) is bijzonder: hij verbindt nooit met de letter die erna komt.",
      ],
    },
  ]),
  makeLetterLesson(2, "Jīm, ḥā', khā'", "ج ح خ", ["ج", "ح", "خ"], [
    {
      title: "Let op de ḥā'",
      body: [
        "ح is geen Nederlandse 'h' en ook geen 'g'. Maak de keel smal en blaas krachtig, zonder te schrapen.",
        "خ is de schraapklank die je kent uit 'lachen'. Oefen het verschil: حَال (toestand) en خَال (oom van moederskant).",
      ],
      examples: [
        { ar: "حَال", tr: "ḥāl", nl: "toestand" },
        { ar: "خَال", tr: "khāl", nl: "oom (van moederskant)" },
      ],
    },
  ]),
  makeLetterLesson(3, "Dāl, dhāl, rā', zāy", "د ذ ر ز", ["د", "ذ", "ر", "ز"], [
    {
      title: "Letters die niet verbinden",
      body: [
        "د ذ ر ز verbinden, net als ا en و, nooit met de letter die erna komt. Na zo'n letter begint de volgende letter met zijn begin- of losse vorm.",
        "Voorbeeld: in دَرْس staan د en ر los van elkaar, en س begint opnieuw.",
      ],
      examples: [{ ar: "دَرْس", tr: "dars", nl: "les" }],
    },
  ]),
  makeLetterLesson(4, "Sīn, shīn, ṣād, ḍād", "س ش ص ض", ["س", "ش", "ص", "ض"], [
    {
      title: "Dunne en zware letters",
      body: [
        "س is een gewone, 'lichte' s. ص is 'zwaar' (emfatisch): de achterkant van je tong gaat omhoog, en de klinker ernaast klinkt donkerder.",
        "Vergelijk: سَيْف (zwaard) en صَيْف (zomer).",
      ],
      examples: [
        { ar: "سَيْف", tr: "sayf", nl: "zwaard" },
        { ar: "صَيْف", tr: "ṣayf", nl: "zomer" },
      ],
    },
  ]),
  makeLetterLesson(5, "Ṭā', ẓā', ʿayn, ghayn", "ط ظ ع غ", ["ط", "ظ", "ع", "غ"], [
    {
      title: "De ʿayn oefenen",
      body: [
        "De ʿayn (ع) maak je door je keel kort samen te knijpen, alsof je iets zwaars optilt, en dan een klinker te laten klinken.",
        "Verwar ع niet met de hamza (ء): de hamza is een korte stop (zoals tussen 'na-apen'), de ʿayn is een keelklank.",
      ],
    },
  ]),
  makeLetterLesson(6, "Fā', qāf, kāf, lām", "ف ق ك ل", ["ف", "ق", "ك", "ل"], [
    {
      title: "qāf of kāf?",
      body: [
        "ك is een gewone k. ق maak je veel verder achterin, bij de huig. Vergelijk: كَلْب (hond) en قَلْب (hart).",
        "Let ook op het verschil in vorm: ف heeft één punt, ق heeft twee punten en een diepere staart.",
      ],
      examples: [
        { ar: "كَلْب", tr: "kalb", nl: "hond" },
        { ar: "قَلْب", tr: "qalb", nl: "hart" },
      ],
    },
  ]),
  makeLetterLesson(7, "Mīm, nūn, hā', wāw, yā'", "م ن ه و ي", ["م", "ن", "ه", "و", "ي"], [
    {
      title: "De hā' verandert sterk",
      body: [
        "De vormen van ه verschillen veel: los ه, begin هـ, midden ـهـ, eind ـه. Oefen ze apart.",
        "و en ي zijn medeklinkers (w, y) maar ook lange klinkers (ū, ī). Daarover meer in les 10.",
      ],
    },
  ]),
];
