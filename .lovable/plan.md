## Goal
Strip the referral engine (personal codes, spots counter, referral landing overlay, and reward tracking) from the Bazuki pre-launch page. Visitors simply subscribe with WhatsApp OTP + optional email to claim the 50% early-access discount, then get a generic way to tell friends.

## Changes

### 1. Simplify `src/pages/ComingSoon.tsx`
- Remove `spotsRemaining`, `personalCode`, `copied`, and `referralsOpen` state.
- Remove the `spots_remaining` RPC poll and the conditional "closed / open" messaging.
- Remove the success-state personal referral-code card and the "Anyone who uses your code" copy.
- Replace with a clean success message: "You're in. Early access at 50% off is yours."
- Add a generic "Share with friends" block using the Web Share API with a WhatsApp fallback, sharing the plain `/coming-soon` URL (no tracking code).
- Stop reading `ref` / `referral_code` from URL params and stop sending `referred_by` to the verify function.
- Update helper micro-copy and CTA button text to reflect the single open waitlist.
- Keep the two-step WhatsApp OTP flow and optional email capture unchanged.

### 2. Remove the referral landing overlay from the pre-launch route
- In `src/App.tsx`, stop rendering `<ReferralWelcomeOverlay />` on `/` and `/coming-soon`.
- Since the overlay is only used by the waitlist referral flow, delete `src/components/referral/ReferralWelcomeOverlay.tsx` and `src/lib/referral.ts`.

### 3. Clean up the waitlist verification Edge Function
- In `supabase/functions/whatsapp-verify-waitlist-otp/index.ts`:
  - Stop calling `create-referral-shopify-discount`.
  - Stop calling `sendReferralWhatsApp`.
  - Return `{ success: true }` without `referral_code` or `duplicate`.
  - Remove the `referred_by` parameter from the `create_waitlist_signup` RPC call.
- Delete the now-unused `supabase/functions/create-referral-shopify-discount/index.ts`.

### 4. Update the waitlist confirmation email
- In `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx`:
  - Remove the "Your referral code" block, the share URL, and the "5,000 blends remaining" counter line.
  - Keep the 50% off early-access messaging and the A/B subject test.

### 5. Database (no destructive migration required)
- Leave the existing `waitlist_signups.referral_code`, `referred_by`, and `referral_redemptions` tables/columns in place so historical data is preserved.
- The auto-generated `referral_code` column will simply no longer be surfaced to users.

## Out of scope
- The separate post-signup `referral_rewards` table and `claim_referral_reward()` security fix are unrelated to the pre-launch page and will not be touched.
- The `/home` page and other app routes are unchanged.

## Verification
- Build the project and confirm no TypeScript errors after deleting the referral helper files.
- Deploy the updated `whatsapp-verify-waitlist-otp` Edge Function.
- Test the `/coming-soon` flow: subscribe with a phone number, verify OTP, and confirm the success screen shows only the generic share option and no personal code.