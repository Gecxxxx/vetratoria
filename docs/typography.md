# Typography

Inter Variable is served locally, including Latin/Cyrillic and italic faces.
Edit role tokens in `assets/css/base/typography.css`; page CSS consumes these tokens.
Sizes use desktop (>1100px), tablet (701–1100px), and mobile (≤700px) breakpoints.

| Role | Desktop | Tablet | Mobile | Weight |
|---|---:|---:|---:|---:|
| H1 | 64 | 48 | 40 | 500 |
| H2 | 44 | 36 | 30 | 500 |
| H3 / card title | 26 | 24 | 22 | 500 |
| Hero lead | 18 | 18 | 16 | 400 |
| Body | 16 | 16 | 16 | 400 |
| Compact descriptions | 14 | 14 | 14 | 400 |
| Captions / eyebrow | 12 | 12 | 12 | 500 |
| Feature labels / review names | 16 | 16 | 16 | 600 |
| FAQ | 20 | 20 | 18 | 500 |
| Card price | 40 | 36 | 32 | 500 |
| Navigation | 15 | 15 | 15 | 600 |
| Buttons | 14 | 14 | 14 | 600 |

Semantic HTML and visual roles are distinct: footer h2 uses caption, destination
card h2 uses h3; visual titles rendered as b/strong use heading roles explicitly.
Arrow, close, star and avatar glyph metrics are not prose typography.
Do not reintroduce per-page numeric heading sizes or typography `!important`.

`assets/css/entry.css` lists the ordered source modules. `npm run build` bundles
them into `assets/css/main.css`, rebasing font URLs; do not edit that output.
There are no runtime CSS imports or external font requests. After changes run
`npm run build` and `npm run check`, then inspect desktop and mobile layouts.
