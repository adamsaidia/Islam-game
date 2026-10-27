import type { Lesson, PlannedModule } from "../types";
import { alphabetLessons } from "./alphabet";
import { readingLessons } from "./reading";
import { vocabularyLessons } from "./vocabulary";
import { grammarLessons } from "./grammar";
import { communicationLessons } from "./communication";
import { a1plusLessons } from "./a1plus";
import { a2Lessons } from "./a2";
import { b1Lessons } from "./b1";
import { b2Lessons } from "./b2";
import { c1Lessons } from "./c1";

export const LESSONS: Lesson[] = [
  ...alphabetLessons,
  ...readingLessons,
  ...vocabularyLessons,
  ...grammarLessons,
  ...communicationLessons,
  ...a1plusLessons,
  ...a2Lessons,
  ...b1Lessons,
  ...b2Lessons,
  ...c1Lessons,
].sort((a, b) => a.id - b.id);

export const getLesson = (id: number) => LESSONS.find((l) => l.id === id);

export const MODULES = Array.from(new Set(LESSONS.map((l) => l.module)));

/** Nog niet geschreven uitbreidingen. In de app zichtbaar als 'in ontwikkeling'. */
export const PLANNED: PlannedModule[] = [
  {
    level: "C1",
    title: "Verdieping na C1",
    topics: ["Meer authentieke nieuwsartikelen en columns", "Klassieke literatuur (fragmenten)", "Uitgebreide i'rab-analyse van zinnen", "Formele brieven en e-mails"],
  },
  {
    level: "A2",
    title: "Dialecten (los van de Fuṣḥā)",
    topics: ["Marokkaans Arabisch (Darija)", "Egyptisch Arabisch", "Levantijns Arabisch", "Verschillen met Modern Standaardarabisch"],
  },
];
