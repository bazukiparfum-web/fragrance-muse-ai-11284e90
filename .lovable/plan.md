## Problem
The `/collection` page currently fetches all Shopify products via `fetchShopifyProducts()` with no query filter. This causes aroma diffusers (which are tagged `diffuser` in Shopify) to appear alongside fragrances in the scent library.

## Fix
Update the `fetchShopifyProducts()` call in `src/pages/Collection.tsx` to pass a Shopify Storefront API query that excludes the `diffuser` tag.

### Code change
In `src/pages/Collection.tsx` (~line 35):
```diff
-      fetchShopifyProducts(),
+      fetchShopifyProducts(50, "NOT tag:diffuser"),
```

This keeps fragrances, discovery sets, and other products while hiding diffuser hardware from the library grid. Diffusers will continue to appear on the dedicated `/business` page, which already uses `tag:diffuser`.

## Files touched
- `src/pages/Collection.tsx` (1 line changed)