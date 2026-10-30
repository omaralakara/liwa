import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, restPoints, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import { images, type ImageId } from "../data/assets";

type Lamp = { x: number; y: number };

type Props = {
  wild: ImageId;
  wildMobile?: ImageId;
  /** Overrides the computed horizontal placement: the focal x of the landscape master (0..1). Default: the animal. */
  wildPosition?: string;
  /** Horizon row / image height (0..1) of the landscape master. */
  wildHorizon: number;
  /** The same for the portrait crop. */
  wildHorizonMobile?: number;
  /** Focal x (0..1) kept on the wild side of the frame, landscape / portrait. */
  wildFocalX?: number;
  wildFocalXMobile?: number;
  /** Mirror the wild photograph (an art-direction option when the animal sits right of centre). */
  wildFlip?: boolean;
  house: ImageId;
  houseMobile?: ImageId;
  /** Overrides the computed horizontal placement of the house (focal x, 0..1). Default: the lamp. */
  housePosition?: string;
  houseHorizon: number;
  houseHorizonMobile?: number;
  /** Percent position of the lit doorway inside the house photograph, for the glow. */
  lamp?: Lamp;
  lampMobile?: Lamp;
};

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;
const PHONE = "(max-width: 767px)";
/** House window inset-left at rest, in percent of the frame. */
const REST = { desktop: 56, phone: 50 };

type Fit = {
  /** Horizon row / image height. */
  horizon: number;
  /** Target horizon row / box height. */
  target: number;
  /** Focal x of the photograph (0..1), and where it should land, as a fraction of the frame width. */
  focalX: number;
  targetX: number;
  /** Ceiling on extra zoom (over the horizon-exact fit) spent on reaching the focal target. */
  maxZoom: number;
  flip: boolean;
  /** Left edge of the image box, as a fraction of the frame width (the house media is the right half). */
  boxLeft: number;
  boxWidth: number;
};

/**
 * Cover-fit a photograph with its horizon on the frame's horizon line.
 *
 * Object-fit cover only has vertical slack when the box is wider than the photograph, so on
 * squarer viewports object-position cannot move the horizon at all. This sizes the image box
 * itself: the smallest scale that covers the box and puts enough photograph above and below
 * the line, then a left/top offset. Layout only; GSAP owns every transform on the wrappers.
 */
function fitHorizon(img: HTMLImageElement, id: ImageId, fit: Fit) {
  const box = img.closest(".picture") as HTMLElement | null;
  if (!box) return null;
  const bw = box.clientWidth;
  const bh = box.clientHeight;
  if (!bw || !bh) return null;
  const { width: iw, height: ih } = images[id];
  const h = fit.horizon;
  const t = fit.target;
  const focal = fit.flip ? 1 - fit.focalX : fit.focalX;
  // the focal target, in box coordinates
  const tx = gsap.utils.clamp(0, 1, (fit.targetX - fit.boxLeft) / fit.boxWidth);

  const cover = Math.max(bw / iw, bh / ih);
  const above = (t * bh) / (h * ih);
  const below = ((1 - t) * bh) / ((1 - h) * ih);
  const exact = Math.max(cover, above, below);
  // extra width needed so the focal point can reach its target without exposing an edge
  const needW = bw * Math.max((1 - tx) / Math.max(1 - focal, 0.05), tx / Math.max(focal, 0.05));
  const s = Math.min(Math.max(exact, needW / iw), exact * fit.maxZoom);

  const W = iw * s;
  const H = ih * s;
  const top = gsap.utils.clamp(bh - H, 0, t * bh - h * H);
  const left = gsap.utils.clamp(bw - W, 0, tx * bw - focal * W);

  img.style.width = `${W.toFixed(2)}px`;
  img.style.height = `${H.toFixed(2)}px`;
  img.style.left = `${left.toFixed(2)}px`;
  img.style.top = `${top.toFixed(2)}px`;
  img.style.transform = fit.flip ? "scaleX(-1)" : "";
  return { W, H, left, top };
}

