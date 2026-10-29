import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { chapters, site, type ChapterId } from "../data/site";
import { scrollToId } from "../lib/smooth";

function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#") || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  scrollToId(href.slice(1));
  history.replaceState(null, "", href);
}

/**
 * One slim fixed bar: the mark, the seven chapters (large screens), and the contact.
 * Transparent over the hero; a solid charcoal strip once the hero has gone.
 */
export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<ChapterId>("awakening");
  const [past, setPast] = useState(false);

  useEffect(() => {
    const sections = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as ChapterId);
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

  return (
    <header ref={ref} className={["site-header", past ? "is-past-hero" : ""].join(" ").trim()}>
      <a className="site-header__brand" href="#awakening" aria-label="LIWA Safari, back to the beginning" onClick={onAnchorClick}>
        <Mark />
      </a>
      <nav className="site-header__nav" aria-label="Chapters">
        {chapters.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-current={active === c.id ? "true" : undefined}
            aria-label={`Chapter ${c.number}, ${c.title}`}
            onClick={onAnchorClick}
          >
            {c.nav}
          </a>
        ))}
      </nav>
      <a className="site-header__contact link" href={`mailto:${site.contact.email}`}>
        {site.contact.email}
      </a>
    </header>
  );
}
