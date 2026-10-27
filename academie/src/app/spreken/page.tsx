"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Languages, Mic, Repeat, Send, Square, Snail, Flag, MessageSquare } from "lucide-react";
import { SCENARIOS, type Scenario } from "@/content/scenarios";
import { useStore, type Correction, type Transcript } from "@/lib/store";
import { speak, useSpeechRecognition } from "@/lib/speech";
import { callAi, fetchAiStatus, AiError } from "@/lib/ai/client";
import type { ConversationReply, SummaryResult } from "@/lib/ai/schemas";
import { buildSession, promptOf } from "@/lib/pools";
import { levelEstimate } from "@/lib/planner";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession } from "@/components/ExerciseSession";
import { ArabicInput } from "@/components/ArabicInput";
import { Ar, AudioButton, Rich } from "@/components/arabic";
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Segmented } from "@/components/ui";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; ar: string; nl?: string; corrections?: Correction[] };

export default function SpeakingPage() {
  const [ai, setAi] = useState<{ configured: boolean } | null>(null);
  const aiLevel = useStore((s) => s.settings.aiLevel);
  const [tab, setTab] = useState<"gesprek" | "naspreken" | "historie">("gesprek");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  useStudyTimer("speak_listen");
  useEffect(() => {
    fetchAiStatus().then(setAi);
  }, []);
  const aiOn = !!ai?.configured && aiLevel !== "off";

  if (scenario && aiOn) return <Conversation scenario={scenario} onExit={() => setScenario(null)} />;

  return (
    <div>
      <PageHeader title="Spreken" subtitle="Voer echte gesprekken met je AI-docent, of spreek zinnen na zonder AI.">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "gesprek", label: "AI-gesprek" },
            { value: "naspreken", label: "Naspreken" },
            { value: "historie", label: "Transcripten" },
          ]}
        />
      </PageHeader>
      {tab === "gesprek" && (
        <>
          {ai && !ai.configured && (
            <Notice tone="warn" className="mb-4">
              AI-gesprekken zijn nog niet geconfigureerd: er staat geen ANTHROPIC_API_KEY op de server. Zie Instellingen → Kosten &amp; AI voor uitleg. Naspreken werkt wel zonder AI.
            </Notice>
          )}
          {ai?.configured && aiLevel === "off" && <Notice className="mb-4">AI staat uit in je instellingen.</Notice>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <button key={s.id} disabled={!aiOn} onClick={() => setScenario(s)} className="text-left disabled:opacity-50">
                <Card className="h-full transition hover:border-primary">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{s.title}</span>
                    <Badge>{s.level}</Badge>
                  </div>
                  <p className="text-sm text-muted">{s.description}</p>
                  <p className="ar mt-2 text-lg text-gold">{s.opener.ar}</p>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}
      {tab === "naspreken" && <Shadowing />}
      {tab === "historie" && <Transcripts />}
    </div>
  );
}

