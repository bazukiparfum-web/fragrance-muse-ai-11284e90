
## Goal

Prevent OTP spam on the `/coming-soon` waitlist and give visitors clear, actionable messages when a WhatsApp send fails.

## 1. Resend timer + limit (client)

In `src/pages/ComingSoon.tsx`:

- Extend the current `resendIn` cooldown from 30s to a stepped backoff: 30s → 60s → 120s → 300s based on a new `resendCount` state.
- Track `resendCount` per session; after **5 resends**, disable the Resend button entirely and show: "Resend limit reached. Check your WhatsApp inbox or try a different number."
- Rendering:
  - Resend button shows `Resend in 0:29` while `resendIn > 0` and is `disabled`.
  - Once `resendIn === 0` and under the cap → `Resend code`.
  - At the cap → disabled + helper text.
- The initial `SEND WHATSAPP OTP` action on the details step is also disabled while `status === "loading"` to prevent double-taps.
- "Change number" link resets `resendCount`, `resendIn`, `otp`, `errorMsg` and returns to `details`.

## 2. Server-side rate limits (edge)

`supabase/functions/whatsapp-send-otp/index.ts` already limits per phone (3/10min) and per IP (10/hr). Tighten and surface:

- Return `retryAfterSec` in the 429 JSON body (compute from the oldest timestamp in the window).
- Add `Retry-After` header on 429 responses.
- Keep existing limits; they align with the client cap.

## 3. Clearer WhatsApp error messages

Map provider/network failures to specific, human copy. Both edge and client change.

Edge (`whatsapp-send-otp`): classify errors before responding with 502/429/400 and return a stable `code` plus `error` message. Codes:

- `invalid_phone` (400) — "That doesn't look like a valid Indian mobile. Check the 10 digits and try again."
- `rate_limited_phone` (429) — "You've requested too many codes for this number. Try again in Xm Ys."
- `rate_limited_ip` (429) — "Too many requests from your network. Try again in a bit."
- `provider_origin_unapproved` (503) — "WhatsApp OTP is temporarily unavailable. Please contact Bazuki support."
- `provider_unreachable` (502) — "We couldn't reach WhatsApp right now. Check your connection and retry."
- `provider_rejected` (502) — "WhatsApp couldn't deliver to this number. Double-check it's on WhatsApp, or try another."
- `internal` (500) — generic retry copy.

Client (`ComingSoon.tsx`):

- Parse `{ code, error, retryAfterSec }` from the function response body (already reading `error.context.text()`).
- On `rate_limited_phone`, set `resendIn = retryAfterSec` and jump straight to the `verify` step if we haven't already, so the user can still enter a previously received code.
- Replace the small red text with a dedicated error banner above the CTA: icon + message + optional secondary action ("Change number" for phone errors, "Retry" for provider errors).
- Success toast unchanged.

## 4. Verify-OTP UX polish (small)

`whatsapp-verify-waitlist-otp` errors are already surfaced. Add explicit copy for:

- Wrong code → "That code doesn't match. Check WhatsApp and try again."
- Expired → "This code expired. Tap Resend for a new one." + auto-enable resend by setting `resendIn = 0`.

## Technical notes

- No DB migrations needed — rate limiting stays in-memory (matches existing pattern) and cooldown state is client-side.
- No changes to `waitlist_signups`, RLS, or Shopify.
- Files touched: `src/pages/ComingSoon.tsx`, `supabase/functions/whatsapp-send-otp/index.ts`, `supabase/functions/whatsapp-verify-waitlist-otp/index.ts`.
- Verify by triggering 4 rapid sends in preview to see the stepped cooldown and the "limit reached" state.
