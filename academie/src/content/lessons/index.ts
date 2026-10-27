import type { Lesson, PlannedModule } from "../types";
import { alphabetLessons } from "./alphabet";
import { readingLessons } from "./reading";
import { vocabularyLessons } from "./vocabulary";
import { grammarLessons } from "./grammar";
import { communicationLessons } from "./communication";

export const LESSONS: Lesson[] = [
  ...alphabetLessons,
  ...readingLessons,
  ...vocabularyLessons,
  ...grammarLessons,
  ...communicationLessons,
].sort((a, b) => a.id - b.id);

export const getLesson = (id: number) => LESSONS.find((l) => l.id === id);

export const MODULES = Array.from(new Set(LESSONS.map((l) => l.module)));

/** Nog niet geschreven niveaus. In de app zichtbaar als 'in ontwikkeling'. */
export const PLANNED: PlannedModule[] = [
  {
    level: "A1",
    title: "A1 verdieping",
    topics: ["Werkwoorden in de tegenwoordige tijd (يَفْعَلُ)", "Tijd en dagen van de week", "Kleuren en kleding", "Meervouden (klank- en gebroken meervoud)", "Getallen 11–100", "Idafa (bezitsconstructie)"],
  },
  {
    level: "A2",
    title: "Elementair",
    topics: ["Verleden tijd volledig vervoegd (فَعَلَ)", "Ontkenning: لَا / مَا / لَمْ / لَيْسَ", "Toekomst met سَـ / سَوْفَ", "Gebiedende wijs", "Boodschappen, reizen, de weg vragen", "Langere teksten met gedeeltelijke harakat"],
  },
  {
    level: "B1",
    title: "Zelfstandig",
    topics: ["Woordwortels en werkwoordsvormen I–X", "I'rab: naamvallen in de praktijk", "Betrekkelijke voornaamwoorden (الَّذِي …)", "Werk, studie, gezondheid", "Nieuwsberichten in eenvoudig Arabisch", "Lezen zonder harakat met ondersteuning"],
  },
  {
    level: "B2",
    title: "Gevorderd",
    topics: ["Passief en deelwoorden", "Voorwaardelijke zinnen (إِنْ / لَوْ)", "Masdar en complexe zinsbouw", "Opiniestukken en verhalen", "Langere essays schrijven"],
  },
  {
    level: "C1",
    title: "Vergevorderd",
    topics: ["Academische teksten en betoogstructuur", "Literatuur en klassieke citaten", "Retoriek en stijl (بَلَاغَة)", "Discussiëren over complexe onderwerpen", "Boeken zonder harakat en zonder vertaling"],
  },
];
