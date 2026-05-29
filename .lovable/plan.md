# Luxury Atelier Animation Layer — Both Quiz Flows

Both `QuizForYourself.tsx` (13 steps) and `QuizForSomeoneElse.tsx` (10 steps) already render through `ImmersiveQuizShell`, which already mounts `QuizBackground`. All animation work lands in shared components — no per-page edits, no logic/layout/typography changes.

## Scope (purely additive)

Adds the 10 animation systems requested:
1. 35-particle ambient drift (gold/ivory, sine-wave, randomized)
2. 3 mist blobs (breathing/rotating radial gradients)
3. Progress bar smooth fill + liquid-gold shimmer + sparkle burst on advance + step-counter flip
4. SVG perfume-bottle indicator bottom-left, fills per completed step with bubbles + glow pulse
5. Page entry cascade (heading → subtext → options stagger → nav)
6. Page exit drift (up on Next, down on Back)
7. Next/Back/Skip button states (idle breathe, active pulse-glow, hover, click shimmer)
8. Auto-saving indicator pulse on interaction
9. Radio/card hover shimmer + selected pulse + sparkle burst + sibling dim
10. Performance + `prefers-reduced-motion` + z-index layering + CSS-var tokens

## Files to change

**New**
- `src/components/quiz/PerfumeBottleProgress.tsx` — SVG bottle (~55×85px incl. label), fill via `<clipPath>` + `<rect>` height transition (400ms), wavy top edge via animated `<path>`, 3 bubble `<circle>`s spawned on fill change, idle breathe + ambient glow pulse, "Your Formula" label.
- `src/components/quiz/ProgressSparkleBurst.tsx` — 6–8 `✦` spans bursting from a given x/y, randomized angle/distance, 700ms fade.
- `src/components/quiz/StepCounter.tsx` — wraps "Step X of N" with a `key={step}` flip animation (250ms scale+opacity).

**Modified**
- `src/components/quiz/QuizBackground.tsx`
  - Particle count → 35; per-particle randomized size (1–3px), color (gold/ivory via CSS var), opacity (0.15–0.55), duration (8–18s), delay (0–18s), and CSS-var `--drift-x` (15–30px) feeding a sine-wave horizontal keyframe.
  - Render 3 mist blobs (900/1100/700px) with the exact opacities, positions, and animations specified (drift+scale 25s, rotate 60s linear, scale-pulse 18s offset by 8s).
  - All decorative layers `pointer-events: none`, `will-change: transform, opacity`.

- `src/components/quiz/ImmersiveQuizShell.tsx`
  - Progress bar: switch transition to 600ms ease-out cubic-bezier; add inner shimmer span (2.5s linear gloss); on `currentStep` change mount `<ProgressSparkleBurst>` anchored at the bar's leading tip (using a ref + measured width).
  - Replace step text with `<StepCounter>`.
  - Add `<PerfumeBottleProgress current={currentStep-1} total={totalSteps} />` at `z-15`, bottom-left, above the nav bar.
  - Wrap children with entry-cascade classes (heading/subtext/options/nav get incremental delay classes; options use CSS `:nth-child` stagger via a `data-quiz-options` wrapper consumed inside the page content — already present as the single child block, so the cascade is driven by a top-level wrapper plus a `[data-stagger] > *` rule).
  - Track `direction` state (`forward`/`back`) on `onNext`/`onBack`; pass to the keyed content wrapper to choose exit class (`quiz-exit-up` vs `quiz-exit-down`).
  - Next button: add `idle-breathe` when `!canNext`, `active-pulse-glow` when `canNext`, click handler triggers `shimmer-sweep` class for 150ms then calls `onNext`. Back button gets subtle hover scale; Skip gets opacity/underline hover.
  - Auto-saving indicator: add `data-active` toggled by a `useEffect` that listens to clicks/changes inside the canvas (debounced 2s) and applies pulse classes.

- `src/index.css`
  - Add CSS tokens: `--anim-gold`, `--anim-gold-bright`, `--anim-ivory`, `--anim-bg`, `--anim-amber`, `--anim-dim-gold` (mapped to existing bz-gold etc., no visual recolor).
  - New keyframes: `particle-drift` (Y + sine X via `--drift-x`), `mist-pulse`, `mist-rotate`, `mist-scale-offset`, `bar-shimmer`, `step-flip`, `bottle-wave`, `bottle-breathe`, `bottle-glow-pulse`, `bubble-rise`, `quiz-enter-heading`, `quiz-enter-sub`, `quiz-enter-option`, `quiz-enter-nav`, `quiz-exit-up`, `quiz-exit-down`, `btn-idle-breathe`, `btn-active-pulse`, `btn-shimmer-sweep`, `radio-pulse`, `row-shimmer`, `selected-accent-grow`, `sparkle-burst`, `autosave-pulse`.
  - Utility classes for each, plus `[data-stagger] > *:nth-child(n)` delay rules (350ms + 100ms × index).
  - Single `@media (prefers-reduced-motion: reduce)` block that disables every animation above and keeps only `opacity` fades.

## Out of scope

- Question content, recommendation logic, results/crafting screens, audio, haptics, WebGL, third-party libs (Framer Motion/GSAP/Lottie), any color/spacing/typography change, any backend/edge function change.

## Technical notes

- Particle system stays CSS-only (35 DOM `<span>`s with randomized inline styles) rather than a `<canvas>` — count is low enough that GPU-composited transforms outperform a JS rAF loop, and it preserves the existing approach. (The brief mentions canvas as a preference; CSS keyframes meet the perf+reduced-motion bar more cleanly here.)
- Bottle fill uses `transform: scaleY(...)` on a clipped rect from `transform-origin: bottom` so we never animate height (no CLS).
- Sparkle bursts are mounted with `key={currentStep}` so React remounts and the CSS animation replays on every advance.
- Direction-aware exit: shell sets `data-dir="back"` on the keyed wrapper when Back is pressed within the same render tick before the key changes; CSS picks `quiz-exit-down` accordingly.
- All decorative layers carry `aria-hidden="true"` and `pointer-events: none`.
- Z-index map enforced in `index.css` utilities: mist 0, particles 1, content 10, bottle 15, nav 20.
