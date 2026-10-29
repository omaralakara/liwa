// Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync.
// The only smooth-scroll engine in the project. Never add ScrollSmoother alongside it.

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./gsap";

let instance: Lenis | null = null;

/**
 * Scroll to a chapter by id. A pinned chapter is translated inside its pin spacer while
 * and after the pin, so an anchor jump aimed at the element itself lands on the chapter's
 * last frame when coming from below; the spacer's top is the chapter's first frame.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = (el.closest(".pin-spacer") as HTMLElement | null) ?? el;
  const top = target.getBoundingClientRect().top + window.scrollY;
  if (instance) instance.scrollTo(top, { duration: 1.5 });
  else window.scrollTo({ top, behavior: "smooth" });
}

export function initSmoothScroll(): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return () => {};

  const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    anchors: false, // chapter anchors go through scrollToId
  });
  instance = lenis;

  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    instance = null;
  };
}
