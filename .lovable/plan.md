# Add BreadcrumbList + Validate Structured Data

Add `BreadcrumbList` JSON-LD to the homepage and Product Detail pages, then run Google's Rich Results validator against the existing JSON-LD blocks (Organization, WebSite, ItemList, Product) and fix anything it flags.

## 1. BreadcrumbList JSON-LD

**Homepage (`src/pages/Index.tsx`)**
Mount a `<JsonLd id="breadcrumbs-home" data={...} />` with a single-item breadcrumb:
- Home → `https://bazukifragrance.com/`

**PDP (`src/pages/ProductDetail.tsx`)**
Add a `<JsonLd id={"breadcrumbs-" + handle} ... />` next to the existing Product JSON-LD:
- Home → `/`
- Collection → `/collection`
- {Product Title} → `/product/{handle}`

Each item uses `{ "@type": "ListItem", position, name, item: <absolute URL> }` per schema.org spec, built off `window.location.origin` (matching the existing pattern).

## 2. Rich Results validation pass

After adding breadcrumbs, run Google's Rich Results Test against the live published URLs:
- Homepage: `https://bazukifragrance.com/`
- A representative PDP: `https://bazukifragrance.com/product/<first-shopify-handle>`

Use the public validator endpoint via `websearch`/`fetch` to capture warnings, then patch the JSON-LD. Known likely fixes based on current code:

**`index.html` Organization**
- Add `contactPoint` (or remove empty `sameAs: []` to avoid "empty array" warnings).
- Add `logo` as an `ImageObject` with explicit `url` if validator flags it.

**`ProductShowcase.tsx` ItemList**
- `description` may be empty for some Shopify products → fall back to `${node.title} — luxury fragrance by Bazuki`.
- `image` may be undefined when a product has no images → omit the field instead of emitting `undefined` (currently serializes to missing key, but guard explicitly).
- Add `priceValidUntil` (e.g. end of current year) — Google warns when missing on Offers.
- Add `itemCondition: "https://schema.org/NewCondition"`.

**`ProductDetail.tsx` Product**
- Same `priceValidUntil` + `itemCondition` additions on each Offer.
- Use `mpn` or stable `sku` (strip the `gid://shopify/ProductVariant/` prefix to a clean numeric SKU) — Google prefers a human-readable SKU.
- Add `hasMerchantReturnPolicy` and `shippingDetails` only if the validator escalates to errors (otherwise leave as warnings to avoid fabricating policy data).
- Ensure `aggregateRating` / `review` are NOT emitted unless real review data exists (current code correctly omits — keep it that way).

## 3. Verification

- Re-run the Rich Results Test on both URLs.
- Confirm: 0 errors, breadcrumbs detected, Product detected on PDP, ItemList detected on homepage.
- Report remaining non-blocking warnings (e.g. shipping policy) to the user with a recommendation.

## Files touched

- `src/pages/Index.tsx` — add breadcrumb JsonLd
- `src/pages/ProductDetail.tsx` — add breadcrumb JsonLd, harden Product offer fields
- `src/components/ProductShowcase.tsx` — harden ItemList Offer fields, image guard
- `index.html` — small Organization cleanup if validator flags it

No new dependencies. No DB or backend changes.
