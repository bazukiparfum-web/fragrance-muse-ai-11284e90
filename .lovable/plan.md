# Fix: Add to Cart not working

## Root cause

Network log on `/shop/quiz/results` shows Shopify's Storefront API rejecting the cart with:

> "The merchandise with id `gid://shopify/ProductVariant/47200402669788` does not exist."

That variant is **hardcoded** in `src/pages/QuizResults.tsx` (lines 321 / 342 / 359) for the "30ml Discovery Set" CTA — it does not exist in the connected Shopify store, so cart creation fails. But:

- `addItem(...)` is called without `await`, and
- `toast.success('Added 30ml Discovery Set to cart!')` fires immediately,

so the UI lies — the user sees success while nothing was added. This matches the session replay (toast appeared, cart icon never updates).

The per-scent "Add to Cart" handler in the same file (line 253) has the same swallowed-result bug: it does `await` the edge function but never awaits `addItem`, so a returned `false` is silently hidden behind a success toast.

Several other call sites have the same "no await / always toast success" pattern and should be audited while we're here.

## Changes

### 1. `src/pages/QuizResults.tsx` — `handleAddDiscoverySet`

Replace the hardcoded product/variant block with a real lookup against the live Shopify store.

- Fetch the Discovery Set by handle (`discovery-set-30ml`) via the existing `storefrontApiRequest` helper in `src/lib/shopify.ts` using a `productByHandle` query that returns `id`, `handle`, `title`, `priceRange`, `images(first:1)`, `variants(first:5)`, `options`.
- If the product or its first available variant cannot be found, surface `toast.error('Discovery Set is currently unavailable.')` and bail. Do **not** call `addItem`.
- Build the `CartItem` from the real Shopify response (real `variantId`, `price`, `selectedOptions`), then `const ok = await addItem(...)`.
- Only toast success when `ok === true`. On failure, `toast.error('Failed to add Discovery Set. Please try again.')`.
- Open the cart drawer on success via `useCartStore.getState().openDrawer()` so the user sees the result.

### 2. `src/pages/QuizResults.tsx` — per-scent add handler (~line 253)

- `await addItem({...})`, capture the boolean, toast success only when `true`, toast error otherwise.
- Open cart drawer on success.

### 3. Audit other `addItem` callers for the same bug

Update these to `await` and gate the success toast on the returned boolean (no behavior change otherwise):

- `src/components/account/ReorderModal.tsx` (line ~50)
- `src/pages/Account.tsx` (line ~268)
- `src/pages/ScentDetail.tsx` (line ~89)
- `src/components/ProductShowcase.tsx` (line ~76)

`ShopifyProductCard.tsx`, `FeaturedScents.tsx`, and `ProductDetail.tsx` already do this correctly — leave them alone.

### 4. Out of scope

- No design changes.
- No changes to `cartStore.ts`, edge functions, or the Discovery Set Shopify product itself. If the `discovery-set-30ml` handle does not exist in Shopify either, the new error toast will tell us and we'll create the product in Shopify as a follow-up.

## Verification

1. On `/shop/quiz/results` click **Add 30ml Discovery Set to Cart** → cart badge increments, drawer opens, network shows a successful `cartCreate` with no `userErrors`.
2. Click per-scent **Add to Cart** for a recommended scent → same expected behavior.
3. With a deliberately invalid variant, confirm an **error** toast now appears instead of a fake success.
