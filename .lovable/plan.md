## Plan: Fix 11za originWebsite configuration

### Goal
Stop the "Could not send WhatsApp message" error on `/coming-soon` by setting the 11za `originWebsite` secret to the exact value the provider expects.

### Steps

1. **Update the backend secret**
   - Set `WHATSAPP_11ZA_ORIGIN_WEBSITE` to `https://www.bazukifragrance.com/` (the exact format shown in the 11za payload).

2. **Test the WhatsApp OTP flow**
   - Use the `/coming-soon` page in the preview to request an OTP to a valid Indian mobile number.
   - Confirm the request succeeds and the user sees the OTP input step instead of the red error toast.

3. **Verify Edge Function logs**
   - Check `whatsapp-send-otp` logs for any remaining 11za errors.
   - Confirm the provider returns a success response with the updated origin.

### Expected outcome
WhatsApp OTP messages send successfully from `/coming-soon`, and the function logs no longer show `Invalid originWebsites` errors.

### Technical details
- Secret name: `WHATSAPP_11ZA_ORIGIN_WEBSITE`
- New value: `https://www.bazukifragrance.com/`
- Affected function: `supabase/functions/whatsapp-send-otp/index.ts`
- Affected page: `src/pages/ComingSoon.tsx` (only for testing/verification)