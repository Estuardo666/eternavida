"use client";

import { useState, useRef, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

interface AdminTooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

const tooltipVariants = {
  initial: { opacity: 0, y: 4, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.96,
    transition: { duration: motionTokens.duration.instant, ease: motionTokens.ease.exit },
  },
};

export function AdminTooltip({ content, children, className }: AdminTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={tooltipVariants}
            role="tooltip"
            className={cx(
              "absolute bottom-full left-1/2 z-tooltip mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-soft bg-surface-canvas px-2.5 py-1.5 text-label-sm text-text-primary shadow-md",
              className,
            )}
          >
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
