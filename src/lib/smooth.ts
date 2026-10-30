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
/**
 * Where a jump into a pinned chapter comes to rest, as timeline progress. A chapter's closed
 * first frame is a cut, not a picture: a link should carry the visitor through the transition
 * and leave them on the first open frame (the same rest points the snap uses), so the scene
 * animates itself into place on arrival instead of waiting for a nudge.
 */
const LANDING: Record<string, number> = { wild: 0.62, vision: 0.8, about: 0.72 };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Move the keyboard's starting point with the view: the next Tab continues from this chapter,
  // not from the link that was pressed (the section takes focus without a ring or a jump).
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  // The pinned element may be the chapter itself (hero, Wild, Vision) or a frame inside it (About).
  const spacer = (el.closest(".pin-spacer") as HTMLElement | null) ?? (el.querySelector(".pin-spacer") as HTMLElement | null);
  const target = spacer ?? el;
  let top = target.getBoundingClientRect().top + window.scrollY;
  if (spacer) {
    const pinned = spacer.firstElementChild as HTMLElement | null;
    const pin = pinned ? spacer.offsetHeight - pinned.offsetHeight : 0;
    top += Math.max(0, pin) * (LANDING[id] ?? 0);
  }
  if (instance) instance.scrollTo(top, { duration: 1.6 });
  else window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Freeze or release page scrolling while a modal surface (the menu) is open.
 * Lenis is stopped so wheel and touch do nothing; the root overflow is also set so the lock
 * holds under reduced motion, where Lenis is never created. `scrollbar-gutter: stable` on
 * the root (nav.css) keeps the layout from shifting when the scrollbar goes.
 */
let lockedY: number | null = null;
const holdPosition = () => {
  if (lockedY !== null && window.scrollY !== lockedY) window.scrollTo(0, lockedY);
};

export function lockScroll(locked: boolean) {
  if (locked) {
    instance?.stop();
    if (lockedY === null) {
      lockedY = window.scrollY;
      window.addEventListener("scroll", holdPosition);
    }
  } else {
    window.removeEventListener("scroll", holdPosition);
    lockedY = null;
    instance?.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
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
