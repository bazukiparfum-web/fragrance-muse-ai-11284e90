## Goal
Ship a new `/coming-soon` prelaunch landing page that matches the mockup, with a live countdown to 29 Aug 2026 00:00 IST, an SVG bottle whose liquid fills based on elapsed % of the launch window, and an email waitlist form backed by a new `waitlist_signups` table. Existing routes stay live — this is additive, not a gate.

## Backend

Migration creating `public.waitlist_signups`:
- `id uuid primary key default gen_random_uuid()`
- `email text unique not null` (citext-style lowercased on insert client-side; DB stores as-is with unique constraint)
- `utm_source text null`
- `referral_code text null`
- `created_at timestamptz not null default now()`

Grants + RLS:
- `GRANT INSERT ON public.waitlist_signups TO anon, authenticated;` (public signup, no reads from client)
- `GRANT ALL ON public.waitlist_signups TO service_role;`
- Enable RLS. Single policy: `FOR INSERT TO anon, authenticated WITH CHECK (true)`. No SELECT policy — signups are write-only from the browser.
- Basic length check in a `BEFORE INSERT` trigger to cap email at 255 chars and reject empty strings (CHECK constraint is fine here since it's immutable).

## Frontend

New route `/coming-soon` in `src/App.tsx` (added above the catch-all, outside admin), rendering a new `src/pages/ComingSoon.tsx`.

`src/pages/ComingSoon.tsx`:
- Reuses `CollectionAmbience` from `src/components/library/CollectionAmbience.tsx` for the drifting particle/mist background (already the homepage-style atmosphere component). Overlaid with 3 blurred color glows (amber `#D68A3C`, teal `#2F6E68`, violet `#6E5AA8`) matching the mockup, positioned absolutely.
- Scoped CSS variables at the page root for `--gold`, `--gold-dim`, `--ivory`, `--ivory-dim`, `--hair` etc. so we don't pollute global tokens; leverages existing Cormorant Garamond (`font-display`) and adds JetBrains Mono locally via a `<link>` in the page (or inline `@import`). Body font stays site default.
- Structure per mockup: eyebrow "Formula in progress" → H1 "Your scent is *being calibrated.*" → sub copy → SVG bottle → countdown readout → launch-date line → email form → microcopy → footer brand block.
- SVG bottle inlined (copied from mockup). A `useEffect` with `setInterval(1000)` computes:
  - `launch = 2026-08-29T00:00:00+05:30`
  - `start = 2026-07-21T00:00:00+05:30` (matches mockup window)
  - Countdown d/h/m/s and fill percent (`elapsed/total`, clamped 0–1). Fill height = 156 * pct, `y = 202 - fillHeight` on the clip rect. Interval cleared on unmount. Skips work when tab hidden via `document.visibilityState` guard.
- Reduced-motion: skip particle canvas ambience and freeze the liquid at its current fill (still updates countdown text).
- Countdown numbers use `tabular-nums` to prevent jitter.

Waitlist form:
- Controlled email input + submit button styled per mockup (gold pill button, hairline border wrapper).
- Zod validation: `z.string().trim().toLowerCase().email().max(255)`. On invalid, inline red hairline message replaces microcopy line — no toast.
- On submit: read `utm_source` from `URLSearchParams` and `referral_code` from `?ref=` (both optional, capped at 64 chars). Insert via `supabase.from('waitlist_signups').insert({...})`.
- Success: swap form + microcopy for confirmation line "You're on the list. We'll write when the machine is ready." in mono teal — no reload, no toast, matches mockup.
- Duplicate email (unique violation, PG code `23505`): treat as success with same confirmation copy (don't leak whether email exists).
- Other errors: show inline mono error "Something went wrong. Try again in a moment." in place of microcopy; form stays visible.
- Button shows "Reserving…" and is disabled during in-flight request.
- Track submit via existing `trackCta` helper as `waitlist_signup` for parity with other CTAs.

SEO (via `useSEO` hook already used elsewhere):
- Title: "Bazuki — Launching 29 August 2026"
- Description: "India's first AI-algorithmic perfume house. Reserve early access to your custom formula."
- `og:type=website`, `twitter:card=summary_large_image`. No `og:image` set (hosting adds default).
- `robots: index,follow` (public teaser page).

Accessibility:
- H1 only on this page.
- Email input has `aria-label="Email address"` and `autocomplete="email"`.
- Confirmation region uses `role="status" aria-live="polite"`.
- SVG bottle marked `aria-hidden="true"`; countdown wrapped with `aria-label="Time until launch on 29 August 2026"`.
- Focus ring on button and input using existing tokens.

## Out of scope
- No global redirect / gating of other routes.
- No admin UI for the waitlist (viewable via existing DB tools).
- No email delivery to signups yet — table just captures leads.
- No changes to Header/Footer, sitemap, or existing pages.

## Technical notes
Files created:
- `src/pages/ComingSoon.tsx`
Files edited:
- `src/App.tsx` (add one `<Route path="/coming-soon" element={<ComingSoon />} />` above the catch-all)
Migration:
- Create `waitlist_signups` with grants, RLS, insert-only anon policy, and CHECK on email length.
