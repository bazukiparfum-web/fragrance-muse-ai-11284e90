# Quiz Session Retention & Retargeting

A new, additive data layer. No existing quiz, results UI, or checkout logic changes.

## Phase 1 — Capture & Persist

### 1. Database — `quiz_sessions` table (migration)
- Columns per spec: `session_id` (unique), `completed_at`, `expires_at`, `last_seen_at`, `quiz_type`, `quiz_answers` jsonb, `formula_results` jsonb, `customer_profile` jsonb, `email`, `phone`, `name`, `status`, `retargeted`, `retarget_count`, `last_retargeted_at`, `converted`, `converted_at`, `order_value`, `browser_fingerprint` jsonb, `source_url`, `utm_source/medium/campaign`, `created_at`.
- GRANTs: `anon` + `authenticated` INSERT/UPDATE/SELECT on own session_id; `service_role` ALL.
- RLS: anyone can INSERT; SELECT/UPDATE only when `session_id` matches row (passed via filter) AND `expires_at > now()`. Edge functions use service role.
- Indexes: `(email) where email is not null`, `(status, retargeted, expires_at)`, unique `(session_id)`.

### 2. Auto-save on results page load
- New `src/lib/quizSession.ts`:
  - `generateSessionId()` (crypto.randomUUID)
  - `saveToLocalStorage(payload)` / `getFromLocalStorage()` with 30-day expiry
  - `setSessionCookie(id)` / `getSessionCookie()` — 30d, SameSite=Lax
  - `getBrowserFingerprint()` (UA, lang, tz, screen)
  - `persistQuizSession({ answers, results, quizType })` — upserts to `quiz_sessions`, writes localStorage + cookie. Idempotent by `session_id`.
- Hook into `src/pages/QuizResults.tsx` via a `useEffect` that fires once on first successful results render. Wraps in try/catch — failure never breaks UI.

### 3. Email capture card on results page
- New `src/components/quiz/results/RetargetEmailCapture.tsx`.
- Placement: between formula cards and the "Order a Full-Size Bottle" section in `QuizResults.tsx`.
- Style per spec (gold tokens — wired via existing CSS tokens, no raw hex hardcoding in components; tokens added to `src/index.css` if missing).
- On submit: validate (zod), update row via `quiz_sessions.update({ email, customer_profile: {...} }).eq('session_id', sid)`. Success state with gold check animation. Consent microcopy.
- Phone/WhatsApp input intentionally deferred to Phase 3.

### 4. Privacy microcopy
- Small dismissible 30-day retention notice below results page heading, links to `/legal/privacy`.

## Phase 2 — Returning customer

### 5. `useQuizSession()` hook
- On mount: read localStorage → fallback to cookie → fetch row from `quiz_sessions` if alive.
- Updates `last_seen_at`.

### 6. Welcome-back banner
- New `src/components/retarget/WelcomeBackBanner.tsx` mounted in `Index.tsx` only.
- Shows when a live session is found and not dismissed (sessionStorage flag). Slide-down, dismissible. CTA → `/shop/quiz/results?session=<id>`.

### 7. UTM + session URL handling
- In `QuizResults.tsx`: if `?session=` present, hydrate results from `quiz_sessions` instead of QuizContext (read-only restore). Persist UTM fields back to the row, bump `last_seen_at`.
- Show "Here are your saved results from X days ago" subline when restored.

## Phase 3 — Retargeting + conversion

### 8. Conversion tracking
- In Shopify webhook handler (`supabase/functions/shopify-webhook-handler/index.ts`) and `create-shopify-product-from-scent`: when a quiz-sourced cart/order completes, mark `converted=true`, `converted_at`, `order_value`. Session id passed via cart attributes / line item metafield (already used pattern for quiz scents) or via a new attribute we attach when adding to cart from results.
- Frontend: when add-to-cart fires from results, attach `bazuki_session_id` cart attribute.

### 9. Email retargeting sequence (Lovable Emails)
- Use existing email infra (`send-transactional-email`). Add 5 new React Email templates in `supabase/functions/_shared/transactional-email-templates/`:
  - `quiz-formula-immediate`, `quiz-followup-day1`, `quiz-followup-day3`, `quiz-followup-day7`, `quiz-followup-day25`.
- Register in `registry.ts`.
- New edge function `quiz-retarget-scheduler` (verify_jwt=false, called by pg_cron) selects eligible rows (`email not null AND converted=false AND expires_at>now() AND retarget_count<5`) and dispatches the correct template by days-since-completion, updating `retarget_count` + `last_retargeted_at`.
- Immediate email (#1) sent inline from email-capture submit handler (via existing `send-transactional-email`).
- pg_cron job hourly via `supabase--insert`.

### 10. WhatsApp retargeting (optional, last)
- Phone field in capture card. Reuses existing `whatsapp-send-otp`-style 11za integration to fire one templated message on capture. No drip — single send only.

## Technical notes

- All gold colors come from semantic CSS variables already in `src/index.css` (`--luxury-gold`, etc.). New tokens added only if a spec value has no existing token; components never inline hex.
- Zero changes to: formula generation, results rendering, save-scent flow, cart store, Shopify product creation logic.
- All DB writes from the browser go through anon-key RLS-scoped policies; sensitive cross-row queries (retarget scheduler) run server-side with service role.
- All new client code is wrapped in try/catch so the results page never breaks if storage/network fails.

## Files

New:
- `supabase/migrations/<ts>_quiz_sessions.sql`
- `src/lib/quizSession.ts`
- `src/hooks/useQuizSession.ts`
- `src/components/quiz/results/RetargetEmailCapture.tsx`
- `src/components/retarget/WelcomeBackBanner.tsx`
- `supabase/functions/quiz-retarget-scheduler/index.ts`
- 5 templates under `supabase/functions/_shared/transactional-email-templates/`

Edited:
- `src/pages/QuizResults.tsx` (auto-save effect, capture card slot, URL hydration, restore subline)
- `src/pages/Index.tsx` (mount banner)
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `supabase/functions/shopify-webhook-handler/index.ts` (+ cart attribute pass-through)
- `supabase/config.toml` (register new function)

## Open questions before build

1. Email infra: should I assume Lovable Emails is the provider for all 5 retargeting templates (recommended), or do you want Resend/Mailgun instead?
2. WhatsApp Phase 3: keep it as a single immediate send via your existing 11za setup, or skip entirely for now?
3. Privacy microcopy link target: `/legal/privacy` (existing route) — OK?
