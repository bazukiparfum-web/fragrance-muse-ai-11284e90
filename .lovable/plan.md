
## Reference read

**PDP (mittiymade Ultimate Combo)** uses this stack, top → bottom:

1. Two-column top: gallery left, buy-box right.
2. Buy-box: title → short tagline → 3 checkmark benefit bullets → price with "Tax included / Inclusive of all taxes" → qty stepper + Add to cart → prominent "Buy It Now — 10% off on prepaid orders" → row of 3 trust badges (Free Delivery / COD / Secure Payment) → collapsible Description.
3. "Shop Our Bestsellers" recommended-products rail.
4. "Our Promise of Purity" 4-icon strip (Vegan / Paraben-Free / Sulphate-Free / Toxin-Free).
5. Customer reviews block.
6. FAQs.
7. "What makes us stand out" — image + caption feature cards.

**Collection page** (couldn't fully load — rate-limited) follows the same Shopify pattern: promo strip, product grid with dual price display, then trust/USP bands.

## What we borrow (structure only — no design changes)

Bazuki keeps its dark theme, cream/gold tokens, Cormorant headings, gold corner brackets, `bg-bz-primary/secondary/card`. We only reorganise sections and add a few missing ones.

### `src/pages/CarFreshenerDetail.tsx` — insert/reshape sections

- **Buy-box (right column)** — add above price:
  - 3 checkmark bullets: "Pure fragrance-oil formula", "30–45 days of scent", "Leak-proof glass · hand-finished cord". Use `Check` in gold on `bg-bz-card` rows.
  - Under price: small "Tax included · Shipping calculated at checkout" line.
- **Qty stepper** — add a `−  1  +` control (local state) next to Add to cart, styled with `border-gold/20` pill.
- **Secondary CTA** — replace current "Bulk / gifting" outline with a full-width "Buy it now" outline button under Add to cart, with sub-label "10% off on prepaid orders" (visual only for now; wires to same checkout flow via `openDrawer`). Keep Bulk link as a small text link below.
- **Trust badge row** — new 3-up icon row under CTAs: Truck (Pan-India delivery), Wallet (COD available), ShieldCheck (Secure payment). Uses existing gold-outline circle style from `CarFreshenersPage` TRUST strip.
- **Description accordion** — wrap the existing tagline/long copy in a collapsible `Accordion` labelled "Description", matching FAQ styling.

### New section order on PDP (after buy-box)

```text
Gallery + Buy-box
  ↓
"How to use" (existing 3 steps — keep)
  ↓
"What's inside" checklist (existing — keep, condense)
  ↓
"Our promise" 4-icon strip  ← NEW (IFRA-safe / Alcohol-free / Recyclable card / Made in India)
  ↓
"What makes Bazuki different" 3–4 image+caption cards  ← NEW
     (Slow diffusion · Balanced, never harsh · Leak-proof glass · Fine-fragrance oils)
     Reuses each freshener's own gallery images — no new assets needed.
  ↓
FAQ (existing — keep)
  ↓
Related "Other scents in the collection" (existing — keep)
```

### `src/pages/CarFresheners.tsx` (collection) — light additions only

- Add a **"Best-sellers"** rail at the top of the collection grid section (first 3 items marked by handle order) as an embla carousel above the full grid, mirroring mittiymade's "Shop Our Bestsellers" pattern. Uses existing `CarFreshenerCard`.
- Add a **"Our promise" 4-icon strip** between the collection grid and "How it works" (same component as PDP for consistency).
- Keep hero, existing trust strip, how-it-works, bulk CTA, FAQ, final CTA exactly as-is.

### Shared new component

- `src/components/car-fresheners/PurityPromiseStrip.tsx` — 4 gold-outline circle icons + label + one-line copy. Used by both pages.
- `src/components/car-fresheners/StandOutFeatures.tsx` — 3–4 image+caption cards for the PDP "what makes Bazuki different" band.

## Out of scope

- No changes to colors, fonts, spacing scale, or existing components (`CarFreshenerCard`, `CarFreshenerGallery`).
- No new product images or Shopify data changes.
- Reviews block (mittiymade shows one) — skipped; we don't have per-product review data yet.
- Promo bar / discount codes — skipped; not part of current pricing strategy.

## Technical notes

- Qty state is local to PDP; passed as `quantity` to `addItem`.
- "Buy it now" reuses `handleAdd` then calls `openDrawer()` — no new checkout path.
- All new copy is static in the component; no schema/data changes.
- Icons: `Truck`, `Wallet`, `ShieldCheck`, `Leaf`, `Sparkles`, `Check` — already imported from `lucide-react` elsewhere.
