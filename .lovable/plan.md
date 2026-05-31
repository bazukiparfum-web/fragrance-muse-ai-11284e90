## Root cause

The Reorder modal on `/shop/account?tab=scents` calls the edge function `create-shopify-product-from-scent`, which fails for two reasons:

1. **Owner mismatch in auth-bypass mode.** The saved scents in the DB belong to real users (e.g. "Velvet Aura v3" → `fc414540-...`). With auth bypassed, the function falls back to `ANON_TEST_USER_ID = '00000000-...'` and then runs `.eq('user_id', userId)` on `saved_scents`. No row matches → scent treated as "not found".

2. **Crash on the not-found path.** Line 89 references `user.id` (the `user` variable no longer exists in the refactored code), so the function throws a `ReferenceError` and returns a 500 instead of a clean 404. The UI shows the generic "Failed to add to cart" toast.

A real user signing in would have hit bug #2 silently anyway because of bug #1 mismatch in any bypass test.

## Fix

Edit `supabase/functions/create-shopify-product-from-scent/index.ts`:

- When running in auth-bypass mode (`useAdmin === true`), drop the `.eq('user_id', userId)` filter on the `saved_scents` lookup so any saved scent can be reordered during E2E testing. Keep the user-id filter when a real session is present.
- Replace the stale `user.id` reference on line 89 with `userId` so the not-found branch returns a proper 404 instead of crashing.
- Also use `supabaseAdmin` for the post-create `update` and `insert` calls in bypass mode, so RLS does not silently block writing back `shopify_product_id` / mappings.

No other files change. ReorderModal, cart store, and Shopify variant handling stay as-is — the 50ml/100ml variants are already created correctly by the edge function.

## Out of scope

- Bottle-size policy (the project memory says 30ml/50ml only, but the modal already offers 50ml/100ml; not changing that in this fix).
- Restoring real auth — the testing bypass stays.

## Verification

On `/shop/account?tab=scents`, click Reorder on "Velvet Aura v3" → pick 50ml or 100ml → Add to Cart. Expected: edge function returns 200 with `productId` + `variantIds`, cart drawer opens, success toast. Network shows no 500 from `create-shopify-product-from-scent`.
