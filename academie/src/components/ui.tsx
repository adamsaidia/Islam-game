"use client";
// Kleine UI-bibliotheek in shadcn/ui-stijl (zelf geschreven, zonder extra afhankelijkheden).
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-ink hover:opacity-90 shadow-sm",
  secondary: "bg-surface-2 text-ink hover:bg-line",
  ghost: "text-ink hover:bg-surface-2",
  outline: "border border-line bg-surface text-ink hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
  gold: "bg-gold text-white hover:opacity-90 shadow-sm",
};
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base", icon: "h-10 w-10" };

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export function LinkButton({ href, className, variant = "primary", size = "md", children }: { href: string; className?: string; variant?: Variant; size?: keyof typeof sizes; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98]", variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,.04)]", className)} {...props} />;
}

export function CardTitle({ children, className, icon }: { children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <h2 className={cn("mb-3 flex items-center gap-2 font-display text-lg font-semibold", className)}>
      {icon}
      {children}
    </h2>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "danger" | "gold" | "primary"; className?: string }) {
  const tones = {
    neutral: "bg-surface-2 text-muted",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    gold: "bg-gold-soft text-gold",
    primary: "bg-primary-soft text-primary",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Progress({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "gold" | "ok" | "danger" }) {
  const v = Math.max(0, Math.min(1, value));
  const color = { primary: "bg-primary", gold: "bg-gold", ok: "bg-ok", danger: "bg-danger" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-primary" : "bg-line")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, className }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-xl bg-surface-2 p-1", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-lg px-3 py-1.5 text-sm transition", o.value === value ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Notice({ tone = "neutral", children, className }: { tone?: "neutral" | "warn" | "danger" | "ok"; children: ReactNode; className?: string }) {
  const tones = { neutral: "bg-surface-2 text-ink", warn: "bg-warn-soft text-warn", danger: "bg-danger-soft text-danger", ok: "bg-ok-soft text-ok" };
  return <div className={cn("rounded-xl px-4 py-3 text-sm", tones[tone], className)}>{children}</div>;
}
