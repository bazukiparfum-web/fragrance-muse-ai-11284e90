
## CSV validation results (zero issues found)

| Category | Count | Variants | Images | Prices | Descriptions |
|---|---|---|---|---|---|
| Bespoke Perfumes | **57/57 ✓** | All have 30 ML / 50 ML / 100 ML | 5 each, all on bazukiperfumes.com | ₹499/999/1499 regular, ₹400/750/999 sale (all present) | Short desc: clean HTML, ~750–920 chars, structured "♣Fragrance / Inspiration / Occasion / Concentration / Longevity" |
| Car Perfumes | **12/12 ✓** | All have Black / White | 7 each | ₹599 regular / ₹299 sale | ✓ |
| Diffusers (simple) | **11/11 ✓** | n/a | ✓ | ₹5,310–₹65,832, all present | ✓ |

Additional checks passed:
- No duplicate product names
- All 369 image URLs are well-formed and live on bazukiperfumes.com (sampled 5 with HEAD requests — all returned `200 OK`)
- Two simple rows are skipped (zero-price "Bespoke Live Perfume" landing-page entries and a hand-painted Goblet sample) — not real sellable SKUs

Source descriptions use WP-export `\n` literals and inline `<a><img>` tags in the long description. We'll use the **clean short description** as Shopify body HTML (the structured ♣ blocks read well as-is) and let Shopify's own gallery handle product images. Literal `\n` will be converted to `<br>` so the layout renders correctly.

---

## Phase 0 — Pre-flight

1. Reconnect Shopify (the session token expired).
2. Run `shopify--count_products` and `shopify--list_products` to capture the current store state — this is the rollback baseline.
3. Confirm with you: **the 5 existing hardcoded Signature products** (Midnight Velvet, Citrus Bloom, Ocean Breeze, Rose Garden, Discovery Set) — keep them, delete them, or tag them `signature` so they appear alongside the new 57? **Default: keep & tag** so nothing is destructively removed.

## Phase 1 — Dry-run preview (no Shopify writes)

Generate a local JSON preview of all 80 payloads (`/mnt/documents/shopify-import-preview.json`) plus a CSV summary (`/mnt/documents/shopify-import-preview.csv`) listing every product with: title, tags, variant count, image count, sample price. **You review and approve before any product is created.**

## Phase 2 — Upload, in safe order with checkpoints

Sequential, one product per `shopify--create_product` call, in this order with explicit pauses:

1. **Pilot batch (3 products)** — 1 Bespoke + 1 Car + 1 Diffuser. Stop. You verify in Shopify admin that:
   - Title, body HTML, vendor, tags, product type look right
   - Variants exist with correct prices + compare-at (strikethrough)
   - All images uploaded successfully from bazukiperfumes.com URLs
   - Product is published
2. **Bespoke Perfumes (remaining 56)** — tag `signature, bespoke, inspired`; vendor `BAZUKI`; product_type `Bespoke Perfume`; options `Size = [30 ML, 50 ML, 100 ML]`; for each variant `price` = sale, `compare_at_price` = regular.
3. **Car Perfumes (remaining 11)** — tag `car-perfume`; product_type `Car Perfume`; options `Color = [Black, White]`; price ₹299, compare_at ₹599.
4. **Diffusers (remaining 10)** — tag `diffuser, b2b`; product_type `Aroma Diffuser`; simple, no variants.

After each phase: log success count and any failed product IDs to `/mnt/documents/shopify-import-log.json`.

### Safeguards

- Idempotency: before each create, search Shopify for `title:"<exact name>"` and **skip if already exists** (so re-runs after a partial failure don't duplicate).
- Image failure handling: if Shopify rejects any image URL, the product still gets created with the images that loaded; the failure is logged and reported.
- On 3+ consecutive product-create failures, stop and surface the error rather than churn through 80 broken calls.

## Phase 3 — Storefront wiring

Touched files:

- `src/lib/shopify.ts` — extend `fetchShopifyProducts(first, query?)` to accept a Storefront `query` string (the GraphQL already has `$query`, just thread it through).
- `src/components/ProductShowcase.tsx` (homepage) → fetch `query: "tag:signature"`, `first: 60`.
- `src/pages/Collection.tsx` → fetch `query: "tag:signature"` for Shopify side; DB scents unchanged.
- `src/pages/CarPerfumes.tsx` — **new** page, fetches `query: "tag:car-perfume"`, reuses `ShopifyProductCard` grid.
- `src/App.tsx` — register `/car-perfumes` route.
- `src/components/Header.tsx` — add "Car Perfumes" link.
- `src/pages/Business.tsx` — add a "Aroma Diffusers" section between `ServicesOffered` and `B2BTestimonials`, fetching `query: "tag:diffuser"`.

No DB, edge function, RLS, or checkout changes. Cart + webhook + production-queue flows are untouched because Bespoke/Car/Diffuser products are standard pre-made Shopify products (the production-queue handler only fires for items carrying custom-scent line-item attributes).

## Phase 4 — Verification

- `shopify--count_products` post-import = baseline + 80.
- Visit `/`, `/collection`, `/car-perfumes`, `/business` in preview and confirm each grid populates.
- Add-to-cart one Bespoke 50 ML and one Car Perfume Black → cart drawer opens, checkoutUrl resolves.
- Spot-check 3 random products in Shopify admin (variants, images, pricing).

## Rollback

If you spot anything wrong after upload, the import log records every `shopify_product_id` created. We can bulk-delete via `shopify--delete_product` calls from that list — clean undo.

## Out of scope

- Editing or removing the 5 existing hardcoded signature products (deferred to your Phase 0 decision).
- SEO meta titles per product (Shopify auto-generates acceptable defaults; can be added later in bulk).
- Inventory tracking (will be set to "do not track" so nothing goes out of stock unexpectedly during launch).
