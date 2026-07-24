## Goal
Let visitors join the waitlist on `/coming-soon` with their WhatsApp number (required) and an optional email. Verify the phone via WhatsApp OTP before creating the signup, then send the referral code by WhatsApp and also show it on screen.

## Changes

### 1. Database (migration)
- `waitlist_signups`: make `email` nullable; add `phone` (text, unique when not null) and `phone_verified_at` (timestamptz).
- Update `create_waitlist_signup` RPC:
  - New signature: `(_phone text, _email text DEFAULT NULL, _first_name text, _utm_source, _referred_by, _email_variant)`.
  - Require `_phone`; dedupe on phone first, then email.
  - Store phone in E.164 (`+91XXXXXXXXXX`).
- Keep existing referral code generation trigger untouched.

### 2. Edge functions
- Reuse `whatsapp-send-otp` (already exists, 11za flow, 6-digit OTP, 5-min TTL).
- New `whatsapp-verify-waitlist-otp` function:
  - Input: `{ phone, otp, email?, first_name?, utm_source?, referred_by?, email_variant? }`.
  - Validate OTP against `phone_otps` (hash + salt, unexpired), mark consumed.
  - Call `create_waitlist_signup` RPC via service role.
  - Fire the existing `create-referral-shopify-discount` + WhatsApp referral message via 11za (new template variable = referral code + short link `bazukifragrance.com/?ref=CODE`).
  - Return `{ referral_code, duplicate }`.
- Keep existing email confirmation path: only send the welcome email if `email` was provided.

### 3. Frontend — `src/pages/ComingSoon.tsx`
Replace the current email-only form with a two-step flow:

Step 1 — Details
- Fields: First name (optional), WhatsApp number (required, reuse `WhatsAppCaptureField` styling with `+91` prefix + 10-digit validation), Email (optional).
- Submit → calls `whatsapp-send-otp`.

Step 2 — Verify
- 6-digit OTP input, resend timer (30s), edit-number link.
- Submit → calls `whatsapp-verify-waitlist-otp`.
- On success: show existing success card with referral code, share tools, and a small "Sent to your WhatsApp ✓" confirmation.

Preserve: referral-open/closed states, UTM + `referred_by` capture, cta_events tracking (add `waitlist_phone_signup` event).

### 4. WhatsApp template
- Reuse 11za template `otp_login` for OTP send (already configured).
- For the post-signup referral message, use a new template name via env `WHATSAPP_11ZA_REFERRAL_TEMPLATE` (fallback: skip WhatsApp send if unset and log a warning — user can add later without breaking signup).

### 5. Admin waitlist view
- `/admin/waitlist`: add Phone column and phone filter; make email column show "—" when null.

## Technical details
- OTP storage already exists (`phone_otps` table + hashing in `whatsapp-send-otp`).
- Rate limits from existing OTP function apply (3/phone/10min, 10/IP/hour).
- Phone uniqueness enforced at DB level; RPC returns `duplicate: true` with existing referral code (parity with current email dedupe).
- Email A/B variant only assigned when email is provided.

## Out of scope
- SMS fallback (no SMS provider connected).
- Changing the referral overlay / drip email cadence.
- WhatsApp drip sequence (email drips still email-only; phone-only users just get the initial WhatsApp confirmation).