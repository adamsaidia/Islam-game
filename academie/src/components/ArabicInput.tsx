"use client";
// Invoerveld voor Arabisch met een ingebouwd toetsenbord (standaard Arabische indeling + harakat).
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Delete, Keyboard, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ", "ذ"],
];
const EXTRA = ["أ", "إ", "آ", "؟", "،", "."];
const MARKS: { ch: string; name: string }[] = [
  { ch: "َ", name: "fatha" },
  { ch: "ِ", name: "kasra" },
  { ch: "ُ", name: "damma" },
  { ch: "ْ", name: "sukun" },
  { ch: "ّ", name: "shadda" },
  { ch: "ً", name: "-an" },
  { ch: "ٍ", name: "-in" },
  { ch: "ٌ", name: "-un" },
];
const DIGITS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٠"];

const PREF_KEY = "aa-keyboard";

export type ArabicInputHandle = { focus: () => void };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showMarks?: boolean;
  className?: string;
  autoFocus?: boolean;
};

export const ArabicInput = forwardRef<ArabicInputHandle, Props>(function ArabicInput(
  { value, onChange, onSubmit, multiline, placeholder = "اكتب هنا…", disabled, showMarks = true, className, autoFocus },
  ref,
) {
  const el = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [kbd, setKbd] = useState(true);
  const [digits, setDigits] = useState(false);
  const [touch, setTouch] = useState(false);
  useImperativeHandle(ref, () => ({ focus: () => el.current?.focus() }));

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    try {
      const p = localStorage.getItem(PREF_KEY);
      if (p) setKbd(p === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (autoFocus && !touch) el.current?.focus();
  }, [autoFocus, touch]);

  const toggleKbd = () => {
    setKbd((k) => {
      try {
        localStorage.setItem(PREF_KEY, k ? "0" : "1");
      } catch {}
      return !k;
    });
  };

  const insert = (s: string) => {
    const node = el.current;
    const start = node?.selectionStart ?? value.length;
    const end = node?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + s + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      if (!node) return;
      const pos = start + s.length;
      node.setSelectionRange(pos, pos);
      if (!touch) node.focus();
    });
  };

  const backspace = () => {
    const node = el.current;
    const start = node?.selectionStart ?? value.length;
    const end = node?.selectionEnd ?? value.length;
    if (start === end && start === 0) return;
    const from = start === end ? Array.from(value.slice(0, start)).slice(0, -1).join("").length : start;
    onChange(value.slice(0, from) + value.slice(end));
    requestAnimationFrame(() => node?.setSelectionRange(from, from));
  };

  const common = {
    ref: el,
    value,
    disabled,
    dir: "rtl" as const,
    lang: "ar",
    placeholder,
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    inputMode: kbd && touch ? ("none" as const) : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: cn(
      "ar w-full rounded-xl border border-line bg-surface px-4 py-2 text-2xl outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60",
      multiline && "min-h-32 text-xl",
    ),
  };

  const key = (label: string, onPress: () => void, cls = "", title?: string) => (
    <button
      key={label + title}
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onPress}
      className={cn("ar flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg bg-surface text-xl shadow-[0_1px_0_var(--line)] transition active:scale-95 active:bg-primary-soft sm:h-11", cls)}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea {...common} />
        ) : (
          <input
            {...common}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit?.();
              }
            }}
          />
        )}
        <button
          type="button"
          onClick={toggleKbd}
          title={kbd ? "Verberg app-toetsenbord (gebruik je eigen toetsenbord)" : "Toon Arabisch toetsenbord"}
          className={cn("mt-1 rounded-lg p-2 text-muted hover:bg-surface-2", kbd && "text-primary")}
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </div>
      {kbd && !disabled && (
        <div className="select-none rounded-2xl bg-surface-2 p-1.5 sm:p-2" dir="rtl">
          {showMarks && (
            <div className="mb-1.5 flex gap-1">
              {MARKS.map((m) => key("ـ" + m.ch, () => insert(m.ch), "text-gold", m.name))}
            </div>
          )}
          {digits ? (
            <div className="mb-1 flex gap-1">{DIGITS.map((d) => key(d, () => insert(d)))}</div>
          ) : (
            ROWS.map((row, i) => (
              <div key={i} className="mb-1 flex gap-1">
                {row.map((c) => key(c, () => insert(c)))}
              </div>
            ))
          )}
          <div className="flex gap-1">
            {EXTRA.map((c) => key(c, () => insert(c)))}
            {key(digits ? "ابج" : "١٢٣", () => setDigits((d) => !d), "text-sm")}
            {key("␣", () => insert(" "), "flex-[3]", "spatie")}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={backspace}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-surface shadow-[0_1px_0_var(--line)] active:scale-95 sm:h-11"
              aria-label="Wissen"
            >
              <Delete className="h-5 w-5" />
            </button>
            {onSubmit && !multiline && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onSubmit}
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-primary-ink active:scale-95 sm:h-11"
                aria-label="Controleren"
              >
                <CornerDownLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
