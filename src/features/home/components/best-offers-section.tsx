"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import { PublicProductCard } from "@/features/catalog/components/public-product-card";
import type { HomeProductShelfContent } from "@/types/content";

interface BestOffersSectionProps {
  content: HomeProductShelfContent;
}

function useItemsPerSlide() {
  const [value, setValue] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setValue(1);
      else if (w < 1024) setValue(2);
      else setValue(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return value;
}

const DRAG_THRESHOLD = 10;

export function BestOffersSection({ content }: BestOffersSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const itemsPerSlide = useItemsPerSlide();

  const items = useMemo(() => {
    const base = content.items.slice(0, 10);
    if (base.length === 0 || base.length >= 5) return base;
    const out: typeof base = [];
    for (let i = 0; i < 5; i++) {
      out.push(base[i % base.length]!);
    }
    return out;
  }, [content.items]);

  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  const snapToNearest = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    if (slideWidth === 0) return;
    const nearest = Math.round(track.scrollLeft / slideWidth);
    const clamped = Math.max(0, Math.min(nearest, totalSlides - 1));
    track.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
    setActiveSlide(clamped);
  }, [totalSlides]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.offsetWidth;
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    track.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
    setActiveSlide(clamped);
  }, [totalSlides]);

  /* ── Pointer drag ── */
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const hasDragged = useRef(false);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    pointerId.current = e.pointerId;
    track.setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    dragStartScroll.current = track.scrollLeft;
    hasDragged.current = false;
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !trackRef.current) return;
      const dx = dragStartX.current - e.clientX;
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        hasDragged.current = true;
      }
      trackRef.current.scrollLeft = dragStartScroll.current + dx;
    },
    [isDragging],
  );

  const onPointerUp = useCallback(() => {
    if (!trackRef.current) return;
    if (pointerId.current !== null) {
      try {
        trackRef.current.releasePointerCapture(pointerId.current);
      } catch {
        /* noop */
      }
      pointerId.current = null;
    }
    setIsDragging(false);
    snapToNearest();
  }, [snapToNearest]);

  /* ── Reset on breakpoint change ── */
  useEffect(() => {
    setActiveSlide(0);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: 0, behavior: "auto" });
  }, [itemsPerSlide]);

  if (!items.length) return null;

  return (
    <section className="w-full pt-0 pb-8 sm:pb-10 lg:pb-12">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-[2.5rem] font-bold leading-tight tracking-tight text-text-primary">
              Las ofertas mas compradas
            </h2>
            <p className="text-body-md text-text-secondary">
              Aprovecha, que ¡no durarán!, Las mejores ofertas en Dermatológika.
            </p>
          </div>
          <Link
            href={content.cta?.href ?? "#"}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-brand-primary px-6 py-3 text-label-md text-text-inverse transition hover:-translate-y-0.5 hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {content.cta?.label ?? "Apróvechalas ya"}
          </Link>
        </div>

        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={[
            "flex overflow-x-auto scrollbar-none select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            isDragging ? "snap-none" : "snap-x snap-mandatory",
          ].join(" ")}
          style={{ scrollbarWidth: "none", touchAction: "pan-y" }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const slideItems = items.slice(
              slideIndex * itemsPerSlide,
              slideIndex * itemsPerSlide + itemsPerSlide,
            );
            return (
              <div
                key={slideIndex}
                className={[
                  "grid w-full shrink-0 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                  isDragging ? "" : "snap-start snap-always",
                ].join(" ")}
              >
                {slideItems.map((product, i) => (
                  <div
                    key={`${product.id}-${slideIndex}-${i}`}
                    className={isDragging ? "pointer-events-none" : ""}
                  >
                    <PublicProductCard product={product} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {totalSlides > 1 ? (
          <div
            className="flex items-center justify-center gap-2"
            role="group"
            aria-label="Indicadores de diapositiva"
          >
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a diapositiva ${i + 1}`}
                aria-current={i === activeSlide ? "true" : undefined}
                className={[
                  "h-1.5 w-6 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                  i === activeSlide
                    ? "bg-brand-primary"
                    : "bg-neutral-300 hover:bg-neutral-400",
                ].join(" ")}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
