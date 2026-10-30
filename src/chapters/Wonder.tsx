import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import type { ImageId } from "../data/assets";

export type Moment = { id: ImageId; caption: string; position?: string };

type Props = { moments: [Moment, Moment, Moment, Moment, Moment] };

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/**
 * Moments of Wonder.
 *
 * Four full-bleed moments in the same film language as the rest of the site:
 * a wide frame, a diptych (a detail beside an animal), a second wide frame, and a closing frame that
 * carries the chapter's one line. Every frame is uncovered once as it arrives and
 * the camera drifts a little as the page moves. Nothing is pinned.
 */
export function Wonder({ moments }: Props) {
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
          if (!motion) {
            gsap.set(q(".wonder__eyebrow, .wonder__text"), { autoAlpha: 1 });
            return;
          }

          gsap.fromTo(
            q(".wonder__eyebrow"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 60%", once: true } },
          );

          (q(".wonder__frame") as HTMLElement[]).forEach((frame) => {
            const win = frame.querySelector(".wonder__window") as HTMLElement;
            const media = frame.querySelector(".wonder__media") as HTMLElement;
            const text = frame.querySelector(".wonder__text") as HTMLElement | null;
            const reveal = insetClip(win, { b: 100 });

            const tl = gsap.timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: frame, start: "top 78%", once: true } });
            tl.to(reveal.geo, { b: 0, duration: 1.8, ease: "power3.inOut", onUpdate: reveal.apply }, 0).fromTo(
              media,
              { scale: 1.12 },
              { scale: 1, duration: 2.6, ease: "power2.out" },
              0,
            );
            if (text) {
              const statement = text.querySelector(".wonder__statement") as HTMLElement | null;
              if (statement) {
                SplitText.create(statement, {
                  type: "lines",
                  mask: "lines",
                  linesClass: "scene__line",
                  autoSplit: true,
                  onSplit: (self) =>
                    gsap.fromTo(
                      self.lines,
                      { yPercent: 112 },
                      { yPercent: 0, duration: 1.4, stagger: 0.12, ease: "power4.out", scrollTrigger: { trigger: frame, start: "top 45%", once: true } },
                    ),
                });
              }
              tl.fromTo(text, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.9);
            }

            // The camera drifts: a slow vertical parallax on the media, inside the clipped frame.
            gsap.fromTo(
              media,
              { yPercent: phone ? -3 : -4.5 },
              { yPercent: phone ? 3 : 4.5, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 1.1 } },
            );
          });
        },
      );
    },
    { scope: root },
  );

  const [wide, detail, animal, plain, closing] = moments;

  return (
    <section id="wonder" ref={root} className="wonder" aria-labelledby="wonder-title">
      <h2 id="wonder-title" className="visually-hidden">
        Moments of Wonder
      </h2>
      <p className="wonder__eyebrow scene__eyebrow caption">
        <span>Moments of Wonder</span>
        <span>On safari, looking closer</span>
      </p>

      <Frame m={wide} kind="wide" sizes="100vw" />

      <div className="wonder__pair">
        <Frame m={detail} kind="detail" sizes="(min-width: 768px) 40vw, 100vw" />
        <Frame m={animal} kind="animal" sizes="(min-width: 768px) 60vw, 100vw" />
      </div>

      <Frame m={plain} kind="wide" sizes="100vw" />

      <Frame m={closing} kind="closing" sizes="100vw">
        <p className="wonder__statement display display--h3 display--italic">You come for the big animals. You remember the small things.</p>
      </Frame>
    </section>
  );
}

function Frame({ m, kind, sizes, children }: { m: Moment; kind: string; sizes: string; children?: ReactNode }) {
  return (
    <figure className={`wonder__frame wonder__frame--${kind}`}>
      <div className="wonder__window">
        <div className="wonder__media">
          <Picture id={m.id} sizes={sizes} position={m.position} style={FILL} />
        </div>
        <div className="scene__grade" aria-hidden="true" />
        <div className="scene__grain grain" aria-hidden="true" />
      </div>
      <div className="wonder__scrim" aria-hidden="true" />
      <figcaption className="wonder__text">
        {children}
        <span className="wonder__caption">{m.caption}</span>
      </figcaption>
    </figure>
  );
}
