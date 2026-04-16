import { Reveal } from "@/components/motion/reveal";

type SectionHeadingProps = {
  title: string;
  description: string;
  centered?: boolean;
};

export function SectionHeading({ title, description, centered = false }: SectionHeadingProps) {
  return (
    <Reveal>
      <h2
        className={`text-3xl font-semibold text-slate-900 sm:text-4xl ${
          centered ? "text-center" : ""
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-3 max-w-2xl text-slate-600 ${
          centered ? "mx-auto text-center" : ""
        }`}
      >
        {description}
      </p>
    </Reveal>
  );
}
