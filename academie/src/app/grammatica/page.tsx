"use client";
import { useMemo, useState } from "react";
import { ChevronDown, Lock, RotateCcw } from "lucide-react";
import { LESSONS } from "@/content/lessons";
import { useStore } from "@/lib/store";
import { buildSession, promptOf } from "@/lib/pools";
import { useStudyTimer } from "@/lib/useStudyTimer";
import { ExerciseSession } from "@/components/ExerciseSession";
import { Rich } from "@/components/arabic";
import { Badge, Button, Card, LinkButton, Notice, PageHeader } from "@/components/ui";

const LATER = ["Tweevoud (الْمُثَنَّى)", "Meervouden (klank- en gebroken meervoud)", "Werkwoordvervoeging verleden en tegenwoordige tijd", "Gebiedende wijs (الْأَمْر)", "Idafa (الْإِضَافَة)", "Ontkenning (لَا، مَا، لَمْ، لَنْ، لَيْسَ)", "I'rab: naamvallen (الْإِعْرَاب)", "Woordwortels (الْجَذْر)", "Werkwoordpatronen I–X (الْأَوْزَان)", "Betrekkelijke voornaamwoorden (الَّذِي، الَّتِي)", "Passief en deelwoorden"];

export default function GrammarPage() {
  const lessons = useStore((s) => s.lessons);
  const state = useStore();
  const recordAnswer = useStore((s) => s.recordAnswer);
  const [open, setOpen] = useState<number | null>(null);
  const [practice, setPractice] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  useStudyTimer("read_grammar");
  const topics = LESSONS.filter((l) => l.skills.includes("grammar"));
  const exercises = useMemo(
    () => buildSession(state, { skills: ["grammar", "writing"], kinds: ["type", "order"], size: 10, seed: Date.now() + round }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Grammatica" subtitle="Heldere uitleg in het Nederlands; oefenen doe je vooral door zelf zinnen te maken.">
        <Button onClick={() => { setPractice((p) => !p); setDone(null); }}>{practice ? "Terug naar overzicht" : "Zinnen bouwen"}</Button>
      </PageHeader>
      {practice ? (
        exercises.length === 0 ? (
          <Notice>Er is nog geen grammaticastof vrijgespeeld. Start eerst een grammaticales (vanaf les 21), of maak de instaptoets.</Notice>
        ) : done ? (
          <Card className="space-y-3 text-center">
            <p className="font-medium">{done}</p>
            <Button onClick={() => { setDone(null); setRound((r) => r + 1); }}>
              <RotateCcw className="h-4 w-4" /> Nieuwe ronde
            </Button>
          </Card>
        ) : (
          <Card>
            <ExerciseSession
              key={round}
              title="Zinnen bouwen"
              exercises={exercises}
              onAnswer={(e, r) => recordAnswer({ exerciseId: e.id, skill: e.skill, correct: r.correct, verdict: r.verdict, prompt: promptOf(e), expected: r.expected })}
              onFinish={(res) => setDone(`${res.filter((r) => r.result?.correct).length} van ${res.filter((r) => r.result).length} goed`)}
            />
          </Card>
        )
      ) : (
        <>
          <div className="space-y-2">
            {topics.map((l) => {
              const st = lessons[l.id]?.status;
              return (
                <Card key={l.id} className="p-0">
                  <button onClick={() => setOpen(open === l.id ? null : l.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                    <span>
                      <span className="text-xs text-muted">Les {l.id}</span>
                      <span className="block font-medium">{l.title}</span>
                      <span className="ar block text-lg text-gold">{l.titleAr}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {st === "completed" && <Badge tone="ok">behaald</Badge>}
                      <ChevronDown className={`h-5 w-5 transition ${open === l.id ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {open === l.id && (
                    <div className="space-y-3 border-t border-line p-4 text-sm">
                      {l.sections.map((s, i) => (
                        <div key={i}>
                          <p className="font-medium"><Rich text={s.title} /></p>
                          {s.body.map((b, j) => (
                            <p key={j} className="mt-1">
                              <Rich text={b} />
                            </p>
                          ))}
                          {s.table && (
                            <div className="mt-2 overflow-x-auto">
                              <table className="min-w-max text-sm">
                                <tbody>
                                  {s.table.map((row, r) => (
                                    <tr key={r} className={r === 0 ? "text-muted" : ""}>
                                      {row.map((c, k) => (
                                        <td key={k} className="px-2 py-1">
                                          <Rich text={c} />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                      <LinkButton href={`/lessen/${l.id}`} size="sm">
                        Naar de les
                      </LinkButton>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <Card>
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
              <Lock className="h-4 w-4 text-muted" /> Gepland voor A1-verdieping t/m B2
            </h2>
            <ul className="grid gap-1 text-sm text-muted sm:grid-cols-2">
              {LATER.map((t) => (
                <li key={t}>
                  <Rich text={t} arClass="text-base" />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">Deze onderwerpen zijn nog niet uitgewerkt. Vragen erover kun je wel al aan de AI-docent stellen.</p>
          </Card>
        </>
      )}
    </div>
  );
}
