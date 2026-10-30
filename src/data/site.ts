// Verified facts only. Source: https://liwa.na/ (contact page), checked 2026-10-29.
// Nothing about the property, lodges, wildlife or experiences is verified; narrative copy speaks about Namibia and about intentions only.

export const site = {
  name: "LIWA Safari",
  fullName: "LIWA Safari Namibia",
  /** The brand descriptor: safari today, a resort as the stated vision. Never implies the resort operates. */
  descriptor: "Safari & Resort Vision",
  country: "Namibia",
  contact: {
    email: "info@liwa.na",
    phoneDisplay: "+264 85 111 1777",
    phoneHref: "tel:+264851111777",
    whatsappHref: "https://wa.me/264851111777",
    website: "https://liwa.na",
  },
  /** The one discreet disclosure for all illustrative photography; shown once, in the closing chapter. */
  disclosure: "Imagery is illustrative of the proposed experience.",
  year: 2026,
} as const;

/** The nine content areas, in page order. `nav` is the short label used in secondary chapter lists. */
export const chapters = [
  { id: "awakening", number: "I", title: "The Awakening", nav: "Awakening" },
  { id: "about", number: "II", title: "About LIWA", nav: "About" },
  { id: "wild", number: "III", title: "Into the Wild", nav: "Wild" },
  { id: "land", number: "IV", title: "The Land", nav: "Land" },
  { id: "wonder", number: "V", title: "Moments of Wonder", nav: "Wonder" },
  { id: "vision", number: "VI", title: "A New Vision", nav: "Vision" },
  { id: "visit", number: "VII", title: "Book a Visit", nav: "Visit" },
  { id: "invitation", number: "VIII", title: "The Invitation", nav: "Invitation" },
  { id: "contact", number: "IX", title: "Contact Us", nav: "Contact" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/**
 * Primary navigation: five clear paths (header on desktop, the menu overlay everywhere).
 * The cinematic chapters stay reachable through the secondary list in the menu.
 */
export const primaryNav: ReadonlyArray<{ id: ChapterId; label: string; hint: string }> = [
  { id: "awakening", label: "Home", hint: "The Awakening" },
  { id: "about", label: "About LIWA", hint: "Safari and resort vision" },
  { id: "wild", label: "Safari", hint: "Into the Wild" },
  { id: "vision", label: "The Resort Vision", hint: "A New Vision" },
  { id: "contact", label: "Contact Us", hint: "Write to us, or call" },
];

/** Chapters that are not already in the primary navigation. */
export const secondaryNav = chapters.filter((c) => !primaryNav.some((p) => p.id === c.id));
