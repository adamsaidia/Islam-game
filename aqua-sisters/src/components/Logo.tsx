export function LogoMark({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 52 40" className={className} aria-hidden="true" fill="none" strokeLinecap="round">
      <circle cx="26" cy="11" r="6" stroke="#C8A96A" strokeWidth="1.8" />
      <path d="M4 25c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 8 4" stroke="#C8A96A" strokeWidth="1.8" />
      <path d="M4 33c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 8 4" stroke={light ? '#7FD1CB' : '#2E7F7C'} strokeWidth="1.8" />
    </svg>
  );
}

export function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-7 w-9" light={light} />
      <span className={`display text-[1.15rem] tracking-[0.32em] ${light ? 'text-white' : 'text-deep'}`}>AQUA SISTERS</span>
    </span>
  );
}
