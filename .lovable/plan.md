## Goal
Show the payment gateway (e.g. GoKwik) and payment type (COD / Prepaid) on the customer-facing Order Confirmation page.

## Changes

### 1. `supabase/functions/get-order-summary/index.ts`
- Extend the `orders` select to include `payment_method` and `payment_gateway`.
- Return them in the JSON response alongside `orderNumber`, `total`, `items`.

### 2. `src/pages/OrderConfirmation.tsx`
- Extend the summary state to capture `paymentMethod` and `paymentGateway`.
- Inside the existing "Order summary" card (right below the items list, above the total-less footer), render a small "Payment" row:
  - Label: `Payment` in the same uppercase gold-muted style used for the "Order summary" label.
  - Value line: `{Gateway} · {COD | Prepaid}` — e.g. `GoKwik · Prepaid`, `Shopify Payments · COD`, or `Cash on Delivery` when method is COD and no gateway is set.
  - Gateway name pretty-printed (map common slugs: `gokwik` → `GoKwik`, `shopify_payments` → `Shopify Payments`, `cash_on_delivery` / `manual` → hide gateway and just show `Cash on Delivery`). Unknown gateways fall back to title-cased slug.
- If neither field is present (older orders), skip the row silently.
- No layout, color, or typography changes beyond adding this one row using existing tokens (`text-cream`, `text-cream-muted`, `--bz-gold`).

## Out of scope
- Email template, admin UI, webhook, DB schema — all already store the data correctly.
- No new tables, RLS, or migrations.
