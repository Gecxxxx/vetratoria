# Design QA — акватория и мобильные экспертные блоки

- Source visual truth: `/workspace/scratch/65e995573032/upload/81ef5fcd-a8af-4b93-bd06-cd89dee8621b.png` and the user's written requirements for a white informational water-area block.
- Implementation: browser-rendered local preview at `http://terminal.local:4173/` for `/`, `/dahab/`, `/dahab/wingfoil/`, and `/dahab/windsurf/`.
- Implementation screenshots: cloud-browser captures of the desktop water-area block and responsive iframe captures at 320, 360, 390, and 414 CSS px. The cloud browser did not expose filesystem paths for these captures.
- Source pixels: 1917 × 801. Desktop implementation capture: 1348 × 936 pixels at 1348 × 936 CSS px and device scale factor 1.
- Mobile implementation captures: 1363 × 936 outer pixels with same-origin responsive frames of 320 × 844, 360 × 844, 390 × 844, and 414 × 844 CSS px at device scale factor 1.
- State: water-area overview, destination season cards, first station-life slide, lightbox open, and mobile menu open.

## Full-view comparison evidence

The source had a dark sales-oriented split panel with orange pills and action links. The revised implementation keeps the real aerial image and the three-zone structure but turns the section into a light informational card. The heading and neutral overview lead the section; the map and separate Lagoon, Speedy, and Kamikaze descriptions form the main content. Sales pills and CTAs are absent.

The source and implementation were opened in one comparison input together with desktop and 320 px implementation captures. The light version creates the requested visual pause, keeps the existing Vetratoria type and orange accent, and preserves the aerial image as the spatial explanation.

## Focused-region comparison evidence

- At 320 and 390 px the water-area heading, lead, 4:3 map, caption, and three numbered zone descriptions stack without clipping or horizontal page overflow.
- Homepage destination cards were checked at 320 and 390 px. The month calendar changes to two six-month rows, all month labels remain readable, and the full photographic card remains clickable.
- Station-life sliders were checked at 320, 360, 390, and 414 px on Dahab, Wingfoil, and Windsurf routes. One 16:10 mobile card occupies about 91% of the track and reveals the next card edge as a swipe affordance.
- Carousel controls remain at least 42 × 42 px; captions are clamped to two lines on narrow screens.
- Opening a station-life image displays a modal viewer with the image using almost the full available mobile width and navigation controls over the media rather than beside it.
- The Dahab mobile menu was opened at 360 px and remained independently scrollable without covering or widening the page.
- Browser console contained no site-origin errors. Logged errors came only from the cloud browser extension.

## Required fidelity surfaces

- Fonts and typography: the existing Vetratoria family, weights, and uppercase labels are retained; display titles reflow at narrow widths without orphaned fragments or clipping.
- Spacing and layout rhythm: desktop uses a balanced header plus map/content grid; mobile changes to a deliberate vertical composition with 16–20 px card padding and consistent separators.
- Colors and visual tokens: the water section now uses the shared light surface, border, shadow, dark text, muted body text, and restrained orange section accents.
- Image quality and assets: the existing Dahab aerial photograph and real station photographs are preserved; no stock imagery or generated placeholders were added. Responsive crops use 4:3 for the map and 16:10 for mobile carousel cards.
- Copy and content: removed sales-oriented pills and CTA copy; added factual descriptions of the separated Lagoon, Speedy, and Kamikaze zones without introducing unverified wind statistics.

## Comparison history

- Initial P1: the water-area block remained a long dark product/sales panel and conflicted with the requested informational purpose. Fixed with a shared light surface, simplified hierarchy, and removal of pills and actions.
- Initial P1: new destination cards compressed 12 month cells into one unreadable mobile row. Fixed with a six-column, two-row mobile calendar.
- Initial P2: tablet destination layout centered the third card at half width. Fixed by allowing the third card to span the full tablet grid.
- Initial P1: station-life items used viewport-based widths and squeezed captions/controls at 320–414 px. Fixed with container-relative slide widths, compact controls, mobile crop, and two-line captions.
- Initial P2: modal navigation consumed too much image width on small screens. Fixed by overlaying previous/next controls on the image.
- Post-fix browser evidence at all listed viewports shows no actionable P0/P1/P2 findings.

## Primary interactions tested

- destination card navigation affordance;
- station-life horizontal scrolling and next-card preview;
- station-life image opening in the lightbox;
- lightbox close control;
- mobile menu open state and internal scrolling.

## Follow-up polish

- P3: the final ordering of station-life photos can be curated later when the client supplies a definitive album sequence; the component accepts additional real images without layout changes.

## iOS station-life follow-up — 2026-08-09

- Source visual truth: `/workspace/scratch/65e995573032/upload/F2514494-0B1B-4373-B734-B049A184F2C4.png` (1179 × 2556 pixels) and `/workspace/scratch/65e995573032/upload/DB3FC378-7CC3-4CCA-BEA7-B88C8889ADED.jpeg` (709 × 1536 pixels).
- Implementation screenshots: cloud-browser captures with responsive frames at 320 × 844, 390 × 844, and 414 × 844 CSS px, device scale factor 1. The browser did not expose filesystem paths for these captures.
- State: first slide visible on Dahab, Wingfoil, and Windsurf station-life blocks; second Windsurf slide selected; lightbox open at `2 из 8`.
- Full-view comparison: both iPhone references showed the carousel media collapsed into a thin horizontal strip. Post-fix captures show a stable 190–240 px media height, a large first photo, and a narrow preview of the next slide at every tested width.
- Focused comparison: the heading was reduced to 28–34 px, vertical spacing was tightened, the native horizontal scrollbar was hidden, image sizing was made independent of Safari flex/aspect-ratio calculation, and captions now allow up to three lines.
- Primary interactions tested: next-slide button, touch-style horizontal carousel state, photo opening, previous/next lightbox controls, and close control.
- Console errors checked: no `terminal.local` site-origin errors.
- P1 fixed: iOS Safari could collapse flex-button slides because their cross-axis size depended only on `aspect-ratio`. The mobile component now has an explicit responsive `height` and `min-height`, with absolutely fitted images.
- P2 fixed: oversized mobile headings and excessive section rhythm reduced the visible photo area. Mobile typography and section spacing are now compact without changing the desktop layout.
- Required fidelity surfaces: existing font and color tokens remain unchanged; spacing now matches a mobile content rhythm; real Vetratoria images keep correct crops; copy and interaction labels are unchanged.
- Post-fix evidence at 320, 390, and 414 px shows no actionable P0/P1/P2 findings.

final result: passed
