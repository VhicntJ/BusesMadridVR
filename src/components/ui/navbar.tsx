"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, TriangleAlert, X } from "lucide-react";

import { DenunciaModal } from "@/components/ui/denuncia-modal";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  items: readonly NavItem[];
};

const navCheckpoints: Record<string, string[]> = {
  servicios: [
    "inicio",
    "servicios-intro",
    "servicios",
    "somos-buses-madrid",
    "operaciones-modernas",
  ],
  flota: ["flota"],
  calidad: ["calidad"],
  nosotros: ["nosotros"],
  clientes: ["clientes"],
  contacto: ["contacto"],
};

export function Navbar({ items }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isDenunciaOpen, setDenunciaOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [splash, setSplash] = useState({ id: 0, x: 0 });
  const [indicator, setIndicator] = useState({
    x: 0,
    width: 12,
    opacity: 0,
    stretch: 0,
  });

  const navListRef = useRef<HTMLUListElement | null>(null);
  const navItemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const previousActiveIndexRef = useRef(0);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navListRef.current || items.length === 0) return;

      const checkpointData = items.map((item, index) => {
        const primaryId = item.href.replace("#", "");
        const checkpointIds = navCheckpoints[primaryId] ?? [primaryId];
        const checkpoints = checkpointIds
          .map((id) => {
            const element = document.getElementById(id);
            return element ? { id, element, offsetTop: element.offsetTop } : null;
          })
          .filter(Boolean);

        return { navIndex: index, label: item.label, checkpoints };
      });

      const checkpoints = checkpointData
        .flatMap((item) =>
          item.checkpoints.map((cp) => ({
            navIndex: item.navIndex,
            sectionId: cp.id,
            top: cp.offsetTop,
            label: item.label,
          }))
        )
        .sort((first, second) => first.top - second.top);

      if (checkpoints.length === 0) return;

      const headerHeight =
        navListRef.current.closest("header")?.getBoundingClientRect().height ?? 80;
      const marker = window.scrollY + headerHeight + 8;

      let activeCheckpointIndex = 0;
      for (let index = 0; index < checkpoints.length; index += 1) {
        if (marker >= checkpoints[index].top) {
          activeCheckpointIndex = index;
        } else {
          break;
        }
      }

      const activeCheckpoint = checkpoints[activeCheckpointIndex];
      const currentItemIndex = activeCheckpoint.navIndex;

      let nextDifferentCheckpointIndex = -1;
      for (let index = activeCheckpointIndex + 1; index < checkpoints.length; index += 1) {
        if (checkpoints[index].navIndex !== currentItemIndex) {
          nextDifferentCheckpointIndex = index;
          break;
        }
      }

      const nextItemIndex =
        nextDifferentCheckpointIndex === -1
          ? currentItemIndex
          : checkpoints[nextDifferentCheckpointIndex].navIndex;

      // Liquid transition only when close to the next section boundary
      const transitionWindow = 180;
      const boundaryTop =
        nextDifferentCheckpointIndex === -1
          ? Number.POSITIVE_INFINITY
          : checkpoints[nextDifferentCheckpointIndex].top;
      const boundaryStart = Math.max(boundaryTop - transitionWindow, 0);
      const progressToNext =
        nextDifferentCheckpointIndex === -1
          ? 0
          : Math.min(Math.max((marker - boundaryStart) / transitionWindow, 0), 1);

      const currentItem = navItemRefs.current[currentItemIndex];
      const nextItem = navItemRefs.current[nextItemIndex] ?? currentItem;
      const listRect = navListRef.current.getBoundingClientRect();

      if (!currentItem || !nextItem) return;

      const currentRect = currentItem.getBoundingClientRect();
      const nextRect = nextItem.getBoundingClientRect();

      const currentCenter = currentRect.left - listRect.left + currentRect.width / 2;
      const nextCenter = nextRect.left - listRect.left + nextRect.width / 2;

      const center = currentCenter + (nextCenter - currentCenter) * progressToNext;
      const distanceBetweenItems = Math.abs(nextCenter - currentCenter);

      const stretchFactor = 1 - Math.abs(progressToNext * 2 - 1);
      const width = 12 + distanceBetweenItems * stretchFactor * 0.62;

      setIndicator({
        x: center - width / 2,
        width,
        opacity: 1,
        stretch: stretchFactor,
      });

      setActiveIndex(currentItemIndex);
    };

    const updateScrollProgress = () => {
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    let ticking = false;
    const handleScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateIndicator();
        updateScrollProgress();
        ticking = false;
      });
    };

    updateIndicator();
    updateScrollProgress();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [items]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      previousActiveIndexRef.current = activeIndex;
      return;
    }

    if (previousActiveIndexRef.current !== activeIndex) {
      setSplash((previous) => ({
        id: previous.id + 1,
        x: indicator.x + indicator.width / 2,
      }));
      previousActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, indicator.x, indicator.width]);

  return (
    <header className="brand-surface sticky top-0 z-50 w-full shadow-lg">
      <nav className="w-full">
        <div className="container-pro flex h-16 items-center justify-between">
          <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
            <Link
              href="#inicio"
              className="brand-on-surface flex items-center gap-2 text-lg font-bold"
              aria-label="Ir al inicio"
            >
              <Image
                src="/images/fotos/LOGO-BUSES-MADRID.png"
                alt="Logo Buses Madrid"
                width={160}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
          </motion.div>

          <ul
            ref={navListRef}
            className="relative hidden items-center gap-8 pb-2 min-[1051px]:flex"
          >
            <motion.div
              key={`splash-core-${splash.id}`}
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 z-0 h-2 w-2 rounded-full bg-primary"
              initial={{ x: splash.x - 4, scale: 0.3, opacity: 0.8 }}
              animate={{ x: splash.x - 4, scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              key={`splash-left-${splash.id}`}
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 z-0 h-1.5 w-1.5 rounded-full bg-primary"
              initial={{ x: splash.x - 3, y: 0, opacity: 0.65 }}
              animate={{ x: splash.x - 18, y: -10, opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            />
            <motion.div
              key={`splash-right-${splash.id}`}
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 z-0 h-1.5 w-1.5 rounded-full bg-primary"
              initial={{ x: splash.x - 3, y: 0, opacity: 0.65 }}
              animate={{ x: splash.x + 10, y: -10, opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 z-0 h-2 bg-primary shadow-[0_0_16px_rgba(250,210,36,0.75)]"
              animate={{
                x: indicator.x,
                width: indicator.width,
                opacity: indicator.opacity,
                scaleY: 1 + indicator.stretch * 0.5,
                borderRadius: 999,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.6 }}
            />
            {items.map((item, index) => (
              <motion.li
                key={item.href}
                ref={(element) => {
                  navItemRefs.current[index] = element;
                }}
                className="relative z-10"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.08 + index * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "brand-on-surface relative px-1 py-1 text-sm font-medium transition-colors hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
                    activeIndex === index && "text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 min-[1051px]:flex">
            <Link
              href="#contacto"
              className={buttonVariants({ variant: "secondary", size: "default" })}
            >
              Contacto
            </Link>
            <button
              onClick={() => setDenunciaOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:-translate-y-0.5"
            >
              <TriangleAlert className="h-4 w-4" />
              Canal de denuncias
            </button>
          </div>

          <button
            type="button"
            className="brand-on-surface inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 min-[1051px]:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Abrir menu"
          >
            <motion.span
              key={open ? "close" : "menu"}
              initial={{ rotate: -12, scale: 0.9, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 12, scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </button>
        </div>

        <div className="min-[1051px]:hidden">
          <div className="h-px w-full bg-white/10" />
          <div className="relative h-1.5 overflow-hidden bg-slate-950/25">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-amber-300 to-primary shadow-[0_0_16px_rgba(250,210,36,0.45)]"
              animate={{ width: `${Math.max(scrollProgress * 100, 4)}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.3 }}
            />
            <motion.div
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_rgba(250,210,36,0.75)]"
              animate={{ left: `calc(${Math.max(scrollProgress * 100, 4)}% - 0.25rem)` }}
              transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open ? (
            <div className="fixed inset-x-0 top-16 z-40 min-[1051px]:hidden">
              <motion.button
                type="button"
                aria-label="Cerrar menú"
                className="absolute inset-0 cursor-default bg-slate-950/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
              />

              <motion.aside
                key="mobile-menu"
                initial={{ opacity: 0, x: 28, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 28, scale: 0.98 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="absolute right-3 top-3 w-[min(88vw,20rem)] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl"
              >
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                    Navegación
                  </p>
                </div>

                <div className="max-h-[68vh] overflow-y-auto px-2 py-2">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: index * 0.025 }}
                    >
                      <Link
                        href={item.href}
                        className="brand-on-surface flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="brand-surface-border mt-2 grid gap-2 border-t border-white/10 px-1 pt-3">
                    <Link
                      href="#contacto"
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                      onClick={() => setOpen(false)}
                    >
                      Contacto
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setDenunciaOpen(true);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25"
                    >
                      <TriangleAlert className="h-4 w-4" />
                      Canal de denuncias
                    </button>
                  </div>
                </div>
              </motion.aside>
            </div>
          ) : null}
        </AnimatePresence>
      </nav>

      <DenunciaModal
        isOpen={isDenunciaOpen}
        onClose={() => setDenunciaOpen(false)}
      />
    </header>
  );
}