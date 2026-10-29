/**
 * Clip-path geometry that GSAP can tween as plain numbers.
 *
 * Browsers serialise `inset()` shorthand (collapsing equal sides), which breaks
 * string interpolation. Tweening this object and writing the string ourselves is
 * deterministic, and lets a companion outline element share the exact geometry.
 *
 * Percent insets (t, r, b, l) and pixel radii for the top and bottom corners.
 */
export type InsetGeo = { t: number; r: number; b: number; l: number; rt: number; rb: number };

export function insetClip(el: HTMLElement, init: Partial<InsetGeo> = {}, outline?: HTMLElement) {
  const geo: InsetGeo = { t: 0, r: 0, b: 0, l: 0, rt: 0, rb: 0, ...init };
  const apply = () => {
    el.style.clipPath = `inset(${geo.t}% ${geo.r}% ${geo.b}% ${geo.l}% round ${geo.rt}px ${geo.rt}px ${geo.rb}px ${geo.rb}px)`;
    if (outline) {
      outline.style.top = `${geo.t}%`;
      outline.style.right = `${geo.r}%`;
      outline.style.bottom = `${geo.b}%`;
      outline.style.left = `${geo.l}%`;
      outline.style.borderRadius = `${geo.rt}px ${geo.rt}px ${geo.rb}px ${geo.rb}px`;
    }
  };
  apply();
  return { geo, apply };
}
