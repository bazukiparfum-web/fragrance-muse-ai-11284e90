# Diffuser + Oils order page

## What customers get
A new page at **/shop/diffusers** where a customer:
1. Picks one diffuser (cards with photo, price, short description).
2. Sees the fragrance oils that go with it and adds any number (quantity steppers per oil).
3. Sees a live order summary (diffuser + oils + total) and taps **Add set to cart & checkout**.
4. Goes to the existing Shopify checkout, which collects the shipping address and ships everything together as one order.

Also: a "Diffusers" link in the header/footer shop menu, and a "Build your set" button on each diffuser product page that opens this page with that diffuser pre-selected (`?diffuser=handle`).

## How "matching oils" works
- An oil matches a diffuser if it shares a Shopify tag like `for-<diffuser-handle>`.
- If no oil has such a tag, all diffuser oils are shown as compatible.
- If the shop has no oils visible yet, the page still works for diffusers alone and shows "Fragrance oils coming soon".

Note: right now no oil products are visible to the store. Oils must be live on the Lovable sales channel and tagged `diffuser-oil` (or have "Oil" in the name) to appear.

## Shipping
Checkout stays on Shopify, so all items in one cart ship as one order. Each diffuser and oil must be marked "physical product / requires shipping" in Shopify — I'll check this and update any that aren't.

## Technical details
- New `src/pages/DiffuserSets.tsx`, lazy route `/shop/diffusers` in `App.tsx`; same dark/gold design, mobile sticky summary bar.
- Fetch with existing `storefrontApiRequest` + `DIFFUSER_FAMILY_QUERY`; split with `isDiffuserProduct` / `isDiffuserFamily`.
- New helper `matchingOils(diffuser, oils)` in `src/lib/shopify.ts` with vitest tests (tag match, fallback to all oils, perfumes excluded).
- Add-to-cart uses the existing `cartStore.addItem` sequentially for each line, then the existing `useCheckoutRedirect` (opens shop.bazukifragrance.com checkout with `channel=online_store` in a new tab).
- Check `requires_shipping` on diffuser/oil variants via Shopify tools; batch-update if needed (with your approval).
- SEO via `useSEO`; add URL to sitemap.
- Verify at 375/414/768px with Playwright, including adding a set to cart and reaching checkout.
