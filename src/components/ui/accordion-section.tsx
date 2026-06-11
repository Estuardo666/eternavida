"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { motionTokens } from "@/motion/tokens";

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="border-b border-border-soft">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[1.0625rem] font-medium text-text-primary" style={{ fontFamily: "'SentaSans', sans-serif" }}>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : motionTokens.duration.fast,
            ease: motionTokens.ease.standard,
          }}
        >
          <ChevronDown className="h-5 w-5 text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={{
              collapsed: {
                opacity: 0,
                height: 0,
                transition: {
                  opacity: { duration: 0.16 },
                  height: { duration: 0.2, ease: motionTokens.ease.exit },
                },
              },
              expanded: {
                opacity: 1,
                height: "auto",
                transition: {
                  opacity: { duration: 0.2, delay: 0.02 },
                  height: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
                },
              },
            }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[0.9375rem] leading-relaxed text-text-secondary">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
