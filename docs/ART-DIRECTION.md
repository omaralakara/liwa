# LIWA teaser — art direction (Stage 1, 29 Oct 2026)

Concept: **The Reel.** LIWA is introduced the way a documentary opens: four long-held, letterboxed frames. Type lives in the black bars and on the ground below, never on the photograph. One physical object recurs, a small card carrying the client's logo exactly as supplied. Between frames the page breathes.

Chosen by a three-judge panel over two alternatives ("Threshold" and "Ma"), with these grafts:

- Chapter 1 is the single full-viewport frame; the bars are the viewport edges.
- Chapter 2 holds the site's one bold gesture: the oversized headline slides up under the bottom bar, and a dim second exposure of the same photograph bleeds behind the frame (the "threshold into light" idea from the logo's own rounded-frame geometry).
- The conceptual label in Chapter 3 is typography with a role: inside the frame top-left with a 1px underline, repeated in full in the bottom bar. Later motion stages may not remove it.
- Chapter 4 copy is in a host's voice ("The house is not yet ready to receive you. Until it is, we are reachable.").
- Pauses between chapters carry exactly one caption line.

## Palette

| Token | Hex | Use |
|---|---|---|
| Umber | #1A1410 | page ground |
| Reel black | #000000 | letterbox bars, vignette |
| Bone | #EDE6DA | headlines, body, card |
| Fog | #A9B0B3 | captions, secondary text (cool counterweight) |
| Claret | #731A33 | brand accent, normalised from the logo (#701830). Rules, focus, selection, an 8% lift at the foot of each frame. Never running text. |
| Dune | #C89C62 | image grade target only |

## Type

- Display: **Gambetta** 300 / 300 italic / 400 (Fontshare, self-hosted). Headlines left-aligned and ragged, line breaks are the only emphasis. No single italic words.
- Body: **Switzer** 300 / 400 / 500 (Fontshare, self-hosted). Captions 14px sentence case. No all-caps, no eyebrows, no numbered markers, no arrows on links, no middle dots.
- Fluid sizes live in `src/styles/tokens.css`.

## Imagery rules

- Licensed only (Unsplash License, Pexels License, CC BY/BY-SA/CC0); every asset is listed in `public/images/SOURCES.md`.
- Captions never name a location, so no frame reads as a statement about where LIWA is.
- Chapter 3 imagery is conceptual and labelled so on every breakpoint.
- No photograph of an existing resort (not Sir Bani Yas, not any Anantara property), no competitor lodge, no people.
- Portrait 4:5 crops for phones are art-directed with focal points, not centred.

## Things the judges flagged as generic; keep them out

Centred hero with scrims, "scroll" word with hairline, tick-mark chapter nav, numbered 01/02 markers, tiled grain on everything, glass/backdrop-blur bars, gold hairline frames around photos, mashrabiya pattern overlays, bento cards, "Enquire" top-right, "Coming soon." as a display headline, copyright footer line, Fraunces/Bodoni/Instrument Serif/Playfair, Inter/Roboto/General Sans.

## Verified facts the site may state

Name: LIWA Safari Namibia. Email: info@liwa.na. Phone: +264 85 111 1777. Nothing else. (Client direction, 29 Oct: no "coming soon" anywhere on the site.)

## Known gaps

- The logo exists only as an 896×288 JPEG on white. Ask the client for vector or high-resolution artwork; until then it is shown on a card via multiply blending, never redrawn.
- No LIWA property imagery exists. Chapter 3 is conceptual by design.

---

## Stage 1.5 + 2 addendum (29 Oct 2026)

Client feedback moved the hero away from the letterboxed "exhibition" frame to a full-bleed cinematic landscape with type on the image. What changed:

- **Hero:** 100svh photograph, headline bottom-left over a quiet low-left scrim, eyebrow and lede, a single gold hairline as the scroll cue. The letterbox frames remain for Chapters II and III.
- **Brand:** `public/brand/liwa-mark.png` is the supplied logo with its white ground keyed out (luminance to alpha, shapes untouched). Rendered in ivory through a CSS mask in the header and the end chapter. The original JPEG is kept as the source of truth.
- **Header:** one fixed bar: mark, the four chapters (960px and up), contact. Transparent over the hero, solid charcoal after it. No glass.
- **Tokens:** charcoal ground #141311, burgundy #701830, desert gold #C89C62 (hairlines only), ivory #EDE6DA.
- **Motion (Stage 2):** entrance = veil lifts, light blooms, landscape settles, brand rises, headline lines reveal through masks, cue draws. Scroll = pinned 160vh (120vh on phones): camera push, words leave, then the **threshold**: a window in the logo's rounded-frame geometry opens onto a pre-graded sunlit exposure of the same photograph (`dune-dawn`, derived locally by sharp, no runtime filters) until it fills the frame; the scene then dims and Chapter II follows. Transform, opacity and clip-path only; reversible; reduced motion renders the static hero with no pin.
- **Smooth scroll:** Lenis through the GSAP ticker (`src/lib/smooth.ts`). Nothing else.

---

## Stage 3 addendum (29 Oct 2026): the complete journey

All four chapters are now pinned or triggered scenes that share one motion grammar (camera push or pull, masked line reveals, a geometric threshold, a dim to charcoal between scenes). No pauses remain; each chapter's first frame is dark so it inherits the previous chapter's last frame.

