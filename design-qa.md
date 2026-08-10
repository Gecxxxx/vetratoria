**Source visual truth**

- Reference: `/workspace/scratch/65e995573032/upload/3e5501e2-792a-45bb-a233-505067bc5e99.png` (1013 × 430 px).
- Implementation: browser-rendered `/dahab/wingfoil/?faq-r18b#faq`, desktop cloud-browser viewport 1366 × 936 CSS px; mobile implementation was rendered inside a 390 × 844 px iframe at `/qa-mobile.html`.
- State compared: first answer open; dark FAQ section; one accordion item expanded.

**Findings**

- No actionable P0/P1/P2 differences remain for the reusable sport FAQ. The rendered component follows the reference hierarchy: editorial left column, compact right-side numbered accordion, orange active marker and a dark bordered surface.
- Acceptable intentional difference: CTA is only retained on the Dahab overview FAQ, where it already exists; sport and travel FAQ sections do not invent a new conversion block.

**Comparison history**

- [P1, fixed] Generic FAQ sections used a vertical list with no numbered editorial layout and could appear on a lighter surface. Fixed by introducing one centralized `sportFaqBlock` renderer and `.dahab-sport-section--faq` dark section token.
- [P2, fixed] Generic accordions permitted visually inconsistent expanded states. Added the existing `data-exclusive-accordion` behavior and explicit `aria-expanded` state to every generated FAQ.
- [P2, fixed] Mobile rows risked over-wide labels. At 620 px and below the layout becomes one column, rows use 29px/1fr/16px tracks, and answer indents reduce to fit the 390px viewport.

**Evidence and checks**

- Desktop: browser DOM showed one open item and no horizontal overflow (`scrollWidth <= innerWidth`). The first FAQ was visible in the target dark state.
- Interaction: keyboard activation of item 02 left exactly one FAQ item open; item 02 reported `aria-expanded="true"`, item 01 reported `aria-expanded="false"`.
- Mobile: 390 px rendered frame contained the FAQ and reported no horizontal overflow. The responsive one-column rule was active.
- Console: no site-origin errors were found for the checked FAQ route. The only logged errors came from the cloud-browser metadata extension (`chrome-extension://…`), not from site code.

**Required fidelity surfaces**

- Fonts and typography: existing Vetratoria family and 900-weight hierarchy retained; small orange numerals remain legible and answers use a softer 14/13px reading size.
- Spacing and layout rhythm: desktop has a deliberate two-column gap; mobile collapses without squeezed columns or excess gutters.
- Colors and visual tokens: `#100e0d` section, `#191412` accordion, `#443b36` dividers and the existing orange accent match the dark Vetratoria direction in the reference.
- Image quality and asset fidelity: this reference contains no content image inside the FAQ; no replacement imagery was added.
- Copy and content: existing questions and answers are unchanged; headings are retained per route.

**Implementation checklist**

- [x] Centralize sport FAQ markup.
- [x] Apply the dark, numbered accordion style to Wingfoil, Windsurf, WindSurfKids and travel FAQ sections.
- [x] Preserve the overview FAQ CTA and its existing design.
- [x] Verify desktop interaction, mobile overflow, build and static checks.

**Follow-up polish**

- [P3] When final production content is approved, consider shortening any exceptionally long question to keep all desktop closed rows visually uniform.

final result: passed
