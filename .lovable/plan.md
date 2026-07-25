# Prelaunch Landing Redesign

Restructure `/coming-soon` around two mutually exclusive states, refine the aesthetic, and add a scent preference picker + generic share row. The existing WhatsApp OTP send/verify flow (edge functions, 11za integration, resend backoff, error parsing) stays byte-for-byte the same — only the surrounding UI and post-verify experience change.

## 1. Data model additions

Migration on `prelaunch_signups`:
- Add `scent_families text[]`, `intensity text`, `wear_time text` (all nullable — preferences are optional).
- Add `UNIQUE (phone)` and `UNIQUE (email)` constraints so repeat submissions upsert instead of duplicating.
- Update the existing insert path to `ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, email = EXCLUDED.email` (handled inside the current post-OTP insert).
- Add a `SECURITY DEFINER` RPC `save_prelaunch_preferences(p_phone text, p_families text[], p_intensity text, p_wear_time text)` so State B can write preferences without exposing broad table update rights. RLS on `prelaunch_signups` stays locked; RPC is granted to `anon, authenticated`.
- Add a lightweight public RPC `prelaunch_spots_left()` returning `CAP - count(*)` (CAP = 100 constant in the function) so the scarcity line doesn't require table-wide select.

## 2. Two-state page structure

Refactor `src/pages/ComingSoon.tsx` around a single `view` derived from persistence, never both at once:

```
view = "subscribe" | "welcome"
```

- On mount: check `localStorage.bazuki_prelaunch` for `{phone, firstName}`. If present, call an RPC `get_prelaunch_signup(p_phone)` to hydrate `firstName` + saved preferences and switch to `welcome`. Otherwise `subscribe`.
- After successful OTP verify (existing flow) → write localStorage → `setView("welcome")`. No reload.

### State A — Subscribe

Layout (mobile-first, single column, max-w ~ 520px):
1. Eyebrow `FORMULA IN PROGRESS` — cream `#F5EFE6`, 13px, tracking `0.18em`.
2. Headline (Cormorant Garamond): "Your scent is being **_calibrated_**." — "calibrated" in gold italic.
3. Subhead (Inter): "India's first AI-algorithmic perfume house, finishing its first batch. One bottle built for you."
4. Animated line-art bottle (see §3).
5. Countdown D / H / M / S to 29 Aug 2026 00:00 IST (reuse existing tick loop).
6. Scarcity line: `Only {spotsLeft} founding spots left` — fetched via `prelaunch_spots_left()` on mount, refetched after successful signup.
7. Form (reordered, lowest commitment first):
   - First name (text)
   - Mobile (tel) with fixed `+91` prefix rendered inside the field; user types 10 digits; existing `phoneSchema` regex unchanged.
   - Email (email)
   - Single primary button: **Reserve my 50% spot** (gold fill, cream label).
8. On submit → existing `whatsapp-send-otp` call → existing verify step (unchanged UI subtree, just re-skinned to match new type scale). On verify success → upsert row with E.164 phone (`+91` prepended server-side in the verify function's insert path) → transition to State B.

### State B — Welcome

1. Confirmation headline: `You're in, {FirstName}. Your 50% off early bird price is locked.` (gold italic on the name).
2. Sub-line: "Now tell us what you love — we'll calibrate your first formula around it."
3. Countdown stays visible (compact strip).
4. **Scent Preference Picker** (the core of State B, mobile chip UI):
   - Q1 "Which family pulls you in?" — multi-select 1–3 chips: Woody, Fresh/Citrus, Floral, Oriental/Spicy, Aquatic, Gourmand.
   - Q2 "How loud should it be?" — single choice: Subtle / Balanced / Bold.
   - Q3 "When will you wear it most?" — single choice: Daytime / Evening / Office / Party.
   - Autosave on each tap via `save_prelaunch_preferences` RPC (debounced 400ms). Micro-confirm toast/inline "Noted. Your formula's already taking shape." after first save.
   - Pre-select saved chips on return. Never gate confirmation on completing them.
5. **Share row** (visually subordinate, gold outline buttons):
   - Shared message constant:
     `Bazuki is launching India's first AI-algorithmic perfume house — your own formula, blended to you. Early subscribers get 50% off the first batch. Reserve your spot: https://bazukifragrance.com/prelaunch`
   - WhatsApp → `https://wa.me/?text={encoded}`.
   - Instagram → `navigator.clipboard.writeText(msg)` + toast "Message copied — paste it into your Instagram story or DM", then open `https://www.instagram.com/bazukiperfume/` in a new tab.
   - Optional "Follow @bazukiperfumes" outline button as final step.
6. Footer: `BAZUKI — discover your formula · @bazukiperfumes`.

## 3. Bottle animation

Replace the current static/elapsed-fill SVG with a continuous 4s calibration loop:
- SVG `<rect>` clipped to bottle silhouette, `y` and `height` animated via CSS keyframes from 85% → 20% → 85% over 4s ease-in-out, infinite. Gold fill at 60% opacity.
- Overlay 6 tiny gold dots drifting upward at randomized delays (pure CSS `@keyframes` translateY + opacity) to read as particles.
- `@media (prefers-reduced-motion: reduce)` → static half-fill, no drift.

## 4. Aesthetic refinements

- Backgrounds unify on `#0A0A0A`; remove any secondary panels.
- All eyebrow/label text: cream `#F5EFE6`, min 13px, tracking `0.16–0.2em` — retire the tiny gold-on-black labels for contrast.
- Body/UI font: Inter (already loaded via Tailwind stack) — enforce on inputs, buttons, chips, countdown numerals. Cormorant Garamond stays for the H1 only.
- Focus ring: `outline: 2px solid #C9A84C; outline-offset: 2px` on all interactive elements.
- Chips: unselected = 1px cream/20 border; selected = 1.5px gold border + inline check icon (so state is distinguishable without color).

## 5. Preserved (do NOT touch)

- `supabase/functions/whatsapp-send-otp/index.ts`
- `supabase/functions/whatsapp-verify-waitlist-otp/index.ts`
- 11za origin/template config, `WHATSAPP_11ZA_*` secrets
- Resend backoff schedule, error-code parsing, verify step UI logic
- SEO/`useSEO` noindex settings

## 6. Files touched

- `supabase/migrations/<new>.sql` — columns, unique constraints, two RPCs + grants.
- `src/pages/ComingSoon.tsx` — restructured into `SubscribeState` + `WelcomeState` subcomponents; existing OTP handlers moved verbatim into `SubscribeState`.
- `src/components/prelaunch/CalibratingBottle.tsx` — new, animated SVG.
- `src/components/prelaunch/ScentPreferencePicker.tsx` — new, chip UI + autosave.
- `src/components/prelaunch/ShareRow.tsx` — new, WhatsApp + Instagram buttons.
- `src/index.css` — small keyframe additions for bottle fill + particle drift.

## 7. Out of scope

- No changes to referral system (already removed).
- No changes to OG image or `index.html` meta (already set for prelaunch).
- No analytics changes beyond keeping the existing `trackCta` calls on the primary CTA.
