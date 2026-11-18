"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowUpRight } from "lucide-react";
import type { ResolvedImage } from "@/lib/images";
import { whatsappLink } from "@/lib/links";
import { formatPaise, formatQuantity, orderMessage } from "@/lib/format";
import { FEATURED_LABEL, type MenuCardProduct } from "@/lib/menu-types";
import { SmartImage } from "./ui/SmartImage";

type Props = {
  item: MenuCardProduct;
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
  const headingId = `dish-${item.slug}`;

  // Portions: customers can only pick ones that are in stock (and only if the dish itself is available).
  const portions = item.variants;
  const orderable = item.isAvailable ? portions.filter((p) => p.isAvailable) : [];
  const [selectedId, setSelectedId] = useState<number | null>(orderable[0]?.id ?? null);
  const selected = orderable.find((p) => p.id === selectedId) ?? null;
  const soldOut = !item.isAvailable || (portions.length > 0 && orderable.length === 0);

  const priceText = selected ? formatPaise(selected.pricePaise) : soldOut ? "Sold Out" : "Coming Soon";
  const message = selected
    ? orderMessage(item.name, selected)
    : `Hello! I would like to know more about the ${item.name} and today's availability.`;

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
          className={`aspect-[4/3.4] w-full ${soldOut ? "grayscale-[0.6]" : ""}`}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/90 to-transparent" />
        {item.isFeatured && (
          <span className="absolute left-5 top-5 rounded-full border border-gold/50 bg-forest/80 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold backdrop-blur-md">
            {FEATURED_LABEL}
          </span>
        )}
        {soldOut && (
          <span className="absolute bottom-5 left-5 rounded-full border border-cream/30 bg-forest/85 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur-md">
            Currently Unavailable
          </span>
        )}
        <span className="absolute right-5 top-5 font-serif text-sm italic text-cream/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col px-7 pb-7 pt-3">
        <div className="flex items-center gap-3">
          <DietMark veg={item.isVeg} />
          {item.spiceLevel > 0 && (
            <span className="flex items-center gap-0.5" aria-label={`Spice level ${item.spiceLevel} of 3`}>
              {[1, 2, 3].map((n) => (
                <Flame
                  key={n}
                  size={13}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={n <= item.spiceLevel ? "text-[#d9824a]" : "text-sand/20"}
                />
              ))}
            </span>
          )}
        </div>

        <h3 id={headingId} className="mt-4 font-serif text-[2rem] font-medium leading-tight text-cream">
          {item.name}
        </h3>
        {item.subtitle && <p className="mt-1 font-serif text-lg italic text-gold/80">{item.subtitle}</p>}

        <p className="mt-4 text-[0.95rem] leading-relaxed text-sand/80">{item.shortDescription}</p>

        {portions.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-[0.6rem] uppercase tracking-[0.3em] text-sand/50">Choose a portion</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {portions.map((p) => {
                const disabled = !item.isAvailable || !p.isAvailable;
                const active = p.id === selected?.id;
                const amount = formatQuantity(p.quantity, p.unit);
                return (
                  <label
                    key={p.id}
                    title={p.description ?? undefined}
                    className={`relative flex min-h-11 flex-col justify-center rounded-2xl border px-3.5 py-1.5 text-left transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                      disabled
                        ? "cursor-not-allowed border-cream/10 text-sand/35"
                        : active
                          ? "cursor-pointer border-gold bg-gold/15 text-gold"
                          : "cursor-pointer border-cream/20 text-cream/85 hover:border-gold/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`portion-${item.id}`}
                      value={p.id}
                      checked={active}
                      disabled={disabled}
                      onChange={() => setSelectedId(p.id)}
                      className="sr-only"
                    />
                    <span className="text-[0.78rem] font-semibold leading-tight">
                      {p.portionName}
                      {amount && <span className="font-normal opacity-80"> · {amount}</span>}
                    </span>
                    <span className={`text-[0.72rem] leading-tight ${disabled ? "" : "opacity-80"}`}>
                      {disabled ? <span className="line-through">{formatPaise(p.pricePaise)}</span> : formatPaise(p.pricePaise)}
                      {disabled && <span className="ml-1 no-underline">Sold out</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-auto pt-7">
          <div className="hairline mb-5" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-sand/50">{selected ? selected.portionName : "Price"}</p>
              <p className="mt-1 font-serif text-xl italic text-gold" aria-live="polite">
                {priceText}
              </p>
            </div>
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cream/90 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-forest"
            >
              Ask on WhatsApp
              <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">
                about {item.name}
                {selected ? `, ${selected.portionName}` : ""} (opens WhatsApp)
              </span>
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
