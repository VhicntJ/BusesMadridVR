"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, TriangleAlert, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  items: readonly NavItem[];
};

export function Navbar({ items }: NavbarProps) {
  const [open, setOpen] = useState(false);

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

          <ul className="hidden items-center gap-8 md:flex">
            {items.map((item, index) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.08 + index * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={item.href}
                  className="brand-on-surface relative px-1 py-1 text-sm font-medium transition-colors hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="#contacto"
              className={buttonVariants({ variant: "secondary", size: "default" })}
            >
              Contacto
            </Link>
            <Link
              href="#"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:-translate-y-0.5"
            >
              <TriangleAlert className="h-4 w-4" />
              Canal de denuncias
            </Link>
          </div>

          <button
            type="button"
            className="brand-on-surface inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden",
            open ? "max-h-80" : "max-h-0",
          )}
        >
          <div className="brand-surface-2 container-pro grid gap-3 px-4 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="brand-on-surface block px-2 py-2 text-sm font-medium hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="brand-surface-border mt-2 grid gap-2 border-t pt-2">
              <Link
                href="#contacto"
                className={buttonVariants({ variant: "secondary", size: "default" })}
                onClick={() => setOpen(false)}
              >
                Contacto
              </Link>
              <Link
                href="#"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700"
                onClick={() => setOpen(false)}
              >
                <TriangleAlert className="h-4 w-4" />
                Canal de denuncias
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}