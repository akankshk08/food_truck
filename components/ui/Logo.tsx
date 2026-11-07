import { brand } from "@/config/brand";

/** Monogram badge: a food truck framed by a fine gold ring. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <circle cx="24" cy="24" r="22.5" stroke="#D7B66A" strokeOpacity="0.85" />
      <circle cx="24" cy="24" r="19.5" stroke="#D7B66A" strokeOpacity="0.3" />
      {/* wave */}
      <path d="M11 33.5c2.2-1.6 4.4-1.6 6.5 0s4.4 1.6 6.5 0 4.4-1.6 6.5 0 4.3 1.6 6.5 0" stroke="#D7B66A" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
      {/* truck body */}
      <path d="M12.5 28.5V19a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v9.5" stroke="#D7B66A" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M29 21.5h3.6c.5 0 1 .25 1.25.67l2.4 3.83c.17.27.25.58.25.9v1.6H29" stroke="#D7B66A" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12.5 28.5H36.5" stroke="#D7B66A" strokeWidth="1.4" strokeLinecap="round" />
      {/* serving hatch + awning */}
      <path d="M15.5 21h10" stroke="#D7B66A" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M15.5 21l-1 2.2M18.83 21l-.5 2.2M22.17 21l.5 2.2M25.5 21l1 2.2" stroke="#D7B66A" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="17" cy="29.5" r="2" fill="#101B12" stroke="#D7B66A" strokeWidth="1.3" />
      <circle cx="32" cy="29.5" r="2" fill="#101B12" stroke="#D7B66A" strokeWidth="1.3" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="flex flex-col leading-none">
        <span className={`whitespace-nowrap font-serif font-semibold text-cream ${compact ? "text-[0.95rem] tracking-[0.14em]" : "text-[0.9rem] tracking-[0.1em] sm:text-lg sm:tracking-[0.14em]"}`}>
          {brand.name}
        </span>
        <span className="mt-1 hidden text-[0.58rem] font-medium uppercase tracking-[0.38em] text-gold/80 sm:block">
          Coastal Street Kitchen
        </span>
      </span>
    </span>
  );
}
