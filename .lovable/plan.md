

## Plan: Add Admin Authentication Guard

### Current State
- `user_roles` table exists with RLS and `has_role()` function
- `modivishvam@live.com` already has the `admin` role assigned
- All `/admin/*` routes are currently unprotected — anyone can access them
- Auth page (`/auth`) exists with sign-in/sign-up functionality

### Changes

**1. Create `src/components/AdminRoute.tsx`** — A route guard component that:
- Checks if user is authenticated (redirects to `/auth` if not)
- Queries `user_roles` table to verify the user has the `admin` role
- Shows a loading spinner while checking
- Shows an "Access Denied" message if authenticated but not admin
- Renders children if authorized

**2. Update `src/App.tsx`** — Wrap all `/admin/*` routes with `<AdminRoute>`:
```
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
<Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
...etc
```

**3. Update `src/components/Header.tsx`** — Conditionally show the Shield (admin) icon only when the logged-in user has the admin role, hiding it from regular users.

### Technical Details
- Uses `supabase.auth.getUser()` for session check
- Uses `supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin')` to verify admin status
- Listens to `onAuthStateChange` so it reacts to login/logout
- No database changes needed — roles table and data already exist

