## Quiz results page redesign

All changes live in `src/pages/QuizResults.tsx`, supported by 3 small new components and CSS tokens in `src/index.css`. No business logic, prices, or cart/Shopify code changes. Save still uses the existing `SaveScentDialog` flow under the hood for logged-in users; lead capture is added for anonymous users.

### New page order (top → bottom)

1. Personalized header + trust bar
2. Slim urgency bar (24-hour countdown)
3. ✦ **Discovery Set** card (moved to top)
4. ✦ **Your 3 AI-Matched Formulas** (Save-focused cards)
5. ✦ **Order a Full-Size Bottle** (mini product cards, 50ml/100ml + engraving upsell)
6. Bottom section (Retake quiz · Share · Machine promise)
7. Existing "Learn more" guides + Scent Coaching CTA + Analytics (kept as-is)

### Section-by-section changes

**1. Header & trust bar (`QuizResults.tsx`)**
- Heading: `✦ Your Perfect Matches`, 52px desktop / 32px mobile, ivory serif. Add gently pulsing `Sparkles` icon.
- Subtext: `Custom-crafted by Bazuki AI — exclusively for you`, gold italic 16px.
- Trust bar row: `✦ 2,400+ formulas created · ★★★★★ 4.8 rating · Ships in 3–5 days`, 12px `#C8C0B0`, gold separators.

**2. Urgency bar (new inline component, top of page)**
- Slim full-width strip with `1px solid rgba(201,168,76,0.3)` border, dark bg.
- Text: `⏱ Your formula is saved for HH:MM:SS` — live countdown using a `useEffect` interval starting at 24h from mount (no persistence; pure visual urgency).
- Reduced-motion respected: countdown still ticks, no extra animation.

**3. Discovery Set — `DiscoverySetHero` (extract to `src/components/quiz/results/DiscoverySetHero.tsx`)**
- Solid gold `⭐ BEST WAY TO START` badge above heading, `#0D0C0A` text on `#C9A84C`, gentle breathing scale (1.0 ↔ 1.03, 3s, reduced-motion safe).
- Heading kept: `Get All 3 as 30ml Discovery Set`.
- New subtitle: `The only way to try all 3 of your AI-matched formulas in 30ml — exclusively as a set`, 14px `#C8C0B0` italic.
- Large savings badge: `YOU SAVE ₹600`, 22px bold `#0D0C0A` on gold, with CSS shimmer sweep (linear-gradient highlight translating across, 2.5s loop, reduced-motion safe).
- CTA button: full-width 58px solid gold, text `Try All 3 Formulas — ₹1,500` (16px bold dark). Breathing gold glow via box-shadow keyframe.
- Sub-line under button: `30ml each · All 3 AI-matched formulas · Save ₹600`, 11px `#8B6914`.
- Action keeps existing `handleAddDiscoverySet`.

**4. Formula cards — `FormulaResultCard` (extract to `src/components/quiz/results/FormulaResultCard.tsx`)**
- Section header above cards: `✦ Your 3 AI-Matched Formulas` (22px ivory serif). Sub: `Explore each formula · Save for later · Or order a full-size bottle below`.
- Card 1 (highest match score) gets a gold top banner `✦ YOUR BEST MATCH` (26px tall, full-width `#C9A84C` bg, `#0D0C0A` text) and a `2px solid #C9A84C` border. Other cards: `1px solid rgba(201,168,76,0.3)`.
- Card body keeps name, % match pill, story, `FragrancePyramid`, intensity/longevity bars, formulationNotes.
- Footer rebuilt:
  - Tiny context line: `Not ready to order yet?` 11px `#8B6914` italic centered.
  - **Save My Formula** button (see Save spec below).
  - Text link beneath: `Want full size? See below ↓` — smooth-scrolls to `#single-bottle-section` and sets `highlightedScentId = scent.id` so the matching mini card gets a brief gold ring + size-pill ping.

**5. Save button — `SaveFormulaButton` (new, in same folder)**
The Save button replaces today's plain `Save` button on each card.

