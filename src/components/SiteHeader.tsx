import { useCallback, useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { MenuOverlay } from "./MenuOverlay";
import { SoundToggle } from "./SoundToggle";
import { chapters, primaryNav, type ChapterId } from "../data/site";
import { lockScroll, scrollToId } from "../lib/smooth";

function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#") || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  scrollToId(href.slice(1));
  history.replaceState(null, "", href);
}

/** Which primary path a chapter belongs to, for the header's current marker. */
const primaryOf: Record<ChapterId, ChapterId | null> = {
  awakening: null,
  about: "about",
  wild: "wild",
  land: "wild",
  wonder: "wild",
  vision: "vision",
  visit: null,
  invitation: "contact",
  contact: "contact",
};

/** The centre list omits Home: the mark already leads there. */
const centreNav = primaryNav.filter((p) => p.id !== "awakening");

/**
 * One slim fixed bar: the mark, the four primary paths (large screens), the "Book a visit" link
 * and a two-line menu control that opens the full chapter list. Transparent over the hero; a solid
 * charcoal strip once the hero has gone. The menu overlay is rendered here, at body level,
 * so it can never sit beneath a pinned chapter.
 */
export function SiteHeader() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<ChapterId>("awakening");
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    // Every chapter currently inside the centre band, so a lone "left the band" entry still
    // resolves to whichever chapter remains (a batch only carries the chapters that changed).
    const inBand = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) inBand.set(e.target.id, e.intersectionRatio);
          else inBand.delete(e.target.id);
        });
        let best: string | null = null;
        let bestRatio = -1;
        inBand.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        if (best) setActive(best as ChapterId);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));

    const hero = document.getElementById("awakening");
    let heroObserver: IntersectionObserver | undefined;
    if (hero) {
      heroObserver = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px", threshold: 0 });
      heroObserver.observe(hero);
    }
    return () => {
      observer.disconnect();
      heroObserver?.disconnect();
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /** Close the menu, release the lock, then measure and travel on the next frame. */
  const travel = useCallback((id: ChapterId) => {
    setOpen(false);
    lockScroll(false);
    requestAnimationFrame(() => {
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    });
  }, []);

  const onBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (open && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      travel("awakening");
      return;
    }
    onAnchorClick(e);
  };

  const current = primaryOf[active];
  const className = ["site-header", past ? "is-past-hero" : "", open ? "is-menu-open" : ""].join(" ").trim();

  return (
    <header className={className}>
      <a className="site-header__brand" href="#awakening" aria-label="LIWA Safari, back to the beginning" onClick={onBrandClick}>
        <Mark />
      </a>
      <nav className="site-header__nav" aria-label="Primary">
        {centreNav.map((p) => (
          <a key={p.id} href={`#${p.id}`} aria-current={current === p.id ? "true" : undefined} onClick={onAnchorClick}>
            {p.label}
          </a>
        ))}
      </nav>
      <div className="site-header__right">
        <a className="site-header__contact" href="#visit" aria-current={active === "visit" ? "true" : undefined} onClick={onAnchorClick}>
          Book a visit
        </a>
        <SoundToggle variant="header" />
        <button
          ref={toggleRef}
          type="button"
          className="site-header__menu menu-toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__word caption" aria-hidden="true">
            Menu
          </span>
          <span className="menu-toggle__lines" aria-hidden="true">
            <span className="menu-toggle__line">
              <span className="menu-toggle__bar" />
            </span>
            <span className="menu-toggle__line">
              <span className="menu-toggle__bar" />
            </span>
          </span>
        </button>
      </div>
      <MenuOverlay open={open} toggleRef={toggleRef} onClose={close} onSelect={travel} />
    </header>
  );
}
