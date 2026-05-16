# Shopify Storefront Connection Verification

Goal: Confirm the Storefront API is live and returning real product data before building any new cart/checkout UI. No production UI changes.

## What already exists

- `src/lib/shopify.ts` already initializes the Storefront client with hardcoded constants:
  - `SHOPIFY_STORE_PERMANENT_DOMAIN = 'jg651i-6z.myshopify.com'`
  - `SHOPIFY_STOREFRONT_TOKEN = '95b86894e26ad7e37bd04e955084497e'`
  - `SHOPIFY_API_VERSION = '2025-07'`
  - Helper `storefrontApiRequest(query, variables)` posts to the GraphQL endpoint.
- `.env` does not currently contain `VITE_SHOPIFY_STORE_DOMAIN` or `VITE_SHOPIFY_STOREFRONT_TOKEN`. The project's convention is the hardcoded constants in `src/lib/shopify.ts`. Plan will use those (they are publishable values), and additionally read `import.meta.env.VITE_SHOPIFY_STORE_DOMAIN` / `VITE_SHOPIFY_STOREFRONT_TOKEN` as overrides if present, so the user's requested env var names work too.

## Changes

### 1. New component: `src/components/dev/ShopifyDebugPanel.tsx`
- Renders `null` unless `import.meta.env.DEV` is true.
- Fixed bottom-right card (`fixed bottom-4 right-4 z-[9999]`), max-width ~320px, dark translucent background, monospace text, semantic color tokens (`text-green-500` / `text-red-500` for status — acceptable here since it's a dev-only diagnostic, not production UI).
- On mount, runs a Storefront GraphQL query:
  ```graphql
  query DebugProducts {
    products(first: 3) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url } } }
        }
      }
    }
  }
  ```
- Uses `storefrontApiRequest` from `@/lib/shopify`.
- States: `loading | connected | failed` with error message string.
- `console.log('[Shopify Debug] Full response:', data)` and `console.error` on failure.
- Panel content:
  - Status line ("Shopify Status: Connected ✓" green / "Failed ✗" red + error)
  - Store domain (resolved from env override or `SHOPIFY_STORE_PERMANENT_DOMAIN`)
  - Product count fetched
  - List of `title — {amount} {currencyCode}` for each product
  - Small "×" button to dismiss the panel for the session
- No changes to `src/lib/shopify.ts` required; export the existing domain constant is already exported.

### 2. Mount the panel
- Edit `src/App.tsx`: import `ShopifyDebugPanel` and render once at the root (inside the Router but outside route switches) so it's visible on every page in dev.

## Verification steps after implementation

1. Open preview → bottom-right shows the panel.
2. Confirm green "Connected ✓" with domain `jg651i-6z.myshopify.com` and 3 product titles/prices.
3. Check browser console for `[Shopify Debug] Full response:` log with raw GraphQL data.
4. If failed, the error message is visible in the panel and console — report back.

## Files touched

- New: `src/components/dev/ShopifyDebugPanel.tsx`
- Edit: `src/App.tsx` (one import + one JSX line)

No production UI, no cart/checkout work, no env file edits (env file is auto-managed).
