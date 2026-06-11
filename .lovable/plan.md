## Goal

Add a dedicated **Customers** area to the admin, separate from Users (employees). A customer = anyone who has a `profiles` row, a `saved_scents` row, a `quiz_responses` row, OR an `orders` row — merged by email (for guest orders) and `user_id`.

## Scope

### Navigation
- New sidebar link **"Customers"** under `/admin/customers`. Existing `/admin/users` stays unchanged (employees/roles).
- Two new routes:
  - `/admin/customers` — searchable list
  - `/admin/customers/:id` — detail page (id = profile UUID or email for guest-only customers)

### Customers list (`/admin/customers`)
Table columns: Email · Name · Phone · # Orders · Total spent · # Scents · Signed up · Last activity · Account?

- Search by email/name/phone.
- Sort by last activity (default), total spent, signups.
- Filter chips: All / Has account / Guest only / Has orders / Quiz takers.
- Row click → detail page.

### Customer detail (`/admin/customers/:id`)
Four read-only sections in tabs (mobile) / stacked cards (desktop):

1. **Profile & contact** — email, full name, phone, WhatsApp opt-in status, signup date, last activity, account type badge (Account / Guest), most-recent shipping address from latest order.
2. **Orders history** — list of all `orders` + `order_items`, totals, status, created_at, "Open in Shopify" link (uses existing Shopify admin order URL), "Resend confirmation email" button (calls existing transactional email queue with order context).
3. **Created perfumes** — all `saved_scents` (public AND private) with name, fragrance_code, formula preview, is_public badge, created_at, link to `/admin/scents` row when public.
4. **Quiz activity & referrals** — latest `quiz_responses` + result snapshot, referral code issued, list of referrals made + reward status from `referral_rewards`.

No edit/delete/disable actions on this page. (Those stay on `/admin/users` for employees only.)

### Backend (edge function)
New `admin-list-customers` edge function (Service Role, admin-gated):
- `action: 'list'` → returns merged customer rows. Joins `profiles` left with aggregated `orders` (count, sum, max(created_at)) and `saved_scents` (count). Unions in distinct `orders.email` rows that have no matching profile (guest customers).
- `action: 'detail', id | email` → returns profile + all orders + order_items + saved_scents + latest quiz_response + referral code + referrals + referral_rewards + whatsapp_optin in one payload.
- `action: 'resend_order_email', orderId` → enqueues order confirmation via existing `process-email-queue` pipeline.

Reuses admin-role check pattern from `admin-manage-users`.

### Frontend files
- `src/pages/admin/AdminCustomers.tsx` (list)
- `src/pages/admin/AdminCustomerDetail.tsx` (detail, 4 sections)
- Sidebar entry in `src/components/admin/AdminSidebar.tsx`
- Routes in `src/App.tsx`

### Out of scope
- No schema changes (uses existing tables).
- No edits/deletes/password actions on customers.
- No CSV export, no bulk actions, no pagination beyond first 100 (search to narrow).
- Users page (`/admin/users`) is unchanged.

## Technical notes

- Customer ID strategy: prefer `profiles.id` (UUID). For guest-only customers (orders without a profile), use URL-encoded email as the id segment; detail function dispatches on UUID vs email.
- "Last activity" = `GREATEST(max(orders.created_at), max(saved_scents.created_at), max(quiz_responses.created_at), profiles.created_at)`.
- All queries run inside the edge function with `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS — same pattern as `admin-list-orders`.
- Shopify order link: `https://{shop}.myshopify.com/admin/orders/{shopify_order_id}` built from existing `orders.shopify_order_id`.
