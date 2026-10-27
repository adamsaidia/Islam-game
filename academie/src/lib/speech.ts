"use client";
// Spraak via de Web Speech API van de browser: gratis, geen sleutel nodig.
// Kwaliteit en beschikbaarheid verschillen per apparaat; de UI meldt dat eerlijk.
import { useCallback, useEffect, useRef, useState } from "react";

export function getArabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ar"));
}

/** Wacht tot de stemmenlijst geladen is (Chrome laadt die asynchroon). */
export function useArabicVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => setVoices(getArabicVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return { voices, supported };
}

export function speak(text: string, opts: { rate?: number; voiceURI?: string; onEnd?: () => void } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA";
  u.rate = opts.rate ?? 0.85;
  const voices = getArabicVoices();
  const voice = voices.find((v) => v.voiceURI === opts.voiceURI) ?? voices[0];
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  if (opts.onEnd) u.onend = opts.onEnd;
  synth.speak(u);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

// --- Spraakherkenning ---------------------------------------------------------

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => RecognitionLike) | null;
}

export function sttSupported(): boolean {
  return getRecognitionCtor() !== null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Microfoon geweigerd. Sta microfoontoegang toe in je browser.",
  "no-speech": "Ik hoorde niets. Probeer het opnieuw en spreek iets dichter bij de microfoon.",
  network: "Spraakherkenning heeft internet nodig (de browser stuurt audio naar zijn eigen dienst).",
  "language-not-supported": "Je browser ondersteunt geen Arabische spraakherkenning.",
  "audio-capture": "Geen microfoon gevonden.",
};

export function useSpeechRecognition(lang = "ar-SA") {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const rec = useRef<RecognitionLike | null>(null);

  useEffect(() => setSupported(sttSupported()), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Spraakherkenning wordt niet ondersteund in deze browser. Gebruik Chrome, Edge of Safari.");
      return;
    }
    setError(null);
    setTranscript("");
    setInterim("");
    setConfidence(null);
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript;
          setConfidence(res[0].confidence);
        } else interimText += res[0].transcript;
      }
      if (finalText) setTranscript((t) => (t ? t + " " : "") + finalText.trim());
      setInterim(interimText);
    };
    r.onerror = (e) => {
      if (e.error !== "aborted") setError(ERRORS[e.error] ?? `Spraakherkenning mislukt (${e.error}).`);
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => rec.current?.stop(), []);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, transcript, interim, confidence, error, start, stop, setTranscript };
}
