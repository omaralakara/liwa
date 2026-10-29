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
 * Rest points for a pinned chapter, as timeline progress values. Once the visitor nudges the
 * scroll (wheel, trackpad or thumb), the transition plays itself to the next rest point in the
 * direction of travel instead of stalling half-open; scrolling back plays it in reverse.
 */
export function restPoints(points: number[]) {
  return {
    snapTo: points,
    duration: { min: 0.8, max: 2.4 },
    delay: 0.08,
    ease: "power2.inOut",
    directional: true,
    inertia: false,
  };
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
