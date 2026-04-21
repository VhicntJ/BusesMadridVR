"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { JobApplicationForm } from "@/components/ui/job-application-form";
import { navItems } from "@/lib/site-data";

export function CareersLanding() {
  return (
    <>
      <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.16),_transparent_32%),linear-gradient(180deg,_#fffdf7_0%,_#fff_26%,_#f8fafc_100%)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute left-[-4rem] top-24 h-32 w-32 rounded-full bg-amber-300/25 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -16, 0], x: [0, -12, 0] }}
            transition={{ duration: 13, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute right-[-3rem] top-40 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
            transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute bottom-16 left-1/3 h-28 w-28 rounded-full bg-emerald-300/18 blur-3xl"
          />
        </div>

        <header className="container-pro relative z-10 pt-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>

            <div className="hidden sm:block">
              <Image
                src="/images/fotos/LOGO-BUSES-MADRID.png"
                alt="Buses Madrid"
                width={172}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:hidden">
              Buses Madrid
            </span>
          </div>
        </header>

        <section className="container-pro relative z-10 py-10 lg:py-16" id="formulario-postulacion">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
                / trabaja con nosotros
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Súmate al equipo de Buses Madrid
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Queremos conocerte mejor. Completa este formulario y cuéntanos tu experiencia para
                postular a futuras vacantes dentro de nuestro equipo.
              </p>
            </div>
          </Reveal>

          <div className="relative mx-auto mt-12 min-h-[58rem] max-w-6xl lg:min-h-[64rem]">
            <Parallax offset={30} speed={0.6} direction="down" className="absolute -left-36 top-0 z-[1] hidden w-72 lg:block">
              <div className="group/card pointer-events-auto">
                <div className="relative h-56 -rotate-2 -translate-x-2 overflow-hidden rounded-3xl border border-white/80 opacity-85 shadow-[0_24px_55px_rgba(15,23,42,0.22)] transition-all duration-500 group-hover/card:-translate-x-10 group-hover/card:rotate-0 group-hover/card:opacity-100">
                  <Image
                    src="/images/fotos/Exterior.webp"
                    alt="Flota Buses Madrid"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Buses Madrid
                    </p>
                    <p className="mt-1 text-sm font-semibold">Flota en operación</p>
                  </div>
                </div>

                <div className="mr-14 mt-2 max-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-3 py-0 opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover/card:max-h-32 group-hover/card:py-3 group-hover/card:opacity-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detalle</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700">Rutas corporativas y mineras con monitoreo constante y equipos dedicados.</p>
                </div>
              </div>
            </Parallax>

            <Parallax offset={24} speed={0.65} direction="up" className="absolute -right-32 top-10 z-[1] hidden w-64 lg:block">
              <div className="group/card pointer-events-auto">
                <div className="relative h-48 rotate-2 translate-x-2 overflow-hidden rounded-3xl border border-white/80 opacity-85 shadow-[0_24px_55px_rgba(15,23,42,0.2)] transition-all duration-500 group-hover/card:translate-x-10 group-hover/card:rotate-0 group-hover/card:opacity-100">
                  <Image
                    src="/images/fotos/IMG_0184.webp"
                    alt="Operación Buses Madrid"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Buses Madrid
                    </p>
                    <p className="mt-1 text-sm font-semibold">Operación y coordinación</p>
                  </div>
                </div>

                <div className="ml-14 mt-2 max-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-3 py-0 text-right opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover/card:max-h-36 group-hover/card:py-3 group-hover/card:opacity-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detalle</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700">Turnos organizados, control de llegada y estándares de puntualidad medibles.</p>
                </div>
              </div>
            </Parallax>

            <Parallax offset={28} speed={0.7} direction="down" className="absolute -left-32 top-[54%] z-[1] hidden w-72 -translate-y-1/2 lg:block">
              <div className="group/card pointer-events-auto">
                <div className="relative h-52 rotate-1 -translate-x-1 overflow-hidden rounded-3xl border border-white/80 opacity-90 shadow-[0_24px_55px_rgba(15,23,42,0.22)] transition-all duration-500 group-hover/card:-translate-x-10 group-hover/card:rotate-0 group-hover/card:opacity-100">
                  <Image
                    src="/images/fotos/IMG_0183.webp"
                    alt="Equipo Buses Madrid"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Buses Madrid
                    </p>
                    <p className="mt-1 text-sm font-semibold">Equipo en terreno</p>
                  </div>
                </div>

                <div className="mr-14 mt-2 max-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-3 py-0 opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover/card:max-h-36 group-hover/card:py-3 group-hover/card:opacity-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detalle</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700">Conductores y soporte operativo alineados para mantener continuidad del servicio.</p>
                </div>
              </div>
            </Parallax>

            <Parallax offset={22} speed={0.58} direction="up" className="absolute -right-32 top-[56%] z-[1] hidden w-72 -translate-y-1/2 lg:block">
              <div className="group/card pointer-events-auto">
                <div className="relative h-52 -rotate-2 translate-x-1 overflow-hidden rounded-3xl border border-white/80 opacity-90 shadow-[0_24px_55px_rgba(15,23,42,0.2)] transition-all duration-500 group-hover/card:translate-x-10 group-hover/card:rotate-0 group-hover/card:opacity-100">
                  <Image
                    src="/images/fotos/IMG_0185.webp"
                    alt="Experiencia laboral Buses Madrid"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Buses Madrid
                    </p>
                    <p className="mt-1 text-sm font-semibold">Experiencia y cultura</p>
                  </div>
                </div>

                <div className="ml-14 mt-2 max-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-3 py-0 text-right opacity-0 shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover/card:max-h-36 group-hover/card:py-3 group-hover/card:opacity-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detalle</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700">Ambiente cercano, aprendizaje continuo y foco en seguridad operacional.</p>
                </div>
              </div>
            </Parallax>

            <div className="relative z-10 mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_26px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-primary/10 to-amber-100/20 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Formulario de Postulación</h2>
                  <p className="text-sm text-slate-600">Usa el mismo formulario oficial de Buses Madrid</p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Postulación directa
                </div>
              </div>

              <JobApplicationForm />
            </div>
          </div>
        </section>

        <section className="container-pro relative z-10 pb-16 pt-4 lg:pb-24">
          <div className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] sm:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Postulación abierta
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Estamos buscando personas comprometidas.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Gracias por tu interés en Buses Madrid. Puedes enviarnos tus antecedentes aquí y,
                  cuando quieras, volver al inicio para conocer más de nuestros servicios.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition-all hover:bg-white/15"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter navItems={navItems} />
    </>
  );
}