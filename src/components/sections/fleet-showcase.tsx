import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";

type FleetItem = {
  title: string;
  image: string;
  capacity: string;
  use: string;
};

type FleetShowcaseProps = {
  fleet: readonly FleetItem[];
};

export function FleetShowcase({ fleet }: FleetShowcaseProps) {
  return (
    <>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-[360px] overflow-hidden">
              <Image
                src={fleet[0].image}
                alt={fleet[0].title}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(13,27,45,0.78))]" />
              <div className="absolute left-5 right-5 top-5 flex justify-between">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                  Unidad destacada
                </span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-slate-950">
                  {fleet[0].capacity}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-2xl font-semibold">{fleet[0].title}</h3>
                <p className="mt-1 text-sm text-slate-200">{fleet[0].use}</p>
              </div>
            </div>
          </article>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {fleet.slice(1, 3).map((vehicle, index) => (
            <Reveal key={vehicle.title} delay={0.06 + index * 0.05}>
              <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 35vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(13,27,45,0.75))]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-base font-semibold">{vehicle.title}</h3>
                    <p className="text-xs text-slate-200">
                      {vehicle.capacity} • {vehicle.use}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fleet.slice(3).map((vehicle, index) => (
          <Reveal key={vehicle.title} delay={0.12 + index * 0.05}>
            <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-36 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={vehicle.image}
                  alt={vehicle.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{vehicle.title}</h3>
                  <p className="text-xs text-slate-600">{vehicle.use}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {vehicle.capacity}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
