// Koppelt een planblok aan een concrete activiteit in de app.
import type { Block } from "./store";

export function blockHref(block: Block, opts: { nextLesson: number | null; aiOn: boolean }): { href: string; label: string } {
  switch (block) {
    case "read_grammar":
      return opts.nextLesson ? { href: `/lessen/${opts.nextLesson}`, label: `Les ${opts.nextLesson}` } : { href: "/lezen", label: "Leesteksten" };
    case "writing":
      return { href: "/schrijven", label: "Schrijftraining" };
    case "speak_listen":
      return opts.aiOn ? { href: "/spreken", label: "Gesprek met AI-docent" } : { href: "/luisteren", label: "Luister- en spreekoefeningen" };
    case "vocab":
      return { href: "/woorden", label: "Flashcards herhalen" };
  }
}
