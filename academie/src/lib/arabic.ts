// Hulpfuncties voor Arabische tekst: harakat, normalisatie en antwoordcontrole.

/** Alle harakat/tashkeel-tekens die we als "klinkertekens" behandelen. */
export const HARAKAT_RE = /[\u064B-\u0652\u0670\u0656-\u065F]/g;
const TATWEEL_RE = /\u0640/g;
const PUNCT_RE = /[؟،؛.,!?:;"'«»()\-–—]/g;
const ARABIC_RUN_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+(?:[\s؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]*[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)*/g;

export const FATHA = "\u064E";
export const DAMMA = "\u064F";
export const KASRA = "\u0650";
export const SUKUN = "\u0652";
export const SHADDA = "\u0651";
export const FATHATAN = "\u064B";
export const DAMMATAN = "\u064C";
export const KASRATAN = "\u064D";

export function stripHarakat(s: string): string {
  return s.replace(HARAKAT_RE, "");
}

export function hasArabic(s: string): boolean {
  return /[؀-ۿ]/.test(s);
}

/** Splitst tekst in Arabische en niet-Arabische stukken (voor RTL-weergave). */
export function splitArabicRuns(s: string): { text: string; ar: boolean }[] {
  const out: { text: string; ar: boolean }[] = [];
  let last = 0;
  for (const m of s.matchAll(ARABIC_RUN_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: s.slice(last, i), ar: false });
    out.push({ text: m[0], ar: true });
    last = i + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), ar: false });
  return out;
}

/**
 * Gedeeltelijke harakat: houdt alleen de tekens die echt nodig zijn om te lezen
 * (shadda, tanween, en de klinker op de laatste letter van een woord weg; klinkers
 * die vóór een lange klinker staan weg). Resultaat lijkt op hoe Arabische
 * schoolboeken klinkertekens geleidelijk afbouwen.
 */
export function partialHarakat(s: string): string {
  return s
    .split(/(\s+)/)
    .map((w) => {
      if (/^\s+$/.test(w)) return w;
      const chars = Array.from(w);
      const out: string[] = [];
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (!/[\u064B-\u0652]/.test(c)) {
          out.push(c);
          continue;
        }
        // Shadda en tanween blijven altijd staan.
        if (c === SHADDA || c === FATHATAN || c === DAMMATAN || c === KASRATAN) {
          out.push(c);
          continue;
        }
        // Sukun weg.
        if (c === SUKUN) continue;
        // Klinker vóór de bijpassende lange klinker weg (fatha+alif, damma+waw, kasra+ya): die is voorspelbaar.
        const next = chars[i + 1];
        const nextMark = chars[i + 2] ?? "";
        const nextVowelled = /[\u064B-\u0652]/.test(nextMark);
        const longVowel =
          (c === FATHA && next === "ا") ||
          (c === DAMMA && next === "و" && !nextVowelled) ||
          (c === KASRA && next === "ي" && !nextVowelled);
        if (longVowel) continue;
        // Klinker op de laatste letter (naamvalsuitgang) weg.
        const restHasLetter = chars.slice(i + 1).some((x) => /[\u0621-\u064A]/.test(x));
        if (!restHasLetter) continue;
        out.push(c);
      }
      return out.join("");
    })
    .join("");
}

export type HarakatMode = "full" | "partial" | "none";

export function applyHarakatMode(s: string, mode: HarakatMode): string {
  if (mode === "full") return s;
  if (mode === "partial") return partialHarakat(s);
  return stripHarakat(s);
}

