## Root cause

Console on `/shop/quiz/results` shows the 50ml/100ml **Add to Cart** failing before any Shopify call:

```
Error saving scent: invalid input syntax for type uuid: "anonymous-test-user"
```

`src/pages/QuizResults.tsx:210` inserts into `public.saved_scents` with `user_id: 'anonymous-test-user'`, but `saved_scents.user_id` is a `uuid` column (verified via DB). Postgres rejects with `22P02`, the `try` block throws, and we toast "Failed to add to cart" — no edge function call, no Shopify cart create. (Hence no edge-function call in the network log.)

This only surfaces for the single-bottle CTAs because those scents are quiz-generated (id prefixed with `default-`), so `isValidUUID` returns false and we hit the insert branch every time.

A second latent issue: even after the UUID fix, `create-shopify-product-from-scent` does its own `supabaseAdmin.auth.getUser(token)` check and returns 401 when no real session exists. Per memory, auth is currently bypassed end-to-end (`isAdmin=true`, `verify_jwt=false`), so this edge function also needs to fall back to the test user instead of 401.

## Fix

### 1. `src/pages/QuizResults.tsx` — use a valid UUID for the anonymous test user

- Add a constant `const ANON_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';`
- Replace `user_id: 'anonymous-test-user'` with `user_id: ANON_TEST_USER_ID` in the `saved_scents` insert (line ~210).

### 2. `supabase/functions/create-shopify-product-from-scent/index.ts` — match the project-wide auth bypass

- If `Authorization` header is missing OR `auth.getUser(token)` fails, fall back to `ANON_TEST_USER_ID = '00000000-0000-0000-0000-000000000000'` instead of returning 401. Log a clear `[auth-bypass]` warning so this is easy to find when re-enabling auth.
- Use `supabaseAdmin` (service role) to read/write `saved_scents` in the bypass path so RLS doesn't block the lookup. When a real user is present, keep using the user-scoped client as today.
- Use the resolved user id (real or fallback) for the `.eq('user_id', ...)` filter on the scent lookup.

No other behavior changes; the rest of the edge function (Shopify product creation, mapping inserts, response shape) stays identical.

### 3. Out of scope

- No design changes.
- No changes to `cartStore.ts`, the Storefront API cart mutations, or any other add-to-cart caller — those already work (Discovery Set CTA returned a valid `cartCreate` in the latest network log).
- We do NOT change `saved_scents.user_id` to nullable or drop the FK; the placeholder UUID is enough for E2E testing and matches the existing "Testing Auth Bypass" memory.

## Verification

1. On `/shop/quiz/results`, in Section C, pick **50ml** for Velvet Whisper → click **Add to Cart**.
   - Console: `Scent saved successfully with ID: <uuid>` (no `22P02`).
   - Network: edge function `create-shopify-product-from-scent` returns 200 with `productId` + `variantIds`.
   - Network: Shopify `cartCreate` (or `cartLinesAdd`) returns 200 with empty `userErrors`.
   - UI: success toast, cart drawer opens, badge increments.
2. Repeat with **100ml** → same expected behavior, price ₹1899 reflected in the cart line.
3. Repeat for Mystic Aura and Midnight Shadow → each creates its own Shopify product and adds a separate line.
4. Re-clicking Add to Cart for the same scent/size should hit the `if (scent.shopify_product_id)` short-circuit in the edge function (no duplicate Shopify product created) and just add another line / increment quantity.
