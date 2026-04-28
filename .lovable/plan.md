## WhatsApp OTP Login via 11za (India)

Phone-number + WhatsApp OTP login as the **primary** sign-in method on `/auth`. Email/password and Google remain available beneath a "More login options" disclosure. India only (+91, 10-digit numbers). Provider: **11za**.

The DB migration (table `phone_otps` + unique phone index on `profiles`) was already approved and applied — that part is done.

---

## What the user sees

1. `/auth` opens with a WhatsApp OTP card on top:
   - `+91` prefix locked, 10-digit input.
   - "Send OTP on WhatsApp" button.
2. After Send → 6-digit code entry (existing `input-otp` component) with 60-second resend timer and "Change number" link.
3. After Verify → real Supabase session created, redirected to `/`.
4. Below: a small "More login options" link reveals the existing Sign In / Sign Up tabs (email + Google).

---

## How it works

### `whatsapp-send-otp` edge function (`verify_jwt = false`)
- Body: `{ phone: "9876543210" }` (10 digits).
- Validates: `^[6-9]\d{9}$`.
- In-memory rate-limit: max 3 sends per phone / 10 min, max 10 / IP / hour.
- Generates 6-digit OTP, stores `SHA-256(otp + salt)` in `phone_otps` with 5-min expiry.
- POSTs to **11za**:
  - URL: `${WHATSAPP_11ZA_BASE_URL}/pabbly/sendTemplate` (default base `https://app.11za.in/apis`).
  - Header: `authToken: <WHATSAPP_11ZA_AUTH_TOKEN>`.
  - Body: `{ TemplateName, Name: "Customer", PhoneNumber: "919876543210", Language: "en", BodyDynamicData: <otp>, ButtonValue: <otp> }` (matches 11za Pabbly API).
- Returns `{ success: true }`. Never returns the OTP.

### `whatsapp-verify-otp` edge function (`verify_jwt = false`)
- Body: `{ phone, otp }`.
- Looks up latest unconsumed, unexpired OTP for the phone, hash-compares, max 5 wrong attempts.
- On success:
  1. Find profile by `phone = "+919876543210"`. If missing, create an auth user via `supabase.auth.admin.createUser` with synthetic email `919876543210@phone.bazukifragrance.com` + random 32-byte password, and upsert `profiles { phone }`.
  2. Call `supabase.auth.admin.generateLink({ type: 'magiclink', email })` — returns a `hashed_token`.
  3. Return `{ success: true, token_hash, email }`.
- Frontend then calls `supabase.auth.verifyOtp({ type: 'magiclink', token_hash })` to install a real session client-side. No fake email link is ever emailed or clicked.

### Frontend
- New `src/components/auth/WhatsAppOtpLogin.tsx` — handles both phone and OTP steps.
- `src/pages/Auth.tsx` restructured: WhatsApp first, existing email/Google content moved into a collapsible "More login options".

---

## Secrets you'll need to add (I'll prompt via the secret form once we're in build mode)
- `WHATSAPP_11ZA_AUTH_TOKEN` — your 11za API auth token (from 11za dashboard → API).
- `WHATSAPP_11ZA_TEMPLATE_NAME` — name of your approved authentication template (e.g., `otp_login`).
- `WHATSAPP_11ZA_BASE_URL` — optional, defaults to `https://app.11za.in/apis`. Override only if 11za support gives you a different base.

The template must be of category **Authentication** with one body variable (the OTP) and a Copy-Code button (also receives the OTP via `ButtonValue`).

---

## Files

**Create**
- `supabase/functions/whatsapp-send-otp/index.ts`
- `supabase/functions/whatsapp-verify-otp/index.ts`
- `src/components/auth/WhatsAppOtpLogin.tsx`

**Modify**
- `src/pages/Auth.tsx` — WhatsApp primary, email/Google in a collapsible
- `supabase/config.toml` — add `verify_jwt = false` for both new functions

---

## Notes / limitations
- Until your 11za authentication template is approved by Meta, sends will fail with a clear error toast — code is ready.
- Rate limiting is in-memory (per edge instance). Fine for current scale.
- Phone-only users get an invisible synthetic email; if they later add a real one we can swap it.
- Only `+91` is supported; trivial to extend later.
