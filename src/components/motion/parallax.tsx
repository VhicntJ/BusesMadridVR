// Parallax Effect Component - Creates smooth parallax scrolling
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  speed?: number;
  className?: string;
  direction?: "up" | "down";
}

export function Parallax({
  children,
  offset = 50,
  speed = 0.5,
  className = "",
  direction = "up",
}: ParallaxProps) {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yRange = direction === "up" ? [offset, -offset] : [-offset, offset];
  const y = useTransform(scrollY, [0, 1], yRange, {
    clamp: true,
  });

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
