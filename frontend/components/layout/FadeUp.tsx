"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function FadeUp({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        ease: [0.21, 0.47, 0.32, 0.98], // elegant cubic bezier
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
