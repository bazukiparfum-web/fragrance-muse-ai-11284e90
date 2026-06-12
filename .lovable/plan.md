## Goal
Enable COD orders to enter production immediately on `orders/create`, while prepaid orders keep their existing `orders/paid` flow. Surface COD visibility in `/admin/orders` with a badge and filter.

## Changes

### 1. `supabase/functions/shopify-webhook-handler/index.ts`
- Detect payment method per order. Shopify exposes this via `payment_gateway_names` (array, e.g. `["Cash on Delivery (COD)"]`) and `financial_status` (`pending` for COD).
- Helper `isCOD(orderData)`: returns true when any gateway name matches `/cash on delivery|cod/i`, or when `gateway === 'manual'` and `financial_status === 'pending'`.
- In `handleOrderCreated`:
  - After persisting the order + items, if `isCOD(orderData)` → call `addToProductionQueue(...)` immediately (same function already used by `handleOrderPaid`). Mark the stored order with `payment_method: 'cod'`.
  - Non-COD orders: no production enqueue here (unchanged behavior).
- In `handleOrderPaid`:
  - Skip `addToProductionQueue` if the order is already COD-enqueued (guard against duplicates by checking existing `production_queue` rows for this `order_id`).
  - Prepaid path unchanged.
- Persist `payment_method` ('cod' | 'prepaid') and `payment_gateway` (raw string) on the `orders` row so the admin UI can filter without re-parsing.

### 2. Database
- Add nullable columns to `public.orders`:
  - `payment_method text` (values: 'cod' | 'prepaid')
  - `payment_gateway text`
- No RLS changes needed; existing policies cover new columns.

### 3. `supabase/functions/admin-list-orders/index.ts`
- Accept new filter `paymentMethod: 'all' | 'cod' | 'prepaid'` in request body.
- Include `payment_method`, `payment_gateway` in the `select`.
- Apply `.eq('payment_method', paymentMethod)` when not `'all'`.

### 4. `src/pages/admin/AdminOrders.tsx`
- Add `paymentMethod` state + `<Select>` (All / COD / Prepaid) next to the existing status filter; pass it in the `invoke` body and reset page on change.
- Extend `OrderRow` with `payment_method`.
- Add a "Payment" column showing a `<Badge>`:
  - COD → `variant="outline"` with amber/warning class
  - Prepaid → `variant="secondary"`
  - Unknown → `—`

## Out of scope
- No changes to Shopify Admin config (COD enablement, pincode gating, COD fees).
- No email/notification changes.
- No backfill of `payment_method` on historical orders (column stays null until webhook re-runs or admin edits).

## Technical notes
- Duplicate-enqueue guard uses a `SELECT id FROM production_queue WHERE order_id = ? LIMIT 1` before insert in both paths.
- `payment_method` is derived once in `handleOrderCreated` and reused; `handleOrderPaid` reads it back from the DB to decide whether to skip enqueue.
