"use client";
import { useMemo, useState } from "react";
import { Check, Plus, Search, Trash2, ShieldAlert, Layers } from "lucide-react";
import { useStore, type DictEntry } from "@/lib/store";
import { familiarity, isDue, Rating, type Grade, type StoredCard } from "@/lib/srs";
import { checkArabic, type CheckResult } from "@/lib/arabic";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { Ar, AudioButton, Rich, Translit } from "@/components/arabic";
import { ArabicInput } from "@/components/ArabicInput";
import { Badge, Button, Card, PageHeader, Segmented, Notice, Progress } from "@/components/ui";
import { cn, dayKey } from "@/lib/utils";

const NEW_PER_DAY = 15;
const SESSION = 20;

export default function WordsPage() {
  const [tab, setTab] = useState<"review" | "dict">("review");
  return (
    <div>
      <PageHeader title="Woordenschat" subtitle="Spaced repetition (FSRS): moeilijke woorden komen vaker terug, bekende woorden steeds later.">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "review", label: "Herhalen" },
            { value: "dict", label: "Woordenboek" },
          ]}
        />
      </PageHeader>
      {tab === "review" ? <Review /> : <Dictionary />}
    </div>
  );
}

function buildQueue(cards: Record<string, StoredCard>, newToday: number): StoredCard[] {
  const now = new Date();
  const due = Object.values(cards).filter((c) => isDue(c, now));
  const reviews = due.filter((c) => c.reps > 0).sort((a, b) => a.due.localeCompare(b.due));
  // Nieuwe kaarten: eerst herkennen, daarna produceren (pas als de herkenkaart gezien is).
  const fresh = due
    .filter((c) => c.reps === 0)
    .filter((c) => c.dir === "recognize" || (cards[`${c.wordId}:recognize`]?.reps ?? 0) > 0)
    .slice(0, Math.max(0, NEW_PER_DAY - newToday));
  return [...reviews, ...fresh].slice(0, SESSION);
}

