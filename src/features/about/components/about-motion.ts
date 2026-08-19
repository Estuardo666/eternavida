import type { MotionProps } from "framer-motion";

import { motionTokens } from "@/motion/tokens";

const ENTER_SCALE = 0.94;
const ENTER_DURATION = 0.65;

export const aboutViewport = { once: true, amount: 0.2 } as const;

/** Fade + scale in when the element scrolls into view. */
export function fadeScaleIn(reduceMotion: boolean, delay = 0): MotionProps {
  return {
    initial: reduceMotion ? false : { opacity: 0, scale: ENTER_SCALE },
    whileInView: { opacity: 1, scale: 1 },
    viewport: aboutViewport,
    transition: { duration: ENTER_DURATION, ease: motionTokens.ease.standard, delay },
  };
}

/** Fade + scale in on mount, for above-the-fold content that never scrolls into view. */
export function fadeScaleInOnMount(reduceMotion: boolean, delay = 0): MotionProps {
  return {
    initial: reduceMotion ? false : { opacity: 0, scale: ENTER_SCALE },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: ENTER_DURATION, ease: motionTokens.ease.standard, delay },
  };
}
