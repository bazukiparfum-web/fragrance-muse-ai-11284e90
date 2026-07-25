## Problem

`referral_rewards` INSERT policy only checks `auth.uid() = referee_id`. Any signed-in user can insert a row with any `referrer_id`, `referral_id`, `status`, and discount amounts, then call `redeem_referral_reward()` to claim discounts they didn't earn (including self-referral).

Client insert happens in one place: `src/pages/Auth.tsx` (post-signup, using a stored referral code).

## Fix

### 1. Migration

- Create `public.claim_referral_reward(_referral_code text)` — `SECURITY DEFINER`, `search_path = public`. It:
  - Requires `auth.uid()`.
  - Looks up the referral by `referral_code`.
  - Rejects if not found, if `uses_count >= max_uses`, if `referrer_id = auth.uid()` (self-referral), or if a reward already exists for this `(referral_id, referee_id)`.
  - Inserts the reward with server-controlled `status = 'pending'` and the caller's email from `auth.users`. Ignores any client-supplied status/amount.
- Drop the permissive INSERT policy on `referral_rewards` (`auth.uid() = referee_id`). No replacement policy — service role and the new SECURITY DEFINER function are the only writers.
- `REVOKE EXECUTE ... FROM PUBLIC, anon` on the new function; `GRANT EXECUTE ... TO authenticated`.
- Also revoke `EXECUTE` on `public.redeem_referral_reward` from `PUBLIC` / `anon` (keep `authenticated`) to clear the related "SECURITY DEFINER executable" linter warnings tied to this flow.

### 2. Client

- `src/pages/Auth.tsx`: replace the direct `.from('referral_rewards').insert(...)` with `supabase.rpc('claim_referral_reward', { _referral_code: storedReferralCode })`. Remove the now-unused `referrals` lookup.

## Out of scope

- The separate `order_items` pricing finding and generic SECURITY DEFINER linter warnings for unrelated functions (waitlist/email/machine formula) — those are pre-existing and not part of this fix.
