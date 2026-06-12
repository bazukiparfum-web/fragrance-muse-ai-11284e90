# Engraving — Tests, A11y & Post-Purchase Visibility

Three independent additions on top of the existing engraving feature. No changes to pricing, cart, or checkout logic.

## 1. Automated tests

Switch `vitest.config.ts` to `environment: "jsdom"` with `src/test/setup.ts` (jest-dom + `matchMedia` shim) so React components can render. Add `@vitejs/plugin-react-swc` to the config.

New test files:

- `src/hooks/useEngraving.test.ts`
  - Empty/whitespace text → `isActive === false` even when enabled.
  - 20-char cap and trimming.
  - `Bold` style uppercases new input *and* converts existing text on style switch.
  - `trimmed` matches expectation.

- `src/components/product/EngravingPanel.test.tsx`
  - Toggle off: body collapsed, font cards & input not focusable (`tabindex="-1"` / `inert`).
  - Toggle on: cards have `role="radio"` + `aria-checked`, input visible.
  - Typing updates counter and color tier (assert class / inline style).
  - `pulseInvalid()` via ref focuses input and shows tooltip.

- `src/components/product/EngravedBottlePreview.test.tsx`
  - Hidden when `enabled=false` or empty text.
  - Renders each char + trailing spark when enabled+text.
  - Font size shrinks as length grows (assert inline `fontSize` thresholds at 6/12/18).

- `src/pages/__tests__/ProductDetail.engraving.test.tsx` (light, mocks `fetchShopifyProductByHandle` & `useCartStore`)
  - Base CTA shows `ADD TO CART — ₹X`.
  - Enabling toggle + typing valid text → CTA shows `₹X+199` and `+ ₹199 personalised engraving` line appears under price.
  - Enabling toggle with empty text → clicking ATC calls `pulseInvalid` and does NOT call `addItem`.
  - Valid engraving → `addItem` called with `attributes` containing `_Engraving Text`, `_Engraving Style`, `_Engraving Fee`.

## 2. Accessibility improvements

- **Toggle row** (`EngravingPanel`):
  - Wrap header in a `<label htmlFor="engraving-toggle">` so clicking the label toggles the switch; give `Switch` `id="engraving-toggle"` and `aria-describedby="engraving-toggle-desc"`.
  - Add `aria-expanded` on the toggle reflecting `enabled`; collapsed body gets `hidden` / `inert` so screen readers and tab order skip it.
  - Animated fee badge gets `aria-hidden="true"` (info is in the toggle label).

- **Font style cards**:
  - Convert from individual buttons to a `role="radiogroup"` with `aria-label="Engraving font style"`.
  - Each card becomes `role="radio"` with `aria-checked`, `tabIndex` set to 0 only for the selected card (roving focus), others -1.
  - Arrow Left/Right/Up/Down cycles selection and moves focus; Home/End jump to first/last; Space/Enter selects.
  - Visible `focus-visible` ring using existing gold token.
  - Sample text gets `aria-hidden`; add visually-hidden description e.g. `"Classic — timeless serif"` via `<span className="sr-only">`.

- **Engraving input**:
  - Associate counter via `aria-describedby="engraving-counter"`; counter gets `aria-live="polite"` and `aria-atomic="true"`.
  - When at 19/20 chars, add `aria-describedby` to include a near-limit announcement.
  - Tooltip on invalid submit becomes `role="alert"` (already partially) and input gets `aria-invalid="true"` for the pulse duration.
  - Spark icon → `aria-hidden`.
  - Ensure label `htmlFor` matches input id (already does).

- **Live preview** (`EngravedBottlePreview`): overlay `aria-hidden` (decorative); add an `sr-only` live region in the panel that announces `"Preview updated: <text> in <style>"` debounced 500ms so SR users get feedback.

- Respect `prefers-reduced-motion`: skip pulse/spark/shimmer (already partly handled in CSS — verify and extend).

## 3. Engraving on order confirmation page + email

### Storage
Migration: add `attributes jsonb` column to `public.order_items` (default `'[]'::jsonb`). Re-grant unchanged.

### Webhook
In `shopify-webhook-handler` `handleOrderCreated` line-item insert, persist `item.properties` (filtered to the three engraving keys + any other `_` prefixed) into the new `attributes` column. Shopify line-item properties already arrive as `[{name, value}]`.

### Edge function
Add `get-order-summary` (public, takes `orderNumber`, service-role): returns `{ order_number, items: [{ name, qty, price, size, image, engraving: { text, style, fee } | null }] }`. Used by both the confirmation page and the email.

### Order Confirmation page
Below the order number badge, render an **Order Summary** card. For each item with engraving show a gold-bordered sub-row:
`✦ Engraved "PRIYA" · Elegant style · +₹199` using the same font class as in cart (`ENGRAVING_FONT_CLASS[style]`). No engraving → unchanged.

### Email template
New transactional template `order-confirmation-with-engraving.tsx` (or extend existing order email if one exists — will check during build). Each line item renders product name + quantity + price; engraved lines append:
```
✦ Engraved: PRIYA
   Style: Elegant · +₹199
```
Sent from `shopify-webhook-handler` after `order_items` insert when `recipientEmail` is available (Shopify `orderData.email`), with `idempotencyKey = order-confirm-${shopifyOrderId}`.

If no email infrastructure / template registry exists for app emails, the build step will run `setup_email_infra` + `scaffold_transactional_email` first, then add this template.

## Out of scope
- Changing engraving pricing, cart line-item logic, or checkout flow.
- Editing Shopify-side order confirmation email (we send our own branded one).
- Admin UI changes (engraving will naturally appear in any existing order_items listing once attributes is populated; no new admin work).
