# LIWA Safari Namibia — cinematic teaser

Concept demonstration site. Not the production website: no SEO, CMS, booking or backend.

Art direction, palette, type and content rules: [docs/ART-DIRECTION.md](docs/ART-DIRECTION.md).
Image provenance and licences: [public/images/SOURCES.md](public/images/SOURCES.md).

## Stack

- Vite 8 + React 19 + TypeScript 7
- GSAP 3.15 with ScrollTrigger, SplitText, CustomEase and `@gsap/react` (registered once in `src/lib/gsap.ts`)
- Lenis smooth scroll, synced to ScrollTrigger in `src/lib/smooth.ts` (the only smooth-scroll engine; never add ScrollSmoother alongside it)
- Three.js r186, React Three Fiber 9, drei 10, postprocessing (Stage 3+)
- Self-hosted Gambetta and Switzer from Fontshare (`public/fonts`, `src/styles/fonts.css`)

## Commands

```bash
npm run dev       # start dev server (http://127.0.0.1:5173)
npm run build     # type-check and production build
npm run preview   # serve the production build
npm run lint      # oxlint
node scripts/fetch-assets.mjs   # (re)download imagery from scripts/assets.json, regenerate src/data/assets.ts
```

## Structure

```
src/
  chapters/      Hero, Wild, Vision (pinned scroll scenes); Land, Wonder, Beyond (still editorial chapters, one-time reveals); Invitation (triggered entrance)
  components/    Picture (responsive image), Mark (keyed logo), SiteHeader
  data/          site.ts (verified facts, chapter list, the one imagery disclosure), cast.ts (which image plays each chapter), assets.ts (generated)
  styles/        tokens.css, global.css, scenes.css, hero.css, editorial.css, fonts.css
  lib/           gsap.ts (plugins), smooth.ts (Lenis), clip.ts (tweenable clip geometry)
scripts/         fetch-assets.mjs + assets.json (image manifest)
public/          brand/ (client logo as supplied + keyed mark), fonts/, images/
```

## Agent skills

Twelve project-local skills live in `.claude/skills/` and are pinned in `skills-lock.json`.
Restore them with `npx skills experimental_install`.
