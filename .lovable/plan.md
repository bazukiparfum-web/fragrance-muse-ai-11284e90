## Verification result

The homepage "Explore Bazuki Signature Scents" section is **not rendering** — between `HowItWorks` ("Three Steps…") and `QuizCTABanner` ("Every human deserves…"), the section silently hides itself.

### Root cause

The Shopify Storefront query in `src/lib/shopify.ts` (`STOREFRONT_QUERY`) requests `variants.quantityAvailable`, which requires the `unauthenticated_read_product_inventory` access scope — not granted on this store's Storefront token.

Console proves it:
```
Error calling Shopify: Access denied for quantityAvailable field.
Required access: `unauthenticated_read_product_inventory` access scope.
```

Because `storefrontApiRequest` throws whenever `data.errors` is present, `fetchShopifyProducts()` catches and returns `[]`. `FeaturedScents` then auto-hides on empty (`if (!loading && products.length === 0) return null`).

The debug panel works because it uses a slimmer query without `quantityAvailable`, which is why it shows "Products fetched: 3" while the homepage shows nothing. The same bug also blanks Collection, ProductShowcase, and any other surface using `fetchShopifyProducts`.

### Fix

1. **`src/lib/shopify.ts`**
   - Remove `quantityAvailable` from `STOREFRONT_QUERY` (and from `PRODUCT_BY_HANDLE_QUERY` if also present) so the query stays within the default Storefront scope.
   - Keep `quantityAvailable?: number | null` optional on the `ShopifyProduct` interface (consumers already treat it as optional).
   - Harden `storefrontApiRequest`: if `data.data` is present but `data.errors` is non-fatal (partial response), log a warning and return the data instead of throwing — so a single bad field never blanks the whole storefront.

2. **No component changes required.** `FeaturedScents`, `ShopifyProductCard`, `ProductImage`, and the loading skeleton are already correct. Once the fetch returns 3 products, the homepage section will render on both desktop (4-col grid) and mobile (horizontal snap-scroll), and `ProductImage` will continue to handle slow/failed image loads via its shimmer skeleton and "Image unavailable" fallback.

### Post-fix verification

- Reload `/` on desktop (1366) and mobile (390) viewports
- Confirm "Explore Bazuki Signature Scents" appears between HowItWorks and QuizCTABanner with real product cards (Midnight Velvet, Citrus Bloom, Ocean Breeze)
- Confirm no `[Shopify] fetchShopifyProducts failed` errors in console
- Throttle network in DevTools to verify shimmer skeleton then product image transition
- Temporarily break an image URL to confirm `ProductImage` fallback renders "Image unavailable" without breaking the grid
