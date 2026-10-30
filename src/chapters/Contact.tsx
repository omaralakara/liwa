import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import { SiteFooter } from "../components/SiteFooter";
import { site } from "../data/site";
import { scrollToId } from "../lib/smooth";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Contact Us.
 *
 * The practical close, and the site footer. A slim band of the dune sea from above
 * opens the chapter so even the practical page begins with the desert, then type
 * does the work: a short headline, a welcoming lede, and the two ways to reach
 * LIWA set large in Gambetta, each a working link under a gold hairline, and a third row
 * that leads back to the visit request. No form here.
 * One timeline on arrival; nothing pinned; links are never hidden with visibility
 * so they stay in the tab order.
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
    } catch {
      // Clipboard unavailable (insecure context or denied): the mailto link still works.
    }
  };

  const toVisit = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    scrollToId("visit");
    history.replaceState(null, "", "#visit");
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) {
            gsap.set(q(".contact__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const headline = q(".contact__headline")[0] as HTMLElement;
          const media = q(".contact__media")[0] as HTMLElement;
          const wipe = insetClip(q(".contact__window")[0] as HTMLElement, { r: 100 });

          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
              });
              tl.to(wipe.geo, { r: 0, duration: 2, ease: "power3.inOut", onUpdate: wipe.apply }, 0)
                .fromTo(media, { scale: 1.1, xPercent: -2 }, { scale: 1, xPercent: 0, duration: 3, ease: "power2.out" }, 0)
                .fromTo(q(".contact__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.8)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 1)
                .fromTo(q(".contact__lede"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4 }, 1.4)
                .fromTo(q(".contact__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.3, stagger: 0.2, ease: "power2.inOut" }, 1.3)
                .fromTo(
                  q(".contact__action, .contact__copy"),
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 1.2, stagger: 0.14 },
                  1.55,
                )
                .fromTo(q(".site-footer"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 2.3);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <figure className="contact__band" aria-hidden="true">
        <div className="contact__window">
          <div className="contact__media">
            <Picture id="land-aerial" sizes="100vw" position="50% 50%" style={FILL} />
          </div>
        </div>
        <div className="scene__grade" />
        <div className="contact__foot" />
        <div className="scene__grain grain" />
      </figure>

      <div className="contact__body gutter">
        <p className="contact__eyebrow scene__eyebrow caption">
          <span>Contact Us</span>
          <span>{site.fullName}</span>
        </p>

        <div className="contact__columns cols">
          <div className="contact__words">
            <h2 id="contact-title" className="contact__headline display display--h2">
              Write to us,{" "}
              <br />
              or call.
            </h2>
            <p className="contact__lede lede">
              Ask us about the safari or the resort. Press and partners, write too.
            </p>
          </div>

          <ul className="contact__actions">
            <li className="contact__item">
              <span className="contact__rule" aria-hidden="true" />
              <a className="contact__action" href={`mailto:${site.contact.email}`}>
                <span className="contact__label caption">Email</span>
                <span className="contact__value">{site.contact.email}</span>
              </a>
              <button
                type="button"
                className="contact__copy caption"
                onClick={copyEmail}
                aria-label={copied ? "Email address copied" : "Copy the email address"}
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <span className="visually-hidden" role="status">
                {copied ? "Email address copied" : ""}
              </span>
            </li>
            <li className="contact__item">
              <span className="contact__rule" aria-hidden="true" />
              <a className="contact__action" href={site.contact.phoneHref}>
                <span className="contact__label caption">Telephone</span>
                <span className="contact__value contact__value--number">{site.contact.phoneDisplay}</span>
              </a>
            </li>
            <li className="contact__item">
              <span className="contact__rule" aria-hidden="true" />
              <a className="contact__action" href="#visit" onClick={toVisit}>
                <span className="contact__label caption">Visit</span>
                <span className="contact__value">Book a visit</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <SiteFooter />
    </section>
  );
}
