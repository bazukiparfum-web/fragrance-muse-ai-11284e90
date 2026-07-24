## Goal
Enable automatic WhatsApp referral-code delivery after OTP verification on `/coming-soon` by configuring the `WHATSAPP_11ZA_REFERRAL_TEMPLATE` env var used by `whatsapp-verify-waitlist-otp`.

## Steps
1. Prompt for the approved 11za template name via `add_secret` (secure form), storing it as `WHATSAPP_11ZA_REFERRAL_TEMPLATE`.
2. Redeploy `whatsapp-verify-waitlist-otp` so it picks up the new env var.
3. Verify by triggering a test signup and checking edge function logs for a successful 11za send.

## What I need from you
The exact **template name** (as approved in your 11za dashboard) and confirmation of the variable order it expects. Current code sends `data: [firstName, referralCode]` (i.e. `{{1}}` = first name, `{{2}}` = referral code). If your template uses a different order or only one variable, tell me and I'll adjust the function before redeploy.
