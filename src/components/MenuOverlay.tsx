import { useEffect, useRef, type RefObject } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { lockScroll } from "../lib/smooth";
import { hrefFor, isInPage, primaryNav, secondaryNav, site, type ChapterId, type NavId, type Page } from "../data/site";
import { SoundToggle } from "./SoundToggle";

type Props = {
  open: boolean;
  page: Page;
  /** The primary path the visitor is on: its bullet is filled. */
  current: NavId | null;
  /** The hamburger in the header: its two bars are choreographed with the panel, and focus returns to it. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  /** Close, then travel to a chapter of this page (the caller releases the scroll lock before measuring). */
  onSelect: (id: ChapterId) => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The secondary chapter list, less Book a Visit: it already has its own line under the primary paths. */
const chapterPaths = secondaryNav.filter((c) => c.id !== "visit");

/**
 * The full-screen menu: a burgundy veil leads a charcoal curtain down the viewport, the seven
 * primary paths rise through line masks beside their bullets, then "Book a visit", the remaining
 * chapters, the contact and a gold hairline follow. One paused timeline is played or reversed, so rapid taps are always safe.
 * The panel is rendered inside the fixed header, never inside a pinned chapter.
 */
export function MenuOverlay({ open, page, current, toggleRef, onClose, onSelect }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const wasOpen = useRef(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const toggle = toggleRef.current;
      const bars = toggle ? Array.from(toggle.querySelectorAll<HTMLElement>(".menu-toggle__bar")) : [];
      const headerRest = Array.from(document.querySelectorAll<HTMLElement>(".site-header__nav, .site-header__contact, .sound-toggle--header"));
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          const t = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });

          if (!motion) {
            t.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: "none" }, 0);
            if (bars.length === 2) {
              t.fromTo(bars[0], { y: 0, rotation: 0 }, { y: 3.5, rotation: 45, duration: 0.01 }, 0);
              t.fromTo(bars[1], { y: 0, rotation: 0 }, { y: -3.5, rotation: -45, duration: 0.01 }, 0);
            }
            if (headerRest.length) t.fromTo(headerRest, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01, immediateRender: false }, 0);
            tl.current = t;
            return () => {
              tl.current = null;
            };
          }

          t.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: "none" }, 0)
            // The curtain: burgundy leads by 120 ms, charcoal follows and covers it.
            .fromTo(q(".menu__veil"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.62 }, 0)
            .fromTo(q(".menu__panel"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.62 }, 0.12)
            // The two bars turn into an X at the same time.
            .fromTo(bars[0] ?? [], { y: 0, rotation: 0 }, { y: 3.5, rotation: 45, duration: 0.5, ease: "power3.inOut" }, 0)
            .fromTo(bars[1] ?? [], { y: 0, rotation: 0 }, { y: -3.5, rotation: -45, duration: 0.5, ease: "power3.inOut" }, 0)
            // The header's own links step aside; the mark and the X stay.
            .fromTo(headerRest, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, 0)
            // Primary paths rise through line masks.
            .fromTo(q(".menu__primary-inner"), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0.3)
            .fromTo(q(".menu__primary-dot"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 0.42)
            // Then the quieter material.
            .fromTo(
              q(".menu__meta, .menu__sound, .menu__book, .menu__secondary, .menu__contact"),
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "power3.out" },
              0.58,
            )
            // Finally a gold hairline draws.
            .fromTo(q(".menu__rule"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 0.6, ease: "power3.inOut" }, 0.6);

          tl.current = t;
          return () => {
            tl.current = null;
          };
        },
      );
    },
    { scope: root },
  );

  // Open and close: timeline, scroll lock, inert page, focus.
  useEffect(() => {
    const t = tl.current;
    const main = document.querySelector("main");
    if (open) {
      wasOpen.current = true;
      t?.timeScale(1).play();
      lockScroll(true);
      main?.setAttribute("inert", "");
      // The panel is visible after the first tick; focus the first path then.
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          root.current?.querySelector<HTMLElement>(".menu__primary a")?.focus({ preventScroll: true });
        }),
      );
      return () => cancelAnimationFrame(raf);
    }
    if (!wasOpen.current) return;
    t?.timeScale(2).reverse();
    lockScroll(false);
    main?.removeAttribute("inert");
    toggleRef.current?.focus({ preventScroll: true });
  }, [open, toggleRef]);

  // Escape closes; Tab cycles through the hamburger and the panel's links only.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const inside = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const ring = toggleRef.current ? [toggleRef.current, ...inside] : inside;
      if (!ring.length) return;
      const first = ring[0];
      const last = ring[ring.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const index = current ? ring.indexOf(current) : -1;
      if (e.shiftKey && (index <= 0 || index === -1)) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && (index === ring.length - 1 || index === -1)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, toggleRef]);

  const select = (id: NavId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) return;
    // Another page: close and let the browser follow the link.
    if (!isInPage(id, page)) {
      onClose();
      return;
    }
    e.preventDefault();
    onSelect(id as ChapterId);
  };

  return (
    <div
      ref={root}
      id="site-menu"
      className="menu"
      // Lenis is stopped while the menu is open and would swallow wheel and touch; let the panel scroll natively.
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={open ? undefined : "true"}
    >
      <div className="menu__veil" aria-hidden="true" />
      <div className="menu__panel" aria-hidden="true" />
      <span className="mark menu__mark" aria-hidden="true" />

      <div className="menu__inner">
        <p className="menu__meta caption">
          {site.fullName}
          <br />
          {site.descriptor}
        </p>
        {/* The sound control shares the top row with the brand line, so it is always on screen. */}
        <div className="menu__sound">
          <SoundToggle variant="menu" />
        </div>

        <div className="menu__primary">
          <nav aria-label="Primary">
            <ul>
              {primaryNav.map((p) => (
                <li key={p.id}>
                  <a href={hrefFor(p.id, page)} onClick={select(p.id)} aria-current={current === p.id ? (p.id === "packages" ? "page" : "true") : undefined}>
                    <span className="menu__primary-dot" aria-hidden="true" />
                    <span className="menu__primary-mask">
                      <span className="menu__primary-inner display">{p.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="menu__book">
            <span className="menu__book-rule" aria-hidden="true" />
            <a href={hrefFor("visit", page)} className="menu__book-link" onClick={select("visit")}>
              Book a visit
            </a>
          </p>
        </div>

        <div className="menu__foot">
          <span className="menu__rule" aria-hidden="true" />
          <nav className="menu__secondary" aria-label="More of the story">
            <ul>
              {chapterPaths.map((c) => (
                <li key={c.id}>
                  <a href={hrefFor(c.id, page)} className="caption" onClick={select(c.id)}>
                    <span className="menu__secondary-dot" aria-hidden="true" />
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu__contact">
            <a className="link" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
            <a className="link" href={site.contact.phoneHref}>
              {site.contact.phoneDisplay}
            </a>
          </div>
        </div>

        {/* The visible X lives in the header, outside the dialog; this gives the dialog its own close. */}
        <button type="button" className="visually-hidden menu__close" onClick={onClose}>
          Close menu
        </button>
      </div>
    </div>
  );
}
