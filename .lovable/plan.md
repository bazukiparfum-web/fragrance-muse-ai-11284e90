## Goal

Make the post-OTP referral WhatsApp send match the approved `bazuki_referral_code` template so it actually delivers to new signups.

## Mismatch found (verified in `supabase/functions/whatsapp-verify-waitlist-otp/index.ts`)

Template expects:

- `{{1}}` = friend's first name (appears in HEADER and BODY)
- `{{2}}` = referral code
- Button (Visit Website, dynamic URL) = the referral link the recipient opens

Current code sends:

- `data: [referralCode, shareUrl]` → `{{1}}` = code (wrong), `{{2}}` = URL (wrong)
- `buttonValue: referralCode` → button URL suffix = raw code (wrong)
- `first_name` from the request body is never passed into `sendReferralWhatsApp`

Result: 11za rejects the send (variable count/format mismatch) or delivers a garbled message, which is why nothing is arriving.

## Fix

1. In `whatsapp-verify-waitlist-otp/index.ts`:
  - Change `sendReferralWhatsApp` signature to `(phoneE164, referralCode, firstName)`.
  - Set `data: [firstName || "A friend", referralCode]`.
  - Set `buttonValue` to the dynamic URL suffix 11za appends to the template's base "Visit Website" URL. For a base of `https://www.bazukifragrance.com/coming-soon` this should be `?ref=${referralCode}` (confirm against how the template's button URL is registered in 11za — if the base URL is the site root, use `coming-soon?ref=${referralCode}`).
  - Pass `first_name` through from the request payload at the call site (line 167).
2. Redeploy `whatsapp-verify-waitlist-otp`.

## Verification

1. Run a real signup on `/coming-soon` with a WhatsApp number you own (first name filled in).
2. Pull `whatsapp-verify-waitlist-otp` logs and confirm `11za referral send ok` with a success body.
3. Confirm the WhatsApp arrives with: correct first name in header/body, correct `BZK-XXXX` code, and the "Open my gift" button opens the referral URL.
4. If 11za returns a variable/URL error, adjust `data` order or `buttonValue` per the exact error, redeploy, retest.

## One clarification I need

In your 11za dashboard for `bazuki_referral_code`, what is the **base URL** configured on the "Open my gift" button? I need to know whether to send `?ref=BZK-XXXX` (base already ends at `/coming-soon`) or `coming-soon?ref=BZK-XXXX` (base is the site root) as `buttonValue`. Once you confirm, I'll apply the fix and redeploy in one pass.  
  
**base URL: [https://www.bazukifragrance.com/coming-soon](https://www.bazukifragrance.com/coming-soon)**