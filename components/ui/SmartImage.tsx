import Image from "next/image";
import { Camera } from "lucide-react";
import type { ResolvedImage } from "@/lib/images";

type Props = {
  image: ResolvedImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Short label shown in the placeholder, e.g. the dish name. */
  label?: string;
  /** Tone of the placeholder's glow. */
  tone?: "ember" | "leaf" | "gold";
  /** Show the photographer's brief inside the placeholder. */
  showBrief?: boolean;
};

const TONES = {
  ember: "radial-gradient(120% 90% at 30% 85%, rgb(148 62 28 / 0.55), transparent 60%), radial-gradient(90% 70% at 80% 10%, rgb(215 182 106 / 0.28), transparent 60%)",
  leaf: "radial-gradient(120% 90% at 75% 85%, rgb(70 104 58 / 0.6), transparent 60%), radial-gradient(90% 70% at 20% 10%, rgb(215 182 106 / 0.22), transparent 60%)",
  gold: "radial-gradient(110% 90% at 50% 100%, rgb(215 182 106 / 0.35), transparent 60%), radial-gradient(80% 60% at 15% 0%, rgb(120 82 36 / 0.45), transparent 65%)",
};

/**
 * Renders the configured photo when it exists in /public/images,
 * otherwise a premium, clearly-labelled placeholder (never a cartoon).
 * The image zooms gently when a parent with the `group` class is hovered.
 */
export function SmartImage({ image, sizes, priority, className = "", label, tone = "gold", showBrief = false }: Props) {
  if (image.file) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={image.file}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={82}
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-elegant)] group-hover:scale-[1.06]"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${image.alt} (photograph coming soon)`}
      className={`grain relative isolate overflow-hidden bg-card ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-elegant)] group-hover:scale-[1.06]"
        style={{ background: `${TONES[tone]}, linear-gradient(160deg, #1d2b1e 0%, #121d13 100%)` }}
      />
      {/* Fine inner frame */}
      <div aria-hidden="true" className="absolute inset-3 rounded-[inherit] border border-gold/15" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold/90">
          <Camera size={18} strokeWidth={1.4} aria-hidden="true" />
        </span>
        {label && <span className="font-serif text-2xl italic text-cream/90">{label}</span>}
        <span className="text-[0.62rem] uppercase tracking-[0.32em] text-gold/70">Photograph coming soon</span>
        {showBrief && (
          <span className="mt-1 max-w-xs text-xs leading-relaxed text-sand/50">{image.brief}</span>
        )}
      </div>
    </div>
  );
}
