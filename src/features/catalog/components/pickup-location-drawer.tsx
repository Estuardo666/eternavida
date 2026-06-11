"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, MapPin, Clock, Navigation } from "lucide-react";
import { motionTokens } from "@/motion/tokens";
import type { PublicPickupLocationSummary } from "@/types/public-catalog";
import { cfImageLoader } from "@/lib/cf-image-loader";

interface PickupLocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: PublicPickupLocationSummary[];
  productName?: string;
}

const panelTransition = {
  duration: motionTokens.duration.moderate,
  ease: motionTokens.ease.soft,
} as const;

const backdropTransition = {
  duration: motionTokens.duration.base,
  ease: motionTokens.ease.standard,
} as const;

export function PickupLocationDrawer({
  isOpen,
  onClose,
  locations,
  productName,
}: PickupLocationDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-label="Cerrar drawer de ubicaciones de recogida"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ubicaciones de recogida"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "calc(100% + 16px)" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "calc(100% + 16px)" }}
            transition={panelTransition}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border-soft bg-surface-canvas shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Ubicaciones de recogida
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                aria-label="Cerrar drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {productName && (
                <p className="mb-4 text-sm text-text-secondary">
                  Disponibilidad de recogida para{" "}
                  <span className="font-medium text-text-primary">{productName}</span>
                </p>
              )}

              {locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="mb-3 h-10 w-10 text-text-tertiary" />
                  <p className="text-sm font-medium text-text-secondary">
                    No hay ubicaciones de recogida disponibles
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="rounded-xl border border-border-soft bg-surface-subtle p-4"
                    >
                      <div className="flex items-start gap-3">
                        {location.logoMedia?.url && (
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cfImageLoader({ src: location.logoMedia.url, width: 80, quality: 70 })}
                              alt={location.name}
                              className="h-full w-full object-contain p-1"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-text-primary">
                            {location.name}
                          </h3>
                          <div className="mt-1.5 flex items-start gap-1.5 text-xs text-text-secondary">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>{location.address}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Listo en 24 horas</span>
                          </div>
                          {location.directionsUrl && (
                            <a
                              href={location.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/20"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Cómo llegar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
