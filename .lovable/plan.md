## Root cause

Console shows:
```
Error saving scent: new row violates row-level security policy for table "saved_scents"
```

In `src/pages/QuizResults.tsx` (line ~205), the handler tries to client-insert the scent into `saved_scents` with a hard-coded `user_id: '00000000-0000-0000-0000-000000000000'`. The RLS INSERT policy on `saved_scents` is `WITH CHECK (auth.uid() = user_id)`, so:

- Anonymous users: `auth.uid()` is `null` → blocked.
- Logged-in users: `auth.uid()` is their real id, not the zero UUID → blocked.

So every fresh quiz recommendation (`id` starts with `default-`, not a UUID) fails at the save step, the catch fires, and the user sees "Failed to add to cart."

## Fix

Move the save server-side into the existing `create-shopify-product-from-scent` edge function (already uses the service-role client, already resolves the auth'd user or falls back to the anon test user).

### Edge function `supabase/functions/create-shopify-product-from-scent/index.ts`

Accept an optional `scent` payload in the request body. New flow:

1. Parse `{ scentId, scent }` from body.
2. If `scentId` is missing OR not a valid UUID (e.g. `default-1`):
   - Require `scent` payload (name, formula, matchScore, intensity, longevity, prices, formulationNotes, quizAnswers).
   - Insert into `saved_scents` via the service-role client using the resolved `userId` (real user when authed, else `ANON_TEST_USER_ID`).
   - Use the inserted row's `id` as `scentId`.
3. Continue with the existing variant-resolution / `shopify_product_id` tracking code unchanged.

Validation: reuse the same shape the client currently sends (`formula`, `match_score`, `intensity`, `longevity`, `prices`, `formulation_notes`, `quiz_answers`).

### Client `src/pages/QuizResults.tsx`

In `handleAddToCart`:

- Remove the client-side `supabase.from('saved_scents').insert(...)` block.
- When `!isValidUUID(scent.id)`, call the edge function with the full scent payload instead of a scentId:
  ```ts
  const { data, error } = await supabase.functions.invoke(
    'create-shopify-product-from-scent',
    { body: { scent: {
        name: scent.name,
        formula: scent.formula,
        match_score: scent.matchScore,
        intensity: scent.intensity,
        longevity: scent.longevity,
        prices: scent.prices,
        formulation_notes: scent.formulationNotes,
        quiz_answers: answers,
      } } }
  );
  ```
- When the id IS a valid UUID, keep the current `{ scentId }` call.
- Apply the same change to `handleAddDiscoverySet` if it follows the same pattern (verify lines 321+).

No DB / RLS changes. No new edge function. Cart store + Storefront API flow downstream is unchanged.

## Out of scope

- Touching RLS policies on `saved_scents` (they are correct).
- Changing the recommendation engine output format.
- The `useEngraving` / engraving panel work from prior turns.
