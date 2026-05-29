# Nostalgia & Roots — Per-Option Environmental Animations

Scope: only the radio question with `answer_key: 'setting'` ("In what setting did you grow up?") in both quiz flows. Options in the DB: **City, Small town, Countryside, Suburbs, Various, Metropolis** (the screenshot was cut off — Various & Metropolis get matching treatments per note #7). All work is additive — no layout/copy/color-token changes.

## Approach

The current "setting" question is rendered by the generic `radio` case in `QuestionRenderer.tsx`. Rather than overload that case with conditional environment effects, introduce a dedicated branch for setting-style questions, keyed off `question.answer_key === 'setting'`, that swaps in a new `NostalgiaSettingOptions` component. The generic radio path stays untouched for every other radio question.

## Files

**New**
- `src/components/quiz/NostalgiaSettingOptions.tsx` — wraps the 6 radio options, owns per-option overlays, particle bursts, and SVG decoration. Uses the same Label/RadioGroupItem look so the existing layout/border/glow tokens remain identical.
- `src/components/quiz/nostalgia/EnvironmentLayer.tsx` — fixed, pointer-events-none layer mounted into the quiz shell area that reacts to the currently-selected setting and renders the matching background atmosphere (grid / amber bloom / green mist / cozy glow / etc.). Only active while this question is on-screen.
- `src/components/quiz/nostalgia/SettingParticleField.tsx` — option-specific upward particle stream (count, color, speed, sway tuned per setting).
- `src/components/quiz/nostalgia/SkylineTrace.tsx` — small inline SVG with `stroke-dasharray` self-draw animation for the City card.

**Edited**
- `src/components/quiz/QuestionRenderer.tsx` — add a branch before the generic `radio` case: if `question.answer_key === 'setting'`, render `<NostalgiaSettingOptions ... />`. No other changes.
- `src/components/quiz/ImmersiveQuizShell.tsx` — mount `<EnvironmentLayer />` only when the active question's `answer_key` is `setting`, reading the current value from quiz context.
- `src/index.css` — add the keyframes & utility classes listed below, all gated by `prefers-reduced-motion`.

## Per-option behavior

Selection state drives a `data-setting="city|small-town|countryside|suburbs|various|metropolis"` attribute on `EnvironmentLayer`, and a one-shot `data-burst` flag that retriggers card-level decorations on each (re)selection.

| Option | Background atmosphere | Particles | Card inner glow | Card-level flourish |
|---|---|---|---|---|
| City | Faint geometric grid lines (SVG pattern), fades in to 8% then out over 1.5s | Sharp angular gold dots, fast upward, minimal sway | Cool steel-blue → gold inner shadow | `SkylineTrace` self-draws along card bottom over 600ms then fades |
| Small town | Warm amber radial-gradient bloom from card center, soft & wide | Slow gold dots in loose clusters, low density | Honey-amber inner shadow | Concentric ring ripple from the radio dot, 3 rings fading at edges |
| Countryside | Green-gold mist wisps drifting L→R across screen (two slow blurred blobs) | Green-tinted gold, organic side-to-side sway, gentle rise | Earthy green-amber inner shadow | 4–6 leaf/petal clip-path shapes drift upward from card, fade over 800ms |
| Suburbs | Even, comfortable golden glow (low-intensity full-area gradient) | Medium-paced evenly-spaced gold dots in parallel streams | Soft warm-white gold inner shadow | 3 gentle pulse rings from the radio dot, expanding & fading |
| Various (note #7) | Slow morphing blend of city grid + amber + green mist at 40% intensity | Mixed-color gold/ivory particles, mixed cadences | Neutral warm-gold inner shadow | Brief radial sparkle burst (4 directions) from radio dot |
| Metropolis (note #7) | Denser grid + faint vertical light streaks (skyscraper light trails) | Fast dense gold particles, taller upward trajectory | Cool platinum-gold inner shadow | Two parallel vertical light streaks rise behind the card, fade 700ms |

All atmospheres mount/unmount via opacity transition (400ms) when selection changes, so switching between options cross-fades cleanly.

## Page entry & hover (this question only)

- Heading: split `question.question_text` into word `<span>`s; each fades up (opacity 0→1, translateY 20→0) on mount with 80ms stagger. Uses the existing `font-display text-cream` heading — wrapping happens in the new component so the generic renderer is unaffected.
- Options: cascade in from the left (translateX -24→0, opacity 0→1) with 120ms stagger via CSS animation-delay on each Label.
- Hover: gold shimmer sweep (linear-gradient overlay translated L→R over 400ms) + border brightens from `border-gold` to `border-gold-strong` via CSS — applied through a wrapper class so the existing border tokens stay the source of truth.

## Keyframes / utilities to add in `index.css`

- `@keyframes nostalgia-word-rise` (opacity + translateY)
- `@keyframes nostalgia-option-slide-in` (translateX + opacity)
- `@keyframes nostalgia-shimmer-sweep` (background-position L→R)
- `@keyframes nostalgia-ring-ripple` (scale 0→3, opacity 0.6→0)
- `@keyframes nostalgia-leaf-drift` (translateY + rotate + opacity)
- `@keyframes nostalgia-mist-drift` (translateX + opacity bell curve)
- `@keyframes nostalgia-particle-rise-{city|town|country|suburb|metro}` — variants for speed/sway
- `@keyframes nostalgia-skyline-draw` (stroke-dashoffset → 0, then opacity fade)
- `@keyframes nostalgia-grid-fade` (opacity 0 → 0.08 → 0 over 1.5s)
- `@media (prefers-reduced-motion: reduce)` block forces all of the above to a simple 200ms opacity fade with no transform.

## What does NOT change

- No edits to colors/tokens, copy, question schema, recommendation logic, or other questions.
- Generic `radio` rendering, layout spacing, border classes, and existing `glow-gold-sm` selected state are preserved verbatim inside `NostalgiaSettingOptions`.
- Existing global `QuizBackground` / `PerfumeBottleProgress` / shell transitions are untouched; `EnvironmentLayer` sits above them at low opacity.
