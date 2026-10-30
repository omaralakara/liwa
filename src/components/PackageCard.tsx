import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "./Picture";
import type { Package } from "../data/packages";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

type Props = {
  pkg: Package;
  /** The edge the photograph bleeds off; the words sit on the other side. */
  side: "left" | "right";
  /** The visitor pressed the enquire action. The page chooses the option and takes them to the form. */
  onEnquire: (pkg: Package) => void;
  /** The internal layout sample (see samplePackage): no action at all, only a note that says so. */
  sample?: boolean;
};

/** The optional fields in print order: each with its label in the list, and its name in the line that stands in for it. */
function detailsOf(pkg: Package) {
  return [
    { label: "Duration", value: pkg.duration, missing: "duration", plural: false },
    { label: "Included experiences", value: pkg.experiences?.length ? pkg.experiences : undefined, missing: "included experiences", plural: true },
    { label: "Guests", value: pkg.capacity, missing: "guest numbers", plural: true },
    { label: "Price", value: pkg.price, missing: "price", plural: false },
    { label: "Availability", value: pkg.availability, missing: "availability", plural: false },
  ];
}

/** "Duration, guest numbers and price are confirmed on enquiry." */
function pendingLine(fields: ReadonlyArray<{ missing: string; plural: boolean }>) {
  const names = fields.map((f) => f.missing);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
  const verb = fields.length > 1 || fields[0].plural ? "are" : "is";
  return `${list[0].toUpperCase()}${list.slice(1)} ${verb} confirmed on enquiry.`;
}

/**
 * One package: a large photograph bleeding off one edge, and the words offset beside it, the title
 * reaching across the photograph's inner edge. It prints every field that exists under gold
 * hairlines and folds the others into one quiet line, so an unconfirmed value never shows up as a
 * row to fill in. The same still grammar as The Land: one wipe and settle on arrival, nothing pinned.
 * The action fades with opacity only, so it is always in the tab order.
 */
export function PackageCard({ pkg, side, onEnquire, sample = false }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) return;

          const title = q(".package__title")[0] as HTMLElement;
          const media = q(".package__media")[0] as HTMLElement;
          const reveal = q(".package__window")[0] as HTMLElement;
          const wipe = insetClip(reveal, side === "left" ? { r: 100 } : { l: 100 });
          let revealed = false;

          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              // A resize after the reveal only re-splits the lines and leaves the photograph open (see PackagesHero).
              if (revealed) {
                reveal.style.clipPath = "";
                return;
              }
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                onComplete: () => {
                  revealed = true;
                },
                scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
              });
              tl.to(wipe.geo, { [side === "left" ? "r" : "l"]: 0, duration: 2.2, ease: "power3.inOut", onUpdate: wipe.apply }, 0)
                .fromTo(media, { scale: 1.1, xPercent: side === "left" ? 2 : -2 }, { scale: 1, xPercent: 0, duration: 3, ease: "power2.out" }, 0)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.9)
                .fromTo(q(".package__summary"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4 }, 1.3)
                .fromTo(q(".package__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.4)
                .fromTo(
                  q(".package__detail, .package__pending, .package__status, .package__action, .package__action-note"),
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 1.2, stagger: 0.09 },
                  1.55,
                );
              return tl;
            },
          });

          // Should the visitor ask for reduced motion midway, the photograph must not stay clipped.
          return () => {
            reveal.style.clipPath = "";
          };
        },
      );
    },
    { scope: root },
  );

  const details = detailsOf(pkg);
  const known = details.filter((d) => d.value);
  const unknown = details.filter((d) => !d.value);

  return (
    <article ref={root} id={`package-${pkg.slug}`} className={`package package--${side} gutter cols`} aria-labelledby={`package-${pkg.slug}-title`}>
      <figure className="package__figure">
        <div className="package__window">
          <div className="package__media">
            <Picture id={pkg.image} mobile={pkg.mobile} sizes="(min-width: 768px) 62vw, 100vw" position={pkg.position} style={FILL} />
          </div>
          <div className="scene__grade" aria-hidden="true" />
          <div className="package__edge" aria-hidden="true" />
          <div className="scene__grain grain" aria-hidden="true" />
        </div>
      </figure>

      <div className="package__words">
        <h3 id={`package-${pkg.slug}-title`} className="package__title display">
          {pkg.title}
        </h3>
        <div className="package__text">
          <p className="package__summary lede">{pkg.summary}</p>
          <span className="package__rule" aria-hidden="true" />

          {known.length > 0 && (
            <dl className="package__details">
              {known.map((d) => (
                <div key={d.label} className="package__detail">
                  <dt className="package__label caption">{d.label}</dt>
                  <dd className="package__value">
                    {Array.isArray(d.value) ? (
                      <ul className="package__list">
                        {d.value.map((item, i) => (
                          <li key={`${item}-${i}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {/* An example has nothing to confirm yet: the line below says so, and this one would promise details that do not exist. */}
          {pkg.status === "confirmed" && unknown.length > 0 && <p className="package__pending caption">{pendingLine(unknown)}</p>}

          {pkg.status === "example" && (
            <p className="package__status caption">
              <span className="package__ring" aria-hidden="true" />
              Example only. Details to be confirmed.
            </p>
          )}

          {sample ? (
            <p className="package__action-note caption">This sample cannot be reserved.</p>
          ) : pkg.status === "confirmed" && pkg.reservationUrl ? (
            <a className="package__action" href={pkg.reservationUrl} target="_blank" rel="noopener noreferrer">
              Reserve
              <span className="visually-hidden"> {pkg.title} (opens in a new tab)</span>
            </a>
          ) : (
            <a
              className="package__action"
              href="#enquire"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                onEnquire(pkg);
              }}
            >
              Enquire about {pkg.title}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
