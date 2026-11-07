import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  id?: string;
};

export function SectionHeading({ eyebrow, title, subtitle, align = "center", id }: Props) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className={`eyebrow flex items-center gap-4 ${centered ? "justify-center" : ""}`}>
        <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
        {eyebrow}
        {centered && <span aria-hidden="true" className="h-px w-8 bg-gold/60" />}
      </p>
      <h2 id={id} className="mt-5 font-serif text-4xl font-medium leading-[1.05] text-cream text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && <p className="mt-5 text-base leading-relaxed text-sand/80 sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
