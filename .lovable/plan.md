# Wire /collection (Scent Library) to real Shopify products

The existing `/collection` page already fetches Shopify via `fetchShopifyProducts()` + public Supabase scents and renders both through `ScentCard`. The current card is notes-focused (pyramid, note pills) and has no image, no variant selector, no in-card Add to Cart. The request is to make Shopify products render as proper shoppable cards (image, ₹ price, variant dropdown, Add to Cart, Out of Stock), with skeleton/error/empty states. No cart logic changes — we'll use the existing `useCartStore.addItem` that's already wired to the Storefront API.

## Scope

- Only `/collection` (Scent Library) page.
- Community/public Supabase scents continue to appear (per memory: unified marketplace), but render through a separate lightweight community variant of the card so the spec applies cleanly to Shopify items.
- No changes to cart store, drawer, or checkout.

## Changes

### 1. `src/lib/shopify.ts` — extend Storefront query
- Update `STOREFRONT_QUERY` to request the fields listed in the spec (already covers id/title/handle/description/priceRange/variants/images). Verify `variants(first: 10)` and `images(first: 1)` match; reduce `images` to first 1 if needed (currently first 5 — leave as is, it's a superset and harmless).
- No API signature changes.

### 2. New `src/components/library/ShopifyProductCard.tsx`
Card for `LibraryItem` where `source === "shopify"`. Dark luxury styling matching existing tokens (`bg-bz-card`, `border-gold`, `rounded-xl`, hover `glow-gold-sm`).
- **Image:** `aspect-[4/5]` top section, `object-cover`, Shopify image URL with `altText` fallback to title. Graceful placeholder div if no image.
- **Title:** `font-display text-xl text-cream`.
- **Price:** Formatted as `₹{Math.round(amount)}` using the selected variant's price (or min variant price if no selector). Currency code shown only if not INR.
- **Variant selector:** If `variants.length > 1`, render a shadcn `<Select>` (dark trigger: `bg-bz-secondary/60 border-gold-strong text-cream`, gold border, gold focus ring). Options show variant title + price. Selecting updates displayed price and the variant used for Add to Cart. Unavailable variants are still selectable but render greyed.
- **Add to Cart:** Primary gold button (`bg-gold text-primary-foreground rounded-pill`). Disabled when `selectedVariant.availableForSale === false` OR `useCartStore.isLoading`. Calls `addItem({ product: raw, variantId, variantTitle, price, quantity: 1, selectedOptions })`. Shows `Loader2` spinner while `isLoading`. Success → `toast.success`.
- **Out of Stock:** When selected variant is unavailable, button is disabled and label switches to `Out of Stock` in `text-cream-muted`.
- Clicking the card body (image/title area) still opens the existing `ScentDetailDrawer` (preserve current behavior). The Add to Cart and Select use `e.stopPropagation()`.

### 3. New `src/components/library/CardSkeleton.tsx`
- Same dimensions as the card (`aspect-[4/5]` image + ~140px footer).
- `bg-[#1A1A1A]` with a shimmer overlay via Tailwind arbitrary keyframes:
  - Add a CSS keyframe `shimmer-gold` in `src/index.css`: `0% { transform: translateX(-100%) } 100% { transform: translateX(100%) }`.
  - Sweep is `linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.05) 50%, transparent 100%)`, absolutely positioned, `animation: shimmer-gold 1.8s linear infinite`.

### 4. New `src/components/library/CollectionStates.tsx`
Two small components:
- `<CollectionError onRetry={fn} />` — centered, message `"Unable to load products. Please refresh."` in `text-cream`, gold outline `Retry` button (`variant="outline" border-gold-strong text-gold hover:bg-gold hover:text-primary-foreground`).
- `<CollectionEmpty />` — centered Bazuki logo (use `/favicon.png` per memory or existing wordmark if present in `src/assets`) above message `"Our scent library is being updated. Check back soon."` in `text-cream-muted`.

### 5. `src/pages/Collection.tsx`
- Track `error` state. Wrap fetch in try/catch; if both Shopify and Supabase reject, set error. (Shopify reject alone shouldn't error because community scents may still render — but if BOTH fail, show error.)
- Extract the fetch into a `loadLibrary` callback so `Retry` can invoke it.
- Replace the loading spinner block with a grid of 6 `<CardSkeleton />`.
- Replace the "Nothing here yet" block with `<CollectionEmpty />` when `items.length === 0` and no error.
- On error, render `<CollectionError onRetry={loadLibrary} />`.
- In the rendered grid, branch by `item.source`:
  - `shopify` → `<ShopifyProductCard item={item} onOpen={openItem} />`
  - `scent` → existing `<ScentCard />` (unchanged — community scents keep their notes pyramid).

### 6. `src/index.css`
Add the `shimmer-gold` keyframes alongside existing animations. No token changes.

## Verification

1. Preview `/collection`: 6 skeletons flash, then real Shopify cards appear with images, ₹ prices, variant dropdown for multi-variant products (e.g. Discovery Set / 30ml-50ml products), and Add to Cart.
2. Picking 50ml in the dropdown updates the displayed price.
3. Click Add to Cart on an in-stock product → cart drawer count increments, toast appears, no console errors.
4. Force a fetch failure (temporarily block storefront URL in devtools) → error block with working Retry.
5. Filter to a mood with zero items (after temp-clearing) → empty state with logo.
6. Verify out-of-stock variant disables the button and shows "Out of Stock".

## Files touched

- New: `src/components/library/ShopifyProductCard.tsx`
- New: `src/components/library/CardSkeleton.tsx`
- New: `src/components/library/CollectionStates.tsx`
- Edit: `src/pages/Collection.tsx`
- Edit: `src/index.css` (one keyframe block)
- Edit: `src/lib/shopify.ts` only if needed (likely no change — query is already a superset)

No cart/checkout work, no schema changes, no removal of community scents.
