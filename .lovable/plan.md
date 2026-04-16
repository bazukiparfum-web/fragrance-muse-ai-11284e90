

## Plan: Add Sign In / Account Button to Header

### Change

Update `src/components/Header.tsx` to:

1. **Track auth state** — add a `user` state variable alongside `isAdmin`, populated by the existing `onAuthStateChange` listener and `getUser()` call.

2. **Render a User/LogIn button** — between the admin Shield icon and the CartDrawer:
   - **Logged out**: Show a `User` (lucide) icon button that navigates to `/auth`
   - **Logged in**: Show a `UserCheck` (lucide) icon button that navigates to `/shop/account`

### Files Modified
- `src/components/Header.tsx` — add `User`/`UserCheck` imports from lucide-react, add `user` state, render conditional button.

No database or routing changes needed — `/auth` and `/shop/account` routes already exist.