- Default visual: full-width 40px transparent button, `1px solid rgba(201,168,76,0.4)`, gold text 12px, `🔖` icon, label `Save My Formula`. Hover brightens border + `rgba(201,168,76,0.06)` bg.
- Tooltip: built with existing `@/components/ui/tooltip` (shadcn). Dark `#1A1408` bg, `1px solid rgba(201,168,76,0.3)`, radius 8, padding 10/14, 12px `#C8C0B0`, line-height 1.6, gold arrow pointing down, 200ms fade. Text: `Save this unique formula to your profile — order it anytime later. We'll remind you so your scent is never lost.` Works on hover (desktop) and tap (mobile, via shadcn tooltip's `delayDuration={0}` + click open).
- Click behavior:
  - If `supabase.auth.getUser()` returns a user → open existing `SaveScentDialog` (current flow). On its success callback, transition button to the "Saved" state (described below) and fire confetti.
  - If anonymous → inline expand below the button: small email input (same styling as quiz inputs: dark bg, gold border, gold-dim placeholder `your@email.com`) + small solid-gold pill `Save Formula →`. Submitting calls a new server route (see below) that stores the scent + email for retargeting.
- Saved state (in-place transform of the button):
  - Icon `🔖 → ✓`, label `Formula Saved ✓`, bg `rgba(201,168,76,0.1)`, border `1px solid #C9A84C`.
  - 5 small gold sparkles burst from button (absolute-positioned spans with translate+fade keyframes, 500ms, reduced-motion: skipped).
  - Below button: 3-second auto-dismissing success line `✓ Saved! We'll remind you to order this formula.` 11px gold italic. If email was just captured, swap to: `✓ Formula saved! Check your email for your formula details.`

**6. Single bottle section — rebuilt as mini product cards (`SingleBottleCard` in same folder)**
- Section heading: `✦ Order a Full-Size Bottle` (26px ivory serif). Subtext: `Choose your favourite formula in 50ml or 100ml`. Anchor id `single-bottle-section`.
- One card per recommendation. Layout:
  - Top row: `✦ BEST MATCH` label (only on highest match) on the left, `75% Match` on the right (11px gold, letter-spacing 0.1em).
  - Name (serif), short tagline (truncated story).
  - `SELECT SIZE:` label, then two toggle pills `50ml — ₹1,099` / `100ml — ₹1,899`. Active = gold bg/dark text, inactive = transparent with `rgba(201,168,76,0.3)` border. 200ms transitions. State stored in existing `selectedSize` map.
  - Add to Cart button: outline gold, full-width 46px, label `Add to Cart — ₹<price>` updates with size and engraving toggle. Hover fills solid gold, text dark.
  - Engraving upsell row beneath: `+ ✦ Add personalised engraving — ₹199` with a switch. Collapsed by default; switch ON adds 199 to displayed price and stores an `engraving` flag for that scent. The actual engraving text input reuses the existing `EngravingPanel` component, mounted inline only when enabled.
- Styling: `#141210` bg, radius 10, padding 20/24, gap 16 between cards. Best-match card: `1px solid rgba(201,168,76,0.5)`.
- Cart wiring: keep `handleAddToCart(scent)` and existing Shopify variant resolution. When `engraving` is on, add `attributes` to the cart line (same pattern already used by `cartStore.addItem` with `attributes?: CartAttribute[]`): `[{ key: 'Engraving', value: <text> }]` and the existing engraving fee handling on the cart drawer/checkout stays unchanged (no business logic edits). If engraving wiring touches anything beyond passing attributes, defer to existing PDP engraving infra without altering it.
- Highlight behavior: when `highlightedScentId` matches (from the "See below" link), card gets a 1500ms gold ring pulse.
- Footer line stays: `30ml is only available in the Discovery Set above.`

**7. Bottom section (new block above the existing Learn-more grid)**
- A: `Results don't feel right? Retake the quiz →` link, 13px `#8B6914`, navigates to `/shop/quiz`.
- B: Share row: `Share your scent profile` + WhatsApp button + Copy Link button. Reuse existing `ShareFragranceDialog` if it fits, otherwise inline simple WhatsApp deep link (`https://wa.me/?text=...`) and `navigator.clipboard` for copy.
- C: Machine promise: `✦ Your formula will be precision-filled by our AI algorithmic machine — exact concentrations, every time`, small `#8B6914` italic centered.

### New backend route (only for anon Save lead capture)

`supabase/functions/save-quiz-lead/index.ts` (small, service-role):
- Body: `{ email, scent: { name, formula, match_score, intensity, longevity, prices, formulation_notes, quiz_answers } }`.
- Validates email format.
- Inserts into `saved_scents` with `user_id = ANON_TEST_USER_ID` (matches the pattern used by `create-shopify-product-from-scent`), plus a new nullable `lead_email` column.
- Migration: `ALTER TABLE public.saved_scents ADD COLUMN IF NOT EXISTS lead_email text;` — additive, no policy change needed (already covered by existing RLS; only the edge function writes via service role).
- Response: `{ ok: true, scentId }`.
- Triggering the day-0/1/3/7 retargeting email sequence is **out of scope for this change** but the spec is noted in a code comment so the email worker can pick it up later (mentioned as a future enhancement; no email infra changes here).

### Design tokens

Add to `src/index.css` `:root`:
```css
--qr-bg: 13 12 10;            /* #0D0C0A */
--qr-card: 20 18 16;          /* #141210 */
--qr-bundle: 26 20 8;         /* #1A1408 */
--qr-gold: 201 168 76;        /* #C9A84C */
--qr-gold-bright: 240 192 64; /* #F0C040 */
--qr-gold-dim: 139 105 20;    /* #8B6914 */
--qr-ivory: 245 240 232;      /* #F5F0E8 */
--qr-body: 200 192 176;       /* #C8C0B0 */
```
Plus keyframes: `qr-breathe`, `qr-shimmer`, `qr-glow-pulse`, `qr-sparkle-burst`, `qr-highlight-ring`. Every animation wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; }`.

### Out of scope (explicitly preserved)

- Fragrance names, match %, note compositions, prices.
- Cart store, Shopify Storefront API calls, checkout flow.
- `create-shopify-product-from-scent` edge function and its variant logic.
- `SaveScentDialog` internals (only reused).
- Quiz engine output shape / recommendation logic.
- Existing "Learn more" guide grid, Scent Coaching CTA, and `QuizAnalytics`.
- Email infrastructure / actual retargeting drip implementation.

### File list

- Edit: `src/pages/QuizResults.tsx`, `src/index.css`.
- Create: `src/components/quiz/results/DiscoverySetHero.tsx`, `FormulaResultCard.tsx`, `SaveFormulaButton.tsx`, `SingleBottleCard.tsx`, `UrgencyCountdown.tsx`.
- Create: `supabase/functions/save-quiz-lead/index.ts`.
- Migration: one additive `ALTER TABLE saved_scents ADD COLUMN lead_email text`.