function Review() {
  const cards = useStore((s) => s.cards);
  const dict = useStore((s) => s.dictionary);
  const reviewCard = useStore((s) => s.reviewCard);
  useStudyTimer("vocab");
  const newToday = Object.values(cards).filter((c) => c.reps === 1 && c.last_review?.startsWith(dayKey())).length;
  const [queue, setQueue] = useState<StoredCard[]>(() => buildQueue(cards, newToday));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [input, setInput] = useState("");
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [stats, setStats] = useState({ again: 0, good: 0 });

  const card = queue[i];
  const word = card ? dict[card.wordId] : undefined;
  const totalDue = Object.values(cards).filter((c) => isDue(c)).length;

  if (!Object.keys(cards).length) {
    return (
      <Card className="text-center">
        <Layers className="mx-auto mb-2 h-8 w-8 text-muted" />
        <p className="font-medium">Nog geen flashcards</p>
        <p className="text-sm text-muted">Woorden worden automatisch toegevoegd als je de oefeningen van een les afrondt, of als je een woord bewaart in de leesmodule.</p>
      </Card>
    );
  }

  if (!card || !word) {
    return (
      <Card className="space-y-3 text-center">
        <Check className="mx-auto h-8 w-8 text-ok" />
        <p className="font-medium">{i > 0 ? "Sessie klaar!" : "Niets te herhalen op dit moment"}</p>
        {i > 0 && (
          <p className="text-sm text-muted">
            {stats.good} goed · {stats.again} opnieuw
          </p>
        )}
        <p className="text-sm text-muted">{totalDue > 0 ? `Er staan nog ${totalDue} kaarten klaar (incl. nieuwe kaarten boven de daglimiet van ${NEW_PER_DAY}).` : "Kom later terug; de planner laat zien wanneer er weer kaarten klaarstaan."}</p>
        {totalDue > 0 && (
          <Button
            onClick={() => {
              setQueue(buildQueue(useStore.getState().cards, 0));
              setI(0);
            }}
          >
            Nog een ronde
          </Button>
        )}
      </Card>
    );
  }

  const grade = (g: Grade) => {
    reviewCard(card.id, g);
    setStats((s) => (g === Rating.Again ? { ...s, again: s.again + 1 } : { ...s, good: s.good + 1 }));
    if (g === Rating.Again) setQueue((q) => [...q, card]); // komt in deze sessie nog een keer terug
    setI(i + 1);
    setRevealed(false);
    setInput("");
    setCheck(null);
  };

  const produce = card.dir === "produce";
  const suggested: Grade | null = check ? (check.correct ? Rating.Good : check.verdict === "almost" ? Rating.Hard : Rating.Again) : null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted">
        <Progress value={i / queue.length} />
        <span className="shrink-0">
          {i + 1}/{queue.length}
        </span>
      </div>
      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <Badge tone={produce ? "gold" : "primary"}>{produce ? "Zelf schrijven" : "Herkennen"}</Badge>
          {card.reps === 0 && <Badge>nieuw</Badge>}
          {card.lapses >= 3 && <Badge tone="danger">vaak vergeten</Badge>}
        </div>
        {produce ? (
          <>
            <div className="text-center">
              <p className="text-sm text-muted">Schrijf in het Arabisch:</p>
              <p className="font-display text-2xl font-semibold">{word.nl}</p>
              {word.info && <p className="text-xs text-muted"><Rich text={word.info} arClass="text-base" /></p>}
            </div>
            <ArabicInput value={input} onChange={setInput} onSubmit={() => !check && input.trim() && setCheck(checkArabic(input, [word.ar]))} disabled={!!check} />
            {!check ? (
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCheck(checkArabic("", [word.ar]))}>
                  Weet ik niet
                </Button>
                <Button onClick={() => setCheck(checkArabic(input, [word.ar]))} disabled={!input.trim()}>
                  Controleer
                </Button>
              </div>
            ) : (
              <div className={cn("rounded-xl p-3 text-center", check.correct ? "bg-ok-soft" : check.verdict === "almost" ? "bg-warn-soft" : "bg-danger-soft")}>
                <p className="text-sm">{check.message}</p>
                <Ar text={word.ar} size="xl" force="full" />
                <div className="mt-1">
                  <AudioButton text={word.ar} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 text-center">
            <Ar text={word.ar} size="xl" />
            <div>
              <AudioButton text={word.ar} />
            </div>
            {revealed ? (
              <div className="fade-in">
                <p className="font-display text-xl font-semibold">{word.nl}</p>
                <Translit>{word.tr}</Translit>
                {word.info && <p className="text-xs text-muted"><Rich text={word.info} arClass="text-base" /></p>}
                <p className="mt-1 text-xs text-muted">Met harakat: <bdi className="ar text-lg">{word.ar}</bdi></p>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setRevealed(true)}>
                Toon betekenis
              </Button>
            )}
          </div>
        )}
        {(revealed || check) && (
          <div className="grid grid-cols-4 gap-2">
            {([
              [Rating.Again, "Opnieuw", "bg-danger-soft text-danger"],
              [Rating.Hard, "Moeilijk", "bg-warn-soft text-warn"],
              [Rating.Good, "Goed", "bg-ok-soft text-ok"],
              [Rating.Easy, "Makkelijk", "bg-primary-soft text-primary"],
            ] as [Grade, string, string][]).map(([g, label, cls]) => (
              <button key={g} onClick={() => grade(g)} className={cn("rounded-xl py-3 text-sm font-medium transition active:scale-95", cls, suggested === g && "ring-2 ring-current")}>
                {label}
              </button>
            ))}
          </div>
        )}
        {check && <p className="text-center text-xs text-muted">De omcirkelde knop is de suggestie op basis van je antwoord.</p>}
      </Card>
    </div>
  );
}

