

## Plan: Connect New Shopify Store + Create Dummy Products

### What's Happening

Your Shopify store has been reconnected with a new domain (`jg651i-6z.myshopify.com`). The store currently has **no products**, and the codebase still references the old store domain and token. We need to:

1. Update the Shopify credentials in code
2. Create sample fragrance products in Shopify
3. Upgrade the cart store to use real-time Shopify cart sync (per best practices)
4. Add a cart sync hook

---

### Step 1: Update Shopify Credentials (`src/lib/shopify.ts`)

Update the store domain and storefront token:
- `SHOPIFY_STORE_PERMANENT_DOMAIN` → `jg651i-6z.myshopify.com`
- `SHOPIFY_STOREFRONT_TOKEN` → `95b86894e26ad7e37bd04e955084497e`

Add missing cart mutation queries (cartLinesAdd, cartLinesUpdate, cartLinesRemove, cart query) and helper functions for real-time cart management.

### Step 2: Create Dummy Products in Shopify

Use the `shopify--create_product` tool to create 4-5 sample fragrance products:

1. **Midnight Velvet** — Dark, warm evening scent (₹700 / 30ml, ₹1099 / 50ml)
2. **Citrus Bloom** — Fresh citrus daytime fragrance (₹700 / 30ml, ₹1099 / 50ml)
3. **Ocean Breeze** — Aquatic cool scent (₹700 / 30ml, ₹1099 / 50ml)
4. **Rose Garden** — Classic floral (₹700 / 30ml, ₹1099 / 50ml)
5. **Discovery Set** — Sampler of top 5 scents (₹499 single size)

### Step 3: Upgrade Cart Store (`src/stores/cartStore.ts`)

Rewrite to follow the Shopify best-practice pattern:
- Cart created on first item add via Storefront API
- Line items tracked with Shopify `lineId`
- Real-time add/update/remove via Storefront API mutations
- "Cart not found" auto-recovery
- Persistent state (items, cartId, checkoutUrl)

### Step 4: Add Cart Sync Hook (`src/hooks/useCartSync.ts`)

New hook that syncs cart state when user returns from checkout or switches tabs. Wire it into `App.tsx`.

### Step 5: Update Edge Function Domain

Update `supabase/functions/create-shopify-product-from-scent/index.ts` to use the new store domain.

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/lib/shopify.ts` | Edit — update domain, token, add cart mutations |
| `src/stores/cartStore.ts` | Rewrite — real-time Shopify cart sync |
| `src/hooks/useCartSync.ts` | Create — cart sync on tab visibility |
| `src/App.tsx` | Edit — add useCartSync hook |
| `supabase/functions/create-shopify-product-from-scent/index.ts` | Edit — update domain |
| Shopify (via tools) | Create 5 products |

