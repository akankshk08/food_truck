import { MapPin } from "lucide-react";
import { brand, contact, location, menu, navLinks } from "@/config/brand";
import { instagramLink, whatsappLink } from "@/lib/links";
import { Logo } from "./ui/Logo";
import { InstagramIcon, WhatsAppIcon } from "./ui/BrandIcons";

export default function Footer() {
  const year = new Date().getFullYear();
  const linkClass = "text-sand/70 transition-colors duration-300 hover:text-gold";

  return (
    <footer className="relative overflow-hidden border-t border-bronze/40 bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 50% 0%, rgb(215 182 106 / 0.07), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-24 sm:px-8">
        <p className="text-center font-serif text-5xl italic leading-tight sm:text-7xl lg:text-8xl">
          <span className="gold-text">{brand.tagline}</span>
        </p>
        <div className="hairline mx-auto mt-14 max-w-3xl" />

        <div className="mt-16 grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#home" aria-label={`${brand.name} — back to top`} className="inline-block">
              <Logo />
            </a>
            <p className="mt-6 max-w-sm leading-relaxed text-sand/70">{brand.description}</p>
            <div className="mt-7 flex gap-3">
              <a
                href={instagramLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram (opens in a new tab)"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 hover:bg-gold hover:text-forest"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp (opens WhatsApp)"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 hover:bg-gold hover:text-forest"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="eyebrow">Explore</h2>
            <ul className="mt-6 space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="eyebrow">Menu</h2>
            <ul className="mt-6 space-y-3">
              {menu.map((m) => (
                <li key={m.id}>
                  <a href="#menu" className={linkClass}>
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow">Visit &amp; Order</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3 text-sand/70">
                <MapPin size={16} className="mt-1 shrink-0 text-gold/80" aria-hidden="true" />
                <span>
                  {location.city}, {location.region}, {location.country}
                </span>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${linkClass}`}>
                  <WhatsAppIcon size={16} className="text-gold/80" />
                  Order on WhatsApp
                </a>
              </li>
              <li>
                <a href={instagramLink()} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${linkClass}`}>
                  <InstagramIcon size={16} className="text-gold/80" />
                  {contact.instagramHandle ? `@${contact.instagramHandle}` : "Instagram — coming soon"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bronze/30 py-8 text-xs tracking-wide text-sand/50 sm:flex-row">
          <p>
            &copy; {year} {brand.name}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.3em]">Bangalore, India</p>
        </div>
      </div>
    </footer>
  );
}
