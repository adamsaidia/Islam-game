"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Home, BookOpen, Layers, Mic, Menu, PenLine, Headphones, BookText, GraduationCap, CalendarDays, Settings, MessageCircle, ClipboardCheck, Sun, Moon, X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useHydrated } from "./Providers";

const NAV = [
  { href: "/", label: "Start", icon: Home },
  { href: "/lessen", label: "Lessen", icon: BookOpen },
  { href: "/lezen", label: "Lezen", icon: BookText },
  { href: "/schrijven", label: "Schrijven", icon: PenLine },
  { href: "/luisteren", label: "Luisteren", icon: Headphones },
  { href: "/spreken", label: "Spreken", icon: Mic },
  { href: "/grammatica", label: "Grammatica", icon: GraduationCap },
  { href: "/woorden", label: "Woordenschat", icon: Layers },
  { href: "/docent", label: "AI-docent", icon: MessageCircle },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/instaptoets", label: "Instaptoets", icon: ClipboardCheck },
  { href: "/instellingen", label: "Instellingen", icon: Settings },
];
const MOBILE = ["/", "/lessen", "/woorden", "/spreken"];

function HarakatToggle() {
  const mode = useStore((s) => s.settings.harakat);
  const set = useStore((s) => s.setSettings);
  const next = { full: "partial", partial: "none", none: "full" } as const;
  const label = { full: "Harakat: aan", partial: "Harakat: deels", none: "Harakat: uit" }[mode];
  return (
    <button
      type="button"
      onClick={() => set({ harakat: next[mode] })}
      className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
      title="Wissel tussen volledige, gedeeltelijke en geen harakat"
    >
      <span className="ar text-lg leading-none">{mode === "full" ? "بَ" : mode === "partial" ? "بّ" : "ب"}</span>
      {label}
    </button>
  );
}

function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme);
  const set = useStore((s) => s.setSettings);
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      type="button"
      aria-label="Wissel licht/donker"
      onClick={() => set({ theme: isDark ? "light" : "dark" })}
      className="rounded-full border border-line bg-surface p-2 hover:bg-surface-2"
      title={`Thema: ${theme}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const hydrated = useHydrated();
  const [more, setMore] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="ar flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-2xl text-primary-ink">ع</span>
          <span>
            <span className="block font-display text-lg font-semibold leading-tight">Arabische Academie</span>
            <span className="ar block text-sm text-muted">الأكاديمية العربية</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", active(n.href) ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-surface-2 hover:text-ink")}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur sm:px-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="ar flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xl text-primary-ink">ع</span>
            <span className="font-display font-semibold">Academie</span>
          </Link>
          <div className="hidden lg:block" />
          {hydrated && (
            <div className="flex items-center gap-2">
              <HarakatToggle />
              <ThemeToggle />
            </div>
          )}
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {hydrated ? children : <div className="py-24 text-center text-muted">Laden…</div>}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md justify-around">
          {NAV.filter((n) => MOBILE.includes(n.href)).map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]", active(n.href) ? "text-primary" : "text-muted")}>
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
          <button type="button" onClick={() => setMore(true)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted">
            <Menu className="h-5 w-5" />
            Meer
          </button>
        </div>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="fade-in absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Alle onderdelen</span>
              <button onClick={() => setMore(false)} aria-label="Sluiten">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMore(false)}
                  className={cn("flex flex-col items-center gap-1 rounded-2xl p-3 text-xs", active(n.href) ? "bg-primary-soft text-primary" : "bg-surface-2")}
                >
                  <n.icon className="h-5 w-5" />
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
