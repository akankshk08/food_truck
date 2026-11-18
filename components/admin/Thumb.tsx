import Image from "next/image";
import { ImageOff } from "lucide-react";

/** Small square product photo for admin lists. */
export default function Thumb({ src, alt, size = 56 }: { src: string | null; alt: string; size?: number }) {
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-xl border border-gold/20 bg-card" style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sand/40">
          <ImageOff size={size / 3} aria-label="No photo" />
        </span>
      )}
    </span>
  );
}
