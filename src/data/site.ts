// Verified facts only. Source: https://liwa.na/ (Coming Soon page), checked 2026-10-29.
// Nothing about the property, lodges, wildlife or experiences is verified; narrative copy speaks about Namibia and about intentions only.

export const site = {
  name: "LIWA Safari",
  fullName: "LIWA Safari Namibia",
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

export const chapters = [
  { id: "awakening", number: "I", title: "The Awakening", nav: "Awakening" },
  { id: "wild", number: "II", title: "Into the Wild", nav: "Wild" },
  { id: "land", number: "III", title: "The Land", nav: "Land" },
  { id: "wonder", number: "IV", title: "Moments of Wonder", nav: "Wonder" },
  { id: "vision", number: "V", title: "A New Vision", nav: "Vision" },
  { id: "beyond", number: "VI", title: "Beyond the Expected", nav: "Beyond" },
  { id: "invitation", number: "VII", title: "The Invitation", nav: "Invitation" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];
