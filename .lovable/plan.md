# Plan: Formula Reveal component on Quiz Results

Replace the `FragrancePyramid` block in each of the 3 AI-matched formula cards on `/shop/quiz/results` with a new interactive **FormulaReveal** component, plus a mobile tab switcher above the cards. No data, pricing, cart, or save logic changes.

## Scope (presentation only)

- Edit: `src/pages/QuizResults.tsx` — swap the pyramid block in the formula cards and add a mobile tab switcher around the cards grid.
- New file: `src/components/quiz/results/FormulaReveal.tsx` — the full component (match ring, bottle, note bars, stats row).
- New file: `src/components/quiz/results/FormulaResultsTabs.tsx` — mobile-only tab switcher wrapping the existing card.
- Optional: small keyframes appended to `src/index.css` (`qr-shimmer-sweep`, reuse existing `qr-*` tokens).

The pyramid component itself is left in place (still used by `ProductDetail` and `ScentDetailDrawer`); only the import + JSX inside the results card change.

## New component: FormulaReveal

Props: `{ scent: Recommendation, replayKey?: string | number }`. `replayKey` lets us re-trigger animations when the mobile tab switches.

Internal hooks:
- `useInView` (already in repo, `src/hooks/useInView.ts`) to trigger animations when the card is visible.
- `useCountUp` (already in repo) for the match number.
- Local `expanded: 'top' | 'heart' | 'base' | null` state and `hintDismissed` boolean.

### 1. Match ring (80x80 SVG)

- Track circle, stroke `rgba(201,168,76,0.15)`, 6px.
- Gold arc `#C9A84C`, 6px, round linecap, starts at 12 o'clock, sweeps clockwise. Animated via `stroke-dasharray` interpolated from 0 → `(matchScore/100) * circumference` over 1200ms cubic-bezier(0.22,1,0.36,1) once `inView` flips true.
- Center: `<CountUp>`-driven number in 18px serif gold + small `%`.
- Below center: 9px gold-dim caps `match`.
- Centered above the fragrance name (move name + match badge wrapper).

### 2. Mini bottle (80×160 SVG)

- Gold cap (rounded rect), gold collar, glass body (rounded rect, 1px gold stroke, transparent fill).
- Inside body: three `<rect>` liquid layers clipped to bottle interior via `<clipPath>`.
  - Base `#6B3E1A` ~35% of interior height (bottom).
  - Heart `#B07840` ~30% (middle).
  - Top `#C9B08A` ~25% (upper).
- Animate each layer's `height` + `y` from 0 to final using CSS transitions triggered when `inView`:
  - Base: 0ms delay, 600ms ease-out.
  - Heart: 400ms delay, 500ms.
  - Top: 700ms delay, 400ms.
- Etched gold label rectangle outline + `BAZUKI` text (7px serif, 1px letter-spacing).

### 3. Note layers

Section header: thin gold lines flanking `YOUR FORMULA` (10px gold caps, 0.15em tracking, centered).

For each layer `top | heart | base`:
- Row header: dot (8px circle, layer color), label (10px gold caps, 0.12em), note names joined with `, ` (13px ivory) on the left; duration on the right (11px gold-dim) — Top `1–2 hr`, Heart `3–4 hr`, Base `6–8 hr`.
- Bar track 4px, `rgba(201,168,76,0.12)`, radius 2px. Fill animates `width` from 0 → 35% / 60% / 90% on `inView` with delays 200 / 450 / 700 ms. Shimmer overlay: 40px-wide `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`, looping `qr-shimmer-sweep` ~1.6s.
- Row is a `<button>`; clicking toggles `expanded` (single-open accordion). On expand, render 3 pill descriptors (`opacity 0→1`, `translateY 4→0`, stagger 60ms). Descriptor pools per family — derived once per layer from the layer's first note's family via a small static map (Fresh/Citrus/Bright, Floral/Romantic/Soft, Warm/Woody/Lasting fallbacks). Tapping a row sets `hintDismissed = true`.

