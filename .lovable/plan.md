# Harden Admin Access Control

## Problem
Multiple admin-facing pages and Edge Functions have hardcoded `isAdmin = true` or skip caller authentication entirely. While the React Router `AdminRoute` currently blocks non-admins, defense-in-depth is broken — any future route refactoring or direct Edge Function calls by a non-admin would succeed.

## Scope
**In scope:** Remove testing bypasses, add real admin verification to all admin entry points.
**Out of scope:** Changes to `AdminRoute.tsx` (already correct), changes to non-admin flows, UI redesign.

## Frontend Changes

### 1. Fix hardcoded admin flags in admin pages
Replace hardcoded `isAdmin = true` with a real `user_roles` query in:

| File | Current | Fix |
|------|---------|-----|
| `src/pages/admin/AdminNotes.tsx` | `useState<boolean \| null>(true)` | Query `user_roles` for `role = 'admin'`, show access-denied spinner if not admin |
| `src/pages/admin/AdminIngredients.tsx` | `setIsAdmin(true)` in `useEffect` | Same pattern |
| `src/pages/admin/AdminQuestions.tsx` | `setIsAdmin(true)` in `useEffect` | Same pattern |

Pattern to use:
```ts
useEffect(() => {
  const check = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAdmin(false); return; }
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    setIsAdmin(!!data);
  };
  check();
}, []);
```

## Edge Function Changes

### 2. Add caller admin verification to all admin Edge Functions missing it

The following Edge Functions create a service-role client but **never verify the caller holds an admin role**. A logged-in customer who knows the function name can invoke them via `supabase.functions.invoke()`:

- `admin-manage-questions` — explicitly documented as "no auth checks"
- `admin-manage-notes`
- `admin-manage-scents`
- `admin-manage-rules`
- `admin-manage-formulas`
- `admin-bulk-import-queue`
- `admin-seed-production-queue`

Standard auth guard to add to each:
1. Read `Authorization` header.
2. Create a user-scoped Supabase client with the caller's JWT.
3. Call `auth.getClaims(token)` to extract `callerId`.
4. Query `user_roles` for `role = 'admin'` matching `callerId`.
5. Return `403 Forbidden` if no admin role found.
6. Only then proceed with the service-role client for data mutations.

**Reference implementation** already exists in:
- `admin-manage-users`
- `admin-list-orders`
- `admin-simulate-order`
- `admin-list-customers`

These should be copied as the canonical pattern.

### 3. Remove testing bypass comments
Delete or rephrase comments like "bypass RLS (test mode - no auth checks)" and any `isAdmin=true` / `verify_jwt=false` remnants so the codebase no longer documents how to disable security.

## Verification
- [ ] Non-admin user (customer account) calling any admin Edge Function receives `403`.
- [ ] Admin user can still access all admin pages and Edge Functions normally.
- [ ] No hardcoded `isAdmin = true` remains in `src/pages/admin/`.
- [ ] Build passes without TypeScript errors.
