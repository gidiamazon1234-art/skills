# Product photography — drop your files here

The site already references these filenames. **Upload a file with the exact name below and it
appears automatically** — no code changes needed. Until a file exists, the page falls back to the
built-in SVG illustration, so the site never looks broken.

| Filename | Where it appears | Recommended | Notes |
|---|---|---|---|
| `hero.jpg` | Home hero, right-hand card | ~1200×1400, portrait | Single bottle, Blue & Black. Transparent PNG or white/light background works best. |
| `product-main.jpg` | Product page, main gallery | ~1400×1400, square | The hero product shot. Show the time markers if possible. |
| `product-alt.jpg` | Product page, 2nd thumbnail | ~1400×1400, square | Alternate angle, or the Black colourway. |
| `colors.jpg` | Home, "Four colourways" section | ~1400×1400, square | The full colourway line-up. |
| `lifestyle.jpg` | About page, story block | ~1600×1200, landscape | Gym / in-use shot. |

## Format & size

- **JPG** for photos, **PNG** only when you need transparency, **WebP** is ideal if you have it
  (rename to the same base name, e.g. `hero.webp`, and tell me — I'll update the `<source>`).
- Keep each file **under ~400 KB** so pages stay fast. Anything over ~1 MB will hurt load time.
- These are served as-is; the site does not resize them, so export at roughly the sizes above.

## Good sources in the brand Drive

- `BOTTLE/one gallon/new/#1/SCHEME/` — per-colourway bottle renders
- `חנות/store energybud/01 Home/02_COLORS.jpg` — colourway line-up
- `חנות/store energybud/01 Home/00_TOP BANNER_v3.jpg` — hero-style banner

## How to upload

Drag the files into this folder on GitHub (Add file → Upload files) on the
`claude/energybud-brand-site` branch, or commit them locally:

```bash
cp ~/Downloads/hero.jpg sites/energybud/assets/img/
git add sites/energybud/assets/img && git commit -m "Add product photography" && git push
```
