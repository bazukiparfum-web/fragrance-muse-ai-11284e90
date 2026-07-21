## GoKwik Integration Plan

Since GoKwik is Shopify-native and your store already routes checkout through Shopify, the cleanest path is **installing the GoKwik Shopify app**. No Lovable code changes are required for the checkout itself — GoKwik automatically intercepts Shopify's checkout URL that our cart already generates.

### Recommended path: GoKwik Shopify App (no-code + minimal wiring)

**Why this over a headless integration:**
- Our `cartStore.ts` already opens Shopify's `checkoutUrl` (with `channel=online_store`). Once GoKwik is installed on the Shopify store, that same URL automatically renders GoKwik's 1-click checkout — no frontend changes needed.
- COD verification, RTO shield, UPI/cards, and abandoned-cart recovery are all delivered by GoKwik's app inside Shopify.
- Orders continue to flow through the same Shopify `orders/create`, `orders/updated`, `orders/paid` webhooks our `shopify-webhook-handler` edge function already handles.
- A headless GoKwik API integration would bypass Shopify checkout entirely, break our current cart flow, and require rebuilding COD, payments, and order sync from scratch — not worth it given Shopify is already the source of truth.

### Steps

**1. GoKwik-side setup (you do this in dashboards; no Lovable action)**
- In your GoKwik merchant dashboard, add your Shopify store domain (`bazukifragrance.myshopify.com`).
- In Shopify Admin → Apps, install the **GoKwik Checkout** app (GoKwik will send an install link once they whitelist your store).
- Enable the checkout replacement + COD suite from inside the GoKwik app.
- Enable analytics + abandoned cart flows in the GoKwik dashboard.

**2. Verify cart → checkout flow still works (no code change expected)**
- Add an item to cart on the site → click checkout → confirm the new tab loads GoKwik checkout (not Shopify's default).
- Confirm `channel=online_store` param survives (it does — we already set it in `formatCheckoutUrl`).

**3. Verify order sync into our DB**
- Place one test COD order + one test prepaid order via GoKwik.
- Confirm rows appear in our `orders` and `order_items` tables via the existing `shopify-webhook-handler` edge function.
- If GoKwik posts order events under a different Shopify order tag/source, add a small tag/source pass-through in the webhook handler so we can distinguish GoKwik orders in `orders.metadata` (optional; only if you want to filter by them in admin).

**4. Admin visibility (optional, small change)**
- Add a "Payment source" column in `/admin/orders` reading from Shopify's `payment_gateway_names` / `source_name` (already on the webhook payload) so ops can see which orders came via GoKwik vs. others.

**5. Frontend microcopy (optional)**
- Update the cart drawer's checkout button subtext from "Checkout with Shopify" to something neutral like "Secure Checkout · UPI · Cards · COD" so the branding matches what users will see.

### Technical details

- **No new secrets required.** GoKwik authenticates against Shopify via its app install — we do not need a `GOKWIK_API_KEY` on our side.
- **No edge function changes required** for the core flow. `shopify-webhook-handler` already covers `orders/create`, `orders/updated`, `orders/paid`.
- **No changes to `cartStore.ts`, `useCheckoutRedirect.ts`, or Storefront API mutations.** The Storefront API's `checkoutUrl` is what GoKwik hooks into.
- **What we would change (if you approve the optional items above):**
  - `supabase/functions/shopify-webhook-handler/index.ts` — persist `source_name` / `payment_gateway_names` into `orders.metadata` (JSONB) for GoKwik traceability.
  - `src/pages/admin/AdminOrders.tsx` — new "Source" column.
  - `src/components/cart/BazukiCartDrawer.tsx` — checkout button copy.

### When headless GoKwik would be needed instead

Only if you want to (a) offer GoKwik checkout on non-Shopify products, or (b) skip Shopify entirely. Neither applies to Bazuki today — every product (signature scents, custom AI scents, car fresheners) is a real Shopify product. So we stay with the Shopify app path.

### Out of scope for this plan

- Building a custom GoKwik checkout UI in Lovable.
- Migrating orders off Shopify.
- Refunds / partial refunds automation (handled inside Shopify + GoKwik dashboards).