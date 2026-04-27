## WhatsApp OTP Login (India)

Add a phone-number + WhatsApp OTP login flow as the **primary** login method, while keeping email/password and Google sign-in as a fallback. India only (+91, 10-digit numbers).

Provider: **AiSensy** (or Gupshup / MSG91 — same shape of API; will use AiSensy as default and one swap-able env var). You'll provide an API key and the approved template name later.

---

## What the user sees

1. `/auth` page now opens with a **WhatsApp OTP** card by default:
   - Country code locked to `+91`, 10-digit phone input.
   - "Send OTP on WhatsApp" button.
2. After Send: the input is replaced by a 6-digit OTP entry (using the existing `input-otp` component) with a 60-second resend timer.
3. After Verify: user is signed in (Supabase session created) and redirected home. New users are auto-created.
4. A subtle **"More login options"** link below reveals the existing Email/Password tabs and Google sign-in (current `Auth.tsx` content moved into a collapsible).

---

## How it works (technical)

Supabase Auth doesn't natively support WhatsApp OTP, so we implement a custom OTP flow that ends in a real Supabase session via `signInWithPassword` against a deterministic system password (never exposed to the user).

### New DB table: `phone_otps`
| col | type |
|---|---|
| `id` uuid PK |
| `phone` text (E.164, e.g. `+919876543210`) |
| `otp_hash` text (SHA-256 of OTP + per-row salt) |
| `salt` text |
| `attempts` int default 0 |
| `expires_at` timestamptz |
| `consumed_at` timestamptz null |
| `created_at` timestamptz default now() |

RLS: deny all to anon/authenticated. Only edge functions (service role) read/write.

### New column on `profiles`
- `phone` already exists. We'll add a unique index on `phone` (where not null) so phone numbers are unique per user.

### Edge function: `whatsapp-send-otp`
- Body: `{ phone: "9876543210" }` (10 digits, India)
- Validates with Zod (10 digits, leading non-zero, etc.).
- Rate-limit: max 3 sends per phone per 10 minutes, max 10 per IP per hour (in-memory map; warn this is per-instance only — fine for low volume).
- Generates 6-digit OTP, hashes with random salt, stores in `phone_otps` with 5-min expiry.
- Calls AiSensy/Gupshup/MSG91 API to send WhatsApp template message with OTP variable.
- Returns `{ success: true }` (never returns the OTP).

### Edge function: `whatsapp-verify-otp`
- Body: `{ phone: "9876543210", otp: "123456" }`
- Looks up latest non-consumed `phone_otps` row, checks expiry, hash, attempts (max 5).
- On success: marks consumed, then:
  1. Look up `profiles` by `phone = "+919876543210"`.
  2. If not found: create a new auth user via admin API with email `+919876543210@phone.bazukifragrance.com` and a random 32-byte password. Insert profile row with the phone.
  3. Either way: generate a session by calling `supabase.auth.admin.generateLink({ type: 'magiclink', email })` and return the action token, OR (cleaner) issue a short-lived custom JWT signed with `SUPABASE_JWT_SECRET` containing the user's `sub`. Front-end calls `supabase.auth.setSession({ access_token, refresh_token })`.
  - We'll go with **`generateLink` + `verifyOtp` token_hash** which is the cleanest supported path (Supabase admin endpoint returns a `hashed_token` we exchange client-side via `supabase.auth.verifyOtp({ type: 'magiclink', token_hash })` to set the session — no fake email link clicked).

### Front-end
- New component `src/components/auth/WhatsAppOtpLogin.tsx` with two states (phone → otp).
- `src/pages/Auth.tsx` restructured: WhatsApp OTP up top; existing tabs hidden behind "More login options" disclosure.
- Phone validation client-side: `/^[6-9]\d{9}$/` (Indian mobile).

### Secrets needed (request via `add_secret` after plan approval)
- `WHATSAPP_PROVIDER` = `aisensy` | `gupshup` | `msg91` (defaults to `aisensy`)
- `WHATSAPP_API_KEY` — your provider API key
- `WHATSAPP_TEMPLATE_NAME` — approved OTP template name (e.g., `otp_login_v1`)
- `WHATSAPP_SENDER_ID` — your registered WABA sender (phone or sender ID, format depends on provider)

---

## Files

**Create**
- `supabase/functions/whatsapp-send-otp/index.ts`
- `supabase/functions/whatsapp-verify-otp/index.ts`
- `src/components/auth/WhatsAppOtpLogin.tsx`

**Modify**
- `src/pages/Auth.tsx` — restructure with WhatsApp first, collapsed fallbacks
- DB migration — create `phone_otps` table + RLS + unique phone index on `profiles`
- `supabase/config.toml` — add `verify_jwt = false` for the two new functions (called from public Auth page)

---

## Limitations / things you handle later
- AiSensy/Gupshup/MSG91 require an **approved OTP template** in your WhatsApp Business Account. Until that's approved, sends will fail. The code is ready; you just paste the template name into the secret when ready.
- Rate limiting is in-memory (per edge function instance). For production scale, we'd later switch to a DB-based limiter.
- A user logging in by phone gets a synthetic email like `+919876543210@phone.bazukifragrance.com` — invisible to them. If they later add a real email, we can swap it.
- Only Indian numbers (+91) are accepted. Easy to extend later.
