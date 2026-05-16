## Goal
When Add to Cart / Buy Now is disabled (or stock is low), show a tooltip + inline helper text explaining why.

## Changes — `src/pages/ProductDetail.tsx` only

1. **Derive a single `stockMessage`** alongside existing `isOutOfStock` / `maxQuantity`:
   - If `!selectedVariant?.availableForSale` or `quantityAvailable <= 0` → `"Sold out"`
   - Else if `quantityAvailable <= 10` → `"Only N left in stock"`
   - Else → `null`

2. **Wrap Add to Cart and Buy Now buttons** in shadcn `Tooltip` (import from `@/components/ui/tooltip`, plus a single `TooltipProvider` around both). Tooltip only renders when `stockMessage` exists, content = `stockMessage` (or `"Sold out — restock soon"` when out of stock).
   - Because disabled buttons don't fire pointer events, wrap each button in a `<span tabIndex={0}>` so the tooltip still triggers on hover/focus.

3. **Inline helper text** below the Buy Now button (replacing / augmenting the current "Only N left" hint under the quantity stepper):
   - Out of stock → red-tinted line: `This variant is sold out. Try another size.`
   - Low stock → existing gold/80 line: `Only N left in stock — order soon.`
   - Move the existing low-stock line out from under the quantity stepper to sit right under the CTAs so it's adjacent to the disabled state.

4. **Aria**: add `aria-describedby` on each button pointing to the helper text `<p id="stock-helper">` for screen readers.

No changes to cart logic, Shopify queries, or styling tokens beyond using existing `text-red-400` / `text-gold/80` classes already in the design system.

## Out of scope
- No new dependencies
- No backend / shopify.ts changes
- No variant-pill tooltip changes (sold-out variants already show strikethrough)