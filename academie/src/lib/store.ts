"use client";
// Centrale, lokaal opgeslagen leerdata. Optioneel gesynchroniseerd met Supabase (zie sync.ts).
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Skill } from "@/content/types";
import type { HarakatMode } from "./arabic";
import { newCard, review, type StoredCard, type Grade } from "./srs";
import { dayKey } from "./utils";

export type Block = "read_grammar" | "writing" | "speak_listen" | "vocab";

export const BLOCK_LABELS: Record<Block, string> = {
  read_grammar: "Lezen & grammatica",
  writing: "Schrijven",
  speak_listen: "Spreken & luisteren",
  vocab: "Woordenschat herhalen",
};

export const SKILL_BLOCK: Record<Skill, Block> = {
  letters: "read_grammar",
  reading: "read_grammar",
  reading_unvowelled: "read_grammar",
  grammar: "read_grammar",
  spelling: "writing",
  writing: "writing",
  listening: "speak_listen",
  speaking: "speak_listen",
  vocabulary: "vocab",
};

export type LessonStatus = "new" | "in_progress" | "completed" | "tested_out";

export type LessonProgress = {
  status: LessonStatus;
  /** Index van de volgende stap (0 = uitleg, daarna oefeningen, daarna toets). */
  step: number;
  answers: Record<string, { correct: boolean; verdict: string }>;
  testAnswers: Record<string, { correct: boolean; verdict: string }>;
  bestTest?: number;
  testAttempts: number;
  completedAt?: string;
};

export type Mistake = {
  id: string;
  lessonId?: number;
  skill: Skill;
  prompt: string;
  expected: string;
  count: number;
  lastAt: string;
  resolved: boolean;
};

export type DictEntry = {
  id: string;
  ar: string;
  nl: string;
  tr?: string;
  info?: string;
  source: "les" | "gesprek" | "eigen";
  /** Woorden uit AI-gesprekken zijn niet gecontroleerd tot jij ze bevestigt. */
  verified: boolean;
  addedAt: string;
};

export type TestRecord = {
  id: string;
  kind: "placement" | "lesson" | "review";
  title: string;
  lessonId?: number;
  score: number;
  date: string;
  skills?: Partial<Record<Skill, number>>;
};

export type Correction = { original: string; corrected: string; explanation: string };

export type Transcript = {
  id: string;
  scenario: string;
  date: string;
  messages: { role: "user" | "assistant"; ar: string; nl?: string }[];
  corrections: Correction[];
  recommendations: string[];
};

export type DayHistory = {
  seconds: Record<Block, number>;
  exercises: number;
  correct: number;
};

export type AiLevel = "off" | "zuinig" | "normaal";

export type Settings = {
  theme: "system" | "light" | "dark";
  harakat: HarakatMode;
  translit: boolean;
  dailyMinutes: 20 | 30 | 45 | 60;
  /** 0 = zondag … 6 = zaterdag */
  studyDays: number[];
  aiLevel: AiLevel;
  aiModel: "claude-opus-5-5" | "claude-haiku-5-5";
  accessCode: string;
  ttsRate: number;
  voiceURI?: string;
};

export type SkillScore = { score: number; n: number };

export type PlacementResult = {
  date: string;
  skills: Partial<Record<Skill, number>>;
  sections: Record<string, number>;
  startLesson: number;
};

export type AppState = {
  version: number;
  updatedAt: string;
  settings: Settings;
  goals: string[];
  placement?: PlacementResult;
  lessons: Record<number, LessonProgress>;
  skills: Record<Skill, SkillScore>;
  mistakes: Record<string, Mistake>;
  cards: Record<string, StoredCard>;
  dictionary: Record<string, DictEntry>;
  history: Record<string, DayHistory>;
  tests: TestRecord[];
  transcripts: Transcript[];
  aiUsage: Record<string, number>;
};

type Actions = {
  setSettings: (s: Partial<Settings>) => void;
  setGoals: (g: string[]) => void;
  recordAnswer: (a: {
    exerciseId: string;
    lessonId?: number;
    skill: Skill;
    correct: boolean;
    verdict: string;
    prompt: string;
    expected: string;
    phase?: "exercise" | "test";
  }) => void;
  setLessonStep: (lessonId: number, step: number) => void;
  finishLessonTest: (lessonId: number, title: string, score: number, skills: Partial<Record<Skill, number>>) => boolean;
  resetLesson: (lessonId: number) => void;
  savePlacement: (p: PlacementResult, testedOut: number[]) => void;
  addWords: (entries: Omit<DictEntry, "addedAt">[]) => void;
  verifyWord: (id: string, verified: boolean) => void;
  removeWord: (id: string) => void;
  reviewCard: (cardId: string, grade: Grade) => void;
  addStudySeconds: (block: Block, seconds: number) => void;
  addTranscript: (t: Transcript) => void;
  addTest: (t: TestRecord) => void;
  countAiCall: () => void;
  resolveMistake: (id: string) => void;
  importState: (s: AppState) => void;
  resetAll: () => void;
};

