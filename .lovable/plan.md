## Goal
Show a per-order timeline in the admin that records key lifecycle moments — order created, payment received, production enqueued — distinguishing COD vs prepaid flows.

## Approach
Add a lightweight, append-only `order_events` table written by the webhook handler. Render it as an expandable timeline row inside `/admin/orders` (no separate route).

## Changes

### 1. Database — new table `public.order_events`
Columns:
- `order_id uuid references public.orders(id) on delete cascade`
- `event_type text` — one of: `order_created`, `payment_received`, `production_enqueued`, `status_changed`
- `source text` — `shopify_webhook` | `system` | `admin`
- `metadata jsonb` — e.g. `{ topic: 'orders/paid', payment_method: 'cod', queue_item_id, fragrance_code, from_status, to_status }`
- `occurred_at timestamptz default now()`
- standard `id`, `created_at`

Indexes: `(order_id, occurred_at)`.
GRANTs: `service_role` full; `authenticated` SELECT (admin reads via edge function with service-role, but SELECT grant kept for future). RLS: enable, single policy "Admins can read" using `has_role(auth.uid(), 'admin')`. No INSERT policy needed — writes happen via service role.

### 2. `supabase/functions/shopify-webhook-handler/index.ts`
Insert an event row at each milestone:
- After `orders` row is inserted in `handleOrderCreated` → `order_created` with `{ topic, payment_method, payment_gateway }`.
- If COD branch enqueues production → for each `production_queue` insert, write `production_enqueued` with `{ trigger: 'orders/create', queue_item_id, fragrance_code, payment_method: 'cod' }`.
- In `handleOrderPaid` after status update → `payment_received` with `{ topic: 'orders/paid', payment_method }`.
- For each prepaid enqueue inside `addToProductionQueue` → `production_enqueued` with `{ trigger: 'orders/paid', queue_item_id, fragrance_code, payment_method: 'prepaid' }`.

Wrap the inserts in a small helper `logEvent(orderId, type, metadata)` so failures are caught and logged but never break webhook processing.

### 3. New edge function `admin-list-order-events`
- Standard admin auth guard (JWT + `has_role` check) matching `admin-list-orders`.
- Input: `{ orderId: string }`.
- Returns events sorted ascending by `occurred_at`, plus a derived fallback when zero events exist (so historical orders still show something):
  - synth `order_created` from `orders.created_at`
  - synth `payment_received` if `orders.status === 'paid'` (use `updated_at` if available, else `created_at`)
  - synth `production_enqueued` rows from existing `production_queue` rows for this `order_id` using their `created_at`.
- Register in `supabase/config.toml`.

### 4. `src/pages/admin/AdminOrders.tsx`
- Add a row-expand toggle (chevron in a leading column). Clicking a row toggles an expanded `<TableRow>` underneath that renders `<OrderTimeline orderId={...} />`.
- Track `expandedId` in component state; lazy-fetch events when first expanded; cache in a `Record<string, Event[]>`.

### 5. New component `src/components/admin/OrderTimeline.tsx`
- Calls `admin-list-order-events` via `supabase.functions.invoke`.
- Renders a vertical timeline (dot + line) of events, each row:
  - icon by `event_type` (Plus / CreditCard / Factory / RefreshCw)
  - localized `occurred_at`
  - human label ("Order placed", "Payment received via Razorpay", "Production enqueued (COD, on order create)", etc.)
  - small muted line with `metadata.fragrance_code` when relevant
- Loading skeleton + empty state ("No events recorded").
- Uses semantic tokens only (no hardcoded colors); COD-related rows tagged with the same amber badge style used in the orders table.

## Out of scope
- No write/edit UI for events.
- No email/notification triggers from events.
- No backfill migration — historical orders rely on the derived fallback in step 3.

## Technical notes
- Event writes are best-effort: each `logEvent` call is wrapped in try/catch and only logs on failure, so a missing event never breaks an order or queue insert.
- Timeline always renders chronologically; derived events from the fallback are marked `source: 'derived'` so admins can see they're inferred.
