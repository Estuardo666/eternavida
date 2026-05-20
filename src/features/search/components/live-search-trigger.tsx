import type { KeyboardEventHandler, RefObject } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";

import { cx } from "@/lib/utils";

interface LiveSearchTriggerProps {
  className?: string;
  query: string;
  isOpen: boolean;
  isLoading: boolean;
  controlsId: string;
  activeDescendantId?: string | undefined;
  mobile?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onChange: (value: string) => void;
  onFocus: () => void;
  onOpen: () => void;
  onClose?: () => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}

const triggerTransition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export function LiveSearchTrigger({
  className,
  query,
  isOpen,
  isLoading,
  controlsId,
  activeDescendantId,
  mobile = false,
  inputRef,
  buttonRef,
  onChange,
  onFocus,
  onOpen,
  onClose,
  onKeyDown,
}: LiveSearchTriggerProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const triggerMotionProps = reduceMotion
    ? {
        transition: { duration: 0 },
      }
    : {
        animate: { scale: isOpen ? 1 : 0.995 },
        transition: triggerTransition,
      };

  if (mobile && !isOpen) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={onOpen}
        aria-label="Abrir busqueda"
        className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border-soft bg-surface-canvas text-text-primary transition-[background-color,border-color,color] duration-[180ms] ease-soft hover:border-border-default hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <motion.div
      layout
      transition={reduceMotion ? { duration: 0 } : triggerTransition}
      className={cx("w-full", className)}
    >
      <motion.div
        layout
        {...triggerMotionProps}
        className={cx(
          "flex min-h-11 items-center gap-3 rounded-pill border border-border-soft bg-surface-canvas px-4 py-3 text-text-secondary transition-[background-color,border-color,color] duration-[180ms] ease-soft",
          isOpen && "border-border-default bg-white text-text-primary",
          mobile && "rounded-[24px] px-4 py-3.5",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />

        <input
          ref={inputRef}
          type="search"
          value={query}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={controlsId}
          aria-activedescendant={activeDescendantId}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="Buscar productos..."
          onFocus={onFocus}
          onClick={onOpen}
          onChange={(event) => {
            onOpen();
            onChange(event.target.value);
          }}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-body-md text-text-primary placeholder:text-text-muted focus:outline-none"
        />

        <div className="flex items-center gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-text-muted" aria-hidden="true" /> : null}
          {mobile ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose?.();
              }}
              aria-label="Cerrar busqueda"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-surface-subtle text-text-secondary transition-[background-color,border-color,color] duration-[180ms] ease-soft hover:border-border-default hover:bg-surface-canvas hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}