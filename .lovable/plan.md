# PDP Dark Luxury Redesign

Restyle `src/pages/ProductDetail.tsx` and supporting bits to match the `/collection` luxury treatment. No product data, prices, variant logic, cart store, or tab text content changes.

## File changes

### `src/pages/ProductDetail.tsx` (main work)
Restructure JSX into the new sections; keep all state, handlers, and data fetching identical. Wrap page in `bg-[#0D0C0A]` and mount `<CollectionAmbience />` (reusing the existing one). Replace inline styling with new luxury tokens. Inject the new sections:
- Scent Identity Strip (between description and price)
- AI Formula Callout (below CTAs)
- Trust Badges row
- Find Your Scent quiz banner (between tabs and reviews)
- Related Products grid (before footer)

Animations driven by CSS classes added to `index.css` (no new motion library).

### New components (`src/components/product/`)
- `ProductImageStage.tsx` — square dark container, `mix-blend-multiply` image, 4 gold corner brackets (pseudo-elements via CSS), hover scale + gold radial glow, entry fade/scale, bracket draw-in stagger. Reuses existing gallery state via props.
- `ScentIdentityStrip.tsx` — 3 pills (Scent Family, Intensity with 5-dot scale, Key Notes). Reads from product `productType`, `tags`, and parsed notes; falls back to "—" with a `// TODO: populate from Shopify metafields` comment. Staggered fade-in.
- `AIFormulaCallout.tsx` — gold-left-border card with ✦ icon, italic copy, "Learn how it works →" link to `/about` (or existing AI explainer route). Slide-in from left.
- `TrustBadges.tsx` — inline row of 3 badges with gold dot separators.
- `QuizCTABanner.tsx` — full-width banner with gold gradient borders, headline, subtext, gold "Take the Quiz →" button linking to `/quiz`. Breathing glow.
- `RelatedProducts.tsx` — fetches 3 products via existing `fetchShopifyProducts(3)` (excluding current handle), renders using existing `ShopifyProductCard` from `library/`. Heading with gold ✦ + draw-in underline.

### `src/components/ReviewsSection.tsx` (light edit)
Replace the empty state block only: dark card, `GoldBottleIcon` (reuse from `library/`), ivory heading, subtext, 5 hover-fill outlined stars, ghost "Write a Review" CTA. Section heading gets ✦ prefix and draw-in gold underline. All review-submission logic untouched.

### `src/index.css` (additive)
New utility classes / keyframes (all with `prefers-reduced-motion` fallback):
- `.pdp-image-stage` + `::before/::after` for the 4 corner brackets with draw-in animation
- `.pdp-image-glow` hover radial gradient
- `.pdp-word-rise` (reuse `lux-word-rise` from collection if already present)
- `.pdp-pill-rise` staggered fade-up
- `.pdp-cta-gold` breathing glow loop + shimmer-sweep on click
- `.pdp-cta-ghost` hover state
- `.pdp-callout-slide-in`
- `.pdp-underline-draw` for section headings
- `.pdp-quantity-pulse` for number scale pulse on click

## Layout (desktop, 2-col grid kept)

```text
[Header]
[Back to Library]
┌──────────────┬───────────────────────────┐
│              │  ✦ BAZUKI FRAGRANCE       │
│  IMAGE       │  Product Title (word-rise)│
│  STAGE       │  Description line         │
│  + brackets  │  [Scent Identity Strip]   │
│  + glow      │  Price                    │
│              │  Size pills (existing)    │
│              │  Quantity                 │
│              │  [Add to Cart] (gold)     │
│              │  [Buy Now] (ghost)        │
│              │  [AI Formula Callout]     │
│              │  [Trust Badges]           │
│              │  Fragrance Pyramid        │
└──────────────┴───────────────────────────┘
[Tabs: Description / How to Use / Shipping]
[Quiz CTA Banner]
[Reviews Section — enhanced empty state]
[Related Products — 3 cards]
[Footer]
```

Mobile collapses to single column; image stage stays square; pills wrap; CTAs full-width.

## Out of scope
Product data shape, prices, variant selection logic, cart store, checkout redirect hook, SEO meta, JSON-LD, routing, Header/Footer, tab text bodies, review submission logic.

## Notes
- Reuses `CollectionAmbience`, `GoldBottleIcon`, and `ShopifyProductCard` from `src/components/library/` — no duplication.
- "Scent Family / Intensity / Key Notes" parsed from existing `productType`, `tags`, and `parseNotesFromDescription()`; placeholders shown when absent, with a code comment for the Shopify metafield TODO.
- All animations gated by `prefers-reduced-motion: reduce`.
