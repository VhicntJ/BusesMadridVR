"use client";

import { useEffect, useState } from "react";

type ThemeVariant = "minero" | "premium";

const themeOptions: Array<{ value: ThemeVariant; label: string }> = [
  { value: "minero", label: "Amarillo + Azul petróleo" },
  { value: "premium", label: "Amarillo + Grafito + Blanco" },
];

export function ThemeVariantSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeVariant>("minero");

  useEffect(() => {
    const stored = window.localStorage.getItem("busesmadrid-theme") as ThemeVariant | null;
    const initial = stored === "premium" ? "premium" : "minero";
    setActiveTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const handleTheme = (theme: ThemeVariant) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("busesmadrid-theme", theme);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
        aria-expanded={open}
        aria-label="Abrir selector de tema"
      >
        Variante visual
      </button>

      {open ? (
        <div className="mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Demo para cliente
          </p>
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTheme(option.value)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  activeTheme === option.value
                    ? "border-primary bg-amber-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
