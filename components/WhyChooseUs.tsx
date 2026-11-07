import { ChefHat, Flame, Wheat, HeartHandshake } from "lucide-react";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

const features = [
  {
    icon: ChefHat,
    title: "Authentic Coastal Recipes",
    text: "Inspired by traditional Mangalorean cuisine.",
  },
  {
    icon: Flame,
    title: "Freshly Prepared",
    text: "Food prepared fresh for a satisfying experience.",
  },
  {
    icon: Wheat,
    title: "Quality Ingredients",
    text: "Carefully selected ingredients and aromatic spices.",
  },
  {
    icon: HeartHandshake,
    title: "Made With Passion",
    text: "Bringing traditional flavours to modern street food.",
  },
];

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-heading" className="relative overflow-hidden bg-forest py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 50% at 50% 100%, rgb(215 182 106 / 0.08), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="why-heading"
          eyebrow="Why Choose Us"
          title={
            <>
              The Coast, <span className="gold-text italic">Done Properly</span>
            </>
          }
        />

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[28px] border border-gold/20 bg-gold/15 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="bg-forest-2">
              <Reveal delay={i * 0.1} className="group relative h-full p-9 transition-colors duration-500 hover:bg-card/50 sm:p-10">
                <span className="font-serif text-sm italic text-gold/60">0{i + 1}</span>
                <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-forest">
                  <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
                </span>
                <h3 className="mt-7 font-serif text-[1.65rem] font-medium leading-tight text-cream">{title}</h3>
                <p className="mt-3 leading-relaxed text-sand/75">{text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
