import { useCallback, useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { MenuOverlay } from "./MenuOverlay";
import { SoundToggle } from "./SoundToggle";
import { chapters, hrefFor, isInPage, primaryNav, type ChapterId, type NavId, type Page } from "../data/site";
import { lockScroll, scrollToId } from "../lib/smooth";

function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#") || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  scrollToId(href.slice(1));
  history.replaceState(null, "", href);
}

/** Which primary path a chapter belongs to, for the current marker. */
const primaryOf: Record<ChapterId, NavId | null> = {
  awakening: "awakening",
  about: "about",
  wild: "wild",
  land: "wild",
  wonder: "wild",
  resort: "resort",
  gallery: "gallery",
  visit: null,
  invitation: "contact",
  contact: "contact",
};

/**
 * One slim fixed bar: the mark, the seven primary paths (large screens), the "Book a visit" link
 * and a two-line menu control that opens the full list. Transparent over the first section; a solid
 * charcoal strip once it has gone. The same header serves both pages: chapters of the page the
 * visitor is on glide there, everything else is an ordinary link. The menu overlay is rendered
 * here, at body level, so it can never sit beneath a pinned chapter.
 */
export function SiteHeader({ page }: { page: Page }) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<ChapterId>("awakening");
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    if (!("IntersectionObserver" in window)) return;

    const sections = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length) {
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
      observers.push(observer);
    }

    // The bar turns solid once the page's first section has gone.
    const first = document.querySelector("main section");
    if (first) {
      const firstObserver = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px", threshold: 0 });
      firstObserver.observe(first);
      observers.push(firstObserver);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Coming back through the browser's history restores this page as it was left: never with the menu open.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setOpen(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
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
    if (open && isInPage("awakening", page) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      travel("awakening");
      return;
    }
    onAnchorClick(e);
  };

  const current: NavId | null = page === "packages" ? "packages" : primaryOf[active];
  const visitCurrent = page === "home" && active === "visit";
  const className = ["site-header", past ? "is-past-hero" : "", open ? "is-menu-open" : ""].join(" ").trim();

  return (
    <header className={className}>
      <a className="site-header__brand" href={hrefFor("awakening", page)} aria-label="LIWA Safari, home" onClick={onBrandClick}>
        <Mark />
      </a>
      <nav className="site-header__nav" aria-label="Primary">
        {primaryNav.map((p) => (
          <a
            key={p.id}
            href={hrefFor(p.id, page)}
            aria-current={current === p.id ? (p.id === "packages" ? "page" : "true") : undefined}
            onClick={onAnchorClick}
          >
            {p.label}
          </a>
        ))}
      </nav>
      <div className="site-header__right">
        <a className="site-header__contact" href={hrefFor("visit", page)} aria-current={visitCurrent ? "true" : undefined} onClick={onAnchorClick}>
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
      <MenuOverlay open={open} page={page} current={current} toggleRef={toggleRef} onClose={close} onSelect={travel} />
    </header>
  );
}
