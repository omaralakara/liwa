import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { lockScroll } from "../lib/smooth";
import { images, type ImageId } from "../data/assets";

export type LightboxItem = { id: ImageId; caption: string; group?: string };

type Props = {
  items: readonly LightboxItem[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Called once the closing curtain has finished; the caller unmounts the lightbox then. */
  onClose: () => void;
  /** The control that opened it: focus goes back there. */
  returnFocus: HTMLElement | null;
  /** The dialog's accessible name. */
  label?: string;
  /** A quiet line kept under every photograph. */
  note?: string;
};

/** One photograph on the stage. Several exist only during a cross-move. */
type Slide = { key: number; index: number; dir: number; decoded: boolean };

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Horizontal travel, in pixels, before a touch counts as a swipe. */
const SWIPE = 48;
/** How long a change of photograph waits for its file before moving on to the placeholder. */
const PATIENCE = 900;

function sourcesOf(id: ImageId) {
  const files = images[id].files as Record<string, string>;
  const widths = Object.keys(files)
    .map(Number)
    .sort((a, b) => a - b);
  return {
    srcSet: widths.map((w) => `${files[String(w)]} ${w}w`).join(", "),
    src: files[String(widths[widths.length - 1])],
  };
}

/**
 * The full-screen viewer: the menu's curtain, quicker (a burgundy veil leads, charcoal follows), then the
 * whole photograph on a dark stage. The next file is decoded before anything moves, so a change of
 * photograph is always a short cross-move between two finished pictures, and the words change with it.
 * The latest request wins, so rapid presses simply land on the last one. Rendered into the body, above the
 * page and the header; the page behind is locked and inert until it has closed.
 */
export function Lightbox({ items, index, onIndexChange, onClose, returnFocus, label = "Photograph viewer", note }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const curtain = useRef<gsap.core.Timeline | null>(null);
  const motion = useRef(false);
  const closing = useRef(false);
  const wordsId = useId();

  const [slides, setSlides] = useState<Slide[]>(() => [{ key: 0, index, dir: 1, decoded: false }]);
  const shown = slides[slides.length - 1];
  const item = items[shown.index];
  const total = items.length;

  // Where the visitor has asked to be (ahead of the stage while a file decodes), and what the stage holds.
  const requested = useRef(index);
  const committed = useRef(index);
  const direction = useRef(1);
  const ticket = useRef(0);
  const nextKey = useRef(1);
  const animatedKey = useRef(0);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const leaning = useRef(false);
  const swipedAt = useRef(0);

  // Decoded files, kept for as long as the viewer is open so going back is immediate.
  const files = useRef(new Map<number, { image: HTMLImageElement; ready: Promise<void>; done: boolean }>());
  const prepare = useCallback(
    (i: number) => {
      let file = files.current.get(i);
      if (!file) {
        const { srcSet, src } = sourcesOf(items[i].id);
        const image = new Image();
        image.sizes = "100vw";
        image.srcset = srcSet;
        image.src = src;
        const entry = { image, ready: Promise.resolve(), done: false };
        entry.ready = image
          .decode()
          .catch(() => undefined)
          .then(() => {
            entry.done = true;
          });
        files.current.set(i, entry);
        file = entry;
      }
      return file;
    },
    [items],
  );

  const wrap = useCallback((i: number) => ((i % total) + total) % total, [total]);

  const go = useCallback(
    (to: number, dir: number) => {
      if (closing.current || to === requested.current) return;
      requested.current = to;
      direction.current = dir;
      onIndexChange(to);
    },
    [onIndexChange],
  );
  const step = useCallback((d: number) => go(wrap(requested.current + d), d), [go, wrap]);

  // ---------- The curtain ----------

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          motion.current = (ctx.conditions as { motion: boolean }).motion;
          if (!motion.current) return;

          const first = q(".lightbox__frame")[0] as HTMLElement;
          const soft = insetClip(first, { t: 4, r: 4, b: 4, l: 4 });
          const t = gsap.timeline({ defaults: { ease: "expo.out" } });
          // The curtain: burgundy leads, charcoal follows and covers it.
          t.fromTo(q(".lightbox__veil"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.42, ease: "power3.inOut" }, 0)
            .fromTo(q(".lightbox__panel"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.42, ease: "power3.inOut" }, 0.1)
            // Then the photograph, softly, and the quieter material after it. Controls fade with opacity only.
            .fromTo(q(".lightbox__stage"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.42)
            .to(soft.geo, { t: 0, r: 0, b: 0, l: 0, duration: 0.8, onUpdate: soft.apply }, 0.42)
            .fromTo(q(".lightbox__control, .lightbox__info"), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.56);
          curtain.current = t;
          return () => {
            curtain.current = null;
            first.style.clipPath = "";
          };
        },
      );
    },
    { scope: root },
  );

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const t = curtain.current;
    if (!t || t.time() < 0.02) {
      onClose();
      return;
    }
    t.eventCallback("onReverseComplete", onClose);
    t.timeScale(2.8).reverse();
  }, [onClose]);

  // ---------- The page behind: locked and inert while open, focus handed over and back ----------

  useEffect(() => {
    const page = Array.from(document.querySelectorAll<HTMLElement>("main, .site-header, .skip-link"));
    closeButton.current?.focus({ preventScroll: true });
    page.forEach((el) => el.setAttribute("inert", ""));
    lockScroll(true);
    return () => {
      page.forEach((el) => el.removeAttribute("inert"));
      lockScroll(false);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  // ---------- Change of photograph: decode first, then commit; the newest ticket wins ----------

  useEffect(() => {
    const mine = ++ticket.current;
    if (index === committed.current) {
      // A request cancelled by going straight back: the photograph may still be leaning from a swipe.
      const slide = root.current?.querySelector<HTMLElement>(`[data-slide="${animatedKey.current}"]`);
      if (slide && gsap.getProperty(slide, "x") !== 0) gsap.to(slide, { x: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      return;
    }
    const dir = direction.current;
    const file = prepare(index);
    const commit = () => {
      if (mine !== ticket.current) return;
      ticket.current++;
      committed.current = index;
      const slide: Slide = { key: nextKey.current++, index, dir, decoded: file.done };
      // Without motion there is no cross-move: the new photograph simply replaces the last.
      setSlides((s) => (motion.current ? [...s.slice(-2), slide] : [slide]));
    };
    const patience = window.setTimeout(commit, PATIENCE);
    void file.ready.then(() => {
      window.clearTimeout(patience);
      commit();
    });
    return () => window.clearTimeout(patience);
  }, [index, prepare]);

  // Both neighbours are always on their way.
  useEffect(() => {
    prepare(wrap(shown.index + 1));
    prepare(wrap(shown.index - 1));
  }, [shown.index, prepare, wrap]);

  // The cross-move: transform and opacity only, then the old photograph leaves the page.
  useGSAP(
    () => {
      const latest = slides[slides.length - 1];
      if (latest.key === animatedKey.current) return;
      animatedKey.current = latest.key;
      const stage = root.current?.querySelector<HTMLElement>(".lightbox__stage");
      if (!stage) return;
      const incoming = stage.querySelector<HTMLElement>(`[data-slide="${latest.key}"]`);
      const outgoing = Array.from(stage.querySelectorAll<HTMLElement>("[data-slide]")).filter((el) => el !== incoming);
      if (!incoming || !outgoing.length) return;
      const travel = Math.min(56, stage.clientWidth * 0.06) * latest.dir;
      gsap.killTweensOf([incoming, ...outgoing]);
      gsap.fromTo(incoming, { x: travel, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
      outgoing.forEach((el) => {
        const key = Number(el.dataset.slide);
        gsap.to(el, {
          x: -travel,
          opacity: 0,
          duration: 0.36,
          ease: "power2.out",
          onComplete: () => setSlides((s) => s.filter((one) => one.key !== key)),
        });
      });
    },
    { scope: root, dependencies: [slides] },
  );

  // ---------- Keyboard ----------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The browser's own shortcuts are left alone: Alt and Left is Back.
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowRight":
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          step(-1);
          break;
        case "Home":
          e.preventDefault();
          go(0, -1);
          break;
        case "End":
          e.preventDefault();
          go(total - 1, 1);
          break;
        case "Enter":
        case " ":
          // The key that opened the viewer, still held down, must not press the control that now has focus.
          if (e.repeat) e.preventDefault();
          break;
        case "Tab": {
          const ring = Array.from(root.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
          if (!ring.length) break;
          const at = ring.indexOf(document.activeElement as HTMLElement);
          if (e.shiftKey && at <= 0) {
            e.preventDefault();
            ring[ring.length - 1].focus({ preventScroll: true });
          } else if (!e.shiftKey && (at === ring.length - 1 || at === -1)) {
            e.preventDefault();
            ring[0].focus({ preventScroll: true });
          }
          break;
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, go, step, total]);

  // ---------- Touch: the photograph leans with the finger, a swipe past the threshold changes it ----------

  const currentSlide = () => root.current?.querySelector<HTMLElement>(`[data-slide="${animatedKey.current}"]`) ?? null;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    // A second finger means a pinch, not a swipe.
    swipe.current = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId || !motion.current) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - s.y)) return;
    const slide = currentSlide();
    if (!slide) return;
    leaning.current = true;
    gsap.set(slide, { x: dx * 0.3 });
  };

  // Only a photograph that really leaned is brought back, and only its x: a tap in the middle of a cross-move disturbs nothing.
  const settleSlide = () => {
    if (!leaning.current) return;
    leaning.current = false;
    const slide = currentSlide();
    if (slide) gsap.to(slide, { x: 0, duration: 0.35, ease: "power3.out", overwrite: "auto" });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const zoomed = (window.visualViewport?.scale ?? 1) > 1.01;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 1.2 || zoomed) {
      settleSlide();
      return;
    }
    leaning.current = false;
    swipedAt.current = performance.now();
    step(dx < 0 ? 1 : -1);
  };

  const onPointerCancel = () => {
    swipe.current = null;
    settleSlide();
  };

  // The empty stage closes; the photograph, the controls and the words do not.
  const onBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (performance.now() - swipedAt.current < 400) return;
    if ((e.target as HTMLElement).closest(".lightbox__frame, .lightbox__control, .lightbox__info > *")) return;
    close();
  };

  return createPortal(
    <div
      ref={root}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-describedby={wordsId}
      tabIndex={-1}
      // Lenis is stopped while this is open and would swallow wheel and touch.
      data-lenis-prevent
      onClick={onBackdropClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="lightbox__veil" aria-hidden="true" />
      <div className="lightbox__panel" aria-hidden="true" />

      <div className="lightbox__inner">
        <div className="lightbox__stage">
          {slides.map((slide) => (
            <Photograph key={slide.key} slide={slide} id={items[slide.index].id} />
          ))}
        </div>

        <button type="button" className="lightbox__control lightbox__prev" aria-label="Previous photograph" onClick={() => step(-1)}>
          <svg viewBox="0 0 16 40" aria-hidden="true" focusable="false">
            <path d="M14 2 2 20l12 18" />
          </svg>
        </button>
        <button type="button" className="lightbox__control lightbox__next" aria-label="Next photograph" onClick={() => step(1)}>
          <svg viewBox="0 0 16 40" aria-hidden="true" focusable="false">
            <path d="M2 2l12 18L2 38" />
          </svg>
        </button>
        <button ref={closeButton} type="button" className="lightbox__control lightbox__close" aria-label="Close photograph" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 3l18 18M21 3 3 21" />
          </svg>
        </button>

        <div className="lightbox__info">
          <div id={wordsId} className="lightbox__words" aria-live="polite" aria-atomic="true">
            <span className="visually-hidden">{images[item.id].alt.replace(/\.$/, "")}.</span>
            <p className="lightbox__caption">{item.caption}</p>
            <p className="lightbox__meta caption">
              {item.group && <span>{item.group}</span>}
              <span>
                {shown.index + 1} of {total}
              </span>
            </p>
          </div>
          {note && <p className="lightbox__note caption">{note}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** The box is reserved at the photograph's own ratio, the blur placeholder underneath, before the file arrives. */
function Photograph({ slide, id }: { slide: Slide; id: ImageId }) {
  const asset = images[id];
  const { srcSet, src } = sourcesOf(id);
  const [loaded, setLoaded] = useState(slide.decoded);

  return (
    <div className="lightbox__slide" data-slide={slide.key}>
      <div
        className="lightbox__frame"
        style={{ "--ratio": asset.width / asset.height, backgroundImage: `url(${asset.placeholder})` } as React.CSSProperties}
      >
        <img
          className={loaded ? "is-loaded" : undefined}
          src={src}
          srcSet={srcSet}
          sizes="100vw"
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          decoding={slide.decoded ? "sync" : "async"}
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
        <div className="scene__grain grain" aria-hidden="true" />
      </div>
    </div>
  );
}
