"use client";
import { useMemo, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw } from "lucide-react";
import { TEXTS, type ReadingText } from "@/content/texts";
import { useStore } from "@/lib/store";
import { speak, stopSpeaking, useArabicVoices } from "@/lib/speech";
import { checkArabic, type CheckResult } from "@/lib/arabic";
import { buildSession, promptOf } from "@/lib/pools";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession } from "@/components/ExerciseSession";
import { ArabicInput } from "@/components/ArabicInput";
import { Ar } from "@/components/arabic";
import { Button, Card, Notice, PageHeader, Segmented, Switch } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "fragmenten" | "oefenen" | "dictee";

export default function ListeningPage() {
  const [mode, setMode] = useState<Mode>("fragmenten");
  const { voices, supported } = useArabicVoices();
  const rate = useStore((s) => s.settings.ttsRate);
  const setSettings = useStore((s) => s.setSettings);
  useStudyTimer("speak_listen");
  return (
    <div>
      <PageHeader title="Luisteren" subtitle="Woorden, zinnen, gesprekken en verhalen. Speel zo vaak af als je wilt.">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "fragmenten", label: "Fragmenten" },
            { value: "oefenen", label: "Luistervragen" },
            { value: "dictee", label: "Luisterdictee" },
          ]}
        />
      </PageHeader>
      {!supported && <Notice tone="danger" className="mb-4">Je browser ondersteunt geen spraaksynthese. Luisteren werkt hier niet.</Notice>}
      {supported && voices.length === 0 && (
        <Notice tone="warn" className="mb-4">
          Er is geen Arabische stem gevonden op dit apparaat. De uitspraak kan dan onjuist zijn. Op iPhone/iPad: Instellingen → Toegankelijkheid → Gesproken materiaal → Stemmen → Arabisch. Op Android: installeer
          &quot;Spraakservices van Google&quot; met Arabisch. Op Windows: Instellingen → Tijd en taal → Spraak → Arabisch toevoegen.
        </Notice>
      )}
      <Card className="mb-5 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm">
          Snelheid
          <input type="range" min={0.5} max={1.2} step={0.05} value={rate} onChange={(e) => setSettings({ ttsRate: Number(e.target.value) })} className="accent-[var(--primary)]" />
          <span className="w-10 tabular-nums text-muted">{rate.toFixed(2)}×</span>
        </label>
        <span className="text-xs text-muted">Audio wordt door je apparaat voorgelezen (gratis) en komt altijd exact overeen met de getoonde tekst.</span>
      </Card>
      {mode === "fragmenten" && <Fragments rate={rate} />}
      {mode === "oefenen" && <Practice />}
      {mode === "dictee" && <Dictation rate={rate} />}
    </div>
  );
}

