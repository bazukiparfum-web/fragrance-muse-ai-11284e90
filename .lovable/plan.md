## Scope update (per your direction)

- **Bespoke perfumes** → upload remaining 56 → visible in Bazuki Signature Scents section
- **Diffusers** → upload remaining 10 → visible on `/business`
- **Car perfumes** → SKIP. Delete the 1 pilot Car Perfume already created (`Bazuki Musk Car Perfume`, id `15158425616748`) so the store stays clean. No `/car-perfumes` page, no header link.

Pilot Bespoke + Diffuser already live and verified — they stay.

## Phase 1 — Clean up pilot

Delete product `15158425616748` (the Musk Car Perfume pilot) via `shopify--delete_product`.

## Phase 2 — Bulk upload the remaining 66 products

Sequential `shopify--create_product` calls using the already-prepared payloads in `/mnt/documents/shopify-import-preview.json` (images already downloaded to `/tmp/bazuki-imgs/`, all 334 verified).

- 56 Bespoke Perfumes: `vendor=BAZUKI`, `product_type=Bespoke Perfume`, `tags=signature,bespoke,inspired`, options `Size=[30 ML, 50 ML, 100 ML]`, each variant has `price` (sale) + `compare_at_price` (regular ₹499/999/1499) and `inventory_policy=continue`.
- 10 Aroma Diffusers: `vendor=BAZUKI`, `product_type=Aroma Diffuser`, `tags=diffuser,b2b`, single variant at CSV price, `inventory_policy=continue`.

Safeguards: idempotent skip if `title:"..."` already exists in Shopify (covers the 2 pilots); log every created `product_id` to `/mnt/documents/shopify-import-log.json`; stop and surface after 3 consecutive failures.

Expected final count: 7 baseline + 1 Bespoke pilot + 1 Diffuser pilot + 56 + 10 = **75 products** (after Car pilot is deleted).

## Phase 3 — Storefront wiring

Files touched:

- `src/lib/shopify.ts` — thread an optional `query` argument through `fetchShopifyProducts` so callers can pass `tag:signature` / `tag:diffuser`. GraphQL already accepts `$query`.
- `src/components/ProductShowcase.tsx` (homepage Signature section) — fetch with `query: "tag:signature"`, `first: 60`.
- `src/pages/Collection.tsx` — Shopify side fetches with `query: "tag:signature"`. DB-backed scents section unchanged.
- `src/pages/Business.tsx` — add an "Aroma Diffusers" grid section fetching `query: "tag:diffuser"`, using the existing `ShopifyProductCard`.

No changes to: `Header`, routing, cart, edge functions, DB, RLS, or webhook flow. The 5 existing hardcoded Signature products (Midnight Velvet etc.) are untouched — they're currently rendered from local code; the new tag-based Shopify fetch will add the 57 real perfumes alongside them. We can prune the legacy 5 later if you want.

## Phase 4 — Verification

- `shopify--count_products` returns 75.
- Load `/` → Signature grid shows real Bespoke perfumes with strikethrough pricing.
- Load `/collection` → same.
- Load `/business` → new diffuser grid populates.
- Add a 50 ML Bespoke to cart → cart drawer opens, Shopify checkoutUrl resolves.

## Rollback

Every created `product_id` is logged. Bulk-undo via `shopify--delete_product` from the log if needed.
