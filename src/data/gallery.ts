// The Gallery's photographs, in viewing order: the page and the lightbox share this sequence.
// Crops, sizes on the page and focal points live in gallery.css (one rule per slot); the lightbox always shows the whole photograph.
import type { ImageId } from "./assets";

/** Which edge a photograph is uncovered towards on arrival (the insetClip side that starts closed). */
export type Wipe = "t" | "r" | "b" | "l";

type GalleryPhoto = {
  id: ImageId;
  /** The plate's name in the layout: `gallery__plate--<slot>`. */
  slot: string;
  movement: "The wild" | "The resort";
  caption: string;
  /** The width the file is really drawn at on the page: a crop or a zoom draws it wider than its window. */
  sizes: string;
  wipe: Wipe;
};

export const gallery = [
  {
    id: "gallery-quiver",
    slot: "quiver",
    movement: "The wild",
    caption: "Sundown. The trees go dark first.",
    sizes: "(min-width: 1101px) 74vw, (min-width: 768px) 82vw, 120vw",
    wipe: "l",
  },
  {
    id: "gallery-rhino",
    slot: "rhino",
    movement: "The wild",
    caption: "All that weight, and no hurry.",
    sizes: "(min-width: 768px) 32vw, 76vw",
    wipe: "t",
  },
  {
    id: "land-aerial",
    slot: "dunes",
    movement: "The wild",
    caption: "One crest catches the light. The rest wait.",
    sizes: "(min-width: 1101px) 60vw, (min-width: 768px) 90vw, 170vw",
    wipe: "b",
  },
  {
    id: "wonder-elephants",
    slot: "herd",
    movement: "The wild",
    caption: "Single file, with the calves kept close.",
    sizes: "(min-width: 1101px) 80vw, (min-width: 768px) 90vw, 170vw",
    wipe: "r",
  },
  {
    id: "gallery-dead-tree",
    slot: "tree",
    movement: "The wild",
    caption: "Long dead, and still holding its shape.",
    sizes: "(min-width: 1101px) 42vw, (min-width: 768px) 50vw, 72vw",
    wipe: "b",
  },
  {
    id: "wonder-lion",
    slot: "lion",
    movement: "The wild",
    caption: "Old scars, and the wind in his mane.",
    sizes: "(min-width: 1101px) 68vw, (min-width: 768px) 86vw, 135vw",
    wipe: "t",
  },
  {
    id: "wonder-ostriches",
    slot: "ostriches",
    movement: "The wild",
    caption: "One feeds. The other keeps watch.",
    sizes: "(min-width: 1101px) 52vw, (min-width: 768px) 70vw, 130vw",
    wipe: "r",
  },
  {
    id: "oryx-plain",
    slot: "oryx",
    movement: "The wild",
    caption: "One animal, and all this room.",
    sizes: "(min-width: 1101px) 132vw, (min-width: 768px) 180vw, 200vw",
    wipe: "b",
  },
  {
    id: "beyond-arch",
    slot: "arch",
    movement: "The resort",
    caption: "A lamp left on in the passage.",
    sizes: "(min-width: 1101px) 42vw, (min-width: 768px) 50vw, 80vw",
    wipe: "b",
  },
  {
    id: "gallery-weave",
    slot: "weave",
    movement: "The resort",
    caption: "Late light along a woven edge.",
    sizes: "(min-width: 1101px) 24vw, (min-width: 768px) 38vw, 64vw",
    wipe: "l",
  },
  {
    id: "gallery-vessel",
    slot: "vessel",
    movement: "The resort",
    caption: "Clay, lamplight, and nothing else.",
    sizes: "(min-width: 1101px) 50vw, (min-width: 768px) 58vw, 88vw",
    wipe: "t",
  },
  {
    id: "beyond-interior",
    slot: "curve",
    movement: "The resort",
    caption: "A curve of plaster, one slit of daylight.",
    sizes: "(min-width: 1101px) 66vw, (min-width: 768px) 90vw, 170vw",
    wipe: "b",
  },
  {
    id: "beyond-courtyard",
    slot: "arches",
    movement: "The resort",
    caption: "A courtyard at night, the stone still warm.",
    sizes: "(min-width: 1101px) 78vw, (min-width: 768px) 86vw, 100vw",
    wipe: "r",
  },
  {
    id: "gallery-table",
    slot: "table",
    movement: "The resort",
    caption: "A small lamp is all a table needs.",
    sizes: "(min-width: 1101px) 32vw, (min-width: 768px) 40vw, 68vw",
    wipe: "t",
  },
] as const satisfies readonly GalleryPhoto[];

export type GallerySlot = (typeof gallery)[number]["slot"];

/** The one honest line about all of it, on the page; the lightbox carries the short form. */
export const galleryNotice =
  "These photographs are illustrative. They show the character of the wild and the kind of hospitality LIWA is planning, not LIWA property, guests or animals.";
export const galleryNoticeShort = "Illustrative photograph, not LIWA property.";
