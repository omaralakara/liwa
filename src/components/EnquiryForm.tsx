import { useState, type FormEvent } from "react";
import { site } from "../data/site";

export type EnquiryInterest = { value: string; label: string };

type Props = {
  /** The interest chips. */
  interests: ReadonlyArray<EnquiryInterest>;
  /** The chosen interest, when the page sets it from outside the form. Otherwise the form keeps its own, starting on the first. */
  interest?: string;
  onInterestChange?: (value: string) => void;
  /** The email's subject, before the visitor's name: "Visit request from". */
  subject: string;
  /** The email's opening line. */
  opening: string;
  submitLabel: string;
  /** The note beside the send control, until the confirmation replaces it. */
  restingNote: string;
};

/**
 * Open a URL the way a link would. The site has no backend: a request is handed to the visitor's
 * own email app through a pre-filled mailto link. The optional `__mailto` array is a harmless test
 * hook: a browser harness reads the URL there instead, and no mail app is opened on the machine.
 */
function navigateTo(url: string) {
  const hook = (window as Window & { __mailto?: string[] }).__mailto;
  if (hook) {
    hook.push(url);
    return;
  }
  window.location.href = url;
}

function field(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

/**
 * The request form of Book a Visit and of the Packages page, in the .visit__* language of visit.css.
 *
 * Submitting composes an email to LIWA in the visitor's own mail app, with the request already
 * written; nothing is stored or sent by the site, and nothing here can book anything. The note
 * beside the button turns into the honest confirmation in place, so the page never grows after a
 * submit. The chapter around it owns the reveal: controls fade with opacity only, so they are
 * always in the tab order.
 */
export function EnquiryForm({ interests, interest, onInterestChange, subject, opening, submitLabel, restingNote }: Props) {
  const [sent, setSent] = useState(false);
  const [ownInterest, setOwnInterest] = useState(interests[0].value);
  const chosen = interest ?? ownInterest;

  const choose = (value: string) => {
    setOwnInterest(value);
    onInterestChange?.(value);
  };

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
      opening,
      "",
      `Name: ${name}`,
      `Email: ${field(data, "email")}`,
      `When: ${field(data, "when") || "Not decided yet"}`,
      `Guests: ${field(data, "guests") || "2"}`,
      `Interest: ${field(data, "interest") || interests[0].value}`,
    ];
    if (message) lines.push("", message);

    const encodedSubject = encodeURIComponent(`${subject} ${name}`);
    const body = encodeURIComponent(lines.join("\r\n"));
    navigateTo(`mailto:${site.contact.email}?subject=${encodedSubject}&body=${body}`);
    setSent(true);
  };

  return (
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
            {interests.map((option) => (
              <label key={option.value} className="visit__chip">
                <input type="radio" name="interest" value={option.value} checked={chosen === option.value} onChange={() => choose(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
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
          {submitLabel}
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
            restingNote
          )}
        </p>
      </div>
    </form>
  );
}

/** The small line that goes with the form: the two ways to reach LIWA without it. */
export function EnquiryAlternatives() {
  return (
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
  );
}
