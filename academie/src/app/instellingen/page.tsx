"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, RotateCcw, Cloud, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useStore, snapshot, AI_DAILY_LIMIT, type AppState, type AiLevel } from "@/lib/store";
import { speak, sttSupported, useArabicVoices } from "@/lib/speech";
import { fetchAiStatus, type AiStatus } from "@/lib/ai/client";
import { currentUser, pull, push, sendMagicLink, signOut, syncConfigured, supabase } from "@/lib/sync";
import { dayKey } from "@/lib/utils";
import { Badge, Button, Card, CardTitle, Notice, PageHeader, Segmented, Switch } from "@/components/ui";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const set = useStore((s) => s.setSettings);
  const aiUsage = useStore((s) => s.aiUsage);
  const { voices, supported } = useArabicVoices();
  const [ai, setAi] = useState<AiStatus | null>(null);
  useEffect(() => {
    fetchAiStatus().then(setAi);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Instellingen" />

      <Card>
        <CardTitle>Weergave</CardTitle>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Thema</span>
            <Segmented
              value={settings.theme}
              onChange={(v) => set({ theme: v })}
              options={[
                { value: "system", label: "Systeem" },
                { value: "light", label: "Licht" },
                { value: "dark", label: "Donker" },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Harakat (klinkertekens)</span>
            <Segmented
              value={settings.harakat}
              onChange={(v) => set({ harakat: v })}
              options={[
                { value: "full", label: "Aan" },
                { value: "partial", label: "Deels" },
                { value: "none", label: "Uit" },
              ]}
            />
          </div>
          <p className="text-xs text-muted">In de lessen over letters en harakat (les 1–14) staan de harakat altijd aan, omdat ze daar de leerstof zijn.</p>
          <Switch checked={settings.translit} onChange={(v) => set({ translit: v })} label="Transliteratie tonen" description="Tijdelijk hulpmiddel (bijv. 'kitāb'). Zet dit uit zodra je vlot leest." />
        </div>
      </Card>

      <Card>
        <CardTitle>Spraak</CardTitle>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Voorlezen (TTS):</span>
            {!supported ? <Badge tone="danger">niet ondersteund</Badge> : voices.length ? <Badge tone="ok">{voices.length} Arabische stem(men)</Badge> : <Badge tone="warn">geen Arabische stem gevonden</Badge>}
          </div>
          {voices.length > 0 && (
            <select value={settings.voiceURI ?? ""} onChange={(e) => set({ voiceURI: e.target.value || undefined })} className="w-full rounded-xl border border-line bg-surface px-3 py-2">
              <option value="">Automatisch</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}){v.localService ? "" : " · online"}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-3">
            Snelheid
            <input type="range" min={0.5} max={1.2} step={0.05} value={settings.ttsRate} onChange={(e) => set({ ttsRate: Number(e.target.value) })} className="accent-[var(--primary)]" />
            <span className="tabular-nums text-muted">{settings.ttsRate.toFixed(2)}×</span>
          </label>
          <Button variant="outline" size="sm" onClick={() => speak("السَّلَامُ عَلَيْكُمْ، كَيْفَ حَالُكَ؟", { rate: settings.ttsRate, voiceURI: settings.voiceURI })}>
            Test stem
          </Button>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="font-medium">Spraakherkenning (microfoon):</span>
            {sttSupported() ? <Badge tone="ok">beschikbaar</Badge> : <Badge tone="warn">niet beschikbaar in deze browser</Badge>}
          </div>
          <p className="text-xs text-muted">
            Spraakherkenning gebruikt de ingebouwde dienst van je browser (Chrome/Edge: Google, Safari: Apple). Je stem wordt daarvoor naar die dienst gestuurd. Het is gratis. De app slaat geen
            audio op.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Kosten &amp; AI</CardTitle>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Status:</span>
            {ai === null ? <Badge>controleren…</Badge> : ai.configured ? <Badge tone="ok">AI geconfigureerd</Badge> : <Badge tone="warn">AI niet geconfigureerd</Badge>}
            {ai?.accessCodeRequired && <Badge tone="gold">toegangscode vereist</Badge>}
            <span className="text-muted">Vandaag gebruikt: {aiUsage[dayKey()] ?? 0} / {AI_DAILY_LIMIT[settings.aiLevel]} aanroepen</span>
          </div>
          {ai && !ai.configured && (
            <Notice tone="warn">
              Voeg op de server (bijv. in Vercel → Settings → Environment Variables, of lokaal in <code>.env.local</code>) de variabele <code>ANTHROPIC_API_KEY</code> toe. De sleutel blijft op de
              server en komt nooit in je browser.
            </Notice>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">Hoeveel AI wil je gebruiken?</span>
            <Segmented<AiLevel>
              value={settings.aiLevel}
              onChange={(v) => set({ aiLevel: v })}
              options={[
                { value: "off", label: "Uit" },
                { value: "zuinig", label: "Zuinig" },
                { value: "normaal", label: "Normaal" },
              ]}
            />
          </div>
          <p className="text-xs text-muted">Uit: geen kosten. Zuinig: max. {AI_DAILY_LIMIT.zuinig} aanroepen per dag, kortere antwoorden. Normaal: max. {AI_DAILY_LIMIT.normaal} per dag.</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">AI-model</span>
            <Segmented
              value={settings.aiModel}
              onChange={(v) => set({ aiModel: v })}
              options={[
                { value: "claude-opus-5-5", label: "Claude Opus 5.5 (beste kwaliteit)" },
                { value: "claude-haiku-5-5", label: "Claude Haiku 5.5 (veel goedkoper)" },
              ]}
            />
          </div>
          {ai?.accessCodeRequired && (
            <label className="block">
              <span className="font-medium">Toegangscode</span>
              <input
                type="password"
                value={settings.accessCode}
                onChange={(e) => set({ accessCode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
                placeholder="Dezelfde code als APP_ACCESS_CODE op de server"
              />
            </label>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-2">Onderdeel</th>
                  <th className="py-2 pr-2">Dienst</th>
                  <th className="py-2 pr-2">Kosten (indicatie)</th>
                  <th className="py-2">Alternatief</th>
                </tr>
              </thead>
              <tbody className="[&_td]:py-2 [&_td]:pr-2 [&_tr]:border-b [&_tr]:border-line/60">
                <tr>
                  <td>70 lessen (A0–C1), toetsen, flashcards, planner, leesmodule</td>
                  <td>In de app zelf</td>
                  <td><Badge tone="ok">gratis</Badge></td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Voorlezen (TTS)</td>
                  <td>Stem van je apparaat</td>
                  <td><Badge tone="ok">gratis</Badge></td>
                  <td>Neurale stemmen (bijv. Azure, ca. 0,5 mln tekens/maand gratis) — nog niet ingebouwd</td>
                </tr>
                <tr>
                  <td>Spraakherkenning (STT)</td>
                  <td>Browser (Web Speech API)</td>
                  <td><Badge tone="ok">gratis</Badge></td>
                  <td>Whisper-API (ca. $0,006 per minuut) voor Firefox/nauwkeuriger — nog niet ingebouwd</td>
                </tr>
                <tr>
                  <td>AI-gesprek, AI-docent, schrijfcorrectie</td>
                  <td>Claude API (Anthropic)</td>
                  <td>
                    Opus 5.5: $4 / $20 per miljoen tokens in/uit → ca. 1–3 cent per gespreksbeurt.
                    <br />
                    Haiku 5.5: $0,10 / $0,50 → ca. 0,05 cent per beurt.
                  </td>
                  <td>AI uit: alle lesstof blijft werken; naspreken zonder AI</td>
                </tr>
                <tr>
                  <td>Cloudopslag en inloggen</td>
                  <td>Supabase</td>
                  <td><Badge tone="ok">gratis tier</Badge> (500 MB; project pauzeert na 1 week zonder gebruik)</td>
                  <td>Alleen lokaal opslaan in je browser (standaard)</td>
                </tr>
                <tr>
                  <td>Publicatie</td>
                  <td>Vercel</td>
                  <td><Badge tone="ok">gratis</Badge> (Hobby-plan, persoonlijk gebruik)</td>
                  <td>Lokaal draaien met <code>npm run dev</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">
            Prijzen: Anthropic-tarieven per oktober 2026, exclusief btw. Een maand dagelijks 20 gespreksbeurten met Opus 5.5 kost grofweg €5–15; met Haiku 5.5 minder dan €0,50. Correcties en
            beoordelingen worden op de server gecachet, zodat herhaalde vragen niet opnieuw betaald worden. Bij Anthropic kun je ook een maandlimiet instellen.
          </p>
        </div>
      </Card>

      <SyncCard />
      <DataCard />
    </div>
  );
}

function SyncCard() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ tone: "ok" | "danger" | "neutral"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!syncConfigured()) return;
    currentUser().then(setUser);
    const sub = supabase()?.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ tone: "ok", text: await fn() });
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof Error ? e.message : "Mislukt." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardTitle icon={<Cloud className="h-5 w-5 text-primary" />}>Account &amp; synchronisatie</CardTitle>
      {!syncConfigured() ? (
        <Notice>
          Je voortgang wordt nu lokaal in deze browser opgeslagen. Wil je synchroniseren tussen apparaten? Maak een gratis Supabase-project, voer <code>supabase/migrations/0001_init.sql</code> uit en
          zet <code>NEXT_PUBLIC_SUPABASE_URL</code> en <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in de omgevingsvariabelen. Zie README.
        </Notice>
      ) : user ? (
        <div className="space-y-3 text-sm">
          <p>
            Ingelogd als <span className="font-medium">{user.email}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => run(async () => (await push(), "Je voortgang is opgeslagen in de cloud."))}>
              Upload naar cloud
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const r = await pull();
                  return r === "updated" ? "Cloudversie geladen." : r === "empty" ? "Er staat nog niets in de cloud." : "Je lokale versie is nieuwer; niets gewijzigd.";
                })
              }
            >
              Haal op uit cloud
            </Button>
            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" /> Uitloggen
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => (await sendMagicLink(email), "Check je e-mail voor de inloglink."));
          }}
        >
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jouw@email.nl" className="h-10 flex-1 rounded-xl border border-line bg-surface px-3 text-sm" />
          <Button type="submit" disabled={busy}>
            Stuur inloglink
          </Button>
        </form>
      )}
      {msg && (
        <Notice tone={msg.tone} className="mt-3">
          {msg.text}
        </Notice>
      )}
    </Card>
  );
}

function DataCard() {
  const importState = useStore((s) => s.importState);
  const resetAll = useStore((s) => s.resetAll);
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Card>
      <CardTitle>Mijn gegevens</CardTitle>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `arabische-academie-${dayKey()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          <Download className="h-4 w-4" /> Exporteer back-up
        </Button>
        <Button variant="outline" size="sm" onClick={() => file.current?.click()}>
          <Upload className="h-4 w-4" /> Importeer back-up
        </Button>
        <input
          ref={file}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const data = JSON.parse(await f.text()) as AppState;
              if (!data.settings || !data.lessons) throw new Error();
              importState(data);
              setMsg("Back-up geïmporteerd.");
            } catch {
              setMsg("Dit is geen geldige back-up.");
            }
          }}
        />
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm("Weet je zeker dat je alle voortgang wilt wissen? Dit kan niet ongedaan worden gemaakt (tenzij je een back-up hebt).")) resetAll();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Alles wissen
        </Button>
      </div>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </Card>
  );
}
