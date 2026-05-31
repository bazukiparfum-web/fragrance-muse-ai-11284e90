## Root cause

The edge function `create-shopify-product-from-scent` (and `getVariantIds`) calls Shopify Admin API directly using a manually-managed `SHOPIFY_ACCESS_TOKEN` secret. That token is invalid (`[API] Invalid API key or access token`), which is why 50ml / 100ml Add to Cart and Reorder fail.

Instead of asking you to create a Shopify custom app and paste a `shpat_…` token, we should use **Lovable's native Shopify integration**, which is already wired into this project (the storefront uses `shopify--get_storefront_token` and `shopify--get_shop_permanent_domain`). For Admin API calls from edge functions, Lovable exposes Shopify Admin tools (`shopify--create_product`, `shopify--update_product`, etc.) so we don't have to hold a long-lived Admin token at all.

## Fix

Replace the raw `fetch` to `https://{store}.myshopify.com/admin/api/.../products.json` with Lovable's managed Shopify Admin path. Two viable approaches — recommend **Option A**:

### Option A (recommended): move product creation to client-side via Lovable Shopify tools
- Lovable's Shopify integration exposes Admin operations (create product, create variant) to the agent/runtime, not to arbitrary edge functions. Since dynamic custom-scent product creation happens on Reorder / Add-to-Cart, refactor so:
  1. Frontend (`ReorderModal.tsx`, custom-scent Add-to-Cart) calls a thin edge function that returns the saved scent + formula.
  2. Edge function no longer talks to Shopify Admin — it just returns scent data.
  3. Product/variant creation in Shopify happens once, ahead of time, via Lovable's Shopify admin tools (one product per saved scent, lazily created on first publish) — and the resulting `shopify_product_id` is stored in `saved_scents`.
- Net effect: no `SHOPIFY_ACCESS_TOKEN` secret needed anywhere. The Storefront API (already using `shopify--get_storefront_token`) handles cart + checkout.

### Option B (smaller change): keep edge function, route Admin calls through Lovable
- Use the Storefront API's `cartCreate` mutation with a one-off draft order pattern instead of creating a real product per scent. Custom scents become line-item-only items (title + price + properties) — Shopify supports this for custom products via draft orders. Removes need for Admin token entirely.
- File touched: `supabase/functions/create-shopify-product-from-scent/index.ts` → renamed to `prepare-custom-scent-cart` and rewritten to return a Storefront cart-ready payload (no Admin API call).

### Option C (status quo + manual token)
- Keep the custom-app `shpat_…` token path. This is what we were doing. Works but you have to maintain the token and re-rotate when it expires or scopes change. **Not recommended** given Lovable's native integration is available.

## What needs your decision

Which option do you want? I lean toward **Option B** — it's the smallest change that fully removes the broken `SHOPIFY_ACCESS_TOKEN` dependency, keeps Reorder + 50ml/100ml Add-to-Cart working today, and doesn't require any manual Shopify Admin setup from you.

## Out of scope

- Storefront product display (already works via Lovable's native Storefront token).
- Signature collection products (pre-made in Shopify, unaffected).
- Auth bypass for E2E testing (stays as-is).

## Verification

After the fix, on `/shop/account?tab=scents`: Reorder → 50ml or 100ml → Add to Cart → cart drawer opens with the custom scent line item, checkout URL resolves. Network shows no 500s and no calls to `/admin/api/.../products.json`.
