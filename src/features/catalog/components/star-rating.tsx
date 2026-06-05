"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showLabel = false,
}: StarRatingProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = useCallback(
    (rating: number) => {
      if (!readonly && onChange) {
        onChange(rating);
      }
    },
    [readonly, onChange],
  );

  const displayValue = hoverValue || value;
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5" role={readonly ? "img" : "radiogroup"} aria-label={readonly ? `Calificación: ${value} de 5 estrellas` : "Selecciona una calificación"}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            whileTap={readonly || reduceMotion ? {} : { scale: 0.85 }}
            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${readonly ? "cursor-default" : "cursor-pointer"}`}
            aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={filled ? "0" : "1.5"}
              className={`${iconSize} transition-colors duration-150 ${filled ? "text-[#f5a623]" : "text-neutral-300"}`}
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.button>
        );
      })}
      {showLabel && value > 0 ? (
        <span className="ml-1.5 text-body-sm font-semibold text-text-primary">
          {value}
        </span>
      ) : null}
    </div>
  );
}
