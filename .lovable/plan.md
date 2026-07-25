## Goal

Switch the referral WhatsApp send from `bazuki_referral_code` to the new approved template `bazuki_referral_code_share`, then verify a real signup delivers.

## Context

Template variables and button are unchanged from the previously fixed mapping in `supabase/functions/whatsapp-verify-waitlist-otp/index.ts`:
- `{{1}}` = friend's first name (header + body)
- `{{2}}` = referral code
- Button dynamic URL suffix = `?ref=BZK-XXXX` (base `https://www.bazukifragrance.com/coming-soon`)

The function already reads the template name from the `WHATSAPP_11ZA_REFERRAL_TEMPLATE` secret, so no code change is required — only the secret value.

## Changes

1. Update secret `WHATSAPP_11ZA_REFERRAL_TEMPLATE` from `bazuki_referral_code` to `bazuki_referral_code_share`.
2. Redeploy `whatsapp-verify-waitlist-otp` so the new secret is picked up.

## Verification

1. Run a live signup on `/coming-soon` with a real WhatsApp number and first name.
2. Pull `whatsapp-verify-waitlist-otp` logs — expect `11za referral send ok`.
3. Confirm the WhatsApp arrives with correct first name in header/body, correct `BZK-XXXX` code, and the "Open my gift" button opens `https://www.bazukifragrance.com/coming-soon?ref=BZK-XXXX`.
4. If 11za returns a variable/URL error, adjust `data` order or `buttonValue` per the exact error, redeploy, retest.
