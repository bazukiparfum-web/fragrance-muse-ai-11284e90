# Plan: Use Custom Checkout Domain

## Goal
Make every Lovable checkout button open `https://shop.bazukifragrance.com/checkout` instead of the default `.myshopify.com` checkout URL, without breaking Shopify Storefront API calls.

## Current state
- `src/lib/shopify.ts` calls Shopify’s Storefront API on `jg651i-6z.myshopify.com`.
- `createShopifyCart()` returns a `checkoutUrl` from the API, e.g. `https://jg651i-6z.myshopify.com/checkout/c/xxxxx`.
- `formatCheckoutUrl()` only appends `?channel=online_store`; it does not rewrite the hostname.
- The cart drawer and `useCheckoutRedirect` launch whatever URL the store returns.

## Changes
1. Add a new constant in `src/lib/shopify.ts`:
   ```ts
   export const SHOPIFY_CHECKOUT_DOMAIN = 'shop.bazukifragrance.com';
   ```
2. Update `formatCheckoutUrl()` to rewrite the checkout URL hostname to `SHOPIFY_CHECKOUT_DOMAIN`, preserving path, search params, and the existing `channel=online_store` parameter.
3. Keep `SHOPIFY_STORE_PERMANENT_DOMAIN` and `SHOPIFY_STOREFRONT_URL` unchanged so all GraphQL API calls still hit the myshopify.com endpoint.
4. Add a runtime guard: if `SHOPIFY_CHECKOUT_DOMAIN` is empty, fall back to the original API hostname.

## Verification
- Add a product to cart in the preview.
- Inspect the generated checkout URL (network tab or logged console output).
- Confirm it starts with `https://shop.bazukifragrance.com/checkout/` and includes `channel=online_store`.
- Confirm clicking checkout opens the custom domain.

## Important note
For this to work in production, `shop.bazukifragrance.com` must be configured in Shopify as the primary checkout domain (Settings > Domains). If it is not, Shopify will redirect or error. This plan only updates the frontend URL rewrite.
