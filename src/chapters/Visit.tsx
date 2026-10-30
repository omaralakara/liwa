import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import { EnquiryAlternatives, EnquiryForm } from "../components/EnquiryForm";
import type { ImageId } from "../data/assets";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

const INTERESTS = [
  { value: "Safari", label: "Safari" },
  { value: "Safari, and news of the resort", label: "Safari, and news of the resort" },
];

type Props = {
  /** The conceptual bedroom photograph; the vaulted clay room by default. */
  image?: ImageId;
  position?: string;
};

/**
 * Book a Visit (under the Beyond the Expected eyebrow).
 *
 * The film's one light valley: sand paper, charcoal type. One screen, no scrolling inside the
 * chapter: the vaulted bedroom is a full-height panel bleeding off the left edge (dropped on
 * phones), and the invitation and a short request form sit centred on the right. Submitting
 * composes an email to LIWA in the visitor's own mail app, with the request already written;
 * nothing is stored or sent by the site. The note under the button turns into the confirmation
 * in place, so the chapter never grows after a submit. Form controls fade with opacity only, so
 * they are always in the tab order.
 */
export function Visit({ image = "beyond-interior", position = "50% 60%" }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) {
            gsap.set(q(".visit__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const headline = q(".visit__headline")[0] as HTMLElement;
          const media = q(".visit__media")[0] as HTMLElement;
          const rise = insetClip(q(".visit__window")[0] as HTMLElement, { t: 100 });

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
              tl.to(rise.geo, { t: 0, duration: 2.2, ease: "power3.inOut", onUpdate: rise.apply }, 0)
                .fromTo(media, { scale: 1.1, yPercent: -3 }, { scale: 1, yPercent: 0, duration: 3.2, ease: "power2.out" }, 0)
                .fromTo(q(".visit__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.5)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.7)
                .fromTo(q(".visit__lede"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4 }, 1.1)
                .fromTo(q(".visit__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.2)
                .fromTo(
                  q(".visit__field, .visit__submit-row, .visit__alt"),
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 1.2, stagger: 0.07 },
                  1.35,
                )
                .fromTo(q(".visit__caption"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.8);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="visit" ref={root} className="visit" aria-labelledby="visit-title">
      <div className="visit__inner gutter">
        <figure className="visit__figure">
          <div className="visit__window">
            <div className="visit__media">
              <Picture id={image} sizes="(min-width: 768px) 45vw, 1px" position={position} style={FILL} />
            </div>
            <div className="visit__foot" aria-hidden="true" />
          </div>
          <figcaption className="visit__caption">Clay walls, and the evening coming in.</figcaption>
        </figure>

        <div className="visit__words">
          <p className="visit__eyebrow scene__eyebrow caption">
            <span>Beyond the Expected</span>
            <span>Book a visit</span>
          </p>

          <h2 id="visit-title" className="visit__headline display display--h2">
            Begin with{" "}
            <br />
            a conversation.
          </h2>
          <p className="visit__lede lede">
            <span className="visit__lede-long">
              Tell us when you would like to come and how many of you there are.{" "}
            </span>
            We write back by email.
          </p>

          <span className="visit__rule" aria-hidden="true" />

          <EnquiryForm
            interests={INTERESTS}
            subject="Visit request from"
            opening="I would like to plan a visit with LIWA."
            submitLabel="Send request"
            restingNote="This opens your email app with the request written for you. Nothing is stored on this site."
          />

          <EnquiryAlternatives />
        </div>
      </div>
    </section>
  );
}