/** The source on screen: the portrait crop when the <picture> chose it, otherwise the master. */
function sourceOf(img: HTMLImageElement, id: ImageId, mobile?: ImageId): ImageId {
  if (mobile && img.currentSrc) {
    const files = Object.values(images[mobile].files);
    if (files.some((f) => img.currentSrc.endsWith(f))) return mobile;
  }
  return id;
}

function focalOf(position: string | undefined, fallback: number) {
  if (!position) return fallback;
  const n = parseFloat(position);
  return Number.isFinite(n) ? n / 100 : fallback;
}

/**
 * Chapter II: About LIWA. One Horizon.
 *
 * A gold hairline is drawn across the frame; the wild photograph opens out of it. One nudge of
 * the scroll slides a lamp-lit house in from the right along the same line, its lamp coming on
 * as it settles. The headline stands on the line: roman on the wild side, italic on the house
 * side. Safari and the planned resort end as two photographs sharing one horizon. Below the
 * frame, a short body says it in plain words.
 */
export function About({
  wild,
  wildMobile,
  wildPosition,
  wildHorizon,
  wildHorizonMobile,
  wildFocalX = 0.5,
  wildFocalXMobile,
  wildFlip = false,
  house,
  houseMobile,
  housePosition,
  houseHorizon,
  houseHorizonMobile,
  lamp = { x: 50, y: 60 },
  lampMobile,
}: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const frame = q(".about__frame")[0] as HTMLElement;
      const wildMedia = q(".about__wild .scene__media")[0] as HTMLElement;
      const houseMedia = q(".about__house .scene__media")[0] as HTMLElement;
      const lampEl = q(".about__lamp")[0] as HTMLElement;
      const seam = q(".about__seam")[0] as HTMLElement;
      const readHorizon = () => parseFloat(getComputedStyle(frame).getPropertyValue("--about-horizon")) / 100 || 0.58;

      // ---------- Horizon registration (every branch, motion or not) ----------
      const wildImgs = q(".scene__ghost img, .about__wild img") as HTMLImageElement[];
      const houseImg = q(".about__house img")[0] as HTMLImageElement;
      const fitAll = () => {
        const phone = window.matchMedia(PHONE).matches;
        const rest = phone ? REST.phone : REST.desktop;
        const target = readHorizon();
        const fw = frame.clientWidth || 1;

        for (const img of wildImgs) {
          const src = sourceOf(img, wild, wildMobile);
          const portrait = src !== wild;
          fitHorizon(img, src, {
            horizon: (portrait ? wildHorizonMobile : undefined) ?? wildHorizon,
            target,
            focalX: focalOf(wildPosition, (portrait ? wildFocalXMobile : undefined) ?? wildFocalX),
            targetX: phone ? 0.3 : 0.44,
            maxZoom: 1.5,
            flip: wildFlip,
            boxLeft: 0,
            boxWidth: 1,
          });
        }

        const src = sourceOf(houseImg, house, houseMobile);
        const portrait = src !== house;
        const l = (portrait ? lampMobile : undefined) ?? lamp;
        const boxLeft = houseMedia.offsetLeft / fw;
        const geo = fitHorizon(houseImg, src, {
          horizon: (portrait ? houseHorizonMobile : undefined) ?? houseHorizon,
          target,
          focalX: focalOf(housePosition, l.x / 100),
          targetX: (rest + 100) / 200, // the middle of the house panel at rest
          maxZoom: 1.25,
          flip: false,
          boxLeft,
          boxWidth: houseMedia.clientWidth / fw,
        });
        if (geo) {
          // the glow and its bloom are anchored to the doorway, wherever the fit put it
          const x = geo.left + (l.x / 100) * geo.W;
          const y = geo.top + (l.y / 100) * geo.H;
          houseMedia.style.setProperty("--lamp-x", `${x.toFixed(1)}px`);
          houseMedia.style.setProperty("--lamp-y", `${y.toFixed(1)}px`);
          gsap.set(lampEl, { transformOrigin: `${x.toFixed(1)}px ${y.toFixed(1)}px` });
        }
      };
      const imgs = [...wildImgs, houseImg];
      for (const img of imgs) img.addEventListener("load", fitAll);
      ScrollTrigger.addEventListener("refresh", fitAll);
      fitAll();

      // ---------- Motion ----------
      // Two contexts, as in the hero: the once-only entrance has no width condition, so crossing the
      // phone breakpoint (a rotation, a split view) never replays it; only the geometry-dependent
      // scrub is rebuilt when the breakpoint is crossed.
      const mm = gsap.matchMedia();
      const MOTION = { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" };
      let entrance: gsap.core.Timeline | undefined;
      let wildGeo: ReturnType<typeof insetClip> | undefined;

      // A. The entrance, once: the line is drawn, the wild opens out of it, the first words rise.
      mm.add(MOTION, (ctx) => {
        const { motion } = ctx.conditions as { motion: boolean };
        const wildWin = q(".about__wild")[0] as HTMLElement;

        if (!motion) {
          // The finished wild half, still (the house half is set by the scrub context).
          insetClip(wildWin);
          gsap.set(q(".about__horizon"), { scaleX: 1 });
          gsap.set(q(".about__eyebrow, .about__text, .about__half, .about__lede"), { autoAlpha: 1 });
          gsap.set(q(".about__veil, .about__shade"), { autoAlpha: 0 });
          return;
        }

        const horizonPct = readHorizon() * 100;
        wildGeo = insetClip(wildWin, { t: horizonPct, b: 100 - horizonPct });
        const geo = wildGeo;
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: frame, start: "top 85%", once: true },
        });
        entrance = intro;
        intro
          .fromTo(q(".about__horizon"), { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0)
          .fromTo(q(".about__veil"), { autoAlpha: 0.6 }, { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, 0)
          .to(geo.geo, { t: 0, b: 0, duration: 1.8, ease: "power3.inOut", onUpdate: geo.apply }, 0.4)
          .fromTo(wildMedia, { scale: 1.1 }, { scale: 1, duration: 2.6, ease: "power2.out" }, 0.4)
          .fromTo(q(".about__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.3);

        let wildLines: gsap.core.Tween | undefined;
        SplitText.create(q(".about__half--wild")[0], {
          type: "lines",
          mask: "lines",
          linesClass: "scene__line",
          autoSplit: true,
          onSplit: (self) => {
            wildLines?.kill();
            wildLines = gsap.fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.4, stagger: 0.14, ease: "power4.out" });
            intro.add(wildLines, 1.5);
            if (intro.progress() >= 1) wildLines.progress(1);
          },
        });

        // The body below the frame, revealed once.
        gsap
          .timeline({ scrollTrigger: { trigger: q(".about__body")[0], start: "top 80%", once: true } })
          .fromTo(q(".about__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
          .fromTo(
            q(".about__statement, .about__note"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.18, ease: "expo.out" },
            0.2,
          );

        return () => {
          entrance = undefined;
          wildGeo = undefined;
        };
      });

      // B. The pinned scrub: the house arrives along the horizon, the lamp comes on, then the cut.
      mm.add({ ...MOTION, phone: PHONE }, (ctx) => {
        const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
        const rest = phone ? REST.phone : REST.desktop;
        const houseWin = q(".about__house")[0] as HTMLElement;

        if (!motion) {
          const houseGeo = insetClip(houseWin, { l: rest });
          seam.style.left = `${houseGeo.geo.l}%`;
          gsap.set(lampEl, { autoAlpha: 1, scale: 1 });
          return;
        }

        // The horizon moves across the breakpoint (58% / 62%): an unplayed slit follows it.
        if (wildGeo && entrance && entrance.progress() === 0) {
          const h = readHorizon() * 100;
          wildGeo.geo.t = h;
          wildGeo.geo.b = 100 - h;
          wildGeo.apply();
        }

        const houseGeo = insetClip(houseWin, { l: 100 });
        const applySeam = () => {
          seam.style.left = `${houseGeo.geo.l}%`;
        };
        applySeam();
        gsap.set(lampEl, { autoAlpha: 0, scale: 0.6 });

        // Built once per breakpoint; only the house headline's line tween is swapped when SplitText re-splits.
        const rests = restPoints([0, 0.72, 1]);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: frame,
            start: "top top",
            end: phone ? "+=80%" : "+=100%",
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            snap: rests,
            onToggle: rests.sync,
            onUpdate: (self) => {
              // Once the visitor scrolls, the entrance hands the frame to the scrub.
              if (self.progress > 0.005 && entrance && entrance.progress() < 1) entrance.progress(1);
            },
          },
        });

        tl.to(houseGeo.geo, { l: rest, duration: 0.5, ease: "power2.inOut", onUpdate: () => { houseGeo.apply(); applySeam(); } }, 0)
          .fromTo(houseMedia, { xPercent: 8 }, { xPercent: 0, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 0)
          .fromTo(wildMedia, { xPercent: 0, scale: 1 }, { xPercent: -5, scale: 1.04, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 0)
          .to(lampEl, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "power2.inOut" }, 0.34)
          .fromTo(q(".about__lede"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.44)
          // the cut
          .to(q(".about__text"), { autoAlpha: 0, yPercent: -10, duration: 0.16, ease: "power1.in" }, 0.84)
          .to(q(".about__eyebrow"), { autoAlpha: 0, duration: 0.1 }, 0.84)
          .to(q(".about__shade"), { autoAlpha: 0.6, duration: 0.16 }, 0.84)
          .to(wildMedia, { scale: 1, duration: 0.16, ease: "power1.in" }, 0.84)
          .to(houseMedia, { scale: 0.97, duration: 0.16, ease: "power1.in" }, 0.84);

        let houseLines: gsap.core.Tween | undefined;
        SplitText.create(q(".about__half--house")[0], {
          type: "lines",
          mask: "lines",
          linesClass: "scene__line",
          autoSplit: true,
          onSplit: (self) => {
            houseLines?.kill();
            houseLines = gsap.fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 0.16, stagger: 0.06, ease: "power3.out" });
            tl.add(houseLines, 0.3);
          },
        });
      });

      return () => {
        for (const img of imgs) img.removeEventListener("load", fitAll);
        ScrollTrigger.removeEventListener("refresh", fitAll);
      };
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="about" aria-labelledby="about-title">
      <div className="about__frame">
        <div className="scene__ghost" aria-hidden="true">
          <Picture id={wild} mobile={wildMobile} sizes="(min-width: 768px) 150vw, 120vw" style={FILL} />
        </div>
        <div className="scene__window about__wild">
          <div className="scene__media">
            <Picture id={wild} mobile={wildMobile} sizes="(min-width: 768px) 150vw, 120vw" style={FILL} />
          </div>
        </div>
        <div className="scene__window about__house">
          <div className="scene__media">
            <Picture id={house} mobile={houseMobile} sizes="100vw" style={FILL} />
            <div className="about__lamp" aria-hidden="true" />
          </div>
        </div>
        <div className="about__seam" aria-hidden="true" />
        <div className="about__horizon" aria-hidden="true" />
        <div className="scene__grade" aria-hidden="true" />
        <div className="scene__grain grain" aria-hidden="true" />
        <div className="about__scrim" aria-hidden="true" />
        <div className="about__veil" aria-hidden="true" />

        <p className="scene__eyebrow about__eyebrow caption">
          <span>About LIWA</span>
          <span>A safari, and the plan for a resort</span>
        </p>

        <div className="about__text">
          <h2 id="about-title" className="about__headline display">
            <span className="about__half about__half--wild">
              The wild{" "}
              <br />
              comes first.
            </span>{" "}
            <span className="about__half about__half--house display--italic">
              Then a house{" "}
              <br />
              to come back to.
            </span>
          </h2>
          <p className="about__lede lede">
            LIWA is a luxury safari brand for Namibia. The days belong to the open country and its animals. The resort
            is the other half of the plan: a lamp lit when the light goes.
          </p>
        </div>

        <div className="about__shade" aria-hidden="true" />
      </div>

      <div className="about__body gutter cols">
        <span className="about__rule" aria-hidden="true" />
        <p className="about__statement lede">
          LIWA is two things that need each other. The wild you go out into in the morning, and a house to come back
          to at dusk.
        </p>
        <p className="about__note body">
          The first is already there. Namibia has been a safari country for a long time. The second is what we are
          working toward: a resort in the desert, run the way a Gulf household receives a guest.
        </p>
      </div>
    </section>
  );
}
