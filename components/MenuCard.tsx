"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowUpRight } from "lucide-react";
import { currency, type MenuItem } from "@/config/brand";
import type { ResolvedImage } from "@/lib/images";
import { formatPrice, whatsappLink } from "@/lib/links";
import { SmartImage } from "./ui/SmartImage";

type Props = {
  item: MenuItem;
  image: ResolvedImage;
  index: number;
};

const TONES = ["ember", "gold", "leaf"] as const;

/** Indian food-labelling mark: green square/dot for veg, brown square/triangle for non-veg. */
function DietMark({ veg }: { veg: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border ${veg ? "border-[#4f9a5a]" : "border-[#a3542f]"}`}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      {veg ? (
        <span className="h-2 w-2 rounded-full bg-[#4f9a5a]" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-[#a3542f]" />
      )}
      <span className="sr-only">{veg ? "Vegetarian" : "Non-vegetarian"}</span>
    </span>
  );
}

export default function MenuCard({ item, image, index }: Props) {
  const reduce = useReducedMotion();
  const headingId = `dish-${item.id}`;

  return (
    <motion.article
      aria-labelledby={headingId}
      initial={{ opacity: 0, y: reduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gold/20 bg-gradient-to-b from-card to-forest-2 shadow-soft transition-[border-color,box-shadow] duration-500 hover:border-gold/55 hover:shadow-gold"
    >
      <div className="relative">
        <SmartImage
          image={image}
          label={item.name}
          tone={TONES[index % TONES.length]}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3.4] w-full"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/90 to-transparent" />
        {item.category && (
          <span className="absolute left-5 top-5 rounded-full border border-gold/50 bg-forest/80 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold backdrop-blur-md">
            {item.category}
          </span>
        )}
        <span className="absolute right-5 top-5 font-serif text-sm italic text-cream/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col px-7 pb-7 pt-3">
        <div className="flex items-center gap-3">
          <DietMark veg={item.veg} />
          {item.spiceLevel && (
            <span className="flex items-center gap-0.5" aria-label={`Spice level ${item.spiceLevel} of 3`}>
              {[1, 2, 3].map((n) => (
                <Flame
                  key={n}
                  size={13}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={n <= item.spiceLevel! ? "text-[#d9824a]" : "text-sand/20"}
                />
              ))}
            </span>
          )}
        </div>

        <h3 id={headingId} className="mt-4 font-serif text-[2rem] font-medium leading-tight text-cream">
          {item.name}
        </h3>
        {item.localName && <p className="mt-1 font-serif text-lg italic text-gold/80">{item.localName}</p>}

        <p className="mt-4 text-[0.95rem] leading-relaxed text-sand/80">{item.description}</p>

        <div className="mt-auto pt-7">
          <div className="hairline mb-5" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-sand/50">Price</p>
              <p className="mt-1 font-serif text-xl italic text-gold">{formatPrice(item.price, currency)}</p>
            </div>
            <a
              href={whatsappLink(`Hello! I would like to know more about the ${item.name} and today's availability.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cream/90 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-forest"
            >
              Ask on WhatsApp
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">about {item.name} (opens WhatsApp)</span>
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