- **I → II.** The hero dims to charcoal. Chapter II opens as a dark widescreen band held tight on the oryx (origin on the animal); the band opens to the full frame while the camera pulls back, so the animal becomes small in the plain. Headline lines rise through masks on the right, then leave as the scene dims. Pin 220vh (170vh phone).
- **II → III, the signature transition.** Out of the dark, a tall doorway with a true semicircular top (the arch radius is half the opening's width, recomputed on refresh) opens onto the lamp-lit pavilion, widening until the vision fills the frame while the camera drifts closer and an amber glow warms. The "Conceptual visualisation" label and the full disclaimer fade in with the first pixel of the image and remain visible to the last, on every breakpoint, above the closing shade. Pin 240vh (200vh phone).
- **III → IV.** The vision settles to charcoal. Chapter IV plays once on arrival (reversed on leaving): a low ember breathes behind the mark, the mark is revealed through a left-to-right mask, the closing line rises through masks, then host line, status, contacts and footer follow.
- **Mechanics.** All clip geometry is tweened as numbers (`src/lib/clip.ts`) on unscaled wrappers; camera moves are transforms on the media inside. SplitText `autoSplit` rebuilds each scroll timeline on font load or resize. ScrollTrigger pins use `invalidateOnRefresh`, `anticipatePin` and `ignoreMobileResize`. Reduced motion: no pins, no entrance, every state legible.
- **Length.** About 10 screens on desktop, 9 on phones: roughly 45 to 75 seconds at a natural pace.

---

## Stage 3.5 addendum (29 Oct 2026): seven chapters, peaks and valleys

The four-chapter film became a seven-chapter one. The rule that governs the expansion: **spectacle only where it earns its place; stillness everywhere else.** Animation level per chapter is fixed and must not creep.

| # | Chapter | Level | What moves |
|---|---|---|---|
| I | The Awakening | high | Entrance + pinned threshold sunrise (unchanged) |
| II | Into the Wild | high | Pinned widescreen band + camera pull-back (unchanged) |
| III | The Land | low | One slow wipe reveal on arrival; then nothing |
| IV | Moments of Wonder | medium | Per-frame clip reveal on arrival; a slow vertical drift inside each frame |
| V | A New Vision | high | Pinned arch doorway + lamplight (unchanged) |
| VI | Beyond the Expected | low | One reveal on arrival; a 2.5% lean-in on hover |
| VII | The Invitation | medium | Triggered entrance (unchanged) |

- **III, The Land.** A 74vh panorama bleeding edge to edge; the headline ("Older than memory.") straddles its lower edge; below, a short gold rule, a lede in Gambetta and a note in Switzer on a 12-column grid. No pin, no parallax.
- **IV, Moments of Wonder.** Three full-bleed moments in the film's own language (a boxed grid was tried and rejected by the client as foreign to the site): one wide frame, a diptych (a sand detail beside a lion, 2:3 split with a 2px charcoal seam), and a closing frame carrying the chapter's one italic line. Every frame wears the shared night grade and grain; captions sit on the image, bottom-left, in italic Gambetta. Reveal once on arrival (clip from the foot, slow settle) plus a 4.5% vertical drift as the page moves. Warm palette only: the Milky Way frame was dropped for clashing. Captions are observational and never name a place.
- **VI, Beyond the Expected.** The page turns to light: the only sand-coloured ground (#E8DFD0) in the film, charcoal type. A 4:5 architectural photograph on the left seven columns; on the right, the oversized headline, a 4:5 detail tucked beneath it, and a short paragraph about hospitality as an idea (host, shade, water, materials), never about facilities.
- **Copy.** Every apologetic or process line is gone ("not yet open", "not yet ready", "we will write when there is something to show", "Conceptual visualisation" overlays, "Concept presentation"). The site states only what is verified (name, country, email, phone). No "coming soon" anywhere, by client direction. Copy is written in a plain, spoken voice: short sentences, concrete nouns, no list-of-three flourishes, no "where X meets Y". One disclosure, in the footer of Chapter VII: "Imagery is illustrative of the proposed experience." It is not repeated inside any scene.
- **Navigation.** Seven short labels (Awakening, Wild, Land, Wonder, Vision, Beyond, Invitation) from 960px up; full titles in the accessible names.
- **Rhythm.** About 16 screens on desktop, 14 on phones. The order peaks at I, II and V; III and VI are the valleys; IV and VII sit between.

### Stage 3.5 follow-ups (29 Oct 2026, client notes)

- **Transitions carry themselves.** The three pinned chapters (I, II, V) snap directionally to rest points (title, open frame, cut): one nudge of the wheel, trackpad or thumb plays the transition to the next rest in the direction of travel over 0.8 to 2.4 s; nudging back plays it in reverse. Implemented with ScrollTrigger snap (helper `restPoints` in `src/lib/gsap.ts`); the pinned timelines are now built once and only the headline line tween is replaced when SplitText re-splits, and they carry `refreshPriority: 1` so pin spacers are measured before the editorial chapters.
- **Header navigation** goes through `scrollToId` (`src/lib/smooth.ts`), which targets the pin spacer so a jump into a pinned chapter from below lands on its first frame, not its last.
- **Hero entrance** lives in a context without a width condition, so crossing 767px rebuilds only the scroll geometry and never replays the title sequence; the entrance settle hands the stage over to the scrubbed push on the first scroll.
- **Accessibility:** headline line breaks keep a word boundary for SplitText aria-labels; contact links fade with opacity only (always in the tab order); secondary type on sand and the footer disclosure clear 4.5:1; the mark survives Windows high-contrast mode.
