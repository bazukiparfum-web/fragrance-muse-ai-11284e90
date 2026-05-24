## 1. Create a test admin account

Seed a confirmed admin user directly in `auth.users` so you can log in immediately — no email verification needed.

**Credentials**

- Email: `modivishvam007@gmail.com` 
- Password: `BazukiAdmin@2026`

Steps (single migration):

- Insert user into `auth.users` with `email_confirmed_at = now()` and a bcrypt-hashed password (uses `crypt()` from pgcrypto).
- Insert matching row in `public.profiles`.
- Insert `('admin')` row in `public.user_roles` for that user.

You can log in at `/auth` → "More login options" → Sign In tab → email/password, then access `/admin`.

## 2. Fix "Forgot Password"

Investigate why the reset flow fails. Likely causes based on the current code:

1. **No custom auth-email-hook deployed** — Lovable Cloud sends default reset emails, but the redirect target `${origin}/reset-password` may land on the wrong domain (preview vs custom domain), making the link look "broken". Confirm Site URL + Redirect URLs are correct in Cloud → Auth settings.
2. `**/reset-password` page only renders the form when `type=recovery` is detected in URL hash** — if Supabase strips the hash before `useEffect` runs (e.g. when the session is already auto-exchanged), users see "Link expired". Fix by also accepting `?code=` query param and calling `supabase.auth.exchangeCodeForSession()` when present, plus a more lenient recovery detection (any active session arriving on this route).
3. **Network errors** in `handleResetPassword` already surface a "Connection blocked" toast — verify whether the failure is actually at `resetPasswordForEmail` (network) or after clicking the email link (token handling).

### Implementation

- Update `src/pages/ResetPassword.tsx`:
  - Detect recovery from hash (`type=recovery`), query (`?code=...&type=recovery`), or `PASSWORD_RECOVERY` auth event.
  - If `?code=` present, call `supabase.auth.exchangeCodeForSession(code)` before showing the form.
  - Only show "Link expired" after a short grace period (e.g. 1.5s) to avoid false negatives during async exchange.
- No DB changes for the fix itself.

## Files touched

- New migration (seed test admin)
- `src/pages/ResetPassword.tsx`

## Out of scope

- Custom branded auth emails (separate scaffolding step)
- Changing Supabase Site URL / Redirect URLs (must be done by you in Cloud → Auth settings if links point to the wrong domain)