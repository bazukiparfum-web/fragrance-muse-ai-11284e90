## Goal

On `/shop/quiz/results`, after the 3 matched perfumes are revealed, the **primary purchase action** should be the **3 × 30ml Discovery Set (₹1,500)**. Individual **50ml / 100ml** purchases per scent become the secondary action shown below it.

## Changes (UI-only, single file: `src/pages/QuizResults.tsx`)

### 1. New page order after the header

```
Hero ("Your Perfect Matches")
  │
  ├─ Section A — Your 3 matches (visual summary only)
  │     3 cards side-by-side, each showing:
  │       • Name + match %
  │       • Story
  │       • Fragrance pyramid
  │       • Intensity / Longevity bars
  │       • Small "Save" icon button (top-right or footer of card)
  │     No size selector, no Add-to-Cart button in this section.
  │
  ├─ Section B — PRIMARY CTA: Discovery Set (3 × 30ml @ ₹1,500)
  │     Promoted, larger card immediately under the matches.
  │     Existing copy + price + "Add 30ml Discovery Set to Cart".
  │     Add line: "Try all three of your matches in travel-friendly 30ml bottles."
  │
  ├─ Section C — SECONDARY: Want a full bottle of just one?
  │     Heading: "Prefer a single full-size bottle?"
  │     Sub-copy: "Choose 50ml or 100ml of any single match."
  │     A compact row/list (one row per scent) with:
  │       • Scent name
  │       • Size select (50ml / 100ml)
  │       • Price for selected size
  │       • "Add to Cart" button (reuses existing handleAddToCart)
  │     Helper microcopy: "30ml is only available in the Discovery Set above."
  │
  └─ Learn-more guides + Scent Coaching + Analytics (unchanged)
```

### 2. Concrete edits in `QuizResults.tsx`

- Split the current single `.map()` (lines 398–506) into:
  - **Section A** — same `grid md:grid-cols-3` but render only name, match badge, story, `FragrancePyramid`, intensity/longevity bars, and a small `Save` button. Remove the price list, size `Select`, and Add-to-Cart button from inside each card.
- Move the **Discovery Set card** (lines 508–543) so it appears **immediately after Section A**, and visually elevate it (slightly larger heading, primary border, keep existing pricing + Save ₹500 badge). This becomes the dominant CTA.
- Add **Section C** below the Discovery Set card:
  - A `Card` titled "Prefer a single full-size bottle?" with sub-copy.
  - Inside, render `recommendations.map(...)` as compact rows (stacked on mobile, `md:flex` row on desktop) containing: scent name, the existing 50ml/100ml `Select`, displayed price, and the existing "Add to Cart" button (reuse `handleAddToCart`, `selectedSize`, `addingToCart` state as-is).
  - Keep the "30ml is sold only as the 3-bottle Discovery Set above" helper line at the bottom of this section.
- Keep guide links, Scent Coaching CTA, Analytics, and `SaveScentDialog` exactly where they are.

### 3. Out of scope

- No changes to pricing, Shopify products, edge functions, cart store, or any other page.
- No changes to the matched-scent data, formulas, or save/share flows.
- No new components — all edits stay inside `src/pages/QuizResults.tsx`.

## Acceptance

- After completing the quiz, users see the 3 matches → then the prominent ₹1,500 Discovery Set CTA as the next thing → then a secondary "buy a single 50ml/100ml" section below it.
- Single 30ml is nowhere on the page (already enforced).
- All existing handlers (`handleAddToCart`, `handleAddDiscoverySet`, `handleSaveScent`) continue to work without modification.
