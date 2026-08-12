# Drop your half-gallon (74 oz) photos here

Upload the whole folder — any filenames, any sizes, any formats. Claude picks the best two,
crops and compresses them, saves them as `hg-main.jpg` and `hg-alt.jpg` in `assets/img/`, and
deletes this folder in the same commit.

## What's needed

Just **two good shots** of the 74 oz bottle:

| Slot | Ideal shot |
|---|---|
| `hg-main.jpg` | The half gallon on its own, showing the time markers if possible |
| `hg-alt.jpg` | A second angle — the measurement scale, the cap, or the bottle in use |

More is fine — extras give a better choice. Shots that show the 74 oz **next to** the gallon are
especially useful, since size comparison is exactly what the toggle is for.

## Good sources in the brand Drive

- `BOTTLE/half a gallon/`
- `Half A gallon/`

## Before uploading

GitHub's browser uploader rejects files over 25 MB and caps each batch at 100 files. If your
originals are large, downscale first — on a Mac, no install needed:

```bash
cd ~/Downloads/YOUR_FOLDER
mkdir -p ~/Desktop/hg-web
for f in *.jpg *.jpeg *.png *.JPG *.PNG; do
  [ -e "$f" ] || continue
  sips -Z 2000 "$f" --out ~/Desktop/hg-web/"$f" >/dev/null
done
```

Then upload from `~/Desktop/hg-web`.
