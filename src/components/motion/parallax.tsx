// Parallax Effect Component - Creates smooth parallax scrolling
"use client";

import { memo, ReactNode, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  speed?: number;
  className?: string;
  direction?: "up" | "down";
}

const ParallaxInner = memo(function ParallaxInner({
  children,
  offset = 50,
  speed = 0.5,
  className = "",
  direction = "up",
}: ParallaxProps) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const travel = offset * speed;
  const yRange = direction === "up" ? [travel, -travel] : [-travel, travel];
  const yTransform = useTransform(scrollYProgress, [0, 1], yRange);
  const y = useSpring(yTransform, { stiffness: 120, damping: 28, mass: 0.25 });

  // Skip parallax effect for users with reduced motion preferences
  if (reduceMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
});

ParallaxInner.displayName = "Parallax";
export const Parallax = ParallaxInner;
