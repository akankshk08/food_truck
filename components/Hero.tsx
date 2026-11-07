"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { location } from "@/config/brand";
import type { ResolvedImage } from "@/lib/images";
import { HeroScene } from "./HeroScene";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ image }: { image: ResolvedImage }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const item = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease },
  });

  return (
    <section
      id="home"
      ref={ref}
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background: real photo when provided, otherwise the night scene */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -bottom-[18%]">
        <motion.div
          initial={{ scale: reduce ? 1 : 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease }}
          className="absolute inset-0"
        >
          {image.file ? (
            <Image src={image.file} alt={image.alt} fill priority sizes="100vw" quality={85} className="object-cover" />
          ) : (
            <HeroScene />
          )}
        </motion.div>
      </motion.div>

      {/* Legibility veils */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/55 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest/80 to-transparent" />
      <div aria-hidden="true" className="grain absolute inset-0" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-5 pb-28 pt-36 sm:px-8"
      >
        <div className="max-w-3xl">
          <motion.p {...item(0.35)} className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold" />
            Authentic Coastal Flavours
          </motion.p>

          <h1 id="hero-heading" className="mt-7 font-serif font-medium leading-[0.95] tracking-[-0.01em]">
            <motion.span {...item(0.5)} className="block text-[3.4rem] text-cream sm:text-7xl lg:text-[6.5rem]">
              Coastal Flavours.
            </motion.span>
            <motion.span {...item(0.68)} className="gold-text block pb-2 text-[3.4rem] italic sm:text-7xl lg:text-[6.5rem]">
              Street Soul.
            </motion.span>
          </h1>

          <motion.p {...item(0.88)} className="mt-7 max-w-xl text-lg leading-relaxed text-sand/90 sm:text-xl">
            Bringing the authentic taste of coastal Karnataka to the streets of Bangalore.
          </motion.p>

          <motion.div {...item(1.05)} className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#menu"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-8 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-forest shadow-[0_18px_40px_-18px_rgb(215_182_106/0.8)] transition-all duration-300 hover:bg-gold-soft hover:shadow-[0_22px_50px_-16px_rgb(215_182_106/0.9)]"
            >
              Explore Our Menu
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="#find-us"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-cream/30 bg-forest/30 px-8 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold"
            >
              <MapPin size={16} aria-hidden="true" />
              Find Our Truck
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.2 }}
        className="absolute inset-x-0 bottom-0"
      >
        <div className="mx-auto flex max-w-7xl items-end justify-between px-5 pb-8 sm:px-8">
          <ul className="hidden gap-10 text-[0.68rem] uppercase tracking-[0.3em] text-sand/60 md:flex">
            <li>{location.city}, {location.region}</li>
            <li aria-hidden="true" className="text-gold/50">◆</li>
            <li>Mangalorean Recipes</li>
            <li aria-hidden="true" className="text-gold/50">◆</li>
            <li>Freshly Prepared</li>
          </ul>
          <a
            href="#menu"
            aria-label="Scroll to the menu"
            className="mx-auto flex flex-col items-center gap-2 text-[0.62rem] uppercase tracking-[0.35em] text-sand/60 transition-colors hover:text-gold md:mx-0"
          >
            Scroll
            <motion.span
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={18} aria-hidden="true" />
            </motion.span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
