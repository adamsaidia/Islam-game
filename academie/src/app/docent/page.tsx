"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import { callAi, fetchAiStatus, AiError } from "@/lib/ai/client";
import { useStore } from "@/lib/store";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { Markdown } from "@/components/Markdown";
import { ArabicInput } from "@/components/ArabicInput";
import { Button, Card, Notice, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "aa-tutor-chat";

const QUICK = [
  "Leg het verschil uit tussen هَذَا en هَذِهِ.",
  "Waarom schrijf je مَدْرَسَتِي met een ت en niet met ة?",
  "Wat is het verschil tussen مُدَرِّس en مَدْرَسَة?",
  "Overhoor mij over mijn laatste lessen.",
  "Geef mij extra oefeningen over de naamwoordzin.",
  "Vertaal 'mijn zus is lerares' en leg de grammatica uit.",
];

export default function TutorPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [arDraft, setArDraft] = useState("");
  const [showAr, setShowAr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<boolean | null>(null);
  const aiLevel = useStore((s) => s.settings.aiLevel);
  const bottom = useRef<HTMLDivElement>(null);
  useStudyTimer("read_grammar", msgs.length > 0);

  useEffect(() => {
    fetchAiStatus().then((s) => setAi(s.configured));
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setMsgs(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(msgs.slice(-40)));
    } catch {}
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setDraft("");
    setArDraft("");
    setBusy(true);
    setError(null);
    try {
      const reply = await callAi<string>("tutor", { messages: next });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof AiError ? e.message : "Er ging iets mis.");
      setMsgs(msgs);
      setDraft(t);
    } finally {
      setBusy(false);
    }
  };

  const disabled = !ai || aiLevel === "off";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="AI-docent" subtitle="Je persoonlijke leraar: uitleg, correctie, overhoring en extra oefeningen, afgestemd op jouw niveau en fouten.">
        {msgs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMsgs([])}>
            <Trash2 className="h-4 w-4" /> Wis gesprek
          </Button>
        )}
      </PageHeader>
      {ai === false && <Notice tone="warn" className="mb-4">De AI-docent is niet geconfigureerd: zet ANTHROPIC_API_KEY op de server (zie Instellingen → Kosten &amp; AI).</Notice>}
      {ai && aiLevel === "off" && <Notice className="mb-4">AI staat uit in je instellingen.</Notice>}
      {msgs.length === 0 && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {QUICK.map((q) => (
            <button key={q} disabled={disabled} onClick={() => send(q)} className="rounded-xl border border-line bg-surface p-3 text-left text-sm hover:border-primary disabled:opacity-50">
              <Sparkles className="mb-1 h-4 w-4 text-gold" />
              <Markdown text={q} />
            </button>
          ))}
        </div>
      )}
      <div className="space-y-3 pb-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[92%] rounded-2xl px-4 py-3", m.role === "user" ? "bg-primary-soft" : "border border-line bg-surface")}>
              <Markdown text={m.content} />
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-muted">De docent schrijft…</p>}
        {error && <Notice tone="danger">{error}</Notice>}
        <div ref={bottom} />
      </div>
      <Card className="sticky bottom-20 space-y-2 lg:bottom-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          disabled={disabled || busy}
          placeholder="Stel je vraag (Nederlands of Arabisch)…"
          className="min-h-20 w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 outline-none focus:border-primary"
        />
        {showAr && (
          <ArabicInput
            value={arDraft}
            onChange={setArDraft}
            onSubmit={() => {
              setDraft((d) => (d ? d + " " : "") + arDraft);
              setArDraft("");
            }}
            placeholder="Typ Arabisch en druk op ↵ om in te voegen"
          />
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowAr((s) => !s)}>
            {showAr ? "Verberg Arabisch toetsenbord" : "Arabisch invoegen"}
          </Button>
          <Button onClick={() => send(draft)} disabled={disabled || busy || !draft.trim()}>
            <Send className="h-4 w-4" /> Vraag
          </Button>
        </div>
      </Card>
    </div>
  );
}
