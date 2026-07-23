## Goal

Randomly assign every new waitlist signup to one of two subject variants for the welcome email, then measure sent / open / click / conversion rates separately for each variant. Results appear in a new section on `/admin/waitlist`.

**Subject A:** `Your early access is open — at half price.`
**Subject B:** `You're in first. Here's 50% off on your purchase.`

## What gets measured per variant

- **Sent** — email successfully enqueued
- **Opens** — tracking pixel loaded (unique by recipient)
- **Clicks** — any link in the email clicked (CTA button + WhatsApp share + code copy fallback)
- **Conversions** (any of these count, tracked separately too):
  1. Referral code copied or WhatsApp share button clicked on `/coming-soon`
  2. Referral code redeemed at checkout (`referral_redemptions` insert)
  3. Return visit to `/home` from the email link

## Database changes

- New column `waitlist_signups.email_variant` (`text`, nullable) — stores `A` or `B` at signup time so the assignment is stable and joinable.
- New table `email_events` — one row per open/click/conversion event, columns: `id`, `message_id`, `template_name`, `recipient_email`, `variant`, `event_type` (`open` / `click` / `conversion`), `conversion_kind` (nullable: `share`, `redeem`, `return_visit`), `metadata` jsonb, `created_at`. RLS: admins read; service role writes. GRANTs per platform rules.
- Store the assigned `variant` in `email_send_log.metadata` (already jsonb) so sends dedupe correctly by `message_id` and stats can join.

## Email template + send flow

- `waitlist-confirmation.tsx` subject becomes a function of `templateData.variant` returning A or B copy. Body copy unchanged.
- `ComingSoon.tsx` picks the variant with a deterministic hash of the email (50/50, so re-sends land on the same variant), writes it to `waitlist_signups.email_variant`, and passes it to `send-transactional-email` as `templateData.variant`.
- Every link in the email (CTA button, share URL, WhatsApp link) is rewritten to go through a new `email-link` edge function that records a `click` event, then 302-redirects to the real URL.
- A 1×1 tracking pixel `<img>` at the bottom of the template points to a new `email-open` edge function that records an `open` event and returns a transparent GIF. Both endpoints accept `?mid=<message_id>&v=<A|B>&e=<recipient>` query params.

## Conversion capture

- **share / copy** (`/coming-soon`): existing copy + WhatsApp handlers already fire; extend them to also insert an `email_events` row with `event_type='conversion'`, `conversion_kind='share'` when the visitor's email matches a `waitlist_signups` row that has a `variant`.
- **redeem** (checkout): `apply-referral-code` edge function additionally inserts a `conversion` event with `conversion_kind='redeem'` when the redeemer's email is a signup with a variant, or when the code owner has a variant.
- **return_visit** (`/home`): when a visit arrives with `?utm_source=welcome_email` (added by the click redirect), log a `conversion` event with `conversion_kind='return_visit'` once per session.

## Admin dashboard section

New "Welcome Email A/B Test" block above the existing waitlist table on `/admin/waitlist`:

- Two side-by-side cards (A and B) showing: assigned, sent, unique opens + open rate, unique clicks + CTR, conversions broken out by kind, overall conversion rate.
- Winner badge on whichever variant leads by conversion rate, with a "not enough data" hint until each side has ≥ 50 assignments.
- Time-range filter (Last 7d / 30d / All) driven by `waitlist_signups.created_at`.
- Data loaded via a new `get-email-experiment-stats` edge function (admin-guarded) that joins `waitlist_signups`, deduped `email_send_log`, and `email_events`.

## Technical notes

- Variant assignment: `variant = (fnv1a(email) & 1) === 0 ? 'A' : 'B'` — deterministic, no cookies, stable across retries.
- Tracking endpoints are public (no JWT) so email clients can hit them; they never accept user-controlled writes — variant + email are re-derived from `message_id` server-side and cross-checked against `email_send_log` to prevent spoofed stat inflation.
- Pixel endpoint always returns a 43-byte transparent GIF with `Cache-Control: no-store`; click endpoint whitelists redirect targets to `bazukifragrance.com` domains to prevent open-redirect abuse.
- Existing `waitlist-confirmation` sends continue to work; missing `variant` in older rows is treated as "unassigned" and excluded from rate math.
- All new edge functions get expanded CORS headers per project convention.

## Files touched

- Migration: add `email_variant` column, create `email_events` table + RLS + grants.
- `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx` — dynamic subject + tracked links + pixel.
- `supabase/functions/email-open/index.ts` — new.
- `supabase/functions/email-link/index.ts` — new.
- `supabase/functions/get-email-experiment-stats/index.ts` — new.
- `supabase/functions/apply-referral-code/index.ts` — log `redeem` conversion.
- `src/pages/ComingSoon.tsx` — assign + persist variant, pass to email, log `share` conversion on copy/WhatsApp.
- `src/pages/Home.tsx` (or wherever `/home` lives) — log `return_visit` conversion when `utm_source=welcome_email`.
- `src/pages/admin/Waitlist.tsx` — new A/B stats section + fetch hook.
