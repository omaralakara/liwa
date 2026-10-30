// Single GSAP registration point. Import `gsap` from here everywhere in the app
// so plugins are registered exactly once, before any component runs.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

// Phone address bars resize the viewport while scrolling; do not refresh pins for that.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Rest points for a pinned chapter, as timeline progress values. One nudge of the wheel, trackpad
 * or thumb plays the transition to the next rest in the direction of travel; a nudge back plays it
 * in reverse.
 *
 * The direction is judged against the rest the chapter last settled on, not against the last frame
 * of smoothed scrolling (Lenis eases to a stop, and a stale or jittery direction could carry a small
 * nudge back to where it started). The rest is kept honest three ways: a finished snap sets it, a
 * snap that finds the scroll already on a rest point adopts it, and `sync` (pass it as the trigger's
 * `onToggle`) resets it when a jump leaves or enters the chapter without snapping.
 *
 *   const rest = restPoints([0, 0.8, 1]);
 *   scrollTrigger: { ..., snap: rest, onToggle: rest.sync }
 */
export function restPoints(points: number[]) {
  const sorted = [...points].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  let rest = first;
  const eps = 0.012;
  const nearest = (p: number) => sorted.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
  return {
    snapTo: (value: number) => {
      const on = sorted.find((p) => Math.abs(p - value) <= 0.004);
      if (on !== undefined) return (rest = on);
      // The next rest beyond the current position, in the direction travelled since the last rest.
      if (value > rest + eps) return sorted.find((p) => p >= value) ?? last;
      if (value < rest - eps) return [...sorted].reverse().find((p) => p <= value) ?? first;
      return rest;
    },
    onComplete: (self: ScrollTrigger) => {
      rest = nearest(self.progress);
    },
    sync: (self: ScrollTrigger) => {
      if (!self.isActive) rest = self.progress < 0.5 ? first : last;
    },
    duration: { min: 0.9, max: 2.0 },
    delay: 0.03,
    ease: "power2.inOut",
    inertia: false,
  };
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
