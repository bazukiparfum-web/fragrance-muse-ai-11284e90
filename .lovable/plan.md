## Overview

Two workstreams:

1. **Referral landing overlay** shown on any page when a `?ref=BZK-XXXX` param is present, plus persistence and pass-through into quiz + checkout so the 50% applies automatically.
2. **Four new drip emails** (Day 3, Day 8, Aug 22, Aug 28) added to the existing waitlist confirmation series, sent by an extended scheduler.

Note on naming: the spec says "prelaunch_signups" but the actual table in this project is `waitlist_signups`. I'll use `waitlist_signups` (it already has `referral_code`, `email_variant`, etc.). Referrer "first name" isn't stored today — waitlist only has email. I'll derive a display name from the local-part of the referrer's email (e.g. `ananya@…` → "Ananya"), capitalised. If you'd prefer to collect a real first name at signup, say the word and I'll add it.

---

## 1. Referral landing overlay

### New component: `src/components/referral/ReferralWelcomeOverlay.tsx`

- Mounted once in `AppInner` (inside `BrowserRouter`) so it can appear on any route.
- On mount, reads `?ref=` from `window.location.search`. If absent, also checks `localStorage` / cookie for a previously stored code — but the **overlay only shows when the code arrives via URL** (returning visitors just keep the discount silently).
- Calls a new lightweight validator: `supabase.rpc('validate_referral_code', { _code })` returning `{ valid, referrer_email, spots_remaining, closed }`. (New SECURITY DEFINER RPC — cheaper than exposing waitlist rows to anon.)
- States:
  - **Valid + spots left** → renders the gift card (matches the uploaded mockup, uses existing tokens `--bz-gold`, Cormorant, mist/particle bg at low opacity).
  - **Valid + closed (≥5000)** → variant card "Early access is now closed" with an inline waitlist email field that posts to the existing waitlist insert path.
  - **Invalid or RPC error** → render nothing (silent).
- Persists on mount when valid: `localStorage.setItem('bz_ref', code)` and `document.cookie = 'bz_ref=…; max-age=2592000; path=/; SameSite=Lax'`.
- CTA "Discover my formula" → `navigate('/shop/quiz')` (goes into quiz landing, not `/home`).
- Fires a visit event via existing `trackCta('referral_visit', { code, path })`; also inserts into a new `referral_visits` table (see DB section) for per-code click counts.
- Fade-in via existing motion utilities, respects `prefers-reduced-motion`.

### Card composition

Reuse the uploaded HTML structure (BAZUKI wordmark, gift pill, headline, subtext, CODE APPLIED strip, three benefit rows, gold CTA, spots line). Rebuilt with Tailwind + design tokens — no inline hex except through the already-defined CSS vars.

### Persistence + pass-through

- New helper `src/lib/referral.ts` with `getStoredRef()`, `setStoredRef(code)`, `clearStoredRef()` (reads cookie first, then localStorage).
- `Checkout.tsx`: on mount, if a stored ref exists and no code was manually entered, prefill the referral field and call the existing `apply-referral-code` function. Nothing changes about the manual entry flow.
- Quiz flow: no behaviour change needed — the code lives in storage and is applied at checkout.

### Order-time redemption

Already handled by `apply-referral-code` when `order_id` is passed. I'll audit `shopify-webhook-handler` to confirm it calls `apply-referral-code` with the stored ref on `orders/paid` and, if not, add that call. Only real change here if the wiring is missing.

---

## 2. Database

Single migration:

- `CREATE TABLE public.referral_visits (id uuid pk, referral_code text, path text, user_agent text, ip_hash text, created_at timestamptz default now())` + GRANTs + RLS (anon INSERT, admin SELECT via `has_role`). Index on `referral_code`.
- `CREATE FUNCTION public.validate_referral_code(_code text) RETURNS jsonb` — SECURITY DEFINER, returns `{ valid, referrer_display, spots_remaining, closed }`. Uses `waitlist_signups.email` local-part for `referrer_display`. Replaces the existing `validate_referral_code(text) returns boolean` (drop + recreate).

Callers of the old boolean version: I'll grep and update. If it's only used by `apply-referral-code`, that function already re-queries directly and doesn't depend on the return shape.

---

## 3. Four new drip emails

### New templates in `supabase/functions/_shared/transactional-email-templates/`

- `waitlist-day3-mechanism.tsx` — Subject: `The machine that refuses to make the same bottle twice.`
- `waitlist-day8-referral.tsx` — Subject: `Your code hasn't been used yet.` (WhatsApp share CTA using `referral_code`)
- `waitlist-aug22-oneweek.tsx` — Subject: `In 7 days, this price disappears.`
- `waitlist-aug28-finalcall.tsx` — Subject: `Tomorrow, we open. Tonight, you're still first.`

Each reuses the existing waitlist email layout (Cormorant heading, gold CTA button, spots-remaining footer line), takes `{ email, referralCode, spotsRemaining, ctaUrl, shareUrl }`, and inherits the automatic unsubscribe footer. Registered in `registry.ts`.

### Scheduler

New Edge Function `supabase/functions/waitlist-drip-scheduler/index.ts` invoked by pg_cron (hourly).
Selection rules (all scoped to signups with no redemption yet and not suppressed):

- **Day 3**: `created_at` between 72–96h ago, no prior `email_send_log` row for `waitlist-day3-mechanism`, AND signup did not open/click day-0 (proxy: no `email_events` open/click for `waitlist-confirmation`). Falls back to "any Day-3 recipient" if you'd rather not gate on opens — I'll default to the gated version per the "non-openers" note but make it a one-line toggle.
- **Day 8**: `created_at` between 8–9d ago, no prior send of `waitlist-day8-referral`.
- **Aug 22**: sent once per signup on/after 2026-08-22 00:00 IST, no prior send.
- **Aug 28 evening**: sent once per signup on 2026-08-28 between 18:00–22:00 IST, no prior send.

Each candidate → `supabase.functions.invoke('send-transactional-email', …)` with an idempotency key `<template>-<email>`. Uses the same A/B `email_variant` already stored on the signup for consistent subject-line experiments later (only day-0 has variants defined now; day 2–5 use the single subjects above).

pg_cron schedule created in the same migration: `select cron.schedule('waitlist-drip', '15 * * * *', $$ select net.http_post(…waitlist-drip-scheduler…) $$);` using the same vault secret pattern as `email_queue_dispatch`.

---

## 4. Wiring / files touched

New:

- `src/components/referral/ReferralWelcomeOverlay.tsx`
- `src/lib/referral.ts`
- `supabase/functions/waitlist-drip-scheduler/index.ts`
- 4 email template files + `registry.ts` update
- 1 migration (referral_visits + validate_referral_code + cron)

Modified:

- `src/App.tsx` — mount `<ReferralWelcomeOverlay />` inside `BrowserRouter`.
- `src/pages/Checkout.tsx` — auto-apply stored ref at mount.
- `supabase/functions/shopify-webhook-handler/index.ts` — ensure `apply-referral-code` called with stored ref on paid orders (only if not already wired).

Deploy the new/edited edge functions after the migration.

---

## Open questions before I start

1. Referrer display name: OK with "capitalised email local-part" as the display name, or do you want a real first-name field added to waitlist signup?  
Answer:  Real first-name field
2. Day-3 email: only to non-openers (as the spec suggests), or every Day-3 signup?  
answers: every Day-3 signup
3. On the "closed" variant card: use the existing waitlist insert (still allows signup but returns "closed" copy), or a separate `launch_waitlist` list?  
answer: use the existing waitlist