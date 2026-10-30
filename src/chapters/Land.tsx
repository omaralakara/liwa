import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

type Props = { image: ImageId; mobile?: ImageId; position?: string };

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Chapter IV: The Land.
 *
 * The first deliberate stillness. One monumental panorama, revealed once by a slow
 * wipe as the chapter arrives, and a headline that sits half on the photograph and
 * half on the ground below it. Nothing is pinned and nothing scrubs: the
 * composition does the work.
 */
export function Land({ image, mobile, position }: Props) {
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
            gsap.set(q(".land__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const media = q(".land__media")[0] as HTMLElement;
          const headline = q(".land__headline")[0] as HTMLElement;
          const wipe = insetClip(q(".land__window")[0] as HTMLElement, { r: 100 });

          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
              });
              tl.to(wipe.geo, { r: 0, duration: 2.2, ease: "power3.inOut", onUpdate: wipe.apply }, 0)
                .fromTo(media, { scale: 1.1, xPercent: 2 }, { scale: 1, xPercent: 0, duration: 3, ease: "power2.out" }, 0)
                .fromTo(q(".land__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.9)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 1.1)
                .fromTo(q(".land__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.5)
                .fromTo(q(".land__statement, .land__note"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.18 }, 1.7);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="land" ref={root} className="land" aria-labelledby="land-title">
      <p className="land__eyebrow scene__eyebrow caption">
        <span>The Land</span>
        <span>A country of long views</span>
      </p>
      <figure className="land__figure">
        <div className="land__window">
          <div className="land__media">
            <Picture id={image} mobile={mobile} sizes="100vw" position={position ?? "50% 55%"} style={FILL} />
          </div>
        </div>
        <div className="land__grade" aria-hidden="true" />
        <div className="scene__grain grain" aria-hidden="true" />
      </figure>

      <div className="land__body gutter">
        <h2 id="land-title" className="land__headline display display--h2">
          Older than{" "}
          <br />
          memory.
        </h2>
        <div className="land__columns cols">
          <span className="land__rule" aria-hidden="true" />
          <p className="land__statement lede">
            The Namib has been a desert for some fifty-five million years. Nothing here hurries, and after a day or
            two neither do you.
          </p>
          <p className="land__note body">
            Namibia has more sky than people. From the dunes of Sossusvlei to the Skeleton Coast and the plains of
            Etosha, it is one of the great safari countries of Africa. This is LIWA&rsquo;s country.
          </p>
        </div>
      </div>
    </section>
  );
}
