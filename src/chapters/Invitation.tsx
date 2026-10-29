import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Mark } from "../components/Mark";
import { site } from "../data/site";

/**
 * Chapter VII: The Invitation.
 *
 * The calmest chapter. A low ember of light breathes behind the mark; the mark is
 * revealed through a mask, the closing line rises through line masks, and the host
 * line, status and contacts follow in one unhurried sequence. Played once on
 * arrival and reversed on leaving, not scrubbed.
 */
export function Invitation() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          const mark = q(".invitation__mark")[0] as HTMLElement;
          const headline = q(".invitation__headline")[0] as HTMLElement;

          if (!motion) {
            gsap.set(q(".invitation__ember"), { autoAlpha: 1 });
            return;
          }

          const reveal = insetClip(mark, { r: 100 });

          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                  trigger: root.current,
                  start: "top 55%",
                  toggleActions: "play none none reverse",
                },
              });
              tl.fromTo(q(".invitation__ember"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.4, ease: "power2.inOut" }, 0)
                .fromTo(mark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.2)
                .to(reveal.geo, { r: 0, duration: 1.4, ease: "power3.inOut", onUpdate: reveal.apply }, 0.2)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.3, stagger: 0.14 }, 0.9)
                .fromTo(q(".invitation__host"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1.1 }, 1.6)
                .fromTo(q(".invitation__contact a"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, stagger: 0.16 }, 2.25)
                .fromTo(q(".invitation__footer"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 2.9);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="invitation" ref={root} className="invitation" aria-labelledby="invitation-title">
      <div className="invitation__ember" aria-hidden="true" />
      <div className="invitation__centre">
        <Mark className="invitation__mark" />
        <h2 id="invitation-title" className="display display--h3 display--italic invitation__headline">
          Until we meet in the desert.
        </h2>
        <p className="body invitation__host">{site.fullName}. A luxury safari brand in Namibia. Write to us, or call.</p>
        <address className="invitation__contact" style={{ fontStyle: "normal" }}>
          <a className="link" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          <a className="link" href={site.contact.phoneHref}>
            {site.contact.phoneDisplay}
          </a>
        </address>
      </div>

      <footer className="invitation__footer caption">
        <span>{site.fullName}</span>
        <span className="invitation__disclosure">{site.disclosure}</span>
      </footer>
    </section>
  );
}
