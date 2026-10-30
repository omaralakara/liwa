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
- **No empty frames (client note, 29 Oct).** Full-height chapters are sized to the large viewport (`100lvh`) so the collapsing phone address bar never opens a dark gap; bottom-anchored text is lifted by `(100lvh - 100svh)` while the bar shows. A dimmed copy of each photograph (`.scene__ghost`, 34%) sits behind the clipped openings of Chapters II and V, and the cuts between chapters dim to 0.55 to 0.65 instead of near-black. The closing chapter centres its words vertically.
- **SEO copy (client request, 29 Oct).** Honest, keyword-bearing sentences were added about Namibia as a safari country (Sossusvlei, Skeleton Coast, Etosha, desert-adapted elephant, oryx, giraffe, lion, seals, flamingos) and about LIWA as a luxury safari brand for Namibia with Arabian hospitality. Title and meta description carry "luxury safari in Namibia"; the `noindex` tag was removed so the deployed site can be indexed. Still no claims about facilities, opening or bookings.

---

## Stage 4 addendum (30 Oct 2026): client feedback, "it's a resort and safari"

Client note on the Stage 3.5 site: "I like the theme and the colors but remember it's a resort and safari. So it has to reflect that." Nothing of the visual identity changed; the film now says what LIWA is in its first seconds and keeps both worlds (the wild, and the resort as a plan) in view throughout.

- **Descriptor.** "Safari & Resort Vision" (`site.descriptor`) is the brand line: in the hero eyebrow under "LIWA Safari Namibia", in the menu, in the footer and in the page title. The hero lede: "A luxury safari in Namibia, and the vision for a resort in the oldest desert on earth." The resort is always "the plan", "the resort LIWA intends to build", "a house to come back to"; never operating.
- **Nine content areas.** I The Awakening (pinned hero) · **II About LIWA** (new) · III Into the Wild (pinned) · IV The Land · V Moments of Wonder (now four frames: a zebra wide frame joins) · VI A New Vision (pinned arch) · **VII Book a Visit** (replaced Beyond the Expected) · VIII The Invitation (emotional close, no contacts) · **IX Contact Us** (new, practical close + site footer with the one disclosure line).
- **II About LIWA, "One Horizon".** Chosen by a three-judge panel over three other concepts. One 100lvh frame: a desert-gold hairline, the horizon, is drawn across the frame on arrival; the wild (a giraffe at sunset) opens out of that line; with one nudge a lamp-lit camp slides in from the right along the same line and its lamps come on. Roman headline on the wild side ("The wild comes first."), italic on the house side ("Then a house to come back to."). Both photographs are fitted so their horizons land on the hairline at every viewport (`fitHorizon` in `src/chapters/About.tsx` writes the image box, not object-position, because cover-fit has no vertical slack at narrow ratios). Pin +100vh (+80vh phone), snap rests [0, 0.72, 1]. The camp photograph is a locally warm-graded derivation (`about-camp-dusk`, sharp: desaturated, tinted) of a generic Sahara camp; it is conceptual, as the footer says. Below the frame, a short body on the Land grid says it in plain words and names the resort.
- **Imagery rules, extended.** No photograph of an identifiable existing lodge or camp, including Namibian ones (two such picks were rejected and deleted). Conceptual hospitality imagery is generic architecture: a vaulted clay bedroom, a night courtyard through an arch, a plastered arch with a lantern. Cool skies are graded warm at derivation time or not used (the Deadvlei frame, blue sky, is fetched but unused).
- **Navigation.** Header: mark · About LIWA · Safari · The Resort Vision · Contact Us · email · Menu. The menu opens a full-screen overlay (claret curtain leads, charcoal follows, line-masked Gambetta links, the cinematic chapters as a secondary list, contacts, faint mark), with scroll lock (Lenis stop + root overflow), focus trap, Escape, `inert` on main, reduced-motion fade. A jump into a pinned chapter lands on its first open frame (`LANDING` in `src/lib/smooth.ts`: Wild 0.62, Vision 0.8, About 0.72) so the transition plays itself on arrival instead of stopping on the closed cut. Roman numerals appear in the menu only, at the client's request for chapter paths; drop `.menu__primary-num` if they read as markers.
- **IX Contact Us.** A 34vh band of the dune sea, eyebrow "Contact Us", headline "Write to us, or call.", a three-line lede, then the email and telephone set large in Gambetta under gold hairlines, each the whole link, with a discreet Copy for the email. No form, no address, no hours, no social accounts. Footer: name, descriptor, disclosure.

### Stage 4 follow-ups (30 Oct 2026, owner notes)

- **VII Book a Visit replaces Beyond the Expected** (the owner disliked both versions of Beyond). The film's one light valley stays: sand ground, charcoal type, the vaulted clay bedroom photograph (conceptual). Headline "Come and see the country.", a short request form (name, email, when, guests, interest: "Safari" or "Safari and the resort vision", message). There is no backend: "Send request" composes a pre-filled email to info@liwa.na in the visitor's own mail app, and the section says so ("Nothing is stored on this site."). It must never read as a reservation: no availability, prices, rooms or confirmations. The whole section fits one screen at common desktop and phone sizes. Reached from the header ("Book a visit", 768px and up, in place of the email), the menu (a line under the primary paths) and a third row in Contact.
- **Transitions carry themselves everywhere.** All four pinned chapters (I, II, III, VI) have shorter pins (about one screen) and play to their next rest with a single nudge of wheel, trackpad or thumb, in both directions. `restPoints` in `src/lib/gsap.ts` judges direction against the rest the chapter last settled on (Lenis's eased stop made the scroll direction unreliable) and is kept in sync by `onToggle: rests.sync` when a jump leaves or enters a chapter. Navigation lands on each pinned chapter's first open frame. The still chapters reveal once on arrival with no further scrolling.
- **Sound.** A generative desert ambience (Web Audio only, nothing downloaded): looped stereo pink noise through drifting low-pass filters for wind and gusts, a faint 58 Hz sub drone with a slow beat, a slow stereo wander, a compressor, roughly -29 dBFS RMS. Browsers forbid sound before a user gesture, so it starts on the first tap, key, wheel or touch, fades out when the tab is hidden, and remembers "off" in localStorage (`liwa:sound`). Controls: a small hairline glyph with "Sound on/off" in the header, and the same control on the menu's top row.
- **Review fixes.** In-page navigation moves keyboard focus to the chapter; the menu dialog has its own (visually hidden) close button, scrolls on short screens (`data-lenis-prevent`), and the header keeps its right group at the gutter between 768 and 959px; About's entrance no longer replays when the phone breakpoint is crossed; "A person answers." removed from Contact (an unverifiable operational claim); page title matches the descriptor.
