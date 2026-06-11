
## Goal

Let the primary admin (modivishvam@live.com) fully manage other users from `/admin/users` — edit their profile, send a password reset, temporarily disable login, or permanently delete the account. Regular admins keep the existing Grant/Revoke abilities only.

## Permission model

- **Primary admin** (email `modivishvam@live.com`): sees Edit, Reset password, Disable, Enable, and Delete actions for every other user.
- **Other admins**: see only the existing Grant admin / Revoke admin button.
- Nobody can edit, disable, or delete their own account.
- The primary admin account itself cannot be disabled, deleted, or have its admin revoked by anyone.

## UI changes — `src/pages/admin/AdminUsers.tsx`

1. Add a "Status" column (Active / Disabled badge based on `banned_until`).
2. Add an actions menu (dropdown) in the row, visible only when the current user is the primary admin:
   - **Edit user** → opens dialog with fields: Full name, Email, Phone (all validated with zod, trimmed, length-capped).
   - **Send password reset** → triggers a reset email to the user's address, with toast confirmation.
   - **Disable login** / **Enable login** → toggles a ban (sets `banned_until` to a far-future date or clears it). Confirm via AlertDialog.
   - **Delete permanently** → red destructive AlertDialog with the user's email typed to confirm, then hard-deletes the auth user (cascades to profile + related rows).
3. Existing Grant/Revoke admin button stays where it is, shown to all admins.

## Backend changes — `supabase/functions/admin-manage-users/index.ts`

Extend the existing function with new actions, all gated by the same admin-role check it already performs, plus a primary-admin check (look up the caller's email in `profiles` and compare to `modivishvam@live.com`) for the destructive ones.

New actions:
- `update_user` — `{ userId, full_name?, email?, phone? }`. Updates `profiles` row; if `email` changed, also calls `admin.auth.admin.updateUserById` to sync the auth email. Zod-validated.
- `send_password_reset` — `{ userId }`. Looks up the user's email, calls `admin.auth.resetPasswordForEmail`.
- `set_user_disabled` — `{ userId, disabled: boolean }`. Calls `admin.auth.admin.updateUserById` with `ban_duration: '876000h'` (≈100 years) when disabling, `'none'` when enabling.
- `delete_user` — `{ userId, confirmEmail }`. Verifies `confirmEmail` matches the target's email, then `admin.auth.admin.deleteUser(userId)`. Cascade FKs already remove `profiles` and related rows.

All destructive actions reject when `userId === callerId` or when the target email is `modivishvam@live.com`.

The existing `list` action is extended to return `is_disabled` (derived from auth admin `listUsers` lookup keyed by id) and `phone` so the UI can render the status badge and edit form.

## Out of scope

- Bulk actions, audit log, undo, pagination beyond the existing 50-row limit.
- Changing how regular admins are managed — only the primary admin gains the new destructive powers.
