## Build the full cart system (Bazuki dark/gold)

Most plumbing already exists: `cartStore.ts` (Zustand + persist + Storefront cart mutations), `useCartSync` hook (mounted in `App.tsx`), and `lib/shopify.ts` cart helpers (`createShopifyCart`, `addLineToShopifyCart`, `updateShopifyCartLine`, `removeLineFromShopifyCart`, `formatCheckoutUrl` with `channel=online_store`). Persistence under `localStorage` key `shopify-cart` (rename per spec is unnecessary — the cart ID lives inside that JSON; we won't change it to avoid wiping carts mid-session).

What's missing: a Bazuki-styled drawer wired to a global open state, the Header cart button must open the drawer (not navigate to `/shop/cart`), a per-button Add-to-Cart feedback state, and a count badge bump animation.

### 1. `src/stores/cartStore.ts` — add UI slice
- Add `isDrawerOpen: boolean`, `openDrawer()`, `closeDrawer()`, `setDrawerOpen(v)`.
- Do NOT persist `isDrawerOpen` (extend `partialize` to keep only items/cartId/checkoutUrl — already correct).

### 2. New `src/components/cart/BazukiCartDrawer.tsx` (replaces `src/components/CartDrawer.tsx` usage)
Uses shadcn `Sheet` for a11y/focus trap, but styled to spec.
- `Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}` reading from store.
- `SheetContent side="right"` with custom classes: `w-full sm:w-[420px] bg-[#0D0D0D] border-l border-[rgba(201,168,76,0.2)] p-0 text-cream`. Overlay default is fine (shadcn renders `bg-black/80`); override to `bg-black/60` via a small global CSS rule or inline override.
- Header row: `font-cormorant text-[28px] text-cream` "Your Cart" + close `×` button (top right, gold on hover).
- Empty state: small Bazuki favicon + "Your cart is empty" in `text-cream-muted`, plus a "Continue Shopping" link that closes the drawer.
- Line items list (scrollable):
  - `64x64 rounded-lg` image (`object-cover`, gray placeholder if missing)
  - Title in `text-cream`, variant title in `text-cream-muted text-sm` (skip if `Default Title`)
  - Price in `text-gold font-medium`
  - Quantity row: `−` `[n]` `+` buttons styled `bg-bz-secondary/60 border border-[rgba(201,168,76,0.4)] text-cream rounded-md w-8 h-8`. Disabled while `isLoading`. Minus at qty 1 calls `removeItem(variantId)`. Plus calls `updateQuantity(variantId, qty+1)`.
  - "Remove" text link: `font-sans text-[11px] text-[#6B5D50] hover:text-cream` → `removeItem`.
- Footer (sticky bottom inside drawer):
  - Subtotal row: "Subtotal" label in `text-cream-muted`, amount `₹{total.toLocaleString()}` in `text-gold text-lg font-medium`, right-aligned.
  - Note: `"Shipping & taxes calculated at checkout"` in `text-[11px] text-[#4A3F35]`.
  - "PROCEED TO CHECKOUT" button: `w-full h-[52px] rounded-full bg-gold text-black font-medium tracking-[0.14em] uppercase text-[12px] hover:opacity-90 disabled:opacity-50`. On click: `window.open(getCheckoutUrl(), '_blank')` then `closeDrawer()`. Disabled when `items.length===0`, `isLoading`, `isSyncing`, or no checkout URL.
  - "Continue Shopping" centered text link in `text-gold hover:text-cream text-[12px] uppercase tracking-[0.14em]` → `closeDrawer()`.

### 3. Delete old generic `src/components/CartDrawer.tsx`
No other files import it (verified — only `ShopifyProductCard` and `Header` use the store; no `<CartDrawer />` in `App.tsx`). Replace with the new Bazuki drawer. (Actually safer: leave the file as a re-export to avoid breaking any unseen import; on second check, prefer a delete if no imports exist. We'll verify with rg and remove.)

### 4. `src/App.tsx`
Mount `<BazukiCartDrawer />` at the root (outside routes) so it's available on every page.

### 5. `src/components/Header.tsx`
- Replace `onClick={() => navigate('/shop/cart')}` on both desktop and mobile cart buttons with `onClick={() => useCartStore.getState().openDrawer()}` (keep `/shop/cart` route untouched — power users can still deep-link).
- Add a scale bump on the badge when `totalItems` increases:
  - Track `prevCount` with `useRef`; when `totalItems > prev`, set a `bump` state to true for 250ms.
  - Badge gets `className={cn('transition-transform duration-200', bump && 'scale-[1.3]')}`.

### 6. `src/components/library/ShopifyProductCard.tsx` — Add-to-Cart feedback
- Local `status: 'idle' | 'adding' | 'added' | 'error'` state.
- `handleAdd`: set `adding` → `await addItem(...)` → on success set `added` + `useCartStore.getState().openDrawer()` → reset to `idle` after 1500ms. On thrown/caught failure set `error` → reset after 2000ms.
- Button label/icon:
  - `adding`: spinner + `"Adding..."`
  - `added`: check icon + `"Added ✓"` (use a green class like `bg-emerald-600 text-white` overriding gold briefly)
  - `error`: `"Failed — Retry"` in red (`bg-red-600 text-white`)
  - `idle`: existing `"Add to Cart"` / `"Out of Stock"`
- Button disabled during `adding` and when variant `availableForSale === false`.
- Note: `addItem` in the store currently swallows errors (always resolves). To detect failure, return a boolean from `addItem` — small additive change: `addItem` returns `Promise<boolean>` (true on success, false on any branch that hit an error or cartNotFound). Update its single existing caller (this card) accordingly.

### 7. Persistence audit
- Cart already restores from localStorage on load via Zustand `persist`. `useCartSync` (already in `App.tsx`) calls Storefront `cart(id)` on mount and on tab visibility; if Shopify returns no cart or `totalQuantity === 0`, it calls `clearCart()` — this covers expired/invalid cart IDs per spec point 5. No changes needed.
- Spec asks for key `bazuki_cart_id`. We won't rename the persist key (it stores items+cartId+checkoutUrl together as JSON under `shopify-cart`); changing the key would orphan any in-flight test carts. Document the choice but functionally equivalent.

### Verification
1. `/collection` → click Add to Cart on a Shopify product:
   - Button: spinner "Adding..." → "Added ✓" (green) → resets.
   - Drawer slides in from right (420px, dark bg, gold left border, 60% black overlay).
   - Header badge appears with a 1→1.3→1 bump.
2. Inside drawer: − / + update quantity via Storefront mutations (Network shows `cartLinesUpdate`); minus at 1 removes (Network shows `cartLinesRemove`).
3. Remove link removes the item; when last item leaves, empty state shows.
4. "PROCEED TO CHECKOUT" opens `cart.checkoutUrl` (with `channel=online_store`) in a new tab and closes the drawer.
5. "Continue Shopping" closes drawer without navigation.
6. Refresh the page: cart count restored from localStorage; opening drawer re-syncs with Shopify; if Shopify cart is gone, local state clears.
7. Force a network failure on add → button shows "Failed — Retry" in red, no drawer opens.
8. Mobile: drawer is full width; minus/plus/remove all reachable; touch targets ≥40px.

### Files touched
- New: `src/components/cart/BazukiCartDrawer.tsx`
- Edit: `src/stores/cartStore.ts` (add UI slice; `addItem` returns boolean)
- Edit: `src/App.tsx` (mount `<BazukiCartDrawer />`)
- Edit: `src/components/Header.tsx` (open drawer + badge bump)
- Edit: `src/components/library/ShopifyProductCard.tsx` (feedback states)
- Delete: `src/components/CartDrawer.tsx` (after confirming no imports)

No schema changes. No new dependencies. Storefront API mutations + checkout URL handling are unchanged.