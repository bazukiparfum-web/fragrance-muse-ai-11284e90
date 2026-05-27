## Goal

Fix the three visual issues on `/shop/quiz/results` match cards (per screenshot): leaking note-pill legend on the right of each pyramid, clipped "TOP" text, and uneven card heights.

## Changes (UI-only)

### 1. `src/pages/QuizResults.tsx` — match cards in Section A

- Change the `FragrancePyramid` `size` from `"md"` to `"sm"`. The `sm` preset has `showLegend: false`, which removes the side legend column that's currently leaking the faint pill/circle artifacts on the right edge of every card.
- Make all 3 cards the same height and align the Save button to the bottom:
  - Add `h-full flex flex-col` to the `Card`.
  - Wrap the inner `<div className="p-6">` content so the Save button sits in a footer that uses `mt-auto`.
- Center the pyramid horizontally within the smaller card width.

### 2. `src/components/FragrancePyramid.tsx` — TOP layer text fit

- The TOP slice is very narrow; the current `fontSize: 11` for the "TOP" label and `fontSize: 8` for the note names still gets clipped by the slice geometry. Reduce the top label to `fontSize: 9` and the top notes line to `fontSize: 7`, and bump `labelY` from `30` to `32` so it sits visually centered in the narrow slice. Also truncate top-layer note names to ~22 chars (instead of 38) so they don't overflow the narrow top.
- No changes to heart/base sizing.

### 3. Out of scope

- No changes to the Discovery Set CTA or the secondary 50ml/100ml section.
- No changes to pyramid geometry, colors, tooltips, accessibility, or animations.
- No changes to any other page that uses `FragrancePyramid`.

## Acceptance

- Each match card shows only the pyramid + longevity strip (no pill legend leaking on the right).
- All 3 cards are the same height; Save buttons line up.
- "TOP" label and top-note text sit cleanly inside the pyramid's top slice.
