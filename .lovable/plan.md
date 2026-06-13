# Plan

## What I’ll fix

1. **Normalize quiz result formulas before saving**
   - Update the save flow so the fragrance formula is converted from the current nested shape:
     ```text
     { top: [...], heart: [...], base: [...] }
     ```
     into the flat array shape the database requires:
     ```text
     [{ category: 'top', name: '...', percentage: ... }, ...]
     ```
   - Apply this in `src/components/SaveScentDialog.tsx` before inserting into `saved_scents`.

2. **Normalize formulas in the add-to-cart edge function too**
   - Update `supabase/functions/create-shopify-product-from-scent/index.ts` so when quiz-result scents are turned into purchasable products, the server also converts nested formulas to the required flat array before inserting into `saved_scents`.
   - This fixes the current failure for full-size bottle add-to-cart from quiz results.

3. **Fix the false-success save callback on dialog close**
   - Update the quiz results dialog wiring in `src/pages/QuizResults.tsx` so the “saved” UI state only triggers after a real successful save, not whenever the modal closes.
   - This prevents the page from looking like save worked when the insert actually failed.

4. **Validate the affected flows only**
   - Verify:
     - Save fragrance from a quiz result card
     - Add 50ml or 100ml from a quiz result card
     - Discovery Set path remains unchanged

## Root cause confirmed

- The database check constraint on `public.saved_scents` is:
  - `formula` must be non-null
  - `formula` must be a JSON **array**
  - that array must have at least one item
- Current quiz results are passing a nested object instead, which causes:
  - save failure in `SaveScentDialog`
  - add-to-cart failure in `create-shopify-product-from-scent`

## Technical notes

- Confirmed constraint:
  - `saved_scents_formula_nonempty = CHECK (formula IS NOT NULL AND jsonb_typeof(formula) = 'array' AND jsonb_array_length(formula) > 0)`
- Confirmed current failing insert path:
  - `src/components/SaveScentDialog.tsx`
  - `supabase/functions/create-shopify-product-from-scent/index.ts`
- No business-rule change is needed.
- No cart UX redesign is needed.
- Most likely **no database migration** is needed; this is a payload-shape bug.

## Files to update

- `src/components/SaveScentDialog.tsx`
- `src/pages/QuizResults.tsx`
- `supabase/functions/create-shopify-product-from-scent/index.ts`