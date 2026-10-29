import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

type Props = { image: ImageId; mobile?: ImageId };

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Chapter II: The Encounter.
 *
 * Opens as a dark widescreen band held tight on the oryx. The band expands to the
 * full frame while the camera pulls back, so the animal becomes small in a vast
 * plain: the scale and silence of the place is the moment. Headline lines rise
 * through masks with the pull-back, then leave as the scene dims toward Chapter III.
 */
export function Wild({ image, mobile }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
          phone: "(max-width: 767px)",
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          const media = q(".wild__media")[0] as HTMLElement;
          const headline = q(".wild__headline")[0] as HTMLElement;

          if (!motion) {
            gsap.set(q(".wild__veil, .wild__shade"), { autoAlpha: 0 });
            gsap.set(q(".wild__text, .wild__eyebrow"), { autoAlpha: 1 });
            return;
          }

          gsap.set(media, { transformOrigin: phone ? "34% 60%" : "28% 62%" });
          // The band is centred on the animal; it lives on an unscaled wrapper so the
          // camera pull-back inside it never changes the band's geometry.
          const band = insetClip(q(".wild__window")[0] as HTMLElement, phone ? { t: 42, b: 24 } : { t: 44, b: 22 });

          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: root.current,
                  start: "top top",
                  end: phone ? "+=170%" : "+=220%",
                  pin: true,
                  scrub: 0.9,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              });

              tl
                // the band opens, the camera pulls back
                .to(band.geo, { t: 0, b: 0, duration: 0.3, ease: "power2.inOut", onUpdate: band.apply }, 0)
                .fromTo(media, { scale: phone ? 1.55 : 1.7 }, { scale: 1, duration: 0.9, ease: "power1.out", immediateRender: false }, 0)
                .fromTo(q(".wild__veil"), { autoAlpha: 0.5 }, { autoAlpha: 0, duration: 0.35 }, 0)
                // words arrive with the widening view
                .fromTo(q(".wild__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.12)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 0.16, stagger: 0.05, ease: "power3.out" }, 0.3)
                .fromTo(q(".wild__body"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.46)
                // and leave as the light goes
                .to(q(".wild__text"), { yPercent: -12, autoAlpha: 0, duration: 0.14, ease: "power1.in" }, 0.8)
                .to(q(".wild__eyebrow"), { autoAlpha: 0, duration: 0.08 }, 0.8)
                .to(q(".wild__shade"), { autoAlpha: 0.88, duration: 0.18 }, 0.82)
                .to(media, { scale: 0.97, duration: 0.18, ease: "power1.in" }, 0.82);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="wild" ref={root} className="scene wild" aria-labelledby="wild-title">
      <div className="scene__stage">
        <div className="scene__window wild__window">
          <div className="scene__media wild__media">
            <Picture id={image} mobile={mobile} sizes="100vw" position="40% 60%" style={FILL} />
          </div>
        </div>
        <div className="scene__grade" aria-hidden="true" />
        <div className="scene__grain grain" aria-hidden="true" />
      </div>
      <div className="scene__scrim" aria-hidden="true" />

      <p className="scene__eyebrow wild__eyebrow caption">
        <span>Into the Wild</span>
        <span>What lives here</span>
      </p>

      <div className="scene__text wild__text">
        <h2 id="wild-title" className="scene__headline wild__headline display display--italic">
          The animals{" "}
          <br />
          set the pace.
        </h2>
        <p className="scene__body wild__body">
          Nothing in Namibia keeps to a schedule. You go out early, you wait, and when something steps into the
          light you remember why you came.
        </p>
      </div>

      <div className="scene__veil wild__veil" aria-hidden="true" />
      <div className="scene__shade wild__shade" aria-hidden="true" />
    </section>
  );
}
