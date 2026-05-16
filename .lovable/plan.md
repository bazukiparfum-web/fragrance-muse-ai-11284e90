## Goal
Wire final checkout flow with a 1s "Preparing your secure checkout..." overlay, add an `/order-confirmation` page, and ship a dev-only testing checklist panel.

## 1. Checkout overlay component — NEW `src/components/checkout/CheckoutLoadingOverlay.tsx`
- Full-screen fixed overlay, `bg-black/90`, z-[100].
- Top edge: 1px gold progress bar, 1s linear keyframe (`@keyframes bz-checkout-progress { from { width: 0 } to { width: 100% } }`) injected via a `<style>` tag local to the component (no Tailwind config edit needed).
- Centered: "Bazuki" wordmark in `font-display` (Cormorant Garamond) ~40px gold, plus subline "Preparing your secure checkout…" in Inter 13px cream.
- Props: `open: boolean`. Renders null when false. Locks body scroll while open.

## 2. Shared checkout launcher — NEW `src/hooks/useCheckoutRedirect.ts`
- Exposes `{ launchCheckout(url: string), isLaunching }`.
- Sets `isLaunching=true`, waits 1000ms, then `window.open(url, '_blank')` (matches existing PDP behavior) and resets state ~300ms later.
- Used by both the cart drawer and PDP Buy Now so the overlay UX is consistent.

## 3. Cart drawer — EDIT `src/components/cart/BazukiCartDrawer.tsx`
- Replace existing direct `window.open(checkoutUrl)` on the "PROCEED TO CHECKOUT" button with `launchCheckout(checkoutUrl)`.
- Render `<CheckoutLoadingOverlay open={isLaunching} />` at root of drawer (or via portal — fine at component root since it's `fixed`).
- Disable button while `isLaunching`.

## 4. PDP — EDIT `src/pages/ProductDetail.tsx`
- Refactor `handleBuyNow`: after `addItem` succeeds, call `launchCheckout(url)` instead of immediate `window.open`.
- Render `<CheckoutLoadingOverlay open={isLaunching} />` once at page root.
- Keep existing error states.

## 5. Order confirmation page — NEW `src/pages/OrderConfirmation.tsx`
- Route added in `src/App.tsx`: `/order-confirmation`.
- Layout: `min-h-screen bg-background flex items-center justify-center px-6`, inner `max-w-[600px]` centered column.
- Animated gold checkmark SVG: `<circle>` + `<path>` with `stroke-dasharray`/`stroke-dashoffset` CSS animation over 2s (inlined `<style>` block, `@keyframes bz-draw`). Color = `hsl(var(--bz-gold))`.
- Headline `font-display text-cream` at 44px: "Your Scent Is Being Crafted".
- Sub paragraph Inter 15px, color `#8A7A6A`.
- Order number card: if `?order=` query param present, render dark card (`bg-bz-secondary/40`, 1px gold border, rounded-md, px-5 py-3) with "Order #XXXXX" in Inter 13px cream.
- Buttons (stacked on mobile, side-by-side ≥sm):
  - Primary `Button` — gold pill, route to `/collection` (the actual scent library route in this project; the brief says `/scent-library` but no such route exists — using existing `/collection` to avoid 404).
  - Secondary — gold ghost pill, opens `https://www.shiprocket.in/shipment-tracking/` in a new tab (no tracking number is supplied by Shopify redirect, so we point to the public tracker).
- On mount: `localStorage.removeItem('bazuki_cart_id')` AND call `useCartStore.getState().clearCart()` so the persisted zustand cart is also cleared.
- SEO via `useSEO`: title "Order Confirmed — Bazuki", noindex.

## 6. Dev-only testing checklist panel — NEW `src/components/dev/CheckoutTestChecklist.tsx`
- Only mounts when `import.meta.env.DEV` is true (also gate behind a `localStorage.getItem('bz_show_test_panel')` toggle so it's silent by default in dev unless turned on).
- Fixed bottom-left, collapsible card (`<details>` element) titled "Checkout test checklist".
- Renders the 9 checkboxes from the brief. State persisted to localStorage key `bz_checkout_checklist` so ticks survive refresh.
- Mounted once in `src/App.tsx`.

## 7. App routing — EDIT `src/App.tsx`
- Add `<Route path="/order-confirmation" element={<OrderConfirmation />} />`.
- Mount `<CheckoutTestChecklist />` (dev-only gated internally).

## Out of scope
- No backend / edge function / Shopify Admin changes.
- No changes to `cartStore.ts` or `lib/shopify.ts`.
- No real shipment tracking integration (placeholder URL).
- Setting the Shopify Thank You URL is a Shopify Admin config, not code — surface it to the user in the closing message.

## Open question
The brief says the primary CTA goes to `/scent-library`, but the project's library route is `/collection`. I'm planning to wire it to `/collection`. Flag if a separate `/scent-library` redirect route is preferred.