import { useRef } from "react";
import { gsap, SplitText, restPoints, useGSAP } from "../lib/gsap";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

type Props = { image: ImageId; mobile?: ImageId; dawn: ImageId };

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Chapter I as the opening of a film.
 *
 * Entrance: a dark veil lifts, warm light blooms on the crest, the landscape settles,
 * the brand rises and the headline is revealed line by line through masks.
 *
 * Scroll (pinned): the camera pushes in and the words leave; then a window in the
 * logo's own rounded-frame geometry opens onto the same landscape in full morning
 * light (a pre-graded second exposure, no runtime filters), until the sun fills the
 * frame; finally the scene dims and Chapter II follows. Fully reversible.
 */
export function Hero({ image, mobile, dawn }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      // The entrance's camera settle, handed to the scroll timeline so the two never fight.
      let settle: gsap.core.Tween | undefined;

      // ---------- Entrance ----------
      // No width condition here: a resize across the phone breakpoint must never replay the title sequence.
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };

          if (!motion) {
            // Final, legible states with no motion at all.
            gsap.set(q(".hero__veil"), { autoAlpha: 0 });
            gsap.set(q(".hero__glow"), { autoAlpha: 1 });
            gsap.set(q(".hero__frame, .hero__caption"), { autoAlpha: 0 });
            return;
          }

          const headline = q(".hero__headline")[0];
          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "hero__line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 112,
                duration: 1.5,
                ease: "power4.out",
                stagger: 0.14,
                delay: 1.0,
              }),
          });

          // Header elements live outside this component's scope, so pass elements, not selectors.
          const brand = document.querySelector(".site-header__brand");
          const headerRest = document.querySelectorAll(".site-header__nav, .site-header__contact");

          settle = gsap.fromTo(q(".hero__stage"), { scale: 1.1 }, { scale: 1, duration: 3.4, ease: "expo.out", paused: true });
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .to(q(".hero__veil"), { autoAlpha: 0, duration: 2.6, ease: "power2.inOut" }, 0)
            .add(settle, 0)
            .fromTo(q(".hero__glow"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.8, ease: "power2.inOut" }, 0.5);
          if (brand) intro.from(brand, { y: 14, autoAlpha: 0, duration: 1.4 }, 0.9);
          if (headerRest.length) intro.from(headerRest, { autoAlpha: 0, duration: 1.2 }, 1.6);
          intro
            .from(q(".hero__eyebrow"), { y: 10, autoAlpha: 0, duration: 1.1 }, 1.1)
            .from(q(".hero__lede"), { y: 16, autoAlpha: 0, duration: 1.2 }, 1.9)
            .from(q(".hero__cue"), { scaleY: 0, transformOrigin: "top center", duration: 1.1, ease: "power2.inOut" }, 2.2);

          return () => {
            settle = undefined;
          };
        },
      );

      // ---------- Scroll ----------
      // Geometry depends on the phone breakpoint, so this context is rebuilt when it is crossed.
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
          phone: "(max-width: 767px)",
        },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          if (!motion) return;

          const scroll = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: phone ? "+=120%" : "+=160%",
              pin: true,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              snap: restPoints([0, 0.8, 1]),
              onUpdate: (self) => {
                // Once the user scrolls, the entrance settle hands the stage over to the scrubbed push.
                if (self.progress > 0.002 && settle?.isActive()) settle.progress(1);
              },
            },
          });

          // The threshold: closed (a hairline at the centre), a door-sized window, then the full frame.
          // Geometry is tweened on a plain object and written to both the clip-path and the gold
          // frame on every update, so the two never drift and no CSS string interpolation is involved.
          const windowEl = q(".hero__window")[0] as HTMLElement;
          const frameEl = q(".hero__frame")[0] as HTMLElement;
          const geo = { t: 46, r: 50, b: 46, l: 50, rad: phone ? 20 : 28 };
          const door = phone ? { t: 40, r: 22, b: 36, l: 22 } : { t: 40, r: 34, b: 32, l: 34 };
          const applyGeo = () => {
            windowEl.style.clipPath = `inset(${geo.t}% ${geo.r}% ${geo.b}% ${geo.l}% round ${geo.rad}px)`;
            frameEl.style.top = `${geo.t}%`;
            frameEl.style.right = `${geo.r}%`;
            frameEl.style.bottom = `${geo.b}%`;
            frameEl.style.left = `${geo.l}%`;
            frameEl.style.borderRadius = `${geo.rad}px`;
          };
          applyGeo();

          scroll
            // camera push, words leave
            .fromTo(q(".hero__stage"), { scale: 1, yPercent: 0 }, { scale: 1.14, yPercent: -2.5, duration: 0.84, immediateRender: false }, 0)
            .to(q(".hero__text"), { yPercent: -22, autoAlpha: 0, duration: 0.34, ease: "power1.in" }, 0.02)
            .to(q(".hero__cue"), { autoAlpha: 0, duration: 0.15 }, 0)
            .to(q(".hero__scrim"), { autoAlpha: 0.35, duration: 0.4 }, 0.1)
            .fromTo(q(".hero__glow"), { autoAlpha: 1 }, { autoAlpha: 0.12, duration: 0.35, immediateRender: false }, 0.25)
            // the threshold opens: sunrise through the frame
            .to(geo, { ...door, duration: 0.16, ease: "power2.out", onUpdate: applyGeo }, 0.26)
            .to(geo, { t: 0, r: 0, b: 0, l: 0, rad: 0, duration: 0.46, ease: "power2.inOut", onUpdate: applyGeo }, 0.42)
            .fromTo(frameEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.26)
            .to(frameEl, { autoAlpha: 0, duration: 0.08 }, 0.86)
            .fromTo(q(".hero__caption"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.46)
            .to(q(".hero__caption"), { autoAlpha: 0, duration: 0.1 }, 0.8)
            // the cut to Chapter II
            .to(q(".hero__shade"), { autoAlpha: 0.55, duration: 0.16 }, 0.84)
            .fromTo(q(".hero__stage"), { scale: 1.14 }, { scale: 1.08, duration: 0.16, ease: "power1.in", immediateRender: false }, 0.84);
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="awakening" ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__photo">
          <Picture id={image} mobile={mobile} priority sizes="100vw" position="52% 58%" style={FILL} />
        </div>
        <div className="hero__window" aria-hidden="true">
          <Picture id={dawn} sizes="100vw" position="52% 58%" style={FILL} />
        </div>
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__haze" aria-hidden="true" />
        <div className="hero__grain grain" aria-hidden="true" />
        <div className="hero__frame" aria-hidden="true" />
      </div>
      <div className="hero__scrim" aria-hidden="true" />
      <p className="hero__caption caption" aria-hidden="true">
        First light.
      </p>

      <div className="hero__text">
        <p className="hero__eyebrow caption">
          <span>The Awakening</span>
          <span>Namibia, before first light</span>
        </p>
        <h1 id="hero-title" className="hero__headline display">
          Before the light,{" "}
          <br />
          the desert is already awake.
        </h1>
        <p className="hero__lede">A new luxury safari in Namibia.</p>
      </div>

      <div className="hero__cue" aria-hidden="true" />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />
    </section>
  );
}
