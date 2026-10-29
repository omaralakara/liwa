import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, restPoints, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

type Props = { image: ImageId; mobile?: ImageId };

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Chapter V: A New Vision.
 *
 * The signature transition. Out of the dark, a tall doorway with a rounded
 * architectural arch opens onto the lamp-lit pavilion; the arch widens until the
 * vision fills the frame while the camera drifts closer and the lamplight warms.
 * The photography is illustrative of the proposed experience; the one disclosure
 * for all illustrative imagery lives in the closing chapter.
 */
export function Vision({ image, mobile }: Props) {
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
          const media = q(".vision__media")[0] as HTMLElement;
          const arch = q(".vision__arch")[0] as HTMLElement;
          const headline = q(".vision__headline")[0] as HTMLElement;

          if (!motion) {
            gsap.set(q(".vision__shade"), { autoAlpha: 0 });
            gsap.set(arch, { autoAlpha: 0 });
            gsap.set(q(".vision__glow, .vision__text, .vision__eyebrow"), { autoAlpha: 1 });
            return;
          }

          // Doorway geometry: a tall opening standing on the ground, semicircular top.
          const door = phone ? { t: 22, r: 30, b: 0, l: 30 } : { t: 14, r: 38, b: 0, l: 38 };
          // Clip on the unscaled wrapper; the camera drift happens on the media inside it.
          const win = insetClip(q(".vision__window")[0] as HTMLElement, { ...door, rt: 1 }, arch);
          let stageWidth = root.current?.clientWidth ?? window.innerWidth;
          const applyArch = () => {
            // Top radius is half the opening's width, so the top is always a true half-circle.
            win.geo.rt = Math.max(0, (stageWidth * (100 - win.geo.l - win.geo.r)) / 200) * win.geo.t / door.t;
            win.apply();
          };
          applyArch();

          // Built once; only the headline's line tween is replaced on a re-split (see Wild).
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: phone ? "+=200%" : "+=240%",
              pin: true,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              snap: restPoints([0, 0.8, 1]),
              onRefresh: () => {
                stageWidth = root.current?.clientWidth ?? window.innerWidth;
                applyArch();
              },
            },
          });

          tl
            // the doorway appears and opens
            .fromTo(q(".vision__eyebrow"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.02)
            .fromTo(arch, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.02)
            .fromTo(media, { scale: 1.22, yPercent: 2 }, { scale: 1, yPercent: 0, duration: 0.8, ease: "power1.out", immediateRender: false }, 0)
            .to(win.geo, { t: 0, r: 0, b: 0, l: 0, duration: 0.5, ease: "power2.inOut", onUpdate: applyArch }, 0.14)
            .to(arch, { autoAlpha: 0, duration: 0.06 }, 0.62)
            // lamplight warms as we enter
            .fromTo(q(".vision__glow"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.2)
            // the words of intention
            .fromTo(q(".vision__lede"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.68)
            .to(q(".vision__text"), { yPercent: -10, autoAlpha: 0, duration: 0.12, ease: "power1.in" }, 0.86)
            .to(q(".vision__eyebrow"), { autoAlpha: 0, duration: 0.08 }, 0.86)
            // settle into the dark for the invitation
            .to(q(".vision__shade"), { autoAlpha: 0.9, duration: 0.14 }, 0.86)
            .to(media, { scale: 0.98, duration: 0.14, ease: "power1.in" }, 0.86);

          let lines: gsap.core.Tween | undefined;
          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              lines?.kill();
              lines = gsap.fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 0.14, stagger: 0.05, ease: "power3.out" });
              tl.add(lines, 0.56);
            },
          });

          return () => ScrollTrigger.refresh();
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="vision" ref={root} className="scene vision" aria-labelledby="vision-title">
      <div className="scene__stage">
        <div className="scene__window vision__window">
          <div className="scene__media vision__media">
            <Picture id={image} mobile={mobile} sizes="100vw" position="50% 82%" style={FILL} />
          </div>
        </div>
        <div className="vision__glow" aria-hidden="true" />
        <div className="scene__grain grain" aria-hidden="true" />
        <div className="vision__arch" aria-hidden="true" />
      </div>
      <div className="scene__scrim scene__scrim--centre" aria-hidden="true" />

      <p className="scene__eyebrow vision__eyebrow caption">
        <span>A New Vision</span>
        <span>As the lamps are lit</span>
      </p>

      <div className="scene__text scene__text--centre vision__text">
        <h2 id="vision-title" className="scene__headline vision__headline display">
          Somewhere to{" "}
          <br />
          come back to.
        </h2>
        <p className="lede vision__lede">
          Somewhere to stay in the Namibian wilderness, run with the kind of welcome you find in the Gulf, where a
          guest is looked after before they think to ask.
        </p>
      </div>

      <div className="scene__shade vision__shade" aria-hidden="true" />
    </section>
  );
}
