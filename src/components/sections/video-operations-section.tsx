// Video Section with Advanced Scroll Animations
// Showcases video content with parallax and scroll triggers
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Gauge, Shield, Zap } from "lucide-react";
import { ScrollTrigger } from "@/components/motion/scroll-trigger";

const operationalFeatures = [
  {
    icon: Gauge,
    title: "Monitoreo GPS en Tiempo Real",
    description: "Monitoreo vía satelital e informes con indicadores de gestión periódica.",
  },
  {
    icon: Shield,
    title: "Seguridad Avanzada",
    description: "Conductores con experiencia y certificación para operaciones exigentes.",
  },
  {
    icon: Zap,
    title: "Eficiencia Operacional",
    description: "Optimización de rutas y operaciones para un servicio puntual y confiable.",
  },
  {
    icon: CheckCircle2,
    title: "Cumplimiento Normativo",
    description: "Protocolos alineados con los estándares para transporte corporativo y minero.",
  },
];

type VideoOperationsSectionProps = {
  id?: string;
};

export function VideoOperationsSection({ id }: VideoOperationsSectionProps) {
  return (
    <section id={id} className="group/ambient relative w-full overflow-hidden bg-slate-50 py-20">
      <div className="container-pro relative z-10">
        <ScrollTrigger delay={0}>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Operaciones Modernas
            </p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              Tecnología en Movimiento
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Nuestras operaciones se respaldan en tecnología de punta. Control
              centralizado, monitoreo en tiempo real y sistemas de seguridad avanzados
              para garantizar que cada traslado sea confiable.
            </p>
          </div>
        </ScrollTrigger>

        <ScrollTrigger delay={0.05}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group/band relative mt-12 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-900 shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <video
                src="/images/fotos/63531038-1a8d-35f1-d0eb-eaf0610051d8_custom.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full scale-[1.34] object-cover object-center opacity-30 blur-[2px] transition-all duration-500 group-hover/band:scale-[1.4] group-hover/band:opacity-55 group-hover/band:blur-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/45 to-slate-950/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/45" />
            </div>

            <div className="relative z-10 grid gap-4 p-6 sm:p-8 lg:grid-cols-12 lg:gap-6 lg:p-10">
              {operationalFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: 0.08 + index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-white/25 bg-white/12 p-4 text-white backdrop-blur-md lg:col-span-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-primary/20 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold leading-tight">{feature.title}</h3>
                        <p className="mt-1 text-xs text-slate-200">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div className="flex items-end justify-start lg:col-span-12 lg:justify-end">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/12 px-4 py-2 text-xs font-semibold text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Operación en vivo
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollTrigger>

        {/* Statistics Banner */}
        <ScrollTrigger delay={0.4}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mt-20 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl"
          >
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { value: "150+", label: "Vehículos Monitoreados" },
                { value: "99.8%", label: "Disponibilidad" },
                { value: "24/7", label: "Centro Control" },
                { value: "1000+", label: "Rutas Diarias" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </ScrollTrigger>
      </div>
    </section>
  );
}
