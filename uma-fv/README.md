# U-MA FV — Design Puzzle

White, responsive version of Design Puzzle for the u-ma.jp first view
(Uncode + WPBakery).

- `uma-puzzle.html` — paste the whole file into a WPBakery **Raw HTML** element.
  No `<html>`/`<head>`; all CSS is scoped under `#uma-puzzle`, all JS is in a closure.
- `preview.html` — the same snippet inside a dummy page (with conflicting theme CSS)
  for checking in a browser. Regenerate it after editing the snippet.

## Puzzles (12)
Overlap · CMYK · RGB · Palette · Scheme · Golden · Silver · Fibonacci ·
Layout · Jump · Editorial · Crop

One game = 10 different puzzles (easy → hard), then a final score and rank.
Back = previous question (same question again),
Reset = start this question over, Index = pick any puzzle.

## Notes
- If a security plugin strips `<script>` from Raw HTML, the puzzle will not start.
- The Crop puzzle uses a drawn placeholder scene until real photos are chosen.

## Load from GitHub (no WordPress edits for updates)
`uma-puzzle.js` is built from `uma-puzzle.html` (`python3 uma-fv/build.py`) and
served by GitHub Pages from the `main` branch. The Raw HTML element then only needs:

```html
<div id="uma-puzzle"></div>
<script src="https://hanamarufujii.github.io/test_sample/uma-fv/uma-puzzle.js" defer></script>
```

Pushing to `main` updates the live site within minutes (GitHub Pages caches ~10 min).
`preview-2lines.html` checks this setup locally.

## First view (typographic motion)
`uma-hero.js` — white, black type, one red hyphen. Fills the screen (landscape on PC,
portrait on SP), plays once (~6 s) and rests on the final layout. Raw HTML:

```html
<div id="uma-hero"></div>
<script src="https://hanamarufujii.github.io/test_sample/uma-fv/uma-hero.js" defer></script>
```
`preview-hero.html` checks it inside a boxed theme-like column.
