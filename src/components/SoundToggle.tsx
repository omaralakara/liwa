import { useSyncExternalStore } from "react";
import { getAmbience } from "../lib/ambience";

type Props = {
  /** "header": the slim bar control; "menu": the larger line inside the overlay. */
  variant?: "header" | "menu";
};

/**
 * The sound control: a tiny hand-drawn glyph of three hairlines that breathe while the
 * ambience plays, and the words "Sound on" or "Sound off". `aria-pressed` carries the state.
 */
export function SoundToggle({ variant = "header" }: Props) {
  const ambience = getAmbience();
  const state = useSyncExternalStore(ambience.subscribe, ambience.getState, ambience.getState);

  const className = [
    "sound-toggle",
    `sound-toggle--${variant}`,
    state.on ? "sound-toggle--on" : "",
    state.playing ? "sound-toggle--playing" : "",
  ]
    .join(" ")
    .trim();

  return (
    <button type="button" className={className} aria-pressed={state.on} onClick={() => ambience.toggle()}>
      <span className="sound-toggle__glyph" aria-hidden="true">
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <path className="sound-toggle__line" d="M3.4 4.6 L3.2 10.1" />
          <path className="sound-toggle__line" d="M7.1 2.9 L7 11.3" />
          <path className="sound-toggle__line" d="M10.7 5.2 L10.9 9.6" />
        </svg>
      </span>
      <span className="sound-toggle__label caption">{state.on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
