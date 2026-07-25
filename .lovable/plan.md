# /coming-soon Redesign

Rebuild the prelaunch page around two mutually exclusive states, keeping the dark-luxury look (bg `#0A0A0A`, gold `#C9A84C`, cream `#F5EFE6`, Cormorant headings, Inter body, line-art bottle).

## 1. Data layer

New table `public.prelaunch_signups`:

- `id uuid pk default gen_random_uuid()`
- `first_name text not null`
- `phone text not null unique` (stored as `+91XXXXXXXXXX`)
- `email text not null unique` (lowercased)
- `created_at timestamptz default now()`
- `utm_source text null`

Grants + RLS:
- `grant insert, select on public.prelaunch_signups to anon, authenticated`
- RLS enabled
- Policy `anon insert`: `for insert to anon, authenticated with check (true)`
- Policy `public count`: `for select to anon, authenticated using (true)` — needed so the client can `count()` remaining spots. Only exposes row existence; no sensitive columns are queried (client only calls `select('id', { count: 'exact', head: true })`).

No OTP flow — user's spec is a direct insert. The existing WhatsApp OTP path stays untouched for other surfaces but is not used here.

Constant `CAP = 100` in the component; `spotsLeft = max(0, CAP - count)`.

## 2. Component structure (`src/pages/ComingSoon.tsx`, full rewrite)

State machine:
```
mode: "capture" | "confirmed"
```

Persistence for returning visitors:
- On mount: read `localStorage.bz_prelaunch_signup` (JSON `{ email, first_name }`). If present → `mode = "confirmed"`.
- Fallback check: if the visitor lands with `?email=` we could look up, but not required; localStorage is enough per spec.

State A layout (capture), top-to-bottom:
1. Eyebrow `FORMULA IN PROGRESS` (cream, 13px, tracking-[0.2em])
2. Headline `Your scent is being calibrated.` — `calibrated` wrapped in `<em class="text-[hsl(var(--bz-gold))] italic font-cormorant">`
3. Subhead: India's first AI-algorithmic perfume house, finishing its first batch. One bottle built for you.
4. Animated line-art bottle (SVG) with a slow 4s gold liquid rise loop + faint particle drift; respects `prefers-reduced-motion` (static half-fill).
5. Countdown card — days / hrs / min / sec to `2026-08-29T00:00:00+05:30`.
6. Scarcity line: `Only {spotsLeft} founding spots left` (cream, small, gold number).
7. Form (single column, max-w-sm, gold focus rings):
   - First name (`text`, required, trim, 1–60 chars)
   - Phone with fixed `+91` prefix inside the field (visually a leading span, input handles only 10 digits; strip non-digits on change)
   - Email (`email`, zod-validated)
   - Submit button `Reserve my 50% spot` — disabled until all three pass validation.
8. Inline error banner on failure (duplicate phone/email → friendly "You're already on the list — check your inbox.").

Submit handler:
- Validate with zod.
- `insert` into `prelaunch_signups` with `first_name`, `phone: "+91" + digits`, `email`, `utm_source` from URL.
- On unique-violation (`23505`) → treat as already-signed-up, go to State B.
- On success: write localStorage, `trackCta("prelaunch_signup", { … })`, transition to State B.

State B layout (confirmed):
1. Same eyebrow style but reading `WELCOME, {firstName}` (cream).
2. Headline: `You're in. Your 50% founding price is <em>locked</em>.`
3. Short reassurance: `We'll message you the moment your bottle is ready.`
4. Same countdown component.
5. One outline gold button `Follow us for the drop` → `https://instagram.com/bazukiperfumes` (opens new tab).
6. No share block, no email field.

Both states share:
- Line-art bottle (in State B it's fully filled, still breathing).
- Footer strip: `BAZUKI — discover your formula · @bazukiperfumes` (cream, small).

## 3. Accessibility

- Countdown uses `aria-live="polite"` region announcing `T-minus D days H hours` every minute (not every second).
- Bottle marked `aria-hidden`.
- Inputs use visible labels (not just placeholders); focus ring `focus-visible:ring-2 ring-[hsl(var(--bz-gold))] ring-offset-2 ring-offset-[#0A0A0A]`.
- Reduced-motion: bottle fill static, no particle drift, countdown still ticks (text-only).
- Semantic `<main>` wrapper, single `<h1>`.

## 4. SEO

Keep existing `useSEO({ noindex: true, canonical: /home })`. No changes needed.

## 5. Files touched

- `supabase/migrations/<new>` — create `prelaunch_signups`, grants, RLS, policies.
- `src/pages/ComingSoon.tsx` — full rewrite around the two states above. Remove the current WhatsApp OTP + share block + Instagram-story-image code.
- No changes to routes; `/` and `/coming-soon` already point here.

## 6. Out of scope

- No confirmation email in this pass (existing waitlist confirmation email is wired to the old `waitlist_signups` table; hooking a new one to `prelaunch_signups` can be a follow-up if you want it).
- No WhatsApp OTP verification on this page.
- Referral / discount-code generation stays removed.

Let me know if you'd like the confirmation email wired to the new table in the same pass, or kept for a follow-up.
