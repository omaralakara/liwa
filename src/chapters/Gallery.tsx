import { useCallback, useRef, useState, type MouseEvent } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip, type InsetGeo } from "../lib/clip";
import { Picture } from "../components/Picture";
import { Lightbox, type LightboxItem } from "../components/Lightbox";
import { images } from "../data/assets";
import { gallery, galleryNotice, galleryNoticeShort, type GallerySlot, type Wipe } from "../data/gallery";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

const CLOSED: Record<Wipe, Partial<InsetGeo>> = {
  t: { t: 100 },
  r: { r: 100 },
  b: { b: 100 },
  l: { l: 100 },
};

const SPLIT = { type: "lines", mask: "lines", linesClass: "scene__line", autoSplit: true } as const;

const items: LightboxItem[] = gallery.map((p) => ({ id: p.id, caption: p.caption, group: p.movement }));

/**
 * The Gallery.
 *
 * The film holds still for a while: a spread from a printed campaign, laid out on the charcoal ground in
 * two movements, The wild and The resort. Photographs of very different sizes sit on the 12-column grid.
 * Some leave the page, a portrait lies over a landscape's corner at each end of the sequence, and the empty
 * columns are part of the layout. Each photograph is uncovered once as it arrives and the one full-bleed
 * frame drifts; nothing is pinned. Any photograph opens whole in the lightbox, in the same order.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null);
  const [viewing, setViewing] = useState<{ index: number; opener: HTMLElement } | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) {
            gsap.set(q(".gallery__eyebrow"), { autoAlpha: 1 });
            return;
          }

          SplitText.create(q(".gallery__headline")[0] as HTMLElement, {
            ...SPLIT,
            onSplit: (self) => {
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
              });
              tl.fromTo(q(".gallery__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.15)
                .fromTo(q(".gallery__note"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 }, 0.9);
              return tl;
            },
          });

          (q(".gallery__title, .gallery__line") as HTMLElement[]).forEach((el) => {
            SplitText.create(el, {
              ...SPLIT,
              // A paragraph cannot carry a label, so its lines simply stay readable as they are.
              aria: el.tagName === "P" ? "none" : "auto",
              onSplit: (self) =>
                gsap.fromTo(
                  self.lines,
                  { yPercent: 112 },
                  { yPercent: 0, duration: 1.5, stagger: 0.12, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } },
                ),
            });
          });

          const windows = q(".gallery__window") as HTMLElement[];
          (q(".gallery__plate") as HTMLElement[]).forEach((plate) => {
            const win = plate.querySelector(".gallery__window") as HTMLElement;
            const media = plate.querySelector(".gallery__media") as HTMLElement;
            const caption = plate.querySelector(".gallery__caption") as HTMLElement;
            const reveal = insetClip(win, CLOSED[plate.dataset.wipe as Wipe]);

            gsap
              .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: plate, start: "top 84%", once: true } })
              .to(reveal.geo, { t: 0, r: 0, b: 0, l: 0, duration: 1.9, ease: "power3.inOut", onUpdate: reveal.apply }, 0)
              .fromTo(media, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: "power2.out" }, 0)
              .fromTo(caption, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1 }, 1.15);
          });

          // The one breath in the sequence drifts a little as the page moves, inside its clipped frame.
          const breath = q(".gallery__plate--oryx")[0] as HTMLElement;
          gsap.fromTo(
            breath.querySelector(".gallery__media"),
            { yPercent: -4 },
            { yPercent: 4, ease: "none", scrollTrigger: { trigger: breath, start: "top bottom", end: "bottom top", scrub: 1.1 } },
          );

          return () => windows.forEach((win) => (win.style.clipPath = ""));
        },
      );
    },
    { scope: root },
  );

  const open = (index: number) => (e: MouseEvent<HTMLButtonElement>) => setViewing({ index, opener: e.currentTarget });
  const changeTo = useCallback((index: number) => setViewing((v) => v && { ...v, index }), []);
  const close = useCallback(() => setViewing(null), []);

  const place = (slot: GallerySlot) => <Plate slot={slot} open={open} />;

  return (
    <section id="gallery" ref={root} className="gallery" aria-labelledby="gallery-title">
      <p className="gallery__eyebrow scene__eyebrow caption">
        <span>Gallery</span>
        <span>Safari and resort, in stills</span>
      </p>

      <header className="gallery__head cols gutter">
        <h2 id="gallery-title" className="gallery__headline display display--h2">
          Some things are worth{" "}
          <br />
          holding still.
        </h2>
        <p className="gallery__note caption">Illustrative photographs. Select one to see it full screen.</p>
      </header>

      {/* The wild: from the sundown to the plain */}
      <div className="gallery__spread cols gutter">
        <h3 className="gallery__title gallery__title--wild display display--italic">The wild</h3>
        {place("quiver")}
        {place("rhino")}
      </div>

      <div className="gallery__spread gallery__spread--dunes cols gutter">
        {place("dunes")}
        <p className="gallery__line gallery__line--wild display display--h3 display--italic">Nothing out here is arranged for you.</p>
      </div>

      <div className="gallery__spread cols gutter">{place("herd")}</div>

      <div className="gallery__spread cols gutter">
        {place("tree")}
        {place("lion")}
      </div>

      <div className="gallery__spread gallery__spread--ostriches cols gutter">{place("ostriches")}</div>

      <div className="gallery__spread cols gutter">{place("oryx")}</div>

      {/* The resort: material, light and calm, from late afternoon into the night */}
      <div className="gallery__spread gallery__spread--resort cols gutter">
        <h3 className="gallery__title gallery__title--resort display display--italic">The resort</h3>
        {place("arch")}
        {place("weave")}
      </div>

      <div className="gallery__spread gallery__spread--vessel cols gutter">
        <p className="gallery__line gallery__line--resort display display--h3 display--italic">After the wild, you want very little, done well.</p>
        {place("vessel")}
        {place("curve")}
      </div>

      <div className="gallery__spread cols gutter">
        {place("arches")}
        {place("table")}
        <p className="gallery__notice caption">{galleryNotice}</p>
      </div>

      {viewing && (
        <Lightbox
          items={items}
          index={viewing.index}
          onIndexChange={changeTo}
          onClose={close}
          returnFocus={viewing.opener}
          label="Gallery photograph"
          note={galleryNoticeShort}
        />
      )}
    </section>
  );
}

/**
 * One photograph. The button lies over the window (a button may not hold the picture's block markup), so
 * it carries the name; the picture beneath is hidden from assistive technology to avoid saying it twice.
 * The caption is always visible and sits outside the button, in the empty space the layout gives it.
 */
function Plate({ slot, open }: { slot: GallerySlot; open: (index: number) => (e: MouseEvent<HTMLButtonElement>) => void }) {
  const index = gallery.findIndex((p) => p.slot === slot);
  const photo = gallery[index];

  return (
    <figure className={`gallery__plate gallery__plate--${slot}`} data-wipe={photo.wipe}>
      <div className="gallery__frame">
        <button type="button" className="gallery__open" aria-label={`View photograph: ${images[photo.id].alt}`} onClick={open(index)} />
        <div className="gallery__window" aria-hidden="true">
          <div className="gallery__media">
            <Picture id={photo.id} sizes={photo.sizes} style={FILL} />
          </div>
          <div className="gallery__grade" />
          <div className="scene__grain grain" />
        </div>
      </div>
      <figcaption className="gallery__caption caption">{photo.caption}</figcaption>
    </figure>
  );
}
