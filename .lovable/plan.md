## Goal

For **custom (AI/quiz) scents only**: customers can no longer buy a single 30ml bottle. The only way to get 30ml is the **3-bottle Custom Discovery Set** (mix 3 different custom scents) at **₹1,500** (existing Discovery Set). They can still buy a single **50ml** or a new single **100ml**. Signature Collection products are untouched.

## Scope of changes (UI only — no pricing or product changes besides adding 100ml)

### 1. Add 100ml as a custom-scent size

- `src/pages/QuizResults.tsx` — extend the `prices` object on each recommended scent to include `'100ml'` (suggested price to confirm: **₹1,899**, currently 30ml=₹700, 50ml=₹1,099). Add `100ml` option to the size `Select`.
- `src/pages/ScentDetail.tsx` — add `100ml` to size options, default selection logic, and the `addItem` mapping (`options.values` array becomes `['30ml','50ml','100ml']`, but 30ml row is rendered disabled — see step 2).
- `src/components/account/ReorderModal.tsx` — add a 3rd `SIZES` entry `{ size: '100ml', price: 1899 }`.
- `src/components/library/ScentDetailDrawer.tsx` — when item is a custom scent, render 50ml/100ml only (30ml hidden/disabled). When item is a Signature Shopify product, behavior unchanged.
- `supabase/functions/create-shopify-product-from-scent/index.ts` — add a 100ml variant alongside the existing 30ml/50ml variants so Shopify cart resolves the new size.

### 2. Disable single 30ml purchase for custom scents

In each entry point that lets a user add a **custom** scent to cart:

- `src/pages/QuizResults.tsx`:
  - Remove the standalone 30ml option from the per-scent size `Select` (only `50ml` and `100ml`).
  - Keep the "Get All 3 as 30ml Discovery Set" CTA — this remains the only way to get 30ml.
  - Default `selectedSize` becomes `'50ml'`.
- `src/pages/ScentDetail.tsx`:
  - Render the 30ml size button as disabled with helper copy "Only available in the 3-bottle Discovery Set".
  - Add a secondary CTA "Add to Discovery Set" that links back to `/shop/quiz/results` (or opens the discovery-set flow) when the user wants 30ml.
- `src/components/account/ReorderModal.tsx`:
  - Detect custom scent (default-true here since reorder targets user's own saved scents). Hide the 30ml tile; default to 50ml.
- `src/components/library/ScentDetailDrawer.tsx`:
  - For custom scents (`item.source === 'scent'`), hide 30ml from size buttons.
  - Signature collection items (`item.source === 'shopify'` for signature handles): no change.

### 3. Cart-side safety net

`src/stores/cartStore.ts` — add a guard in `addItem`: if `selectedOptions` contains `{ name: 'Size', value: '30ml' }` AND the product handle starts with `custom-scent-` (custom scents use this handle prefix per `ReorderModal.tsx`), reject with a toast "30ml custom scents are sold only as a Discovery Set of 3". This catches any missed entry point.

### 4. Discovery Set composition rule (mix 3 different)

Today the "Get All 3 as 30ml Discovery Set" button on `/shop/quiz/results` already adds the **pre-made `discovery-set-30ml` Shopify product** (single line item, single variant). Since the answer is "mix 3 different custom scents", we need the set to actually carry the 3 generated scents:

- Update `handleAddDiscoverySet` in `QuizResults.tsx` to call `create-shopify-product-from-scent` for each of the 3 recommended scents (parallel), then add **3 separate 30ml line items** to the cart (one per custom scent) instead of the generic discovery-set product. Total still presents as ₹1,500 by applying a fixed discount code or by using Shopify bundle pricing.
- Simpler interim approach (recommended for this iteration): keep the existing `discovery-set-30ml` Shopify product as the single cart line, but attach the 3 scent IDs / fragrance codes as line-item properties so production-queue and the webhook handler can still produce the right 3 bottles. This avoids needing a discount rule and matches the existing webhook flow.

### 5. Out of scope

- No DB schema changes.
- No new Shopify discount codes.
- No changes to Signature Collection products or signature 30ml purchases.
- 100ml machine production support (assumed handled by the existing `machine_formulas.total_volume_ml` parameter; just pass 100 instead of 30).

## Open items needing your confirmation

1. **100ml price** for custom scents — I proposed ₹1,899; confirm or override.
2. **Discovery Set composition** — go with the simpler "line-item properties on existing discovery-set-30ml product" approach (faster, no discount engineering) or the "3 separate line items + bundle discount" approach (cleaner cart UX)?
3. Should the disabled 30ml button on `ScentDetail` say something specific, or just hide it entirely?

Once you confirm, I'll implement.
