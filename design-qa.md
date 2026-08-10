**Source visual truth**

- Selected interaction/layout reference: `/workspace/scratch/65e995573032/upload/c692782e-ac6b-485e-9363-f3aa349c844f.png`.
- Target: a dark Vetratoria section with an editorial introduction, compact question rows, a visible open/closed state, orange emphasis and a contact CTA.

**Implementation evidence**

- Browser-rendered implementation: `http://terminal.local:4173/dahab/#faq` (desktop) and `http://terminal.local:4173/qa-faq-mobile.html` (390 px embedded mobile viewport).
- Desktop viewport: 1363 × 936 CSS px, device scale factor 1; first answer open, then second answer open.
- Mobile viewport: 390 × 844 CSS px inside the QA frame, device scale factor 1; first answer open, then second answer open.
- Source reference: 577 × 380 px. Implementation captures were visually compared in the same QA pass, normalizing on the component region rather than browser or embed-frame chrome.
- Primary interactions tested: mouse/touch-equivalent summary activation, one-open-item behavior, `aria-expanded` synchronization, native keyboard-operable summary controls and focus-visible styling.
- Console: no application errors or warnings. Three historic Chrome-extension metadata errors were external to the site.

**Full-view comparison evidence**

- The implementation preserves the reference’s dark premium surface, left editorial title area, large accordion column and bottom CTA band.
- It intentionally uses near-black accordion rows instead of the reference’s light rows, following the approved black Vetratoria treatment while retaining orange state accents and the same information hierarchy.
- The desktop layout has a clear asymmetric 0.76 / 1.24 grid; mobile becomes a single column with compact 34 px index and 16 px control tracks.

**Focused region comparison evidence**

- Typography: bold white headline, orange eyebrow and numbering, muted readable answer copy. Desktop and 390 px mobile wrapping remain inside their containers.
- Spacing and layout rhythm: the accordion uses 2 px dividers, restrained 3 px radius and a 42 px CTA separation; compact mobile padding prevents a long-card effect.
- Colors and tokens: black/near-black surfaces use `#100e0d`, `#171310` and `#1c1612`; existing `--orange` is reserved for selected state and actions; white and muted text retain contrast.
- Image quality and assets: the target contains no image assets for this block. No synthetic imagery, placeholder artwork or changed project media was introduced.
- Copy/content: all existing Vetratoria questions and approved answers are retained; no prices, wind statistics, services or staff claims were added.

**Findings**

- [Resolved P1] The previous generic FAQ was only a vertical stack and did not reflect the selected editorial two-column composition.
  Location: `scripts/build.mjs`, `.dahab-faq-section`.
  Fix: a dedicated intro/accordion layout with numbered rows and a full-width CTA band.
  Post-fix evidence: desktop browser capture shows the intended two-column component with consistent row rhythm.
- [Resolved P1] Multiple answers could remain open and state was not explicitly communicated.
  Location: `assets/js/app.js`, `[data-exclusive-accordion]`.
  Fix: selecting an item closes all other items and synchronizes `aria-expanded` on every summary.
  Post-fix evidence: desktop and 390 px mobile tests both returned `[false, true, false, false]` after opening the second answer.
- [Resolved P2] The generic FAQ did not have a mobile-specific compact layout.
  Location: `assets/css/pages/dahab-home.css`, `@media (max-width: 520px)`.
  Fix: dedicated small-screen grid, spacing and answer offsets.
  Post-fix evidence: 390 × 844 browser frame shows no horizontal overflow and retains visible open/closed controls.

**Implementation checklist**

- Dedicated semantic `<details>/<summary>` FAQ markup created for the Dahab overview.
- Exclusive interactive state, keyboard support and focus visibility verified.
- Desktop and mobile visual checks completed.
- `npm run build`, `npm run check`, and `git diff --check` passed.

**Follow-up polish**

- P3: the FAQ could later gain URL-based deep-linking to a specific question if that becomes useful for campaign pages; it is not needed for the current browse-and-compare flow.

final result: passed