function Shadowing() {
  const state = useStore();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const exercises = useMemo(
    () => buildSession(state, { skills: ["speaking"], size: 8, seed: Date.now() + round }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  if (!exercises.length) return <Notice>Naspreek-zinnen komen uit lessen die je gestart hebt. Begin eerst een les.</Notice>;
  if (done)
    return (
      <Card className="space-y-3 text-center">
        <p className="font-medium">{done}</p>
        <Button onClick={() => { setDone(null); setRound((r) => r + 1); }}>Nieuwe ronde</Button>
      </Card>
    );
  return (
    <Card>
      <ExerciseSession
        key={round}
        title="Naspreken"
        exercises={exercises}
        onAnswer={(e, r) => recordAnswer({ exerciseId: e.id, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected })}
        onFinish={(res) => setDone(`${res.filter((r) => r.result?.correct).length} van ${res.filter((r) => r.result).length} goed verstaan`)}
      />
    </Card>
  );
}

function Transcripts() {
  const transcripts = useStore((s) => s.transcripts);
  const [open, setOpen] = useState<Transcript | null>(null);
  if (open)
    return (
      <div className="space-y-4">
        <button onClick={() => setOpen(null)} className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft className="h-4 w-4" /> Terug
        </button>
        <TranscriptView t={open} />
      </div>
    );
  if (!transcripts.length) return <Notice>Nog geen gesprekken opgeslagen.</Notice>;
  return (
    <ul className="space-y-2">
      {transcripts.map((t) => (
        <li key={t.id}>
          <button onClick={() => setOpen(t)} className="w-full text-left">
            <Card className="flex items-center justify-between py-3">
              <span>
                <span className="font-medium">{SCENARIOS.find((s) => s.id === t.scenario)?.title ?? t.scenario}</span>
                <span className="ml-2 text-xs text-muted">{new Date(t.date).toLocaleString("nl-NL")}</span>
              </span>
              <Badge tone={t.corrections.length ? "warn" : "ok"}>{t.corrections.length} correcties</Badge>
            </Card>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TranscriptView({ t }: { t: Transcript }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Transcript</h2>
        {t.messages.map((m, i) => (
          <div key={i} className={cn("rounded-xl p-3", m.role === "user" ? "bg-primary-soft" : "bg-surface-2")}>
            <p className="text-xs text-muted">{m.role === "user" ? "Jij" : "Docent"}</p>
            <Ar text={m.ar} size="sm" />
            {m.nl && <p className="text-xs text-muted">{m.nl}</p>}
          </div>
        ))}
      </Card>
      <div className="space-y-4">
        <Card>
          <h2 className="mb-2 font-display text-lg font-semibold">Fouten</h2>
          {t.corrections.length ? (
            <ul className="space-y-2 text-sm">
              {t.corrections.map((c, i) => (
                <li key={i} className="rounded-xl border border-line p-2">
                  <bdi className="ar text-lg text-danger line-through">{c.original}</bdi> → <bdi className="ar text-lg text-ok">{c.corrected}</bdi>
                  <p className="text-muted">
                    <Rich text={c.explanation} />
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Geen fouten genoteerd.</p>
          )}
        </Card>
        {t.recommendations.length > 0 && (
          <Card>
            <h2 className="mb-2 font-display text-lg font-semibold">Aanbevolen oefeningen</h2>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {t.recommendations.map((r, i) => (
                <li key={i}>
                  <Rich text={r} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function Conversation({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const settings = useStore((s) => s.settings);
  const addTranscript = useStore((s) => s.addTranscript);
  const addWords = useStore((s) => s.addWords);
  const level = levelEstimate(useStore.getState()).level;
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", ar: scenario.opener.ar, nl: scenario.opener.nl }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNl, setShowNl] = useState(false);
  const [ended, setEnded] = useState<Transcript | null>(null);
  const [newWords, setNewWords] = useState<{ ar: string; nl: string }[]>([]);
  const stt = useSpeechRecognition();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speak(scenario.opener.ar, { rate: settings.ttsRate, voiceURI: settings.voiceURI });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!stt.listening && stt.transcript) setDraft(stt.transcript);
  }, [stt.listening, stt.transcript]);
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const lastAi = [...msgs].reverse().find((m) => m.role === "assistant");

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    const next: Msg[] = [...msgs, { role: "user", ar: t }];
    setMsgs(next);
    setDraft("");
    stt.setTranscript("");
    setBusy(true);
    try {
      const apiMsgs = [{ role: "user" as const, content: "(Begin het gesprek.)" }, ...next.map((m) => ({ role: m.role, content: m.ar }))];
      const r = await callAi<ConversationReply>("conversation", { messages: apiMsgs, scenarioRole: scenario.role, level });
      setMsgs((cur) => {
        const copy = [...cur];
        copy[copy.length - 1] = { ...copy[copy.length - 1], corrections: r.corrections };
        return [...copy, { role: "assistant", ar: r.reply_ar, nl: r.reply_nl }];
      });
      if (r.new_words.length) setNewWords((w) => [...w, ...r.new_words.filter((x) => !w.some((y) => y.ar === x.ar))]);
      speak(r.reply_ar, { rate: settings.ttsRate, voiceURI: settings.voiceURI });
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Er ging iets mis.");
      setMsgs(msgs);
      setDraft(t);
    } finally {
      setBusy(false);
    }
  };

  const end = async () => {
    setBusy(true);
    const corrections = msgs.flatMap((m) => m.corrections ?? []);
    let summary: SummaryResult | null = null;
    if (msgs.filter((m) => m.role === "user").length > 0) {
      try {
        summary = await callAi<SummaryResult>("summary", { messages: msgs.map((m) => ({ role: m.role, content: m.ar })) });
      } catch {
        summary = null;
      }
    }
    const t: Transcript = {
      id: `conv-${Date.now()}`,
      scenario: scenario.id,
      date: new Date().toISOString(),
      messages: msgs.map(({ role, ar, nl }) => ({ role, ar, nl })),
      corrections,
      recommendations: summary ? [summary.summary_nl, ...summary.weak_points.map((w) => `Aandachtspunt: ${w}`), ...summary.recommendations] : [],
    };
    addTranscript(t);
    // AI-woorden gaan ongecontroleerd het woordenboek in; pas na jouw bevestiging worden het flashcards.
    if (newWords.length) addWords(newWords.map((w) => ({ id: `w-${w.ar}`, ar: w.ar, nl: w.nl, source: "gesprek" as const, verified: false })));
    setEnded(t);
    setBusy(false);
  };

  if (ended)
    return (
      <div className="space-y-4">
        <PageHeader title={`Gesprek afgerond: ${scenario.title}`} subtitle="Je transcript is opgeslagen." />
        {newWords.length > 0 && (
          <Notice>
            {newWords.length} nieuwe woorden uit dit gesprek staan in je woordenboek als &quot;niet gecontroleerd&quot;. Bevestig ze daar om er flashcards van te maken.
          </Notice>
        )}
        <TranscriptView t={ended} />
        <div className="flex gap-2">
          <Button onClick={onExit}>Nieuw gesprek</Button>
          <LinkButton href="/woorden" variant="outline">
            Naar woordenboek
          </LinkButton>
        </div>
      </div>
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft className="h-4 w-4" /> Scenario&apos;s
        </button>
        <div className="flex items-center gap-2">
          <Badge>{scenario.title}</Badge>
          <Button size="sm" variant="outline" onClick={end} disabled={busy}>
            <Flag className="h-4 w-4" /> Afronden
          </Button>
        </div>
      </div>
      <Card className="space-y-1 bg-surface-2 py-3 text-xs">
        <p className="font-medium text-muted">Handige zinnen</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {scenario.useful.map((u) => (
            <span key={u.ar}>
              <bdi className="ar text-base">{u.ar}</bdi> <span className="text-muted">= {u.nl}</span>
            </span>
          ))}
        </div>
      </Card>
      <div className="space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[88%] rounded-2xl px-4 py-3", m.role === "user" ? "bg-primary-soft" : "border border-line bg-surface")}>
              <Ar text={m.ar} size="md" />
              {m.role === "assistant" && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AudioButton text={m.ar} label="" />
                  {(showNl || i === 0) && m.nl && <span className="text-sm text-muted">{m.nl}</span>}
                </div>
              )}
              {m.corrections && m.corrections.length > 0 && (
                <div className="mt-2 space-y-1 rounded-xl bg-warn-soft p-2 text-sm">
                  {m.corrections.map((c, k) => (
                    <div key={k}>
                      <bdi className="ar text-base line-through opacity-70">{c.original}</bdi> → <bdi className="ar text-base font-medium">{c.corrected}</bdi>
                      <p className="text-xs text-ink">
                        <Rich text={c.explanation} arClass="text-sm" />
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {m.corrections && m.corrections.length === 0 && <p className="mt-1 text-xs text-ok">Geen fouten gevonden ✓</p>}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-muted">De docent denkt na…</p>}
        <div ref={bottom} />
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
      <Card className="sticky bottom-20 space-y-3 lg:bottom-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!lastAi} onClick={() => lastAi && speak(lastAi.ar, { rate: settings.ttsRate, voiceURI: settings.voiceURI })}>
            <Repeat className="h-4 w-4" /> Herhaal
          </Button>
          <Button size="sm" variant="outline" disabled={!lastAi} onClick={() => lastAi && speak(lastAi.ar, { rate: 0.55, voiceURI: settings.voiceURI })}>
            <Snail className="h-4 w-4" /> Langzamer
          </Button>
          <Button size="sm" variant={showNl ? "secondary" : "outline"} onClick={() => setShowNl((s) => !s)}>
            <Languages className="h-4 w-4" /> Vertaling
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => send("أَعِدْ مِنْ فَضْلِكَ بِبُطْءٍ، وَاشْرَحْ بِالْهُولَنْدِيَّةِ.")}>
            <MessageSquare className="h-4 w-4" /> Uitleg in het Nederlands
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {stt.supported ? (
            <button
              onClick={() => (stt.listening ? stt.stop() : stt.start())}
              disabled={busy}
              className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow transition active:scale-95 disabled:opacity-50", stt.listening ? "animate-pulse bg-danger" : "bg-primary")}
              aria-label={stt.listening ? "Stop opname" : "Spreek"}
            >
              {stt.listening ? <Square className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
            </button>
          ) : (
            <p className="text-xs text-muted">Geen spraakherkenning in deze browser: typ je antwoord.</p>
          )}
          <p className="text-sm text-muted">{stt.listening ? stt.interim || "Ik luister…" : "Spreek of typ je antwoord, controleer de tekst en verstuur."}</p>
        </div>
        {stt.error && <p className="text-sm text-danger">{stt.error}</p>}
        <ArabicInput value={draft} onChange={setDraft} onSubmit={() => send(draft)} disabled={busy} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            {stt.confidence !== null && `Herkenningszekerheid van je browser: ${Math.round(stt.confidence * 100)}%. `}
            Uitspraak wordt alleen indirect beoordeeld via spraakherkenning.
          </p>
          <Button onClick={() => send(draft)} disabled={!draft.trim() || busy}>
            <Send className="h-4 w-4" /> Verstuur
          </Button>
        </div>
      </Card>
    </div>
  );
}
