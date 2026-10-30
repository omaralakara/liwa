// The packages on /packages/, and the one place management's real data goes.
//
// LIWA has not confirmed a package yet, so the three below are examples: a title, a few words and
// a photograph, with nothing a visitor could take for an offer. To publish a real one, set its
// status to "confirmed" and fill in only the fields LIWA has approved. PackageCard prints the fields
// that exist and folds the rest into one quiet line, so a missing value never needs a placeholder.
// Do not write a duration, inclusion, guest number, price or date here until it is confirmed.
import type { ImageId } from "./assets";

export type Package = {
  slug: string;
  title: string;
  summary: string;
  /** The cover: licensed, listed in public/images/SOURCES.md, and never shown as LIWA's own place. */
  image: ImageId;
  /** Art-directed crop served below 768px. */
  mobile?: ImageId;
  /** object-position of the cover, e.g. "50% 40%". */
  position?: string;
  /** Everything below is published only once LIWA has confirmed it. Leave it undefined until then. */
  duration?: string;
  experiences?: string[];
  capacity?: string;
  price?: string;
  availability?: string;
  /** "example": not a real package; shows the example line and only offers an enquiry. "confirmed": real, approved by LIWA. */
  status: "example" | "confirmed";
  /** A genuine reservation link, when one exists. Only honoured when status is "confirmed". */
  reservationUrl?: string;
};

export const packages: Package[] = [
  {
    slug: "safari",
    title: "Safari",
    summary: "Days in open country, at the animals’ pace. Early starts, long silences and the patience to wait.",
    image: "gallery-rhino",
    position: "50% 58%",
    status: "example",
  },
  {
    slug: "resort",
    title: "The Resort",
    summary:
      "Time at the resort LIWA is planning, with real comfort and care for the land around it. Ask us and we will keep you informed.",
    image: "gallery-table",
    position: "50% 42%",
    status: "example",
  },
  {
    slug: "safari-and-resort",
    title: "Safari & Resort",
    summary: "The two together: the wild by day, and somewhere to come back to once the resort is open.",
    image: "gallery-dead-tree",
    position: "50% 58%",
    status: "example",
  },
];

/** The answer for a visitor who has not chosen. */
export const NOT_SURE = "Not sure yet";

/** The options of the enquiry form: every package by name, then the open answer. */
export const enquiryInterests = [...packages.map((p) => ({ value: p.title, label: p.title })), { value: NOT_SURE, label: NOT_SURE }];

/**
 * Internal review only, shown by /packages/?preview and never without it: how a package reads once
 * every field exists. Every value says it is a sample. The photograph is an abstract texture, so it
 * cannot read as a place. Status stays "example" so this can never offer a reservation.
 */
export const samplePackage: Package = {
  slug: "sample",
  title: "Sample package layout",
  summary: "Sample summary. A sentence or two about the package would sit here, once there is a real one to describe.",
  image: "gallery-weave",
  position: "100% 40%",
  duration: "Sample: 7 nights",
  experiences: ["Sample inclusion", "Sample inclusion", "Sample inclusion"],
  capacity: "Sample: 2 to 6 guests",
  price: "Sample: price on request",
  availability: "Sample: dates on request",
  status: "example",
};
