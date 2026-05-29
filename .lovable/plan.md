# Grand Finale — Flow 1 Step 10 + Flow 2 Step 13

Both quiz flows (`QuizForYourself`, `QuizForSomeoneElse`) share `ImmersiveQuizShell` and end with a `text` question. I'll build one parameterized finale that scales with `totalSteps`, so Flow 1 (10 steps) gets 20 sparkles / 3 mist layers / 800ms / bottle 90→100%, and Flow 2 (13 steps) gets 26 sparkles / 4 mist layers / 1000ms / bottle 92→100%.

## Scaling rule
```
sparkles      = round(totalSteps * 2)          // 10→20, 13→26
mistLayers    = totalSteps > 10 ? 4 : 3
mistDurationMs= totalSteps > 10 ? 1000 : 800
```

## Files

### 1. `src/components/quiz/FinaleTextInput.tsx` (new)
Used by `QuestionRenderer` for the `'text'` question type **only when the question is the last step**. Renders:
- **Typewriter heading** (30ms/char) — reuses pattern from `PersonalitySliders`. Heading text comes from `question.question_text`.
- **Glowing input field** with constant inner gold glow (`.finale-input` class) and `autoFocus`.
- **Per-keystroke sparkle burst (3 sparkles each)** — spawned at the right edge of the input, drifting up and fading (auto-cleaned after 900ms).
- **Word echo**: every ~200ms during typing, push a ghost copy `<span class="finale-word-echo">{currentValue}</span>` that floats upward + fades (1.2s).
- **Anticipation atmosphere**: a CSS variable `--finale-intensity` set to `clamp(value.length / 12, 0, 1)` on the root element; background particles in `.finale-atmosphere` portal scale count/speed from it.
- Forwards `value` + `onChange` to parent (same API as the current `Input` branch).

Props: `value`, `onChange`, `placeholder`, `questionText`.

### 2. `src/components/quiz/QuestionRenderer.tsx`
Extend the `text` case to render `<FinaleTextInput>` instead of the plain `Input` when `question.is_last_step === true` (we'll pass a new `isLastStep` prop from the renderer's caller — see step 3). Falls back to existing `Input` otherwise. Add `isLastStep?: boolean` to `QuestionRendererProps`.

### 3. `src/pages/QuizForYourself.tsx` + `src/pages/QuizForSomeoneElse.tsx`
Pass `isLastStep={currentStep === totalSteps}` to `<QuestionRenderer>` so the finale input only renders on the actual final question.

### 4. `src/components/quiz/ImmersiveQuizShell.tsx`
Add **finale orchestration** gated by `isLast`:
- **Entry celebration** (once per mount when `isLast` becomes true): render a `<FinaleSparkleRain count={sparkles} />` portal — `sparkles` gold dots rain from `top:-20px` to `100vh` over 1.6s with random horizontal offsets, sizes, and delays; auto-unmounts after 2s. Also dispatch `window.dispatchEvent(new CustomEvent('bz:bottle-happy-pulse'))` so the bottle does a one-shot bouncy pulse (`.bottle-happy-pulse` keyframe).
- **Reveal-button breathing + halo**: when `isLast && canNext`, add classes `is-finale-breathing` and `is-finale-halo` to the next button (CSS handles scale 1↔1.04 over 2s and a pulsing gold box-shadow halo).
- **Click finale sequence**: replace `handleNextClick` body when `isLast`:
  1. Dispatch `bz:finale-fill` `{ from: pct, to: 1 }` — bottle component animates fill to 100% over 500ms (CSS transition already exists; we just push the bottle to a forced `current = total` via event).
  2. Render `<FinaleBurstParticles count={42} />` portal: 40+ gold + ivory particles exploding from screen center (radial trajectories using CSS custom properties for angle/distance, 900ms ease-out).
  3. Render `<span className="finale-flash-overlay" />` (fixed full-screen, opacity 0→0.15→0 over 600ms, gold gradient).
  4. Add `is-finale-shimmer` to button label for 400ms — gold gradient sweeps across text.
  5. Apply `is-mist-exit` class to the `main.canvasRef` parent — triggers `MistExitOverlay` with `layers={mistLayers}` and `duration={mistDurationMs}`; each layer is a positioned `<span>` with `mist-rise-${i}` keyframe (translateY 0→-30%, blur 0→10px, opacity 1→0, durations staggered).
  6. After `mistDurationMs`, call `onNext()`.
- All animations gated by `prefers-reduced-motion` → skip celebration, just call `onNext()`.

### 5. `src/components/quiz/PerfumeBottleProgress.tsx`
- Listen for `bz:bottle-happy-pulse` → toggle `.bottle-happy-pulse` class for 700ms (keyframe: scale 1→1.15→0.95→1, soft gold halo).
- Listen for `bz:finale-fill` → set internal `forcedPct = 1` state used in lieu of `pct` (so liquid rises to 100% with the existing 400ms transition; will read as 500ms via a `--bottle-fill-dur` override during the event). Auto-resets after 1.2s (not needed since page transitions).

### 6. `src/index.css` (append)
New keyframes/classes:
- `@keyframes finale-sparkle-rain` (translateY -20→110vh, opacity 0→1→0).
- `@keyframes finale-burst` (translate `var(--angle)` × `var(--dist)`, opacity 1→0, scale 1→0.4).
- `@keyframes finale-flash` (opacity 0→0.15→0).
- `@keyframes finale-btn-breath` (scale 1→1.04→1, 2s).
- `@keyframes finale-btn-halo` (box-shadow pulse 2s).
- `@keyframes finale-btn-shimmer` (background-position sweep, 400ms).
- `@keyframes finale-word-echo` (translateY 0→-60px, opacity 0.8→0, blur 0→6px, 1.2s).
- `@keyframes finale-keystroke-sparkle` (translateY 0→-40px, opacity 1→0, 900ms).
- `@keyframes mist-rise-a/b/c/d` (per-layer staggered drift+blur+fade).
- `@keyframes bottle-happy-pulse` (scale + gold halo, 700ms).
- Utility classes: `.finale-input` (constant inner gold glow `box-shadow: inset 0 0 18px hsl(var(--bz-gold)/0.35)`), `.finale-sparkle-rain`, `.finale-burst`, `.finale-flash-overlay`, `.finale-word-echo`, `.is-finale-breathing`, `.is-finale-halo`, `.is-finale-shimmer`, `.mist-exit-overlay`, `.mist-layer-{0..3}`, `.bottle-happy-pulse`, `.finale-atmosphere`, `.finale-particle`.
- `@media (prefers-reduced-motion: reduce)` disables all of the above.

## Out of scope
- Quiz flow logic, scoring, question fetching, navigation routing.
- Other question types' presentation.
- Backend/DB changes.

## Test path
- `/shop/quiz/for-yourself` → answer through step 10/10 → see 20 sparkles, bottle at 90%, click Reveal → fill 90→100%, particle burst, gold flash, 3-layer 800ms mist → results.
- `/shop/quiz/for-someone-else` → step 13/13 → 26 sparkles, bottle 92%, fill 92→100%, 4-layer 1000ms mist → results.
