# LIWA Safari Namibia — cinematic teaser

Concept demonstration site. Not the production website: no SEO, CMS, booking or backend.

Art direction, palette, type and content rules: [docs/ART-DIRECTION.md](docs/ART-DIRECTION.md).
Image provenance and licences: [public/images/SOURCES.md](public/images/SOURCES.md).

## Stack

- Vite 8 + React 19 + TypeScript 7
- GSAP 3.15 with ScrollTrigger, SplitText, CustomEase and `@gsap/react` (registered once in `src/lib/gsap.ts`)
- Lenis smooth scroll, synced to ScrollTrigger in `src/lib/smooth.ts` (the only smooth-scroll engine; never add ScrollSmoother alongside it)
- Three.js r186, React Three Fiber 9, drei 10, postprocessing (Stage 3+)
- One self-hosted family, Gambetta from Fontshare (`public/fonts`, `src/styles/fonts.css`). The `--font` token in `src/styles/tokens.css` is applied once, on `body` in `src/styles/global.css`; everything else inherits, so no other `font-family` belongs in the styles

## Commands

```bash
npm run dev       # start dev server (http://127.0.0.1:5173)
npm run build     # type-check and production build
npm run preview   # serve the production build
npm run lint      # oxlint
node scripts/fetch-assets.mjs   # (re)download imagery from scripts/assets.json, regenerate src/data/assets.ts
```

## Pages

Two real pages and no router: `/` (`index.html`, `src/main.tsx`) and `/packages/` (`packages/index.html`, `src/packages.tsx`). Both are inputs in `vite.config.ts`, and a small plugin there redirects `/packages` to `/packages/` in dev and preview. A static host serves `dist/packages/index.html` for that folder.

Navigation is defined once in `src/data/site.ts` (`primaryNav`, `hrefFor`). From Packages, a homepage link is `/#id`, and `landOnHash` in `src/lib/smooth.ts` lands it once the pins exist.

## Publishing a package

Packages live in `src/data/packages.ts`. To publish a real one, set its `status` to `"confirmed"` and fill in only the fields LIWA has approved: `PackageCard` prints the fields that exist. Do not enter a duration, inclusion, guest number, price or date before that. `/packages/?preview` shows a labelled sample row for internal review.

## Structure

```
index.html, packages/index.html    the two pages
src/
  chapters/      Hero, About, Wild, Vision (the Resort chapter: id "resort"), pinned scroll scenes; Land, Wonder, Gallery, Visit (still chapters, one-time reveals); Invitation (triggered entrance); Contact
  pages/         Packages
  components/    Picture, Mark, SiteHeader, MenuOverlay, SiteFooter, SoundToggle, Lightbox, PackageCard, EnquiryForm
  data/          site.ts (verified facts, chapters, navigation, disclosure, credit), cast.ts (which image plays each chapter), gallery.ts, packages.ts, assets.ts (generated)
  styles/        tokens.css, global.css, fonts.css, scenes.css, nav.css, and one file per chapter or page
  lib/           gsap.ts (plugins, restPoints), smooth.ts (Lenis, scrollToId, landOnHash), clip.ts (tweenable clip geometry), ambience.ts (sound)
scripts/         fetch-assets.mjs + assets.json (image manifest)
public/          brand/ (client logo as supplied + keyed mark), fonts/, images/
```

## Agent skills

Twelve project-local skills live in `.claude/skills/` and are pinned in `skills-lock.json`.
Restore them with `npx skills experimental_install`.
