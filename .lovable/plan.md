# Admin Console Overhaul

## 1. Shared Admin Shell
- Create `src/components/admin/AdminSidebar.tsx` (shadcn `Sidebar`, `collapsible="icon"`, NavLink active styles).
- Create `src/components/admin/AdminLayout.tsx` wrapping children with `SidebarProvider`, persistent `SidebarTrigger` in topbar, breadcrumb header.
- Refactor `src/App.tsx` to nest all `/admin/*` routes inside one `<AdminRoute><AdminLayout/></AdminRoute>` parent using `<Outlet/>`.
- Sidebar groups: **Overview** (Dashboard), **Catalog** (Notes, Ingredients, Rules, Scents, Questions), **Operations** (Orders, Production Queue, Consultations, Reviews), **Access** (Users & Roles), **Tools** (Manual Testing).

## 2. Live Dashboard Stats
- Update `AdminDashboard.tsx` to fetch counts via `Promise.allSettled`:
  - active fragrance_notes, ingredient_mappings, formulation_rules, quiz_questions
  - pending product_reviews, pending production_queue, new consultation_requests, recent orders
- Skeleton loaders + error fallback per card.

## 3. New Admin Pages
**`/admin/orders`** — `AdminOrders.tsx`
- Table of recent orders (id, user email via profiles join, total, status, shopify_order_number, created_at).
- Search by order_number / email, status filter, pagination (20/page).
- New edge function `admin-list-orders` (service role + admin check via `has_role`).

**`/admin/production-queue`** — `AdminProductionQueue.tsx`
- Table of queue items with status badges, fragrance_code, size, qty, created_at.
- Actions: mark in_progress / completed / failed (via `admin-manage-production` edge function).
- Realtime subscription on `production_queue` for live updates.
- Drawer to view full formula JSON + linked machine_formulas pump instructions.

**`/admin/users`** — `AdminUsers.tsx`
- Search profiles by email/name. Show current roles (joined from user_roles).
- Grant/revoke `admin` role via new `admin-manage-users` edge function.
- Confirmation dialog before role changes; block self-demotion.

## 4. Manual Testing Flow
**`/admin/testing`** — `AdminTesting.tsx`
- Step 1: Pick or create a saved_scent (search by user/code).
- Step 2: "Simulate paid order" → calls new `admin-simulate-order` edge function which inserts into `orders` + `production_queue` (mirrors webhook path) without touching Shopify.
- Step 3: "Drive machine" → calls existing `machine-production-api` with DEV key; shows pump sequence and live status as queue advances.
- Activity log panel showing each step's response.

## 5. Edge Functions (new)
All deployed with `verify_jwt = false` and in-code admin check (extract bearer → `getClaims` → `has_role(uid, 'admin')`):
- `admin-list-orders` — paginated orders + joined profile email.
- `admin-manage-users` — list/search profiles, grant/revoke roles.
- `admin-manage-production` — update queue item status, log timestamps.
- `admin-simulate-order` — insert synthetic paid order + queue entry from a saved_scent_id.

CORS via `corsHeaders` import; Zod validation on all inputs.

## 6. Migration
- No schema changes required (all needed tables exist: orders, profiles, user_roles, production_queue, machine_formulas).
- Optional: add index on `production_queue(status, created_at)` for queue page performance.

## 7. Out of Scope (this round)
- Removing the auth bypass (`mem://testing-strategy/authentication-bypass`) — kept until user explicitly requests hardening.
- Referrals admin page and Quiz Analytics page (deferred to a follow-up).
- Editing orders or refunds (read-only this round).

## Files Created
- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/pages/admin/AdminOrders.tsx`
- `src/pages/admin/AdminProductionQueue.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/admin/AdminTesting.tsx`
- `supabase/functions/admin-list-orders/index.ts`
- `supabase/functions/admin-manage-users/index.ts`
- `supabase/functions/admin-manage-production/index.ts`
- `supabase/functions/admin-simulate-order/index.ts`

## Files Edited
- `src/App.tsx` (nested admin routing)
- `src/pages/admin/AdminDashboard.tsx` (live stats + nav cards updated)
- `supabase/config.toml` (register 4 new functions with `verify_jwt = false`)

Approve to switch to default mode and implement.