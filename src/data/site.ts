// Verified facts only. Source: https://liwa.na/ (contact page), checked 2026-10-29.
// Nothing about the property, lodges, wildlife or experiences is verified; narrative copy speaks about Namibia, about values and about intentions only.

export const site = {
  name: "LIWA Safari",
  fullName: "LIWA Safari Namibia",
  /** The brand line: what LIWA stands for. Never implies the resort already operates. */
  descriptor: "Safari, Resort & Preservation",
  country: "Namibia",
  contact: {
    email: "info@liwa.na",
    phoneDisplay: "+264 85 111 1777",
    phoneHref: "tel:+264851111777",
    whatsappHref: "https://wa.me/264851111777",
    website: "https://liwa.na",
  },
  /** The discreet disclosure for all illustrative photography, in the footer of every page. */
  disclosure: "Photographs are illustrative and do not show LIWA property.",
  /** The designer's credit, in the footer of every page. */
  credit: { name: "Synergi", href: "https://synergibpo.com/" },
  year: 2026,
} as const;

/** The content areas of the homepage, in page order. */
export const chapters = [
  { id: "awakening", title: "The Awakening" },
  { id: "about", title: "About LIWA" },
  { id: "wild", title: "Into the Wild" },
  { id: "land", title: "The Land" },
  { id: "wonder", title: "Moments of Wonder" },
  { id: "resort", title: "The Resort" },
  { id: "gallery", title: "Gallery" },
  { id: "visit", title: "Book a Visit" },
  { id: "invitation", title: "The Invitation" },
  { id: "contact", title: "Contact Us" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/** The two pages of the site. */
export type Page = "home" | "packages";

/** Everything the navigation can lead to: a homepage chapter, or the Packages page. */
export type NavId = ChapterId | "packages";

export const PACKAGES_PATH = "/packages/";

/** Primary navigation, in the same order in the header and in the menu overlay. */
export const primaryNav: ReadonlyArray<{ id: NavId; label: string }> = [
  { id: "awakening", label: "Home" },
  { id: "about", label: "About" },
  { id: "wild", label: "Safari" },
  { id: "resort", label: "Resort" },
  { id: "gallery", label: "Gallery" },
  { id: "packages", label: "Packages" },
  { id: "contact", label: "Contact" },
];

/** Chapters that are not already in the primary navigation. */
export const secondaryNav = chapters.filter((c) => !primaryNav.some((p) => p.id === c.id));

/** True when a path is a chapter of the page the visitor is on, so the link can glide there instead of loading a page. */
export function isInPage(id: NavId, page: Page) {
  return page === "home" && id !== "packages";
}

/** The address of a path as seen from a page. From the Packages page, chapters link back to the homepage. */
export function hrefFor(id: NavId, page: Page) {
  if (id === "packages") return PACKAGES_PATH;
  if (page === "home") return `#${id}`;
  return id === "awakening" ? "/" : `/#${id}`;
}
