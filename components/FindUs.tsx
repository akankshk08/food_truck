import { MapPin, Clock, Phone, Navigation, ArrowUpRight } from "lucide-react";
import { contact, hours, location } from "@/config/brand";
import { directionsLink, instagramLink, mapEmbedUrl, phoneLink, whatsappLink } from "@/lib/links";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { InstagramIcon, WhatsAppIcon } from "./ui/BrandIcons";

function InfoRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 border-b border-bronze/30 py-6 last:border-b-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">{icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-gold/80">{title}</h3>
        <div className="mt-2 text-sand/90">{children}</div>
      </div>
    </div>
  );
}

export default function FindUs() {
  const tel = phoneLink();
  const actionClass =
    "group flex items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-card/60 px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-card";

  return (
    <section id="find-us" aria-labelledby="find-heading" className="relative overflow-hidden bg-forest-2 py-28 sm:py-36">
      <div aria-hidden="true" className="hairline absolute inset-x-0 top-0" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="find-heading"
          eyebrow="Find Us"
          title={
            <>
              Find Our <span className="gold-text italic">Food Truck</span>
            </>
          }
          subtitle="We're bringing coastal flavours to the streets of Bangalore. Find our location and come enjoy something delicious."
        />

        <div className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-12">
          {/* Details */}
          <Reveal className="rounded-[28px] border border-gold/20 bg-gradient-to-b from-card to-forest-2 px-7 py-4 shadow-soft sm:px-9 lg:col-span-5">
            <InfoRow icon={<MapPin size={18} strokeWidth={1.5} aria-hidden="true" />} title="Location">
              <address className="not-italic">
                <span className="block font-serif text-2xl text-cream">
                  {location.city}, {location.region}
                </span>
                <span className="block text-sand/70">{location.country}</span>
                <span className="mt-2 block text-sm text-sand/60">{location.spotName || "Exact spot announced soon"}</span>
              </address>
            </InfoRow>

            <InfoRow icon={<Clock size={18} strokeWidth={1.5} aria-hidden="true" />} title="Opening Hours">
              <dl className="space-y-1.5">
                {hours.map((h) => (
                  <div key={h.days} className="flex flex-wrap justify-between gap-x-4">
                    <dt className="text-sand/70">{h.days}</dt>
                    <dd className="text-cream">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </InfoRow>

            <InfoRow icon={<Phone size={18} strokeWidth={1.5} aria-hidden="true" />} title="Phone">
              {tel ? (
                <a href={tel} className="font-serif text-2xl text-cream transition-colors hover:text-gold">
                  {contact.phoneDisplay || contact.phone}
                </a>
              ) : (
                <span className="text-sand/70">Number coming soon &mdash; message us on WhatsApp meanwhile.</span>
              )}
            </InfoRow>
          </Reveal>

          {/* Map */}
          <Reveal delay={0.1} className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-gold/25 shadow-soft lg:col-span-7">
            {/* Shown while the map loads (or if it is blocked) */}
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-card" style={{ background: "radial-gradient(60% 60% at 50% 45%, rgb(215 182 106 / 0.12), transparent 70%), #1d2a1e" }}>
              <MapPin size={36} strokeWidth={1.2} className="-mt-16 text-gold/50" />
            </div>
            <iframe
              title={`Map showing ${location.mapsQuery}`}
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full [filter:grayscale(0.35)_invert(0.92)_hue-rotate(185deg)_saturate(0.7)_brightness(0.95)]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-gold/20" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-forest/90 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-xl text-cream">{location.spotName || `${location.city}, ${location.region}`}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-sand/60">
                  {location.spotName ? `${location.city}, ${location.country}` : "Truck location to be announced"}
                </p>
              </div>
              <a
                href={directionsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-forest transition-colors hover:bg-gold-soft"
              >
                <Navigation size={14} aria-hidden="true" />
                Get Directions
                <span className="sr-only">(opens Google Maps)</span>
              </a>
            </div>
          </Reveal>
        </div>

        {/* Contact & ordering */}
        <Reveal delay={0.1} className="mt-8">
          <h3 className="sr-only">Contact and ordering</h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={`${actionClass} border-gold/50 bg-gold/10`}>
                <span className="flex items-center gap-4">
                  <WhatsAppIcon size={22} className="text-gold" />
                  <span>
                    <span className="block font-serif text-xl text-cream">Order on WhatsApp</span>
                    <span className="block text-xs text-sand/60">Menu &amp; today&rsquo;s availability</span>
                  </span>
                </span>
                <ArrowUpRight size={18} className="text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              {tel ? (
                <a href={tel} className={actionClass}>
                  <span className="flex items-center gap-4">
                    <Phone size={20} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                    <span>
                      <span className="block font-serif text-xl text-cream">Call Us</span>
                      <span className="block text-xs text-sand/60">{contact.phoneDisplay || contact.phone}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={18} className="text-gold" aria-hidden="true" />
                </a>
              ) : (
                <div className={`${actionClass} cursor-default opacity-70 hover:translate-y-0 hover:border-gold/20 hover:bg-card/60`} aria-disabled="true">
                  <span className="flex items-center gap-4">
                    <Phone size={20} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                    <span>
                      <span className="block font-serif text-xl text-cream">Call Us</span>
                      <span className="block text-xs text-sand/60">Number coming soon</span>
                    </span>
                  </span>
                </div>
              )}
            </li>
            <li>
              <a href={instagramLink()} target="_blank" rel="noopener noreferrer" className={actionClass}>
                <span className="flex items-center gap-4">
                  <InstagramIcon size={20} className="text-gold" />
                  <span>
                    <span className="block font-serif text-xl text-cream">Instagram</span>
                    <span className="block text-xs text-sand/60">{contact.instagramHandle ? `@${contact.instagramHandle}` : "Handle coming soon"}</span>
                  </span>
                </span>
                <ArrowUpRight size={18} className="text-gold" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={directionsLink()} target="_blank" rel="noopener noreferrer" className={actionClass}>
                <span className="flex items-center gap-4">
                  <Navigation size={20} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
                  <span>
                    <span className="block font-serif text-xl text-cream">Directions</span>
                    <span className="block text-xs text-sand/60">Open in Google Maps</span>
                  </span>
                </span>
                <ArrowUpRight size={18} className="text-gold" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