function Dictionary() {
  const dict = useStore((s) => s.dictionary);
  const cards = useStore((s) => s.cards);
  const addWords = useStore((s) => s.addWords);
  const verifyWord = useStore((s) => s.verifyWord);
  const removeWord = useStore((s) => s.removeWord);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "learning" | "known" | "mastered" | "hard" | "unverified">("all");
  const [ar, setAr] = useState("");
  const [nl, setNl] = useState("");

  const rows = useMemo(() => {
    const list = Object.values(dict).map((w) => {
      const cs = Object.values(cards).filter((c) => c.wordId === w.id);
      const fams = cs.map(familiarity);
      const status = !cs.length ? "unverified" : fams.includes("new") ? "new" : fams.every((f) => f === "mastered") ? "mastered" : fams.some((f) => f === "learning") ? "learning" : "known";
      const lapses = cs.reduce((a, c) => a + c.lapses, 0);
      return { w, status, lapses };
    });
    return list
      .filter((r) => !q || r.w.nl.toLowerCase().includes(q.toLowerCase()) || r.w.ar.includes(q))
      .filter((r) => filter === "all" || (filter === "hard" ? r.lapses >= 2 : filter === "unverified" ? !r.w.verified : r.status === filter))
      .sort((a, b) => b.w.addedAt.localeCompare(a.w.addedAt));
  }, [dict, cards, q, filter]);

  const label: Record<string, [string, "neutral" | "ok" | "warn" | "gold" | "primary"]> = {
    new: ["nieuw", "neutral"],
    learning: ["aan het leren", "warn"],
    known: ["herkend", "primary"],
    mastered: ["beheerst", "ok"],
    unverified: ["niet gecontroleerd", "gold"],
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-2 font-medium">Eigen woord toevoegen</h2>
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
          <ArabicInput value={ar} onChange={setAr} placeholder="الكلمة" />
          <input value={nl} onChange={(e) => setNl(e.target.value)} placeholder="Betekenis (NL)" className="h-12 rounded-xl border border-line bg-surface px-3" />
          <Button
            className="h-12"
            disabled={!ar.trim() || !nl.trim()}
            onClick={() => {
              addWords([{ id: `w-${ar.trim()}`, ar: ar.trim(), nl: nl.trim(), source: "eigen", verified: true }]);
              setAr("");
              setNl("");
            }}
          >
            <Plus className="h-4 w-4" /> Toevoegen
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">Eigen woorden controleer je zelf. Woorden die de AI voorstelt, worden pas flashcards nadat jij ze bevestigt.</p>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek (Arabisch of Nederlands)" className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 rounded-xl border border-line bg-surface px-3 text-sm">
          <option value="all">Alle ({Object.keys(dict).length})</option>
          <option value="learning">Aan het leren</option>
          <option value="known">Herkend</option>
          <option value="mastered">Beheerst</option>
          <option value="hard">Vaak vergeten</option>
          <option value="unverified">Niet gecontroleerd</option>
        </select>
      </div>
      {rows.length === 0 && <Notice>Geen woorden gevonden.</Notice>}
      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map(({ w, status, lapses }) => (
          <WordRow key={w.id} w={w} badge={label[status]} lapses={lapses} onVerify={() => verifyWord(w.id, true)} onRemove={() => removeWord(w.id)} />
        ))}
      </ul>
    </div>
  );
}

function WordRow({ w, badge, lapses, onVerify, onRemove }: { w: DictEntry; badge: [string, "neutral" | "ok" | "warn" | "gold" | "primary"]; lapses: number; onVerify: () => void; onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
      <div className="min-w-0">
        <Ar text={w.ar} size="md" />
        <p className="text-sm">{w.nl}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge tone={badge[1]}>{badge[0]}</Badge>
          <Badge>{w.source === "les" ? "uit les" : w.source === "gesprek" ? "uit gesprek" : "eigen"}</Badge>
          {lapses >= 2 && <Badge tone="danger">{lapses}× vergeten</Badge>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AudioButton text={w.ar} label="" />
        {!w.verified && (
          <Button size="sm" variant="outline" onClick={onVerify} title="Ik heb dit woord gecontroleerd; maak er flashcards van">
            <ShieldAlert className="h-4 w-4 text-gold" /> Bevestig
          </Button>
        )}
        <button onClick={onRemove} className="rounded-lg p-2 text-muted hover:bg-surface-2" aria-label="Verwijderen">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
