"use client";

import type { ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

type AdminDrawerSide = "right" | "left";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: AdminDrawerSide;
  children: ReactNode;
  className?: string;
  title?: string;
}

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
  exit: { opacity: 0, transition: { duration: motionTokens.duration.fast } },
};

function getDrawerVariants(side: AdminDrawerSide) {
  const x = side === "right" ? motionTokens.distance.xl : -motionTokens.distance.xl;
  return {
    initial: { opacity: 0, x },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
    },
    exit: {
      opacity: 0,
      x: x * 0.6,
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
    },
  };
}

export function AdminDrawer({
  isOpen,
  onClose,
  side = "right",
  children,
  className,
  title,
}: AdminDrawerProps) {
  const variants = getDrawerVariants(side);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className={cx(
              "fixed inset-y-0 z-10 flex w-full max-w-md flex-col overflow-y-auto border-border-soft bg-surface-canvas shadow-lg",
              side === "right" ? "right-0 border-l" : "left-0 border-r",
              className,
            )}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

interface AdminDrawerHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AdminDrawerHeader({ children, onClose, className }: AdminDrawerHeaderProps) {
  return (
    <div className={cx("flex items-center justify-between gap-4 border-b border-border-soft p-5", className)}>
      <div className="min-w-0 flex-1">{children}</div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export function AdminDrawerBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex-1 p-5", className)}>{children}</div>;
}

export function AdminDrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center justify-end gap-3 border-t border-border-soft p-5", className)}>
      {children}
    </div>
  );
}