const ALL_SKILLS: Skill[] = [
  "letters",
  "reading",
  "reading_unvowelled",
  "spelling",
  "vocabulary",
  "grammar",
  "listening",
  "speaking",
  "writing",
];

export const PASS_MARK = 0.8;

function initialState(): AppState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: {
      theme: "system",
      harakat: "full",
      translit: true,
      dailyMinutes: 60,
      studyDays: [1, 2, 3, 4, 5, 6, 0],
      aiLevel: "zuinig",
      aiModel: "claude-opus-5-5",
      accessCode: "",
      ttsRate: 0.85,
    },
    goals: [
      "Vloeiend Arabisch spreken",
      "Boeken en artikelen zonder harakat lezen",
      "Correcte Arabische teksten schrijven",
    ],
    lessons: {},
    skills: Object.fromEntries(ALL_SKILLS.map((s) => [s, { score: 0, n: 0 }])) as Record<Skill, SkillScore>,
    mistakes: {},
    cards: {},
    dictionary: {},
    history: {},
    tests: [],
    transcripts: [],
    aiUsage: {},
  };
}

function emptyLesson(): LessonProgress {
  return { status: "new", step: 0, answers: {}, testAnswers: {}, testAttempts: 0 };
}

function emptyDay(): DayHistory {
  return { seconds: { read_grammar: 0, writing: 0, speak_listen: 0, vocab: 0 }, exercises: 0, correct: 0 };
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s }, updatedAt: new Date().toISOString() })),
      setGoals: (goals) => set({ goals, updatedAt: new Date().toISOString() }),

      recordAnswer: (a) =>
        set((st) => {
          const now = new Date().toISOString();
          const today = dayKey();
          const day = { ...(st.history[today] ?? emptyDay()) };
          day.exercises += 1;
          if (a.correct) day.correct += 1;

          // Vaardigheidsscore: voortschrijdend gemiddelde, zwaarder in het begin.
          const prev = st.skills[a.skill] ?? { score: 0, n: 0 };
          const alpha = Math.max(0.08, 1 / (prev.n + 1));
          const skills = {
            ...st.skills,
            [a.skill]: { score: prev.score + alpha * ((a.correct ? 1 : 0) - prev.score), n: prev.n + 1 },
          };

          const mistakes = { ...st.mistakes };
          if (!a.correct) {
            const m = mistakes[a.exerciseId];
            mistakes[a.exerciseId] = {
              id: a.exerciseId,
              lessonId: a.lessonId,
              skill: a.skill,
              prompt: a.prompt,
              expected: a.expected,
              count: (m?.count ?? 0) + 1,
              lastAt: now,
              resolved: false,
            };
          } else if (mistakes[a.exerciseId] && !mistakes[a.exerciseId].resolved) {
            mistakes[a.exerciseId] = { ...mistakes[a.exerciseId], resolved: true, lastAt: now };
          }

          let lessons = st.lessons;
          if (a.lessonId) {
            const lp = { ...(st.lessons[a.lessonId] ?? emptyLesson()) };
            if (lp.status === "new") lp.status = "in_progress";
            if (a.phase === "test") lp.testAnswers = { ...lp.testAnswers, [a.exerciseId]: { correct: a.correct, verdict: a.verdict } };
            else lp.answers = { ...lp.answers, [a.exerciseId]: { correct: a.correct, verdict: a.verdict } };
            lessons = { ...st.lessons, [a.lessonId]: lp };
          }

          return { history: { ...st.history, [today]: day }, skills, mistakes, lessons, updatedAt: now };
        }),

      setLessonStep: (lessonId, step) =>
        set((st) => {
          const lp = { ...(st.lessons[lessonId] ?? emptyLesson()) };
          lp.step = step;
          if (lp.status === "new") lp.status = "in_progress";
          return { lessons: { ...st.lessons, [lessonId]: lp }, updatedAt: new Date().toISOString() };
        }),

      finishLessonTest: (lessonId, title, score, skillScores) => {
        const passed = score >= PASS_MARK;
        set((st) => {
          const lp = { ...(st.lessons[lessonId] ?? emptyLesson()) };
          lp.testAttempts += 1;
          lp.bestTest = Math.max(lp.bestTest ?? 0, score);
          if (passed) {
            lp.status = "completed";
            lp.completedAt = lp.completedAt ?? new Date().toISOString();
          }
          const tests: TestRecord[] = [
            {
              id: `lesson-${lessonId}-${Date.now()}`,
              kind: "lesson" as const,
              title,
              lessonId,
              score,
              date: new Date().toISOString(),
              skills: skillScores,
            },
            ...st.tests,
          ].slice(0, 200);
          return { lessons: { ...st.lessons, [lessonId]: lp }, tests, updatedAt: new Date().toISOString() };
        });
        return passed;
      },

      resetLesson: (lessonId) =>
        set((st) => {
          const lp = st.lessons[lessonId];
          const keep = lp?.status === "completed" ? "completed" : lp?.status === "tested_out" ? "tested_out" : "new";
          return {
            lessons: { ...st.lessons, [lessonId]: { ...emptyLesson(), status: keep, bestTest: lp?.bestTest, testAttempts: lp?.testAttempts ?? 0, completedAt: lp?.completedAt } },
          };
        }),

      savePlacement: (p, testedOut) =>
        set((st) => {
          const lessons = { ...st.lessons };
          for (const id of testedOut) {
            const lp = lessons[id];
            if (!lp || lp.status === "new") lessons[id] = { ...emptyLesson(), status: "tested_out" };
          }
          const skills = { ...st.skills };
          for (const [k, v] of Object.entries(p.skills)) {
            const sk = k as Skill;
            if (v === undefined) continue;
            skills[sk] = { score: v, n: Math.max(skills[sk]?.n ?? 0, 5) };
          }
          const tests: TestRecord[] = [
            { id: `placement-${Date.now()}`, kind: "placement", title: "Instaptoets", score: avg(Object.values(p.sections)), date: p.date, skills: p.skills },
            ...st.tests,
          ];
          return { placement: p, lessons, skills, tests, updatedAt: new Date().toISOString() };
        }),

      addWords: (entries) =>
        set((st) => {
          const dictionary = { ...st.dictionary };
          const cards = { ...st.cards };
          const now = new Date();
          for (const e of entries) {
            if (!dictionary[e.id]) dictionary[e.id] = { ...e, addedAt: now.toISOString() };
            // Alleen gecontroleerde woorden worden automatisch flashcards.
            if (e.verified) {
              for (const dir of ["recognize", "produce"] as const) {
                const c = newCard(e.id, dir, now);
                if (!cards[c.id]) cards[c.id] = c;
              }
            }
          }
          return { dictionary, cards, updatedAt: now.toISOString() };
        }),

      verifyWord: (id, verified) =>
        set((st) => {
          const entry = st.dictionary[id];
          if (!entry) return {};
          const cards = { ...st.cards };
          if (verified) {
            for (const dir of ["recognize", "produce"] as const) {
              const c = newCard(id, dir);
              if (!cards[c.id]) cards[c.id] = c;
            }
          }
          return { dictionary: { ...st.dictionary, [id]: { ...entry, verified } }, cards, updatedAt: new Date().toISOString() };
        }),

      removeWord: (id) =>
        set((st) => {
          const dictionary = { ...st.dictionary };
          delete dictionary[id];
          const cards = Object.fromEntries(Object.entries(st.cards).filter(([, c]) => c.wordId !== id));
          return { dictionary, cards, updatedAt: new Date().toISOString() };
        }),

      reviewCard: (cardId, grade) =>
        set((st) => {
          const c = st.cards[cardId];
          if (!c) return {};
          const today = dayKey();
          const day = { ...(st.history[today] ?? emptyDay()) };
          day.exercises += 1;
          if (grade >= 3) day.correct += 1;
          const prev = st.skills.vocabulary;
          const alpha = Math.max(0.05, 1 / (prev.n + 1));
          return {
            cards: { ...st.cards, [cardId]: review(c, grade) },
            history: { ...st.history, [today]: day },
            skills: { ...st.skills, vocabulary: { score: prev.score + alpha * ((grade >= 3 ? 1 : 0) - prev.score), n: prev.n + 1 } },
            updatedAt: new Date().toISOString(),
          };
        }),

      addStudySeconds: (block, seconds) =>
        set((st) => {
          const today = dayKey();
          const day = st.history[today] ?? emptyDay();
          return {
            history: { ...st.history, [today]: { ...day, seconds: { ...day.seconds, [block]: day.seconds[block] + seconds } } },
            updatedAt: new Date().toISOString(),
          };
        }),

      addTranscript: (t) => set((st) => ({ transcripts: [t, ...st.transcripts].slice(0, 100), updatedAt: new Date().toISOString() })),

      addTest: (t) => set((st) => ({ tests: [t, ...st.tests].slice(0, 200), updatedAt: new Date().toISOString() })),

      countAiCall: () =>
        set((st) => {
          const today = dayKey();
          return { aiUsage: { ...st.aiUsage, [today]: (st.aiUsage[today] ?? 0) + 1 } };
        }),

      resolveMistake: (id) =>
        set((st) => (st.mistakes[id] ? { mistakes: { ...st.mistakes, [id]: { ...st.mistakes[id], resolved: true } } } : {})),

      importState: (s) => set({ ...initialState(), ...s }),
      resetAll: () => set(initialState()),
    }),
    {
      name: "arabische-academie",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Alleen de data (zonder functies), bijv. voor export of synchronisatie. */
export function snapshot(): AppState {
  const s = useStore.getState();
  const keys: (keyof AppState)[] = [
    "version",
    "updatedAt",
    "settings",
    "goals",
    "placement",
    "lessons",
    "skills",
    "mistakes",
    "cards",
    "dictionary",
    "history",
    "tests",
    "transcripts",
    "aiUsage",
  ];
  return Object.fromEntries(keys.map((k) => [k, s[k]])) as AppState;
}

/** Daglimiet voor AI-aanroepen per niveau (kostenbeheersing). */
export const AI_DAILY_LIMIT: Record<AiLevel, number> = { off: 0, zuinig: 40, normaal: 200 };
