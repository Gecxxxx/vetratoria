# Design QA

**Source visual truth**

- Selected concept: `/workspace/scratch/65e995573032/generated_images/exec-77b0432b-8e72-4138-8445-4b5f2840c349.png`

**Implementation evidence**

- Browser-rendered capture: `qa-approach-editorial.jpg`
- Route/state: homepage, `#brand` section, editorial approach layout visible.
- Desktop viewport: 1363 × 936 CSS px, 1× density; implementation capture is 1348 × 926 px after scrollbar allocation.
- Source capture: 1680 × 935 px. Compared on the common component region; page navigation is outside the target component.
- Mobile: 390 px framed viewport; rendered document width 375 px after native scrollbar allocation, with no horizontal overflow.

**Full-view comparison evidence**

- Both source and implementation place the real station photo on the left and the copy/principles on the right, on a cream surface with black type and orange numbering.
- The implementation uses the original Vetratoria image asset rather than generated or stock imagery.

**Focused region comparison evidence**

- The former bordered list cards are replaced by four numbered rows with thin dividers, matching the selected editorial hierarchy.
- The left image is landscape, rounded and large enough to carry the section emotionally; it remains visible without the former unstable slider state.
- At 390 px the content stacks as heading → numbered rows → photograph, with readable touch-scale type and no clipped text.

**Required fidelity surfaces**

- Fonts and typography: existing Vetratoria type system retained; heading is the dominant visual anchor and supporting text stays readable.
- Spacing and layout rhythm: two balanced desktop columns and a single intentional mobile column; no nested card surface remains.
- Colors and visual tokens: existing cream, near-black and orange tokens are preserved.
- Image quality and assets: existing `vetratoria-station-team.webp` is used, with object-fit crop appropriate to both desktop and mobile.
- Copy and content: all four original approach statements and the existing 2006/10,000-person paragraph remain; only their presentation changed.

**Findings**

- No actionable P0, P1 or P2 findings remain.
- The prior image slider rendered a black media surface in browser QA. It was intentionally replaced by the selected concept’s single real photo, removing the broken state.
- No application-origin console warnings or errors were found.

**Comparison history**

- Iteration 1 — [P1] The original block used a contained text card and a failing image slider; this differed materially from selected Option 1.
- Fix: removed the contained surface, moved the image to the left, introduced a vertical divider and editorial numbered rows, and used a stable direct project image.
- Post-fix evidence: `qa-approach-editorial.jpg`, desktop browser inspection and 390 px mobile inspection. No P0/P1/P2 issues remain.

**Primary interactions tested**

- Existing country navigation remains present above the section.
- The section image is a non-interactive editorial asset; no broken slider controls remain.
- Mobile navigation remains visible in the checked state.

**Implementation checklist**

- [x] Selected Option 1 implemented on homepage.
- [x] Four proof statements converted to semantic ordered list rows.
- [x] Desktop and 390 px mobile rendering checked.
- [x] No horizontal overflow or application console errors.

**Follow-up polish**

- None required for this iteration.

final result: passed
