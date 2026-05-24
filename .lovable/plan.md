## Goal

Make three auth flows robust in `src/pages/Account.tsx` (and supporting Header/Auth) so the user can:
1. Change their password from Account → Settings → Profile Details
2. Sign out cleanly from Account
3. Sign in without falling through to a stale/expired session

## Root cause

The auth-related actions in `Account.tsx` run before the Supabase session is guaranteed to be restored from storage, and they do not surface the real error from Supabase. Specifically:

- `handleChangePassword` calls `supabase.auth.updateUser({ password })` with **no session readiness check** and swallows the real error with a generic `"Failed to change password"` toast. If the session has expired or the user originally logged in via WhatsApp OTP (no email), Supabase returns `AuthSessionMissingError` / `same_password` / `weak_password` — currently invisible to the user.
- `handleLogout` calls `signOut()` then immediately `navigate('/')`, with no error handling and no local-state cleanup. If `signOut()` throws (e.g. network blocked, as seen in console `Failed to fetch`), the toast still says "Logged out successfully" but the session lingers.
- The Account page uses `getUser()` inside `fetchData()` on mount, which can race with session restore — leading to flashes of "Please sign in" or a wrong user id used by RLS-protected mutations.

## Changes

### 1. `src/pages/Account.tsx` — `handleChangePassword`
- Before calling `updateUser`, call `supabase.auth.getSession()`; if no session, toast "Your session expired, please sign in again" and redirect to `/auth`.
- Validate: new password ≥ 6 chars, matches confirm, **and** differs from current input being empty.
- Show the real error message from Supabase (`error.message`) instead of the generic string. Map common codes:
  - `same_password` → "New password must be different from your current password"
  - `weak_password` → surface Supabase's hint
  - `AuthSessionMissingError` → redirect to `/auth`
- Add a `saving` state on the dialog button so it can't be double-clicked.
- On success, close dialog, clear fields, toast success.

### 2. `src/pages/Account.tsx` — `handleLogout`
- Wrap in try/catch, await `signOut({ scope: 'local' })` (avoids the global revoke network call that's currently failing with `Failed to fetch`).
- Clear local component state (`setProfile(null)`, `setCurrentUserId(null)`) and the cart store's user-bound state if needed.
- Only navigate after `signOut` resolves; on error, still navigate but show a "Signed out locally" toast.

### 3. `src/pages/Account.tsx` — session readiness
- Replace the bare `useEffect(() => { fetchData() }, [])` with the standard Lovable pattern:
  - Set up `supabase.auth.onAuthStateChange` **first** (sync handler — no awaits inside the callback; schedule data fetch with `setTimeout(0)`).
  - Then call `supabase.auth.getSession()` to seed the initial state.
  - Only run `fetchData(user)` once a session is confirmed; if no session after init, redirect to `/auth`.
- This eliminates the race where `getUser()` returns `null` on a hard refresh.

### 4. `src/pages/Auth.tsx` — sign-in hardening
- After `signInWithPassword` succeeds, await `supabase.auth.getSession()` once to ensure the token is persisted before `navigate('/')` (prevents the next page from immediately bouncing back to `/auth`).
- Surface specific error codes (`invalid_credentials`, `email_not_confirmed`) with friendlier copy. The 400 `invalid_credentials` already showed up in your auth logs — make sure the toast says "Wrong email or password" instead of the raw message.
- Keep the existing flow otherwise (no changes to WhatsApp OTP or social buttons).

### 5. `src/components/Header.tsx` — keep auth state in sync
- The current `onAuthStateChange` calls `check()` which awaits `getUser()`. Move the awaited call out of the callback (fire-and-forget via `setTimeout`) to avoid the deadlock pattern noted in the stack-overflow snippet. This makes Sign Out reflect in the header instantly.

## Files touched

- `src/pages/Account.tsx`
- `src/pages/Auth.tsx`
- `src/components/Header.tsx`

## Out of scope

- The forgot-password / `/reset-password` flow (already fixed in the previous turn).
- Custom branded auth emails.
- WhatsApp OTP changes.

## Quick test plan

1. Log in with `modivishvam007@gmail.com` / `BazukiAdmin@2026` → Account → Settings → Change password → enter new password twice → expect success toast, then sign out and sign back in with new password.
2. From Account, click Sign Out → header should immediately show "Sign In", `/` should load without a stale session.
3. Try sign-in with a wrong password → expect "Wrong email or password" toast (not raw "Invalid login credentials").
