// Which photograph plays each chapter. Swap ids here; assets.ts is generated.
import type { ImageId } from "./assets";
import type { Moment } from "../chapters/Wonder";

type Role = { id: ImageId; mobile?: ImageId; position?: string };

export const cast: Record<"awakening" | "wild" | "land" | "vision", Role> & {
  wonder: [Moment, Moment, Moment, Moment, Moment];
} = {
  awakening: { id: "dune-dusk", mobile: "dune-dusk-portrait", position: "52% 55%" },
  wild: { id: "oryx-plain", mobile: "oryx-plain-portrait", position: "50% 60%" },
  land: { id: "land-aerial", mobile: "land-aerial-portrait", position: "50% 50%" },
  wonder: [
    { id: "wonder-elephants", caption: "A family on the move, early, before the heat.", position: "50% 62%" },
    { id: "wonder-ripples", caption: "What the wind did overnight.", position: "50% 50%" },
    { id: "wonder-lion", caption: "He walks past without a glance.", position: "42% 50%" },
    { id: "wild-zebra", caption: "A mare and her foal, lit from the side at the end of the day.", position: "55% 50%" },
    { id: "wonder-ostriches", caption: "Two ostriches, and the dust the wind brought in.", position: "50% 55%" },
  ],
  vision: { id: "pavilion-dusk", mobile: "pavilion-dusk-portrait", position: "50% 82%" },
};
