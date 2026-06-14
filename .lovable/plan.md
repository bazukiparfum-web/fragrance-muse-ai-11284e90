# Invite Users from /admin/users

Add an invite flow so any admin can create a new user account from the Users page. The new user receives a single branded email welcoming them and giving them a secure link to set their password.

## UX

On `/admin/users`:
- New **"Invite user"** button in the top-right of the page header (next to the search card).
- Opens a dialog with fields:
  - Email (required)
  - Full name (optional)
  - Phone (optional)
- Submit → toast "Invitation sent to {email}", the new user appears in the list (Active, role: User).

The action is available to **any admin** (matches the Grant/Revoke pattern). Admin role is **not** grantable from the invite form — must be granted afterwards via the existing "Grant admin" button.

## Email

A single branded **app email** (React Email template, sent through `send-transactional-email`):
- Subject: "Welcome to Bazuki — set your password"
- Body: warm welcome line, brand styling matching existing templates, primary CTA button "Set your password" linking to a Supabase password-recovery URL that lands on the existing `/reset-password` page.
- No separate "congrats" + "reset" emails; one email does both.

## Technical Details

### Edge function
Extend `supabase/functions/admin-manage-users/index.ts` with a new action `invite_user`:
1. Require caller to be admin (existing role check is already there; drop the `requirePrimary()` call for this action).
2. Validate input with zod-style checks (email format, length caps mirroring `update_user`).
3. Reject if a profile with that email already exists (`profiles.email` lookup).
4. Create the auth user via `admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name, phone } })`. `email_confirm: true` so the account is usable without a verification step — they'll set their password via the recovery link.
5. Upsert `profiles` row (the `handle_new_user` trigger already inserts `id + email`; we patch in `full_name` / `phone`).
6. Generate a password-setup link with `admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: `${SITE_URL}/reset-password` } })` to get `action_link`.
7. Invoke `send-transactional-email` with `templateName: 'admin-user-invite'`, `recipientEmail: email`, `idempotencyKey: invite-${userId}`, `templateData: { fullName, setPasswordUrl: action_link, siteName: 'Bazuki' }`.
8. Return `{ ok: true, userId }`. On failure after auth-create, best-effort delete the auth user to avoid orphans.

`SITE_URL` resolves from an existing env (fallback to `https://bazukifragrance.com`).

### Email template
New file `supabase/functions/_shared/transactional-email-templates/admin-user-invite.tsx`:
- React Email components only, inline styles, white body background, brand primary for the CTA button (read from `src/index.css` tokens to match other templates).
- Props: `fullName?`, `setPasswordUrl`, `siteName`.
- Register in `_shared/transactional-email-templates/registry.ts`.

### Frontend
`src/pages/admin/AdminUsers.tsx`:
- Add `inviteOpen` state and `inviteForm { email, full_name, phone }`.
- "Invite user" button beside the search card.
- New `Dialog` reusing the same styling as the Edit dialog.
- Submit handler calls `supabase.functions.invoke('admin-manage-users', { body: { action: 'invite_user', ...inviteForm } })`, then `load()` and toast.
- Client-side validation: trim, email regex, name ≤120, phone ≤32.

### Deploy
Deploy `admin-manage-users` and `send-transactional-email` after edits (template registry change requires the send function redeploy).

## Out of Scope
- No bulk invite / CSV import.
- No role assignment in the invite form.
- No resend-invite button (admin can use the existing "Send password reset" if needed).
- No changes to the existing auth flow or `/reset-password` page.
