"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/motion/reveal";

type StatItem = {
  value: string;
  label: string;
};

type StatsProps = {
  id?: string;
  title: string;
  stats: StatItem[];
};

function formatCount(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

function getCounterMeta(value: string) {
  if (value.includes("/")) {
    const head = Number.parseInt(value.split("/")[0], 10);
    if (Number.isFinite(head)) {
      return { canAnimate: true, target: head, prefix: "", suffix: value.slice(String(head).length) };
    }
    return { canAnimate: false, target: 0, prefix: "", suffix: value };
  }

  const match = value.match(/^(\d[\d.]*)/);
  if (!match) {
    return { canAnimate: false, target: 0, prefix: "", suffix: value };
  }

  const target = Number.parseInt(match[1].replaceAll(".", ""), 10);
  const suffix = value.slice(match[1].length);
  return { canAnimate: Number.isFinite(target), target, prefix: "", suffix };
}

function AnimatedStatValue({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const meta = useMemo(() => getCounterMeta(value), [value]);

  useEffect(() => {
    if (!meta.canAnimate || meta.target <= 0) {
      setDisplayValue(value);
      return;
    }

    let rafId = 0;
    const duration = 1600;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(meta.target * eased);

      setDisplayValue(`${meta.prefix}${formatCount(current)}${meta.suffix}`);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [meta, value]);

  return <>{displayValue}</>;
}

export function StatsSection({ id, title, stats }: StatsProps) {
  return (
    <section id={id} className="brand-surface w-full py-20">
      <div className="container-pro">
        <Reveal>
          <h2 className="brand-on-surface mb-12 text-center text-4xl font-bold sm:text-5xl">
            {title}
          </h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.1}>
              <div className="brand-surface-border brand-surface-2 flex flex-col items-center rounded-xl border p-8 text-center">
                <div className="text-5xl font-bold text-primary sm:text-6xl">
                  <AnimatedStatValue value={stat.value} />
                </div>
                <p className="brand-on-surface-muted mt-4 text-sm font-semibold uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