/** Basale normalisatie voor vergelijken: spaties, tatweel, leestekens. */
export function normalizeBasic(s: string): string {
  return s
    .normalize("NFC")
    .replace(TATWEEL_RE, "")
    .replace(PUNCT_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normaliseert de volgorde van shadda + klinker zodat beide invoervolgordes gelijk zijn. */
function canonicalMarks(s: string): string {
  return s.replace(/([\u064B-\u0650\u0652])\u0651/g, "\u0651$1");
}

export type CheckResult = {
  correct: boolean;
  /** "almost": alleen een hamza / ta marbuta / alif maqsura / harakat-fout. */
  verdict: "correct" | "almost" | "wrong";
  message: string;
  expected: string;
};

function looseLetters(s: string): string {
  return s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

/**
 * Controleert een getypt Arabisch antwoord.
 * - Zonder requireHarakat worden klinkertekens genegeerd (ook als je ze wel typt).
 * - Hamza, ta marbuta en alif maqsura tellen WEL mee: dat is spelling.
 *   Een antwoord dat alleen daarop afwijkt krijgt "bijna goed" met uitleg, maar telt als fout.
 */
export function checkArabic(input: string, answers: string[], requireHarakat = false): CheckResult {
  const inp = canonicalMarks(normalizeBasic(input));
  const expected = answers[0];
  if (!inp) return { correct: false, verdict: "wrong", message: "Je hebt nog niets ingevuld.", expected };

  for (const a of answers) {
    const ans = canonicalMarks(normalizeBasic(a));
    if (requireHarakat) {
      if (inp === ans) return { correct: true, verdict: "correct", message: "Helemaal goed, inclusief harakat!", expected: a };
    } else if (stripHarakat(inp) === stripHarakat(ans)) {
      return { correct: true, verdict: "correct", message: "Goed!", expected: a };
    }
  }

  for (const a of answers) {
    const ans = canonicalMarks(normalizeBasic(a));
    if (requireHarakat && stripHarakat(inp) === stripHarakat(ans)) {
      return {
        correct: false,
        verdict: "almost",
        message: "De letters kloppen, maar de harakat (klinkertekens) niet. Vergelijk ze hieronder.",
        expected: a,
      };
    }
    const li = looseLetters(stripHarakat(inp));
    const la = looseLetters(stripHarakat(ans));
    if (li === la) {
      const details: string[] = [];
      const ai = stripHarakat(ans);
      const ii = stripHarakat(inp);
      if (/[أإآؤئء]/.test(ai) !== /[أإآؤئء]/.test(ii) || ai.replace(/[^أإآؤئء]/g, "") !== ii.replace(/[^أإآؤئء]/g, ""))
        details.push("let op de hamza (ء / أ / إ / ؤ / ئ)");
      if (ai.includes("ة") !== ii.includes("ة")) details.push("let op de ta marbuta (ة) versus ه");
      if (ai.includes("ى") !== ii.includes("ى")) details.push("let op de alif maqsura (ى) versus ي");
      return {
        correct: false,
        verdict: "almost",
        message: `Bijna goed: ${details.join(", ") || "kleine spellingsfout"}.`,
        expected: a,
      };
    }
  }
  return { correct: false, verdict: "wrong", message: "Nog niet goed. Bekijk het juiste antwoord.", expected };
}

/** Teken-voor-teken vergelijking voor visuele feedback (op letters, zonder harakat). */
export function diffLetters(input: string, expected: string): { ch: string; ok: boolean }[] {
  const a = Array.from(stripHarakat(normalizeBasic(expected)));
  const b = Array.from(stripHarakat(normalizeBasic(input)));
  // Eenvoudige LCS om overeenkomende letters te markeren.
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const okIdx = new Set<number>();
  let i = 0,
    j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      okIdx.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return a.map((ch, k) => ({ ch, ok: okIdx.has(k) }));
}

/** Vergelijkt een spraaktranscript met de doeltekst op woordniveau (zonder harakat). */
export function compareSpoken(transcript: string, target: string): { words: { w: string; ok: boolean }[]; score: number } {
  const norm = (s: string) => looseLetters(stripHarakat(normalizeBasic(s))).replace(/^ال/, "");
  const said = normalizeBasic(transcript).split(" ").filter(Boolean).map(norm);
  const targetWords = normalizeBasic(target).split(" ").filter(Boolean);
  const pool = [...said];
  const words = targetWords.map((w) => {
    const n = norm(w);
    const k = pool.findIndex((p) => p === n || p === norm("ال" + n) || ("ال" + p) === n);
    if (k >= 0) pool.splice(k, 1);
    return { w, ok: k >= 0 };
  });
  const score = targetWords.length ? words.filter((x) => x.ok).length / targetWords.length : 0;
  return { words, score };
}

/** Vorm van een letter in een bepaalde positie, via zero-width joiner. */
export function letterForm(letter: string, pos: "isolated" | "initial" | "medial" | "final"): string {
  const ZWJ = "\u200D";
  switch (pos) {
    case "isolated":
      return letter;
    case "initial":
      return letter + ZWJ;
    case "medial":
      return ZWJ + letter + ZWJ;
    case "final":
      return ZWJ + letter;
  }
}

/** Letters die niet aan de volgende letter vastgeschreven worden. */
export const NON_CONNECTORS = new Set(["ا", "أ", "إ", "آ", "د", "ذ", "ر", "ز", "و", "ؤ", "ة", "ى"]);

/** Laatste klinkerteken van een woord (de naamvalsuitgang), of "" als er geen is. */
export function finalMark(s: string): string {
  const chars = Array.from(normalizeBasic(s));
  let i = chars.length - 1;
  const marks: string[] = [];
  while (i >= 0 && /[\u064B-\u0652]/.test(chars[i])) marks.unshift(chars[i--]);
  return marks.filter((m) => m !== SHADDA).join("");
}

/** Controle voor naamvalsoefeningen: letters moeten kloppen en de laatste klinker ook. */
export function checkEnding(input: string, answer: string): CheckResult {
  const base = checkArabic(input, [answer]);
  if (!base.correct) return base;
  const want = finalMark(answer);
  const got = finalMark(input);
  if (got === want) return { correct: true, verdict: "correct", message: "Goed, de naamvalsuitgang klopt!", expected: answer };
  const name: Record<string, string> = { "\u064E": "fatha (-a)", "\u064F": "damma (-u)", "\u0650": "kasra (-i)", "\u064B": "-an", "\u064C": "-un", "\u064D": "-in", "\u0652": "sukun" };
  return {
    correct: false,
    verdict: "almost",
    message: got ? `De letters kloppen, maar de uitgang moet ${name[want] ?? want} zijn, niet ${name[got] ?? got}.` : `Zet de naamvalsuitgang erop: ${name[want] ?? want}.`,
    expected: answer,
  };
}
