import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Picture } from "../components/Picture";
import { PackageCard } from "../components/PackageCard";
import { EnquiryAlternatives, EnquiryForm } from "../components/EnquiryForm";
import { enquiryInterests, NOT_SURE, packages, samplePackage, type Package } from "../data/packages";
import { site } from "../data/site";
import type { ImageId } from "../data/assets";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { insetClip } from "../lib/clip";
import { initSmoothScroll, landOnHash, scrollToId } from "../lib/smooth";
import { getAmbience } from "../lib/ambience";

const FILL = { aspectRatio: "auto", width: "100%", height: "100%" } as const;

/** The opening photograph. Not in the Gallery, so neither page repeats the other's first impression. Its focal point lives in packages.css. */
const HERO_IMAGE: ImageId = "wild-zebra";

/** scrollToId's glide takes 1.6 s; focus moves once it has come to rest. */
const GLIDE_MS = 1650;

/**
 * The opening: The Land's composition. One monumental photograph, revealed once by a slow wipe on
 * load, and a headline half on the photograph and half on the ground below it, then a gold rule,
 * the lede and the honest note on the twelve columns.
 *
 * The header turns solid when the page's first section leaves, and here the words pass under it long
 * before they would leave. So the first section is the photograph alone, and it ends where the
 * headline begins: the bar turns solid just as the headline reaches it.
 */
function PackagesHero() {
  const plate = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(plate);
      const words = gsap.utils.selector(body);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { motion } = ctx.conditions as { motion: boolean };
          if (!motion) {
            gsap.set(q(".packages-hero__eyebrow"), { autoAlpha: 1 });
            return;
          }

          const media = q(".packages-hero__media")[0] as HTMLElement;
          const headline = words(".packages-hero__headline")[0] as HTMLElement;
          const reveal = q(".packages-hero__window")[0] as HTMLElement;
          const wipe = insetClip(reveal, { r: 100 });
          let revealed = false;

          SplitText.create(headline, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              // A resize after the reveal only re-splits the lines. Rebuilt, a finished timeline can race
              // ScrollTrigger's refresh and restart at zero with nothing left to play it, words hidden.
              // Reverting the old timeline has closed the wipe and hidden the eyebrow, so both come back here for good.
              if (revealed) {
                reveal.style.clipPath = "";
                gsap.set(q(".packages-hero__eyebrow"), { autoAlpha: 1 });
                return;
              }
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                onComplete: () => {
                  revealed = true;
                },
                scrollTrigger: { trigger: plate.current, start: "top 72%", once: true },
              });
              tl.to(wipe.geo, { r: 0, duration: 2.2, ease: "power3.inOut", onUpdate: wipe.apply }, 0)
                .fromTo(media, { scale: 1.1, xPercent: 2 }, { scale: 1, xPercent: 0, duration: 3, ease: "power2.out" }, 0)
                .fromTo(q(".packages-hero__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.9)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 1.1)
                .fromTo(words(".packages-hero__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 1.5)
                .fromTo(words(".packages-hero__lede, .packages-hero__note"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.18 }, 1.7);
              return tl;
            },
          });

          return () => {
            reveal.style.clipPath = "";
          };
        },
      );
    },
    { scope: plate },
  );

  return (
    <>
      <section ref={plate} className="packages-hero" aria-labelledby="packages-title">
        <p className="packages-hero__eyebrow scene__eyebrow caption">
          <span>Packages &amp; Experiences</span>
          <span>{site.fullName}</span>
        </p>
        <figure className="packages-hero__figure">
          <div className="packages-hero__window">
            <div className="packages-hero__media">
              {/* The upright frames crop a landscape photograph, so they draw it far wider than the screen. */}
              <Picture id={HERO_IMAGE} sizes="(max-width: 767px) 250vw, (max-width: 1100px) 150vw, 100vw" priority style={FILL} />
            </div>
            <div className="packages-hero__grade" aria-hidden="true" />
            <div className="scene__grain grain" aria-hidden="true" />
          </div>
        </figure>
      </section>

      <div ref={body} className="packages-hero__body gutter">
        <h1 id="packages-title" className="packages-hero__headline display">
          Time in the wild,{" "}
          <br />
          planned with care.
        </h1>
        <div className="packages-hero__columns cols">
          <span className="packages-hero__rule" aria-hidden="true" />
          <p className="packages-hero__lede lede">
            Every LIWA package starts from the same place: enough time to see the wild properly, and respect for it while you do.
          </p>
          <p className="packages-hero__note body">
            Our packages are being prepared. Durations, inclusions, guest numbers, prices and availability will be published here once they are
            confirmed. Until then, nothing on this page can be reserved online: an enquiry starts a conversation.
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * The packages, as alternating editorial rows. With ?preview in the address, one more row shows
 * management how a confirmed package would read, under a banner that says what it is.
 */
function PackagesList({ onEnquire, preview }: { onEnquire: (pkg: Package) => void; preview: boolean }) {
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

          let revealed = false;

          SplitText.create(q(".packages-list__title")[0] as HTMLElement, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              // A resize after the reveal only re-splits the lines (see PackagesHero).
              if (revealed) return;
              return gsap.fromTo(
                self.lines,
                { yPercent: 112 },
                {
                  yPercent: 0,
                  duration: 1.5,
                  stagger: 0.14,
                  ease: "power4.out",
                  onComplete: () => {
                    revealed = true;
                  },
                  scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
                },
              );
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="packages-list" aria-labelledby="packages-list-title">
      <div className="packages-list__head gutter cols">
        <h2 id="packages-list-title" className="packages-list__title display display--h2">
          What we are preparing.
        </h2>
      </div>

      <div className="packages-list__rows">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.slug} pkg={pkg} side={i % 2 === 0 ? "left" : "right"} onEnquire={onEnquire} />
        ))}
      </div>

      {preview && (
        <div className="packages-preview">
          <p className="packages-preview__banner" role="note">
            Internal preview. This is a layout sample, not a real package, and it cannot be booked.
          </p>
          <PackageCard pkg={samplePackage} side={packages.length % 2 === 0 ? "left" : "right"} onEnquire={onEnquire} sample />
        </div>
      )}
    </section>
  );
}

