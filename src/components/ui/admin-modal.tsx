"use client";

import type { ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
  exit: { opacity: 0, transition: { duration: motionTokens.duration.fast } },
};

const modalVariants = {
  initial: { opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.modalEnter },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
  },
  exit: {
    opacity: 0,
    y: motionTokens.distance.xs,
    scale: motionTokens.scale.modalExit,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
  },
};

export function AdminModal({ isOpen, onClose, children, className, title }: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={overlayVariants}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={modalVariants}
            className={cx(
              "relative z-10 mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border-soft bg-surface-canvas p-6 shadow-lg",
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

interface AdminModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AdminModalHeader({ children, onClose, className }: AdminModalHeaderProps) {
  return (
    <div className={cx("flex items-center justify-between gap-4 pb-4 border-b border-border-soft", className)}>
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

export function AdminModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("py-4", className)}>{children}</div>;
}

export function AdminModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center justify-end gap-3 pt-4 border-t border-border-soft", className)}>
      {children}
    </div>
  );
}
