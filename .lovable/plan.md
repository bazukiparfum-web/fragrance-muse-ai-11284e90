## Goal

Replace the current WhatsApp-OTP prelaunch flow at `/coming-soon` with a minimal, dark-luxury email-capture page in two mutually exclusive states, reusing the existing `waitlist_signups` table.

## Design tokens (locked)

- Bg `#0A0A0A`, gold `#C9A84C`, cream `#F5EFE6`
- Cormorant Garamond headings, Inter (existing sans) body/UI
- Eyebrows / small labels: cream, ≥13px, modest letter-spacing (~0.15em)
- Gold focus ring on every interactive element

## State A — not subscribed

Layout, top → bottom, centered single column:

1. Eyebrow: `FORMULA IN PROGRESS` (cream)
2. Headline: `Your scent is being calibrated.` — "calibrated" in gold italic Cormorant
3. Subhead: `India's first AI-algorithmic perfume house, finishing its first batch. One bottle built for you.`
4. Animated line-art bottle (SVG): existing stroke bottle motif; ~4s loop of a gold liquid rising from base to ~60% and easing back down (single `<rect>` inside a clipPath, animated via CSS keyframes). Respect `prefers-reduced-motion` → static half-fill.
5. Countdown to **2026-08-29 00:00 IST** — DD / HH / MM / SS, monospace tabular numerals, gold dividers.
6. Scarcity line: `Only {spotsLeft} founding spots left` — cream, gold number. `spotsLeft = CAP - count(waitlist_signups)`, `CAP = 100`, fetched once on mount via `supabase.from('waitlist_signups').select('*', { count: 'exact', head: true })`. Hide line if count query fails.
7. Form: single email input + button `Reserve my 50% spot`. On submit → `create_waitlist_signup` RPC (email only, no phone), then set localStorage flag and swap to State B without reload. Inline error on failure.

## State B — subscribed

1. Headline: `You're in. Your 50% founding price is locked.` ("locked" gold italic)
2. Same countdown component (reused)
3. Single ghost-gold button: `Follow us for the drop` → `https://instagram.com/bazukiperfumes`
4. No email field, no share block, no referral copy

## Persistence

- On mount: if `localStorage.getItem('bz_waitlist_email')` exists → State B.
- Else if URL has `?email=` (from email links) → check `waitlist_signups` for that email; if found, set localStorage + State B.
- Otherwise State A.

## Footer

Single centered line, cream muted:
`BAZUKI — discover your formula · @bazukiperfumes`

## Files

- **Rewrite** `src/pages/ComingSoon.tsx` — remove phone step, OTP UI, resend cooldown, share block, Instagram-story canvas, WhatsApp share. Keep SEO/meta noindex. Two-state render.
- **Keep** existing route wiring in `src/App.tsx` (already `/` and `/coming-soon`).
- **Leave untouched** (dead but harmless, per user's "reuse table, keep OTP code"): `whatsapp-send-otp`, `whatsapp-verify-waitlist-otp` edge functions and their secrets.

## Data / backend

- No schema migration. Reuse `waitlist_signups` and existing `create_waitlist_signup` RPC (already supports email-only, phone null).
- No new edge functions.
- Admin `/admin/waitlist` continues to work unchanged.

## Accessibility

- Eyebrow/labels ≥13px cream
- Form: `<label htmlFor>` (visually hidden), `aria-invalid`, inline error text with `role="alert"`
- Countdown wrapped in `aria-live="off"` container with an `aria-label` summary updated every minute
- Bottle animation `aria-hidden`; reduced-motion static fallback
- Focus ring: `focus-visible:ring-2 ring-[#C9A84C] ring-offset-2 ring-offset-[#0A0A0A]`

## Out of scope

- No referral codes, no WhatsApp, no share cards, no OG image changes, no email A/B (existing confirmation email still fires via current RPC path if wired; not changed here).