function Fragments({ rate }: { rate: number }) {
  const [text, setText] = useState<ReadingText>(TEXTS[0]);
  const [showAr, setShowAr] = useState(false);
  const [showNl, setShowNl] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const stopRef = useRef(false);
  const voiceURI = useStore((s) => s.settings.voiceURI);

  const playFrom = (i: number) => {
    if (i >= text.sentences.length || stopRef.current) {
      setPlayingAll(false);
      setCurrent(null);
      return;
    }
    setCurrent(i);
    speak(text.sentences[i].ar, { rate, voiceURI, onEnd: () => setTimeout(() => playFrom(i + 1), 450) });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="space-y-1 p-3">
        {TEXTS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              stopSpeaking();
              stopRef.current = true;
              setPlayingAll(false);
              setCurrent(null);
              setText(t);
            }}
            className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", t.id === text.id ? "bg-primary-soft font-medium text-primary" : "hover:bg-surface-2")}
          >
            {t.title}
            <span className="block text-xs text-muted">{t.sentences.length} zinnen</span>
          </button>
        ))}
      </Card>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              if (playingAll) {
                stopRef.current = true;
                stopSpeaking();
                setPlayingAll(false);
                setCurrent(null);
              } else {
                stopRef.current = false;
                setPlayingAll(true);
                playFrom(0);
              }
            }}
          >
            {playingAll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playingAll ? "Stop" : "Speel alles"}
          </Button>
          <div className="flex gap-4">
            <Switch checked={showAr} onChange={setShowAr} label="Arabische tekst" />
            <Switch checked={showNl} onChange={setShowNl} label="Vertaling" />
          </div>
        </div>
        <p className="text-xs text-muted">Tip: luister eerst zonder tekst. Speel daarna zin voor zin af.</p>
        <ol className="space-y-2">
          {text.sentences.map((s, i) => (
            <li key={i} className={cn("flex items-start gap-3 rounded-xl border p-3 transition", current === i ? "border-primary bg-primary-soft/50" : "border-line")}>
              <button
                onClick={() => {
                  stopRef.current = true;
                  setPlayingAll(false);
                  setCurrent(i);
                  speak(s.ar, { rate, voiceURI, onEnd: () => setCurrent(null) });
                }}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink"
                aria-label={`Speel zin ${i + 1}`}
              >
                <Play className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                {showAr ? <Ar text={s.ar} size="md" /> : <p className="text-sm text-muted">Zin {i + 1}</p>}
                {showNl && <p className="text-sm text-muted">{s.nl}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Practice() {
  const state = useStore();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const exercises = useMemo(
    () => buildSession(state, { skills: ["listening"], size: 10, seed: Date.now() + round }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  if (!exercises.length)
    return (
      <Card className="text-center">
        <Headphones className="mx-auto mb-2 h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Luistervragen komen uit lessen die je gestart hebt. Begin een les, of gebruik intussen de fragmenten.</p>
      </Card>
    );
  if (done)
    return (
      <Card className="space-y-3 text-center">
        <p className="font-medium">{done}</p>
        <Button onClick={() => { setDone(null); setRound((r) => r + 1); }}>
          <RotateCcw className="h-4 w-4" /> Nieuwe ronde
        </Button>
      </Card>
    );
  return (
    <Card>
      <ExerciseSession
        key={round}
        title="Luistervragen"
        exercises={exercises}
        onAnswer={(e, r) => recordAnswer({ exerciseId: e.id, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected })}
        onFinish={(res) => setDone(`${res.filter((r) => r.result?.correct).length} van ${res.filter((r) => r.result).length} goed`)}
      />
    </Card>
  );
}

function Dictation({ rate }: { rate: number }) {
  const sentences = useMemo(() => TEXTS.flatMap((t) => t.sentences.map((s) => ({ ...s, src: t.title }))).filter((s) => s.ar.split(" ").length <= 7), []);
  const [i, setI] = useState(() => Math.floor(Math.random() * sentences.length));
  const [value, setValue] = useState("");
  const [res, setRes] = useState<CheckResult | null>(null);
  const recordAnswer = useStore((s) => s.recordAnswer);
  const voiceURI = useStore((s) => s.settings.voiceURI);
  const s = sentences[i];
  return (
    <Card className="mx-auto max-w-2xl space-y-4">
      <p className="text-sm text-muted">Luister en schrijf de hele zin. Harakat zijn niet nodig; hamza en ة wel. Bron: {s.src}</p>
      <div className="flex gap-2">
        <Button onClick={() => speak(s.ar, { rate, voiceURI })}>
          <Play className="h-4 w-4" /> Luister
        </Button>
        <Button variant="outline" onClick={() => speak(s.ar, { rate: 0.55, voiceURI })}>
          Langzaam
        </Button>
      </div>
      <ArabicInput
        value={value}
        onChange={setValue}
        disabled={!!res}
        onSubmit={() => {
          if (!value.trim() || res) return;
          const r = checkArabic(value, [s.ar]);
          setRes(r);
          recordAnswer({ exerciseId: `LD-${s.ar}`, skill: "listening", correct: r.correct, verdict: r.verdict, prompt: "Luisterdictee", expected: s.ar });
        }}
      />
      {!res ? (
        <div className="flex justify-end">
          <Button
            disabled={!value.trim()}
            onClick={() => {
              const r = checkArabic(value, [s.ar]);
              setRes(r);
              recordAnswer({ exerciseId: `LD-${s.ar}`, skill: "listening", correct: r.correct, verdict: r.verdict, prompt: "Luisterdictee", expected: s.ar });
            }}
          >
            Controleer
          </Button>
        </div>
      ) : (
        <div className={cn("rounded-xl p-4", res.correct ? "bg-ok-soft" : res.verdict === "almost" ? "bg-warn-soft" : "bg-danger-soft")}>
          <p className="text-sm">{res.message}</p>
          <Ar text={s.ar} size="lg" force="full" />
          <p className="text-sm text-muted">{s.nl}</p>
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => {
                setI(Math.floor(Math.random() * sentences.length));
                setValue("");
                setRes(null);
              }}
            >
              Volgende zin
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
