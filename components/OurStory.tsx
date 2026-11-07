import { images } from "@/config/brand";
import { resolveImage } from "@/lib/images";
import { SmartImage } from "./ui/SmartImage";
import { Reveal } from "./ui/Reveal";

const ingredients = [
  "Byadgi Chilli",
  "Fresh Coconut",
  "Curry Leaves",
  "Black Pepper",
  "Coriander Seed",
  "Tamarind",
  "Kokum",
  "Cumin",
  "Garlic",
  "Fenugreek",
];

export default function OurStory() {
  const main = resolveImage(images.storyMain);
  const spices = resolveImage(images.storySpices);
  const coconut = resolveImage(images.storyCoconut);

  return (
    <section id="story" aria-labelledby="story-heading" className="relative overflow-hidden bg-forest">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-28 sm:px-8 sm:py-36 lg:grid-cols-12 lg:gap-12">
        {/* Imagery collage */}
        <div className="relative lg:col-span-6">
          <Reveal className="group relative mr-10 sm:mr-24 lg:mr-16">
            <SmartImage
              image={main}
              label="In the kitchen"
              tone="ember"
              sizes="(min-width: 1024px) 40vw, 85vw"
              className="aspect-[4/5] w-full rounded-[28px] border border-gold/15 shadow-soft"
            />
          </Reveal>

          <Reveal delay={0.2} className="group absolute -bottom-10 right-0 w-[48%] sm:w-[44%]">
            <SmartImage
              image={spices}
              label="Roasted spices"
              tone="gold"
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="aspect-square w-full rounded-[22px] border-4 border-forest shadow-soft"
            />
          </Reveal>

          <Reveal delay={0.35} className="group absolute -top-8 right-4 hidden w-[30%] sm:block lg:right-0">
            <SmartImage
              image={coconut}
              label="Fresh coconut"
              tone="leaf"
              sizes="(min-width: 1024px) 14vw, 30vw"
              className="aspect-[3/4] w-full rounded-[18px] border-4 border-forest shadow-soft"
            />
          </Reveal>

          {/* Vertical caption */}
          <p
            aria-hidden="true"
            className="absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 -rotate-90 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.5em] text-gold/50 xl:block"
          >
            Coastal Karnataka · Est. on the streets of Bangalore
          </p>
        </div>

        {/* Text */}
        <div className="pt-8 lg:col-span-5 lg:col-start-8 lg:pt-0">
          <Reveal>
            <p className="eyebrow flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
              Our Story
            </p>
            <h2 id="story-heading" className="mt-5 font-serif text-4xl font-medium leading-[1.05] text-cream text-balance sm:text-5xl lg:text-[3.6rem]">
              Rooted in the Coast. <span className="gold-text italic">Made for the Streets.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-sand/85">
              <span className="float-left mr-3 mt-1 font-serif text-7xl leading-[0.8] text-gold">W</span>e bring the
              flavours and food traditions of coastal Karnataka to Bangalore. Inspired by the rich culinary heritage of
              Mangalore and the surrounding coastal regions, our goal is simple: serve authentic, freshly prepared food
              that brings people closer to the taste of home.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <blockquote className="mt-10 border-l border-gold/60 pl-6">
              <p className="font-serif text-2xl italic leading-snug text-cream/95 sm:text-[1.7rem]">
                &ldquo;Roasted spices, fresh coconut and curry leaves &mdash; the scent of a coastal kitchen, served at
                the roadside.&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-bronze/40 pt-8">
              {[
                ["Inspired by", "Mangalore"],
                ["Cooking", "Coastal"],
                ["Served in", "Bangalore"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.6rem] uppercase tracking-[0.28em] text-sand/50">{label}</dt>
                  <dd className="mt-2 font-serif text-xl text-gold sm:text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Ingredient ticker */}
      <div className="relative border-y border-bronze/40 bg-forest-2 py-6" aria-label="Key ingredients">
        <ul className="sr-only">
          {ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <div aria-hidden="true" className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-10 pr-10">
            {[...ingredients, ...ingredients].map((name, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-serif text-2xl italic text-cream/70 sm:text-3xl">
                {name}
                <span className="text-sm not-italic text-gold/60">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
