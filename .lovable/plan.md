## Goal
1) Capture WhatsApp phone + consent before Shopify checkout and let user edit on the confirmation page.
2) Store opt-ins in Lovable Cloud AND append them as a note on the matching Shopify order.
3) Show inline error + retry on the cart drawer / PDP when the checkout URL is missing or the launch flow fails.
4) Configure the Shopify post-payment redirect to `/order-confirmation?order={{ order.order_number }}`.

---

## 1. Cloud schema — new table `whatsapp_optins`

Migration adds:
- `id` uuid pk, `created_at`, `updated_at`
- `phone` text (E.164, `+91XXXXXXXXXX` validated server-side)
- `consent` boolean, default false
- `cart_id` text (Shopify cart `gid`, nullable) — used to reconcile pre-checkout opt-ins
- `shopify_order_number` text, nullable (filled in on confirmation)
- `shopify_order_id` text, nullable (filled in when we resolve the order from Admin API)
- `source` text — `'cart_drawer' | 'order_confirmation'`
- `shopify_note_status` text default `'pending'` → `'sent' | 'failed' | 'skipped'`
- `user_id` uuid, nullable
- Unique index on `(cart_id)` (partial: where cart_id not null) and on `(shopify_order_number)` to allow upsert.

RLS:
- Public INSERT allowed (`with check true`) — same pattern as `consultation_requests`. No public SELECT/UPDATE/DELETE. Edge functions use service role for upserts and reads.

## 2. Edge functions

### `whatsapp-optin` (POST, `verify_jwt = false`, CORS open)
- Zod body: `{ phone: string, consent: boolean, cartId?: string|null, orderNumber?: string|null, source: 'cart_drawer'|'order_confirmation' }`
- Normalize phone to E.164 (+91 default, strip spaces/dashes). Reject if not 10–15 digits.
- Service role upsert into `whatsapp_optins` on `cart_id` (if present) else on `shopify_order_number` else plain insert.
- If `orderNumber` is set, fire-and-forget call to `attach-whatsapp-to-order` (or do inline): resolve order via Shopify Admin REST `GET /admin/api/2025-07/orders.json?name=<orderNumber>&status=any` using `SHOPIFY_ACCESS_TOKEN`, then `PUT /admin/api/2025-07/orders/{id}.json` with `note` appended ("WhatsApp opt-in: +91… (consent: yes)"). Persist `shopify_order_id` and `shopify_note_status`.
- Returns `{ ok: true }` or `{ ok: false, error }`.

### `whatsapp-optin-reconcile` (POST, `verify_jwt = false`)
- Body: `{ cartId: string, orderNumber: string }`. Called from the confirmation page when a previous `cart_drawer` opt-in exists locally — copies `shopify_order_number` onto the row keyed by `cartId` and runs the Shopify note attach. Idempotent.

(Both deployed automatically. `supabase/config.toml` left untouched — defaults already have `verify_jwt = false`.)

## 3. Frontend — WhatsApp capture

### New component `src/components/checkout/WhatsAppCaptureField.tsx`
Reusable controlled field:
- `+91 ▾` prefix select (India only for launch — only ISO `IN` option, but the select is wired so we can add countries later).
- 10-digit numeric input, masked grouping `XXXXX XXXXX`, max 10 digits.
- Consent checkbox: "Send me order updates on WhatsApp from Bazuki."
- Inline zod validation, gold focus ring, dark-theme styling matching drawer/PDP.
- Props: `value`, `onChange`, `required`, `compact?: boolean`.

### Cart drawer (`BazukiCartDrawer.tsx`)
- Above the gold "Proceed to Checkout" button, render `<WhatsAppCaptureField required />`.
- Persist last-entered value to `localStorage.bazuki_wa_phone` / `bazuki_wa_consent` so refreshes don't wipe it.
- Button disabled until phone valid AND consent checked.
- `handleCheckout` now:
  1. Calls edge function `whatsapp-optin` with `{ phone, consent: true, cartId, source:'cart_drawer' }`. Awaits, but does not block on failure (toast warning, still proceeds).
  2. Starts the 1s overlay and opens Shopify checkout (unchanged).

