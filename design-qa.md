# Design QA — directions and station life

- Source visual truth: `/workspace/scratch/65e995573032/upload/5a8c2e0a-f881-4a93-b4ee-cccb518f34af.png` plus the user's written direction in the same request.
- Implementation: browser-rendered local preview at `http://terminal.local:4173/` and `http://terminal.local:4173/dahab/`.
- Implementation screenshot: cloud-browser captures made during this QA pass (homepage destination section, station-life carousel, and open lightbox).
- Viewport: 1363 × 936 CSS px, device scale factor 1.
- Source pixels: 911 × 662. Implementation capture pixels: 1363 × 936. Comparison was normalized by reviewing the same content region rather than browser chrome.
- State: default homepage destination section; Dahab station-life carousel at first and second positions; station-life lightbox open on image 3 of 8.

## Full-view comparison evidence

The source showed three destinations with photo headers followed by a large light text area. The revised implementation keeps the three-column rhythm but makes every card a large, fully photographic, clickable surface. Country, destination, season badge, month calendar, and CTA are overlaid in the lower contrast-safe area. The requested wind paragraphs are absent.

The former four-image station-life grid is replaced by a horizontally scrollable 16:9 carousel. The viewport intentionally shows the next card edge, providing a clear scrolling affordance without reducing the primary image.

## Focused-region comparison evidence

- Month cells were inspected at full desktop size. Season months use dark fill; August, the current month, uses an orange outline without replacing the season fill.
- The carousel next control changed track scroll position from 2 px to 798 px.
- Clicking a carousel image opened the native dialog at `3 из 8` with the selected real photograph, previous/next controls, download link, and close control.
- Closing the dialog restored the page state.
- No horizontal page overflow was present on either tested route.
- Browser console contained no site-origin errors.

## Required fidelity surfaces

- Fonts and typography: existing Vetratoria type system retained; overlay hierarchy remains readable and consistent with the rest of the site.
- Spacing and layout rhythm: large photographic cards, consistent radii, 20 px destination gaps, 16 px carousel gaps, and aligned controls.
- Colors and visual tokens: existing light section, orange accent, dark season state, and orange current-month outline retained.
- Image quality and assets: only existing real Vetratoria photographs are used; images retain their source proportions and use `object-fit: cover` inside 16:9 presentation areas.
- Copy and content: verbose wind descriptions removed from the homepage cards; destination names, seasons, months, and navigation CTAs remain.

## Comparison history

- Initial P1: destination cards read as text cards with small photo headers, contrary to the requested image-led hierarchy. Fixed by moving all essential season content onto large photographic cards.
- Initial P1: station life stopped after four static images. Fixed with eight real images, horizontal navigation, keyboard scrolling, touch scrolling, and a full-screen lightbox.
- Post-fix evidence: browser captures and interaction checks listed above. No actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: replace or reorder individual carousel photographs later if the client supplies a curated final selection; the component supports additional images without changing its layout.

final result: passed
