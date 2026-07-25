## What the error means

The error is coming from the WhatsApp OTP send step, not from the removed referral feature.

Current backend logs show `whatsapp-send-otp` is failing because the 11za WhatsApp provider rejects the configured website/origin:

```text
Invalid originWebsites! Please try again with valid originWebsites
WhatsApp provider rejected the configured website. Please check the 11za originWebsite setting.
```

So the waitlist form reaches the backend, generates/stores an OTP, then fails when trying to send that OTP through 11za.

## Why it still happens after removing referrals

Referral removal affected post-signup sharing/discount-code logic. This failure happens earlier: when the user clicks **Send WhatsApp OTP**. The same 11za provider and `originWebsite` validation are still required for basic OTP delivery.

## Fix plan

1. **Confirm the exact 11za origin format**
   - Check the stored `WHATSAPP_11ZA_ORIGIN_WEBSITE` secret/config value.
   - Compare it with the website/origin registered in the 11za account.
   - The provider is rejecting every current candidate: `bazukifragrance.com`, `www.bazukifragrance.com`, and `https://...` variants.

2. **Update the WhatsApp OTP function**
   - Make the provider payload use the exact registered 11za origin value instead of trying many guessed formats.
   - Keep clear logging for provider rejection without exposing private tokens.
   - Return a friendlier user-facing error if 11za rejects configuration.

3. **Test the deployed function directly**
   - Call the OTP function with a valid test mobile number.
   - Confirm the provider no longer returns `Invalid originWebsites`.
   - Check function logs after the test.

4. **Optional fallback improvement**
   - If 11za remains blocked by account-side settings, keep the page usable by showing a clearer message like: “WhatsApp OTP is temporarily unavailable. Please try again later.”
   - Do not re-add referrals.

## What may need manual action

If the 11za account has a different approved `originWebsite` than the website currently configured in the app, the value must be corrected either in the app secret or in the 11za provider settings. The code alone cannot bypass 11za’s origin whitelist.