### Order confirmation page (`OrderConfirmation.tsx`)
- New "WhatsApp updates" card below the order number:
  - If a saved opt-in exists in localStorage for the visited `cartId` / order, show `+91 XXXXX XXXXX  ✓ Saved` with an "Edit" button.
  - If absent, show the same `<WhatsAppCaptureField />` plus a small "Save" gold pill that calls `whatsapp-optin` with `{ phone, consent, orderNumber, source:'order_confirmation' }`.
  - On success → "Saved ✓" state with subtle gold check + Edit link.

## 4. Inline error + retry UX

### Shared launcher `useCheckoutRedirect.ts`
- Add a `status: 'idle' | 'launching' | 'error'` and `error?: string` to the returned tuple.
- New `reset()` method to clear error state.
- `launchCheckout(url)` validates url before timing out: empty/null → `setError('Checkout link is unavailable. Please try again.')`. Wraps `window.open(...)` in try/catch; if it returns null (popup blocked) → `setError('Checkout was blocked. Please allow pop-ups or try again.')`.

### `CheckoutLoadingOverlay.tsx`
- Add `error?: string`, `onRetry?: () => void`, `onClose?: () => void` props. When `error` is set, replace the progress bar + subline with: red-tinted alert text + two pill buttons "Retry" (gold) and "Close" (ghost gold). Keeps the same dark backdrop and Bazuki wordmark.

### Cart drawer
- If `getCheckoutUrl()` returns null on click → trigger overlay in error state with retry that re-syncs cart (`syncCart()` then re-tries `launchCheckout` once a fresh url exists).
- Also surface a thin inline banner above the button: red-tinted "Checkout link unavailable" + "Retry" text link — visible without opening the overlay, so users see the issue while interacting.

### PDP (`ProductDetail.tsx`)
- Wire the same overlay error/retry. Retry on PDP re-runs `handleBuyNow` (which re-creates / re-syncs cart and re-fetches checkoutUrl).
- Reuses the inline `stockMessage` helper area to also show "Couldn't start checkout — Retry" when applicable.

## 5. Shopify post-payment redirect

**This setting cannot be set programmatically.** Shopify does not expose the Order Status Page "Additional scripts" or the Thank-you page redirect via Admin REST/GraphQL. The two real options are:

A. **Manual (recommended, takes ~30s)** — Shopify Admin → Settings → Checkout → "Order status page" → "Additional scripts" → paste:
```html
<script>
  (function () {
    var orderName = (window.Shopify && Shopify.checkout && Shopify.checkout.order_id) || "{{ order.order_number }}";
    if (orderName) {
      window.location.replace("https://bazukifragrance.com/order-confirmation?order=" + encodeURIComponent(orderName));
    }
  })();
</script>
```

B. **Checkout UI extension app** — heavier, requires creating a Shopify Partner app.

The plan ships an in-app helper at `/admin/shopify-redirect-setup` (admin-only page) that:
- Shows the snippet above with a Copy button.
- Provides a "Open Shopify Order Status settings" deep link generated from `shopify--get_admin_url` + path `/admin/settings/checkout`.
- Stores a single `shopify_redirect_confirmed_at` flag in `admin_meta` (no new table — use `localStorage` admin-side, this is informational only).

I will be explicit to the user that step (A) is a 30-second Admin click — the page makes it copy-paste obvious.

---

## Technical summary
- 1 migration (`whatsapp_optins` + RLS + indexes).
- 2 edge functions (`whatsapp-optin`, `whatsapp-optin-reconcile`). Both call Shopify Admin REST `2025-07` using existing `SHOPIFY_ACCESS_TOKEN` secret.
- New components: `WhatsAppCaptureField`, `ShopifyRedirectSetup` admin page.
- Edits: `CheckoutLoadingOverlay`, `useCheckoutRedirect`, `BazukiCartDrawer`, `ProductDetail`, `OrderConfirmation`, `App.tsx` (admin route).
- No changes to `cartStore.ts` shape; we just attach extra side-effects on Proceed to Checkout.

## Out of scope
- WhatsApp message sending — already handled by existing `WHATSAPP_11ZA_*` infra and the `shopify-webhook-handler` order pipeline. We only capture the opt-in here.
- International phone support beyond +91.
- Building a Shopify checkout UI extension (option B above).