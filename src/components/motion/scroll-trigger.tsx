// Scroll Animation Trigger Component
// Advanced scroll-based animations with IntersectionObserver
"use client";

import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ScrollTriggerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScrollTrigger({
  children,
  delay = 0,
  className = "",
  once = true,
}: ScrollTriggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: "0px 0px -100px 0px", // Trigger when 100px before element enters viewport
    amount: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
