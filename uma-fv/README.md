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

Opens straight into a random puzzle. Back = previous question (same question again),
Reset = start this question over, Index = pick any puzzle.

## Notes
- If a security plugin strips `<script>` from Raw HTML, the puzzle will not start.
- The Crop puzzle uses a drawn placeholder scene until real photos are chosen.
