import { useRef, useState, type FormEvent } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { Picture } from "../components/Picture";
import { site } from "../data/site";
import type { ImageId } from "../data/assets";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

type Props = {
  /** The conceptual bedroom photograph; the vaulted clay room by default. */
  image?: ImageId;
  position?: string;
};

/**
 * Open a URL the way a link would. The site has no backend: a visit request is handed to the
 * visitor's own email app through a pre-filled mailto link. The optional `__mailto` array is a
 * harmless test hook: a browser harness can read the URL it would otherwise have to intercept.
 */
function navigateTo(url: string) {
  (window as Window & { __mailto?: string[] }).__mailto?.push(url);
  window.location.href = url;
}

function field(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

/**
 * Chapter VII: Book a Visit.
 *
 * The film's one light valley: sand paper, charcoal type. One screen, no scrolling inside the
 * chapter: the vaulted bedroom is a full-height panel bleeding off the left edge (dropped on
 * phones), and the invitation and a short request form sit centred on the right. Submitting
 * composes an email to LIWA in the visitor's own mail app, with the request already written;
 * nothing is stored or sent by the site. The note under the button turns into the confirmation
 * in place, so the chapter never grows after a submit. Form controls fade with opacity only, so
 * they are always in the tab order.
 */
export function Visit({ image = "beyond-interior", position = "50% 60%" }: Props) {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) {
            gsap.set(q(".visit__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const headline = q(".visit__headline")[0] as HTMLElement;
          const media = q(".visit__media")[0] as HTMLElement;
          const rise = insetClip(q(".visit__window")[0] as HTMLElement, { t: 100 });

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
              tl.to(rise.geo, { t: 0, duration: 2.2, ease: "power3.inOut", onUpdate: rise.apply }, 0)
                .fromTo(media, { scale: 1.1, yPercent: -3 }, { scale: 1, yPercent: 0, duration: 3.2, ease: "power2.out" }, 0)
                .fromTo(q(".visit__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.5)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.7)
                .fromTo(q(".visit__lede"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4 }, 1.1)
                .fromTo(q(".visit__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.2)
                .fromTo(
                  q(".visit__field, .visit__submit-row, .visit__alt"),
                  { opacity: 0, y: 12 },
                  { opacity: 1, y: 0, duration: 1.2, stagger: 0.07 },
                  1.35,
                )
                .fromTo(q(".visit__caption"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1.8);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = field(data, "name");
    const message = field(data, "message");
    const lines = [
      "Hello LIWA,",
      "",
      "I would like to come and see the country.",
      "",
      `Name: ${name}`,
      `Email: ${field(data, "email")}`,
      `When: ${field(data, "when") || "Not decided yet"}`,
      `Guests: ${field(data, "guests") || "2"}`,
      `Interest: ${field(data, "interest") || "Safari"}`,
    ];
    if (message) lines.push("", message);

    const subject = encodeURIComponent(`Visit request from ${name}`);
    const body = encodeURIComponent(lines.join("\r\n"));
    navigateTo(`mailto:${site.contact.email}?subject=${subject}&body=${body}`);
    setSent(true);
  };

  return (
    <section id="visit" ref={root} className="visit" aria-labelledby="visit-title">
      <div className="visit__inner gutter">
        <figure className="visit__figure">
          <div className="visit__window">
            <div className="visit__media">
              <Picture id={image} sizes="(min-width: 768px) 45vw, 1px" position={position} style={FILL} />
            </div>
            <div className="visit__foot" aria-hidden="true" />
          </div>
          <figcaption className="visit__caption">Clay walls, and the evening coming in.</figcaption>
        </figure>

        <div className="visit__words">
          <p className="visit__eyebrow scene__eyebrow caption">
            <span>Book a Visit</span>
            <span>A safari first, then the house</span>
          </p>

          <h2 id="visit-title" className="visit__headline display display--h2">
            Come and see{" "}
            <br />
            the country.
          </h2>
          <p className="visit__lede lede">
            <span className="visit__lede-long">
              Tell us when you would like to come and how many of you there are.{" "}
            </span>
            We write back by email.
          </p>

          <span className="visit__rule" aria-hidden="true" />

          <form className="visit__form" noValidate onSubmit={onSubmit}>
            <div className="visit__fields">
              <label className="visit__field visit__field--pair">
                <span className="visit__label caption">Name</span>
                <input className="visit__input" type="text" name="name" required autoComplete="name" />
              </label>
              <label className="visit__field visit__field--pair">
                <span className="visit__label caption">Email</span>
                <input className="visit__input" type="email" name="email" required autoComplete="email" inputMode="email" />
              </label>
              <label className="visit__field">
                <span className="visit__label caption">When</span>
                <input className="visit__input" type="text" name="when" placeholder="e.g. June 2027, or a season" />
              </label>
              <label className="visit__field">
                <span className="visit__label caption">Guests</span>
                <input className="visit__input" type="number" name="guests" min={1} max={12} defaultValue={2} inputMode="numeric" />
              </label>

              <fieldset className="visit__field visit__field--wide visit__chips">
                <legend className="visit__label visit__legend caption">Interest</legend>
                <div className="visit__chip-row">
                  <label className="visit__chip">
                    <input type="radio" name="interest" value="Safari" defaultChecked />
                    <span>Safari</span>
                  </label>
                  <label className="visit__chip">
                    <input type="radio" name="interest" value="Safari and the resort vision" />
                    <span>Safari and the resort vision</span>
                  </label>
                </div>
              </fieldset>

              <label className="visit__field visit__field--wide">
                <span className="visit__label caption">
                  Message <span className="visit__optional">(optional)</span>
                </span>
                <textarea className="visit__input visit__textarea" name="message" rows={2} />
              </label>
            </div>

            <div className="visit__submit-row">
              <button type="submit" className="visit__submit">
                Send request
              </button>
              <p className={["visit__note", "caption", sent ? "is-sent" : ""].join(" ").trim()} role="status" aria-live="polite">
                {sent ? (
                  <>
                    Your email app should open now. If it did not, write to{" "}
                    <a className="link" href={`mailto:${site.contact.email}`}>
                      {site.contact.email}
                    </a>
                    .
                  </>
                ) : (
                  "This opens your email app with the request written for you. Nothing is stored on this site."
                )}
              </p>
            </div>
          </form>

          <p className="visit__alt caption">
            Or write to{" "}
            <a className="link" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
            , or call{" "}
            <a className="link" href={site.contact.phoneHref}>
              {site.contact.phoneDisplay}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
