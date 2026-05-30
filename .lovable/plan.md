## Goal
Give the Occasion question (Daily / Office / Evening / Sport / Travel) a per-card scene animation with a satisfying staggered "card-dealing" entry, matching the soul of earlier quiz steps.

## Files

**Create `src/components/quiz/OccasionOptions.tsx`**
- Grid layout matching the current `case 'occasion'` chrome (2 cols mobile, 3 cols ≥md), single-select buttons.
- Entry: each card scales `0.85 → 1` + fade, staggered 100ms in grid order via `--occasion-stagger` CSS var and a shared `occasion-deal-in` keyframe (one-shot on mount).
- Selection state mounts an absolutely-positioned overlay (`pointer-events-none`, rounded to match card) containing the option's signature animation. Deselect unmounts after a 300ms fade-out (`occasion-fade-out`).
- Variant resolution by normalized lowercase option value; unknown values fall back to a neutral glow.

Per-option signatures:

1. **Daily** — Warm sunrise radial gradient blooms in card background (`occasion-sunrise-bloom`, 700ms ease-out, persists while selected). 6 small golden particles drift upward continuously (`occasion-rise`, 3s loop, staggered). Border glow shifts warm amber via `--occasion-tint: 38 90% 60%`.

2. **Office** — A thin gold grid SVG (3×3 lines) strokes itself in via `stroke-dashoffset` 800ms then fades to ~15% opacity and stays. 5 particles travel in tight upward columns (`occasion-column-rise`, 2.4s loop). Tint blends cool blue + gold (`--occasion-tint: 210 50% 65%`, border accent gold).

3. **Evening (most dramatic)** — Deep purple → gold radial backdrop. 14 micro-star spans twinkle at random delays (`occasion-twinkle`, 1.6s loop). 8 slow shimmer particles fall (`occasion-shimmer-fall`, 4s loop). Border uses a layered `box-shadow` — outer deep gold + inner purple edge — driven by `.occasion-card--evening`. A crescent-moon SVG fades in near the top-right (`occasion-moon-fade`, 900ms ease-out then holds at 0.55 opacity).

4. **Sport** — On select, card runs a one-shot `occasion-pop` (scale 1 → 1.06 → 1, 320ms). 10 particles shoot upward fast (`occasion-rise-fast`, 1.1s loop). Background pulse cycles cool blue-green (`occasion-pulse-cool`, 1.8s loop). Tint `--occasion-tint: 170 60% 55%`.

5. **Travel** — Compass-rose SVG (or simple globe ring + crosshairs) strokes itself in over 600ms (`stroke-dashoffset` 0). 8 particles drift in varied directions using per-particle `--dx` / `--dy` CSS vars and a shared `occasion-wind` keyframe (4s loop). Warm wanderlust neutral glow via `--occasion-tint: 32 50% 60%`.

**Edit `src/components/quiz/QuestionRenderer.tsx`**
- Import `OccasionOptions`.
- Replace the body of `case 'occasion':` with `return wrap(<OccasionOptions options={question.options || []} value={(currentAnswer as string) || ''} onChange={(v) => updateAnswer(answerKey, v)} />);`. No other branches change.

**Edit `src/index.css`**
- Add keyframes: `occasion-deal-in`, `occasion-fade-out`, `occasion-sunrise-bloom`, `occasion-rise`, `occasion-rise-fast`, `occasion-column-rise`, `occasion-grid-draw`, `occasion-twinkle`, `occasion-shimmer-fall`, `occasion-moon-fade`, `occasion-pop`, `occasion-pulse-cool`, `occasion-compass-draw`, `occasion-wind`.
- Utility classes scoped under `.occasion-card--daily | --office | --evening | --sport | --travel` to drive `--occasion-tint`, border-glow intensity, and the Evening layered shadow.
- All effects wrapped with `@media (prefers-reduced-motion: reduce)` no-op fallback (cards just fade in, selected state shows static tint).

## Out of scope
- No quiz data, scoring, formula math, other questions, or backend changes.
- Does not touch global `QuizBackground` atmosphere; effects live inside each card.

## Verification
- `/shop/quiz/for-yourself` → question 12, and `/shop/quiz/for-someone-else` → question 8.
- Confirm 100ms staggered scale-in on mount, each option's signature plays on select, deselect fades cleanly in 300ms, reduced-motion users see static selected state.
