# Prevent Saving Fragrances Without a Formula

## Problem

The "Amber Ember v2" scent was saved with an empty Fragrance Formula. Because there are no notes, the Tweak Formula dialog has nothing to render or rescale, making the scent useless. Multiple code paths can insert into `saved_scents` without verifying that `formula` is a non-empty array.

## Root Cause

Four call sites insert into `saved_scents`:
1. `src/components/FormulaTweakDialog.tsx` — only blocks when `totalPercentage === 0`, but allows an empty array if somehow opened that way.
2. `src/components/SaveScentDialog.tsx` — no formula validation at all.
3. `src/components/account/TweakSlidersDrawer.tsx` — no formula validation.
4. `src/pages/QuizResults.tsx` (Add to Cart path) — no formula validation; silently saves whatever recommendation arrived.

The database column `formula` is `jsonb` with no constraint, so an empty `[]` or `null` is accepted.

## Plan

### 1. Client-side guard (helper)
Add `src/lib/formulaValidation.ts` exporting `isValidFormula(formula): boolean` — true when formula is an array with ≥1 note that has a name/note field and percentages summing to > 0. Also export `assertValidFormula(formula)` that throws a user-friendly Error.

### 2. Apply the guard at every insert site
- **SaveScentDialog.handleSave** — early-return with `toast.error("This fragrance has no formula and cannot be saved.")`.
- **FormulaTweakDialog.handleSave** — replace `totalPercentage === 0` check with `isValidFormula`. Also block opening the dialog: if `originalScent.formula` is empty, surface a toast from the caller (already in place for ScentDetailDrawer); add the same guard inside the dialog effect as a safety net.
- **TweakSlidersDrawer.handleSave** — same guard.
- **QuizResults.handleAddToCart** — guard before insert; abort add-to-cart with a clear toast if the recommendation has no formula (this is the path that likely produced the bad row).

### 3. ScentDetail UI hardening
In `src/pages/ScentDetail.tsx`:
- When `scent.formula` is empty/missing, render an "Incomplete formula" empty state in the Fragrance Formula card instead of a blank panel.
- Disable the "Tweak Formula" button with a tooltip "No formula to tweak" when empty.

### 4. Database constraint (defense in depth)
Migration on `public.saved_scents`:
- Add a CHECK constraint: `formula IS NOT NULL AND jsonb_typeof(formula) = 'array' AND jsonb_array_length(formula) > 0`.
- Keep it as a NOT VALID constraint first, then `VALIDATE` — but only after we clean the existing bad row(s). Plan includes a one-time cleanup step:
  - Identify rows where the constraint would fail.
  - Either delete them or mark them (decision deferred to user; default = delete since they are unusable).

### 5. Verification
- Open `/shop/account/scents/e042f82f-...` after migration — confirm it's gone (or shows empty-state UI if kept).
- Re-run quiz → Add to Cart with a valid recommendation → row saved with non-empty formula.
- Attempt insert via SQL with `formula = '[]'::jsonb` → rejected.
- Tweak This Scent on a community scent with formula → opens dialog. On one without → toast + redirect (already implemented).

## Files Touched

- new: `src/lib/formulaValidation.ts`
- edit: `src/components/SaveScentDialog.tsx`
- edit: `src/components/FormulaTweakDialog.tsx`
- edit: `src/components/account/TweakSlidersDrawer.tsx`
- edit: `src/pages/QuizResults.tsx`
- edit: `src/pages/ScentDetail.tsx`
- migration: add CHECK constraint on `saved_scents.formula` (+ cleanup of existing empty rows)

## Out of Scope

- Quiz recommendation engine itself (only validating its output before persistence).
- Shopify product creation flow beyond the pre-save guard.
- Auth/RLS changes.

## Question for you

Before I run the migration: the existing empty row(s) like "Amber Ember v2" — **delete them** outright, or **keep and just show the empty-state UI**? Default if you don't answer: delete.
