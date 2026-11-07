"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whatsappLink } from "@/lib/links";
import { WhatsAppIcon } from "./ui/BrandIcons";

/** Compact WhatsApp shortcut that appears once the visitor scrolls past the hero. */
export default function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order on WhatsApp (opens WhatsApp)"
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-forest/90 text-gold shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md transition-colors hover:bg-gold hover:text-forest sm:bottom-8 sm:right-8"
        >
          <WhatsAppIcon size={24} />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