/**
 * The enquiry: the homepage's light valley and its form language. Sand paper, charcoal type, the
 * heading and the form side by side on wide screens. Submitting opens the visitor's own email app;
 * nothing here can make a booking. Form controls fade with opacity only.
 */
function PackagesEnquiry({ interest, onInterestChange }: { interest: string; onInterestChange: (value: string) => void }) {
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
            gsap.set(q(".packages-enquire__eyebrow"), { autoAlpha: 1 });
            return;
          }

          let revealed = false;

          SplitText.create(q(".packages-enquire__headline")[0] as HTMLElement, {
            type: "lines",
            mask: "lines",
            linesClass: "scene__line",
            autoSplit: true,
            onSplit: (self) => {
              // A resize after the reveal only re-splits the lines and brings the eyebrow back (see PackagesHero).
              if (revealed) {
                gsap.set(q(".packages-enquire__eyebrow"), { autoAlpha: 1 });
                return;
              }
              const tl = gsap.timeline({
                defaults: { ease: "expo.out" },
                onComplete: () => {
                  revealed = true;
                },
                scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
              });
              tl.fromTo(q(".packages-enquire__eyebrow"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.1)
                .fromTo(self.lines, { yPercent: 112 }, { yPercent: 0, duration: 1.5, stagger: 0.14, ease: "power4.out" }, 0.3)
                .fromTo(q(".packages-enquire__lede, .visit__alt"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.14 }, 0.7)
                .fromTo(q(".packages-enquire__rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.8)
                .fromTo(q(".visit__field, .visit__submit-row"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.07 }, 0.9);
              return tl;
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="enquire" ref={root} className="packages-enquire" aria-labelledby="enquire-title">
      <div className="packages-enquire__inner gutter cols">
        <div className="packages-enquire__words">
          <p className="packages-enquire__eyebrow scene__eyebrow caption">
            <span>Enquire</span>
            <span>Packages &amp; Experiences</span>
          </p>
          <h2 id="enquire-title" className="packages-enquire__headline display display--h2">
            Tell us what you are hoping for.
          </h2>
          <span className="packages-enquire__rule" aria-hidden="true" />
          <p className="packages-enquire__lede lede">We write back by email.</p>
          <EnquiryAlternatives />
        </div>

        <div className="packages-enquire__form">
          <EnquiryForm
            interests={enquiryInterests}
            interest={interest}
            onInterestChange={onInterestChange}
            subject="Package enquiry from"
            opening="I would like to know more about LIWA's packages."
            submitLabel="Send enquiry"
            restingNote="This opens your email app with the enquiry written for you. Nothing is stored on this site, and no booking is made."
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Packages & Experiences: a second page of the same film. What LIWA is preparing, with nothing
 * reserved or sold online: until management confirms real packages, every action is an enquiry that
 * ends in the visitor's own email app. The packages themselves live in src/data/packages.ts.
 */
export function PackagesPage() {
  const [interest, setInterest] = useState(NOT_SURE);
  const [preview] = useState(() => new URLSearchParams(window.location.search).has("preview"));
  const focusTimer = useRef(0);

  useEffect(() => initSmoothScroll(), []);
  useEffect(() => getAmbience().armAutoStart(), []);
  useEffect(() => landOnHash(), []);
  useEffect(() => () => window.clearTimeout(focusTimer.current), []);

  /** Choose the package in the form, glide there, then hand the keyboard to the first empty field. */
  const onEnquire = useCallback((pkg: Package) => {
    setInterest(pkg.title);
    const immediate = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollToId("enquire", { immediate });
    history.replaceState(null, "", "#enquire");

    window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(
      () => {
        const section = document.getElementById("enquire");
        // scrollToId put the keyboard's starting point on the section; if it has moved, the visitor has too.
        if (!section || document.activeElement !== section) return;
        const fields = Array.from(section.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(".visit__input"));
        const target = fields.find((f) => !f.value.trim()) ?? section.querySelector<HTMLElement>(".visit__submit");
        target?.focus({ preventScroll: true });
      },
      immediate ? 0 : GLIDE_MS,
    );
  }, []);

  return (
    <>
      <a className="skip-link" href="#enquire">
        Skip to enquiry
      </a>
      <SiteHeader page="packages" />
      <main>
        <PackagesHero />
        <PackagesList onEnquire={onEnquire} preview={preview} />
        <PackagesEnquiry interest={interest} onInterestChange={setInterest} />
      </main>
      <SiteFooter />
    </>
  );
}
