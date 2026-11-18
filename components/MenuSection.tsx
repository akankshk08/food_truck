import { loadPublishedMenu } from "@/lib/data/menu";
import type { ResolvedImage } from "@/lib/images";
import type { MenuCardProduct } from "@/lib/menu-types";
import { whatsappLink } from "@/lib/links";
import MenuCard from "./MenuCard";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { WhatsAppIcon } from "./ui/BrandIcons";

function cardImage(item: MenuCardProduct): ResolvedImage {
  const alt = item.imageAlt || item.name;
  return { src: item.imageUrl ?? "", alt, brief: "", file: item.imageUrl };
}

export default async function MenuSection() {
  const menu = await loadPublishedMenu();
  return (
    <section id="menu" aria-labelledby="menu-heading" className="relative overflow-hidden bg-forest-2 py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgb(215 182 106 / 0.09), transparent 70%), radial-gradient(40% 30% at 0% 100%, rgb(215 182 106 / 0.05), transparent 70%)",
        }}
      />
      <div aria-hidden="true" className="hairline absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="menu-heading"
          eyebrow="The Menu"
          title={
            <>
              Straight From <span className="gold-text italic">Our Kitchen</span>
            </>
          }
          subtitle="Authentic coastal flavours, freshly prepared and served with love."
        />

        {menu && menu.length > 0 ? (
          <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
            {menu.map((item, i) => (
              <div key={item.id} className={i === menu.length - 1 && menu.length % 2 === 1 ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.875rem)] lg:col-span-1 lg:mx-0 lg:w-auto" : ""}>
                <MenuCard item={item} image={cardImage(item)} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <Reveal className="mx-auto mt-16 max-w-xl rounded-[28px] border border-gold/20 bg-card/50 p-10 text-center">
            <p className="font-serif text-2xl text-cream">Our menu is being updated</p>
            <p className="mt-3 text-sand/70">Message us on WhatsApp to hear what&rsquo;s cooking today.</p>
          </Reveal>
        )}

        <Reveal className="mt-16 flex flex-col items-center gap-5 text-center">
          <p className="max-w-lg text-sm leading-relaxed text-sand/60">
            Our full menu and prices are being finalised. Message us to hear what&rsquo;s cooking today.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-gold/60 px-7 py-3.5 text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-gold transition-all duration-300 hover:bg-gold hover:text-forest"
          >
            <WhatsAppIcon size={17} />
            Today&rsquo;s Availability
            <span className="sr-only">(opens WhatsApp)</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
