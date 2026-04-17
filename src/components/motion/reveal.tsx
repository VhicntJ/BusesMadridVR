"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
  distance = 28,
  duration = 0.6,
  once = true,
  amount = 0.22,
}: RevealProps) {
  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -distance, opacity: 0 };
      case "right":
        return { x: distance, opacity: 0 };
      case "down":
        return { y: distance, opacity: 0 };
      case "up":
      default:
        return { y: distance, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{
        once,
        amount,
        margin: "0px 0px -50px 0px",
      }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
