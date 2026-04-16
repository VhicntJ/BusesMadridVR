import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Card, CardDescription } from "@/components/ui/card";

type Service = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
  badge: string;
};

type ServicesGridProps = {
  services: readonly Service[];
};

export function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <Reveal key={service.title} delay={index * 0.05}>
            <Card className="group h-full overflow-hidden border-slate-200/70 bg-white/85 p-0 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <article className="flex h-full flex-col">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,27,45,0.05),rgba(13,27,45,0.72))]" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-slate-900/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {service.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">{service.title}</h3>
                    <span className="inline-flex items-center justify-center rounded-lg bg-white/90 p-2 text-slate-900">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-3 p-5">
                  <CardDescription className="text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </CardDescription>
                  <Link
                    href="#contacto"
                    className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-primary"
                  >
                    Solicitar propuesta
                  </Link>
                </div>
              </article>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
