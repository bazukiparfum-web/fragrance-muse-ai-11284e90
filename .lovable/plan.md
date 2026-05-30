# Visceral Intensity Slider

Replace the inline `case 'slider'` block in `QuestionRenderer.tsx` with a new dedicated `IntensitySlider` component that reacts to value in real time and emits a global atmosphere event the existing `QuizBackground` can listen to.

## New files

### `src/components/quiz/IntensitySlider.tsx`
Props: `{ value, min, max, onChange }`.

Layout:
- Wrapper `pt-4 px-2 intensity-root` with `data-tier="subtle|medium|bold"` derived from value (1–3 / 4–6 / 7–10), used by CSS to tune glow + label colors.
- `Slider` (Radix wrapper from `@/components/ui/slider`) given an `intensity-slider` class. Override thumb + range via the same `[&_[role=slider]]:...` / `[&_span[data-orientation=horizontal]>span]:...` pattern used in `PersonalitySliders`, so we can:
  - Thumb: golden box-shadow whose spread/opacity is bound to a CSS var `--int-glow` (set inline from value: `0.1 + value/max * 0.9`). Slow `intensity-thumb-pulse` keyframe whose amplitude is also scaled by `--int-glow`.
  - Range fill: gradient + a `::after` overlay running an `intensity-shimmer` keyframe (translateX -100% → 100%, 2.5s linear infinite) — gives the liquid-perfume gloss.
- Labels row: `Subtle (min)` left, big number center, `Bold (max)` right.
  - Both end labels get `data-glow="true"` when value is in their zone (≤ min+2 / ≥ max-2). CSS adds cool silver text-shadow on Subtle, warm amber on Bold; fades in/out 300ms.
  - Center number uses `key={value}` to retrigger an `intensity-heartbeat` animation (scale 1→1.3→1, 200ms). Color via `color-mix` or interpolated HSL token from soft gold `hsl(45 50% 60%)` → bright gold `hsl(45 95% 65%)` based on value.

Local state / handlers:
- `onPointerDown` on the track wrapper sets `draggingRef`; `onPointerUp / onPointerCancel / onLostPointerCapture` triggers a burst.
- Burst: pushes N particles into a `bursts` array (N = round(3 + (value-min)/(max-min) * 12), 3..15). Each particle: random angle, distance ~80–180px, lifetime 700ms; rendered as absolutely positioned spans inside the track wrapper at the thumb's current X (`left: ${((value-min)/(max-min))*100}%`). CSS keyframe `intensity-burst-dot` animates translate + opacity. Items removed via `setTimeout`.
- On every value change (and on mount) dispatch `window.dispatchEvent(new CustomEvent('bz:intensity-atmos', { detail: { tier, density, speedFactor, opacity } }))` with:
  - Subtle: `{ density: 10, speedFactor: 0.5, opacity: 0.2, mistScale: 0.7 }`
  - Medium: `{ density: 25, speedFactor: 1, opacity: 0.35, mistScale: 1 }`
  - Bold: `{ density: 50, speedFactor: 1.6, opacity: 0.55, mistScale: 1.35 }`

All animations gated by `prefers-reduced-motion`.

## Edits

### `src/components/quiz/QuestionRenderer.tsx`
- Add `import { IntensitySlider } from './IntensitySlider';`
- Replace the body of `case 'slider'` (lines ~227–248) with:
  ```tsx
  return wrap(
    <IntensitySlider
      value={(currentAnswer as number) ?? (question.min ?? question.min_value ?? 1)}
      min={question.min ?? question.min_value ?? 1}
      max={question.max ?? question.max_value ?? 10}
      onChange={(v) => updateAnswer(answerKey, v)}
    />
  );
  ```

### `src/components/quiz/QuizBackground.tsx`
- Subscribe (in a `useEffect`) to `bz:intensity-atmos`. Store `{ density, speedFactor, opacity, mistScale }` in state, defaulting to current behavior (35 / 1 / ~0.4 / 1).
- Recompute `particles` from live density instead of the static `particleCount` prop (prop becomes a fallback). When density changes, transition by re-keying particles; duration scales by `1/speedFactor`; per-particle `opacity` clamped against the broadcast opacity.
- Mist blobs: apply `style={{ transform: 'scale(var(--mist-scale))', opacity: 'var(--mist-opacity)' }}` and set those CSS vars on the root `.quiz-bg` from state. Add a 600ms CSS transition for both vars on `.quiz-mist` so density changes feel smooth, not snappy.

### `src/index.css`
Add keyframes + utilities (all under `@media (prefers-reduced-motion: no-preference)`):
- `intensity-thumb-pulse` — box-shadow expand/contract using `--int-glow`.
- `intensity-shimmer` — translateX -100% → 100%, 2.5s linear infinite, applied via `.intensity-slider [data-orientation=horizontal] > span::after` (linear-gradient transparent → rgba(gold, 0.45) → transparent).
- `intensity-heartbeat` — scale 1 → 1.3 → 1 over 200ms ease-out.
- `intensity-burst-dot` — translate + fade out 700ms.
- `.intensity-end[data-glow="true"][data-side="subtle"]` cool silver `text-shadow`; `[data-side="bold"]` warm amber. 300ms transition on `text-shadow` and `color`.
- Smooth 600ms transitions on `.quiz-bg`'s mist vars.

## Out of scope
No data, question schema, or other quiz step changes. Only the slider question visuals and the background's reactivity to the new event.
