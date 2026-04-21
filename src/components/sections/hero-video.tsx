"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroService = {
  title: string;
  description: string;
  href: string;
  image?: string;
  teaser?: string;
};

type HeroVideoProps = {
  title: string;
  subtitle: string;
  videoSrc: string;
  fallbackImageSrc?: string;
  services?: HeroService[];
  ctaButtons?: Array<{ label: string; href: string; variant?: "default" | "secondary" }>;
};

export function HeroVideo({
  title,
  subtitle,
  videoSrc,
  fallbackImageSrc = "/images/fotos/Exterior.webp",
  services = [],
  ctaButtons = [],
}: HeroVideoProps) {
  const featuredServices = services.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoAvailable, setIsVideoAvailable] = useState(true);
  const activeService = featuredServices[activeIndex] ?? featuredServices[0];

  return (
    <section
      id="inicio"
      className="relative isolate w-full overflow-hidden pt-16 min-h-[92svh] lg:min-h-[calc(100vh-4rem)]"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={fallbackImageSrc}
          alt="Fondo Buses Madrid"
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-500",
            isVideoAvailable ? "opacity-0" : "opacity-100"
          )}
        />
        <video
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            isVideoAvailable ? "opacity-100" : "opacity-0"
          )}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setIsVideoAvailable(true)}
          onError={() => setIsVideoAvailable(false)}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,27,45,0.42)_0%,rgba(13,27,45,0.22)_48%,rgba(13,27,45,0.72)_100%)] lg:bg-[linear-gradient(120deg,rgba(13,27,45,0.72),rgba(13,27,45,0.4)_45%,rgba(13,27,45,0.62))]" />
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl opacity-80 lg:opacity-100" />
        <div className="absolute bottom-4 right-0 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl opacity-70 lg:opacity-100" />
      </div>

      <div className="relative z-10 py-10 sm:py-14 lg:py-0">
        <div className="container-pro lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center">
          <div className="grid items-end gap-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8 }}
              className="lg:pr-8"
            >
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-4 sm:text-xs lg:bg-white/10 lg:text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Buses Madrid
                </div>
                <p className="inline-flex rounded-full border border-primary/35 bg-white/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">
                  Transporte seguro, confiable y profesional
                </p>
                <h1 className="mt-4 max-w-[12ch] text-5xl font-black leading-[0.92] tracking-[-0.04em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:mt-5 sm:max-w-3xl sm:text-6xl lg:text-7xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-100/95 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)] sm:mt-5 sm:text-xl">
                  {subtitle}
                </p>

                {ctaButtons.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                    {ctaButtons.map((btn, index) => (
                      <Link
                        key={`${btn.href}-${btn.label}-${index}`}
                        href={btn.href}
                        className={buttonVariants({
                          variant: btn.variant || "default",
                          size: "lg",
                        })}
                      >
                        {btn.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="hidden rounded-3xl border border-white/25 bg-white/12 p-5 backdrop-blur-md lg:block"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Servicios Destacados
              </p>

              {activeService?.image ? (
                <div className="relative mt-4 h-40 overflow-hidden rounded-2xl border border-white/25 bg-slate-900/40">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeService.image}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeService.image}
                        alt={activeService.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(13,27,45,0.75))]" />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Vista del servicio
                    </p>
                    <p className="text-xs text-slate-100">
                      {activeService.teaser || "Cobertura segura y puntual para cada operación."}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {featuredServices.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35 + index * 0.08 }}
                    whileHover={{ x: 6, scale: 1.01 }}
                  >
                    <Link
                      href={service.href}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      className="group block rounded-2xl border border-white/15 bg-slate-900/35 px-4 py-3 transition-all duration-300 hover:border-primary/70 hover:bg-slate-900/50"
                    >
                      <p className="text-sm font-semibold text-white">{service.title}</p>
                      <p className="mt-1 text-xs text-slate-200/90">{service.description}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
}
