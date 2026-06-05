import type { KeyboardEventHandler, RefObject } from "react";

import { motion } from "framer-motion";
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
      className={cx("w-full transition-[max-width] duration-[360ms] ease-soft", className)}
    >
      <motion.div
        className={cx(
          "flex min-h-10 items-center gap-2.5 rounded-pill border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-text-secondary transition-[background-color,border-color,color,max-width] duration-[180ms] ease-soft",
          isOpen && "border-brand-primary/40 bg-white text-text-primary",
          mobile && "rounded-[24px] px-3.5 py-2.5",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />

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
          className="w-full bg-transparent text-[15px] font-semibold text-text-primary placeholder:font-medium placeholder:text-text-muted focus:outline-none"
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