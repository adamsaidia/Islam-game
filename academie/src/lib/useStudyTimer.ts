"use client";
// Meet echte studietijd: telt alleen als het tabblad zichtbaar is en je de afgelopen 90 s iets deed.
import { useEffect, useRef } from "react";
import { useStore, type Block } from "./store";

const TICK = 15;

export function useStudyTimer(block: Block, active = true) {
  const add = useStore((s) => s.addStudySeconds);
  const last = useRef(Date.now());
  useEffect(() => {
    if (!active) return;
    const bump = () => (last.current = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last.current < 90_000) add(block, TICK);
    }, TICK * 1000);
    return () => {
      clearInterval(id);
      events.forEach((ev) => window.removeEventListener(ev, bump));
    };
  }, [block, active, add]);
}
