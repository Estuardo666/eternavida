"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

interface AdminDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}

const dropdownVariants = {
  initial: { opacity: 0, y: -4, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: motionTokens.duration.instant, ease: motionTokens.ease.exit },
  },
};

export function AdminDropdown({ trigger, children, className, align = "right" }: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={dropdownVariants}
            className={cx(
              "absolute z-dropdown mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-border-soft bg-surface-canvas shadow-md",
              align === "right" ? "right-0" : "left-0",
              className,
            )}
          >
            <div className="py-1" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface AdminDropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  danger?: boolean;
}

export function AdminDropdownItem({ children, onClick, className, danger }: AdminDropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-2 px-3 py-2 text-body-sm text-left transition-colors duration-100",
        "focus-visible:outline-none focus-visible:bg-surface-subtle",
        danger
          ? "text-status-error hover:bg-status-error/5"
          : "text-text-primary hover:bg-surface-subtle",
        className,
      )}
    >
      {children}
    </button>
  );
}
