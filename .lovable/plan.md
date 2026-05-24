## Problem

On the saved scent detail page (`/shop/account/scents/:id`), the "Fragrance Formula" section renders only the progress bars and percentages — note names are blank.

Cause: saved formulas store the note name under the `note` field (e.g. `{ "note": "Black Pepper", "category": "top", "percentage": 15, ... }`), but the UI reads `note.name`, which is undefined, so the label renders as an empty string.

Verified against the current row:
```
[{ "note": "Black Pepper", "family": "spicy", "category": "top", "percentage": 15 }, ...]
```

## Fix

Render `note.name ?? note.note` everywhere a saved-scent formula is displayed. This is purely a presentation fix — no DB migration, no edge function changes, no rewrite of the saving pipeline.

### Files to update

1. **`src/pages/ScentDetail.tsx`** — three spots (Top / Heart / Base notes) at lines 280, 298, 316. Replace `{note.name}` with `{note.name ?? note.note}`.
2. **`src/pages/SharedFragrance.tsx`** — same pattern in the Fragrance Formula block.

### Out of scope

- Normalising saved formulas in the database.
- Changing how `quiz-recommendations` / `SaveScentDialog` write the formula.
- Any other section of the page.

## Verification

Reload `/shop/account/scents/bb1b55be-...` and confirm each progress bar now shows its note name (Black Pepper, Rose, Jasmine, Amber, Sandalwood, Oud).
