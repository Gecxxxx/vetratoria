**Source visual truth**

- Selected reference: Product Design option 3, generated as `/workspace/scratch/65e995573032/generated_images/exec-0e468d22-3fc2-4a4d-9578-76ba364b23e7.png` (1440 × 1024 px).
- Implementation: browser-rendered `/dahab/?water-r19#water-area`, cloud-browser desktop viewport 1366 × 936 CSS px.
- State: informational water-area section, with all three zones visible as a route rather than a sales CTA.

**Findings**

- No actionable P0/P1/P2 differences remain. The section now has the selected direction’s dominant black editorial introduction, a photo/map-led lower area and a readable, numbered zone list.
- Intentional implementation difference: the existing real aerial photo retains its embedded location labels rather than adding generated route graphics over it. This keeps the content factual and legible.

**Comparison history**

- [P1, fixed] The former white card had the title, map and long zone rows at equal visual weight. It did not carry the black editorial composition selected in option 3. Fixed with `.water-area__intro` as the wide black headline panel and a dedicated route line.
- [P2, fixed] The map was portrait and visually narrow. Fixed to a 4:3 landscape visual with the information list positioned alongside it.
- [P2, fixed] The zone hierarchy was too quiet. Fixed through larger display labels, clearer row separation, orange numerals and an orange active edge for the first zone.

**Evidence and checks**

- Browser DOM confirmed the new heading, route sequence `Лагуна → Speedy → Камикадзе`, and no desktop horizontal overflow.
- Browser desktop capture was made in the Cloud Browser after building; the checked page loaded without site-origin console errors.
- A real 390px rendered iframe reported no horizontal overflow; both the introduction and map/list grids resolved to one column. Card padding and type scale further reduce at 520px and 360px.

**Required fidelity surfaces**

- Fonts and typography: existing Vetratoria type is retained; the display title uses a compact 900-weight hierarchy close to the selected direction.
- Spacing and layout rhythm: the dark introduction has a distinct top-level reading rhythm; the map and vertical zone list use a deliberate two-column grid.
- Colors and visual tokens: off-white background, black editorial surface, orange route accents and subtle warm dividers follow the selected visual.
- Image quality and asset fidelity: the existing real aerial image is used; no stock or generated location image was inserted.
- Copy and content: the factual wording for Лагуна, Speedy and Камикадзе remains unchanged.

**Implementation checklist**

- [x] Recompose the Dahab water-area section to selected option 3.
- [x] Preserve factual zone descriptions and aerial image.
- [x] Apply responsive single-column behavior.
- [x] Run static build, validation and overflow check.

**Follow-up polish**

- [P3] If a higher-resolution aerial image becomes available, it can replace the current image without changing the layout.

final result: passed
