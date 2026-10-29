import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

type Props = {
  image: ImageId;
  detail: ImageId;
  position?: string;
  detailPosition?: string;
};

/**
 * Chapter VI: Beyond the Expected.
 *
 * The page turns to light. On a warm sand ground: one tall architectural
 * photograph, an oversized serif headline, a smaller photographic detail tucked
 * under it, and a short paragraph. Revealed once; otherwise completely still.
 * Expensive because of the composition, not the motion.
 */
export function Beyond({ image, detail, position, detailPosition }: Props) {
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
            gsap.set(q(".beyond__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const headline = q(".beyond__headline")[0] as HTMLElement;
          const main = insetClip(q(".beyond__main .beyond__window")[0] as HTMLElement, { t: 100 });
          const small = insetClip(q(".beyond__detail .beyond__window")[0] as HTMLElement, { b: 100 });

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
              tl.to(main.geo, { t: 0, duration: 2, ease: "power3.inOut", onUpdate: main.apply }, 0)
                .fromTo(q(".beyond__main .beyond__media"), { scale: 1.12, yPercent: -4 }, { scale: 1, yPercent: 0, duration: 3, ease: "power2.out" }, 0)
                .fromTo(q(".beyond__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.7)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.9)
                .to(small.geo, { b: 0, duration: 1.6, ease: "power3.inOut", onUpdate: small.apply }, 1.4)
                .fromTo(q(".beyond__detail .beyond__media"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 1.4)
                .fromTo(q(".beyond__text"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.4 }, 1.9);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="beyond" ref={root} className="beyond" aria-labelledby="beyond-title">
      <div className="beyond__inner gutter">
        <figure className="beyond__figure beyond__main">
          <div className="beyond__window">
            <div className="beyond__media">
              <Picture id={image} sizes="(min-width: 768px) 56vw, 100vw" position={position} style={FILL} />
            </div>
          </div>
        </figure>

        <div className="beyond__column">
          <p className="beyond__eyebrow scene__eyebrow caption">
            <span>Beyond the Expected</span>
            <span>Hospitality, the old way</span>
          </p>
          <h2 id="beyond-title" className="beyond__headline display display--h2">
            Beyond the{" "}
            <br />
            expected.
          </h2>

          <figure className="beyond__figure beyond__detail">
            <div className="beyond__window">
              <div className="beyond__media">
                <Picture id={detail} sizes="(min-width: 768px) 24vw, 62vw" position={detailPosition} style={FILL} />
              </div>
            </div>
          </figure>

          <div className="beyond__text">
            <p className="lede">
              In the Gulf, hospitality is older than hotels. A guest is given shade, water and coffee before anyone
              asks their name. That is the standard LIWA measures itself against.
            </p>
            <p className="body beyond__note">
              Built from natural materials, with deep shade and nothing you do not need.
            </p>
            <p className="body beyond__note">
              LIWA Safari is a luxury safari brand for Namibia: Arabian hospitality in the oldest desert on earth, with
              the privacy, the quiet and the attention to detail a luxury safari should have.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