Pill styling: `rgba(201,168,76,0.08)` bg, `1px solid rgba(201,168,76,0.2)`, radius 20, padding 3×10, 11px serif italic gold.

Helper hint below all bars: centered 11px `rgba(139,105,20,0.7)` italic — `Tap each layer to explore the notes`. Hidden once any row tapped.

### 4. Stats row (3 columns)

- Boxes: `rgba(201,168,76,0.06)` bg, `1px solid rgba(201,168,76,0.15)`, radius 8, padding 10×8, center text.
- Top label (9px gold-dim caps, 0.12em): `INTENSITY` / `LONGEVITY` / `SILLAGE`.
- Bottom value (14px serif gold, weight 500):
  - Intensity: `scent.intensity` mapped → `Soft` (≤3), `Medium` (4–7), `Bold` (8–10).
  - Longevity: mapped → `2–4 hr`, `4–6 hr`, `All-day`.
  - Sillage: derived from intensity → `Intimate` / `Moderate` / `Strong`.
- `SILLAGE` label wrapped in shadcn `Tooltip` showing `How far your scent projects from your skin` (dark card, gold border, 200ms fade).
- Group fades in `opacity 0→1`, 300ms, with 900ms delay after `inView`.

## Mobile tab switcher

In `QuizResults.tsx`, around the existing `<div className="grid md:grid-cols-3 ...">`:

- Desktop (`md:` and up): unchanged — render all 3 cards side by side using the new FormulaReveal inside.
- Mobile (`<768px`): hide the grid; render `FormulaResultsTabs` which shows 3 tab buttons + the currently active card.
  - Tabs row: 3 full-width buttons. Inactive: transparent bg, `rgba(201,168,76,0.2)` border. Active: `rgba(201,168,76,0.1)` bg, `#C9A84C` border.
  - Each tab content: `75%` match (11px gold) · name (12px ivory) · `Best match` or `Alternative` (10px gold-dim).
  - On change: outgoing card `opacity 1→0` 150ms, then incoming `opacity 0→1` 200ms. Pass a new `replayKey` (the active scent id + a counter) to FormulaReveal so the IntersectionObserver re-runs (component remounts via React `key={replayKey}`), causing the ring count-up and bars to replay.

Use the existing `useIsMobile` hook (`src/hooks/use-mobile.tsx`) to choose between the desktop grid and the mobile tabs container — single source of truth so we don't render both.

## Final card element order (unchanged elsewhere)

1. `✦ Your Best Match` banner (best card only) — existing.
2. Match ring (new, centered) — replaces the inline `% Match` pill.
3. Fragrance name (serif, large, centered under ring).
4. Italic story description — existing.
5. Mini bottle with layered liquid fill — new.
6. `YOUR FORMULA` section label — new.
7. 3 note layer rows with animated bars + tap-to-expand pills — new (replaces `FragrancePyramid`).
8. Tap hint text — new.
9. Thin gold divider — new.
10. Stats row — replaces the existing Intensity/Longevity 2-col block; adds Sillage.
11. `Not ready to order yet?` — existing.
12. `Save My Formula` button (`SaveFormulaButton`) — existing, unchanged.
13. `Want full size? See below ↓` — existing, unchanged.

`scent.formulationNotes` (currently rendered between pyramid and stats) is kept as an optional small italic line just above the divider so no copy is lost.

## Animation + accessibility

- All animations gated behind `useInView` and a `prefers-reduced-motion: reduce` check (jump straight to final state, per project animation memory).
- Ring SVG has `role="img"` + `aria-label="{matchScore} percent match"`.
- Note rows are real `<button>`s with `aria-expanded` and `aria-controls` pointing at the pill region.
- Mobile tab buttons use `role="tab"` / `aria-selected`, the card container `role="tabpanel"`.

## Out of scope (explicitly not changed)

- Fragrance data, match percentages, note compositions, prices.
- `handleAddToCart`, `SaveFormulaButton`, Discovery Set, Single bottle section, urgency bar, footer.
- `FragrancePyramid.tsx` itself (still used elsewhere) — only its usage in `QuizResults.tsx` is removed.
