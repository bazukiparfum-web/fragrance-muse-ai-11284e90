## Request 11za WhatsApp secrets inline

Fire an in-chat secret prompt for the three values needed by the `whatsapp-send-otp` and `whatsapp-verify-otp` edge functions.

### Secrets to request

1. **`WHATSAPP_11ZA_AUTH_TOKEN`** (required)
   - 11za dashboard → Settings → API / Integrations → copy `authToken`

2. **`WHATSAPP_11ZA_TEMPLATE_NAME`** (required)
   - 11za dashboard → Templates → exact name of your approved Authentication template (e.g. `otp_login`)
   - Template body must contain `{{1}}` for the OTP; Copy Code button should also receive the OTP

3. **`WHATSAPP_11ZA_BASE_URL`** (optional)
   - Defaults to `https://app.11za.in/apis` — only set if 11za assigned you a different base URL

### What happens after approval

- I'll call the secret-request tool, which renders an input box right here in chat where you paste the values.
- Once saved, both edge functions pick them up automatically — no redeploy, no navigating to the Cloud panel.
- After secrets are in, you can test the WhatsApp OTP flow on `/auth`.