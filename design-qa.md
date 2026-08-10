**Source visual truth**

- Selected visual reference: `/workspace/scratch/65e995573032/upload/525cf511-26b4-4a67-8965-eed1715adfc4.png`.
- Target: a black, photo-led Vetratoria block with two large editorial entry points. User-required differences: use existing project photos, remove `01/02`, and use the explicit actions “Открыть блог” and “Открыть медиа”.

**Implementation evidence**

- Browser-rendered implementation: `http://terminal.local:4173/?faq-media-design-r18#media-blog`.
- Desktop viewport: 1363 × 936 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px in a local responsive browser frame, device scale factor 1.
- Source reference: 720 × 510 px. Comparison used the content region rather than surrounding browser chrome or the QA frame.
- Primary checks: both cards load real project WebP assets, “Все материалы” links to `/media/`, the left destination links to `/blog/`, the right destination links to `/media/`, text and focusable link surfaces remain available on mobile.
- Console: no page application errors. Reported errors originate from the external Chrome extension `content-script.bundle.js`.

**Full-view comparison evidence**

- The implementation keeps the target’s black editorial surface, two equally strong image-led destinations, restrained orange accents and lower media overlays.
- It uses the actual existing `home-blog.webp` and `home-media.webp` project images rather than generated or stock replacements.
- The selected numbers were removed. The CTA labels are replaced by the requested “Открыть блог” and “Открыть медиа”.

**Focused region comparison evidence**

- Typography: heading and card titles use the existing Vetratoria display scale; supporting copy stays readable over the dark image overlay.
- Spacing and layout rhythm: 20 px desktop image gap, large 390–510 px image slots, a lightweight “Все материалы” link, and an understated footer divider match the reference’s airy editorial rhythm.
- Colors and tokens: near-black page surface, existing `--line`, `--white` and `--orange` tokens preserve contrast and active affordance.
- Image quality and asset fidelity: both files are existing 1200 × 840 WebP assets with fixed intrinsic dimensions, lazy loading and `object-fit: cover`; no artificial image asset was created.
- Copy and links: two original intents are preserved; calls to action now name the destination directly.

**Findings**

- [Resolved P1] The prior component used generic smaller destination cards and generic “Открыть” labels.
  Location: `scripts/build.mjs`, home `#media-blog` section.
  Fix: dedicated `home-explore` editorial structure with two photo destinations and explicit CTA copy.
  Post-fix evidence: desktop capture shows large equal photo areas and distinct Blog/Media actions.
- [Resolved P2] At 390 px the target needed a clear single-column order and readable image overlays.
  Location: `assets/css/pages/home.css`, `@media (max-width: 700px)`.
  Fix: single-column grid, responsive image height and mobile title/body sizing.
  Post-fix evidence: 390 px browser capture shows the heading, “Все материалы” link and first card without horizontal overflow.

**Implementation checklist**

- Real project images retained and optimized existing WebP assets used.
- Card interactions remain native links with hover and focus states.
- Desktop and mobile visual QA completed.
- `npm run build`, `npm run check` and `git diff --check` passed.

**Follow-up polish**

- P3: when new portrait-oriented station photos are added to the archive, the same component can opt into 9:16 crops without changing content or the link model.

final result: passed
