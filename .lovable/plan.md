## Goal
Give the Longevity radio question (Short / All-day / Long-lasting) its own time/trail-inspired animation personality, matching the soul of earlier quiz steps.

## Files

**Create `src/components/quiz/LongevityOptions.tsx`**
- Radio-style list, same visual chrome as `PersonalityOptions` (border, glow when selected, full-width cards stacked).
- Entry animation: each row slides in from alternating sides (left, right, left) with `translateX ±40px → 0` + fade, staggered 120ms apart. Uses new `longevity-slide-l` / `longevity-slide-r` keyframes.
- On selection, the active card mounts a per-option overlay layer (absolute, pointer-events-none, rounded to match the card) containing the option's signature animation. Deselect unmounts after a 300ms fade.

Per-option signatures:
1. **Short (2–4h)** — Brief bright burst of 8 gold particles, opacity 1→0 in 400ms then layer self-cleans; a small SVG dashed trail strokes across the card (`stroke-dashoffset` 0→100, 600ms) then fades; tiny clock-hand SVG sweeps 0→360° once near the right edge then fades. All effects play once; card glow remains while selected.
2. **All-day (6–8h)** — SVG sun arc path animates across the top quarter (`stroke-dashoffset`, 800ms ease-out), with a small sun circle riding along via CSS offset-path or `@keyframes sun-arc` (translate + scale). Steady upward particle stream (4 dots, looping 3s) at comfortable pace. Card glow shifts to warm daylight gold (`hsl` accents through a `--longevity-tint` var).
3. **Long-lasting (12+h)** — Background gradient transitions dawn→dusk; a small moon SVG fades in with 4 twinkling star spans (random delays). Rich deep-gold particle stream loops indefinitely (denser). Strongest border glow (`box-shadow` intensified). A shimmer band (`linear-gradient` overlay, `translateX -120% → 120%`) sweeps every 3s via `longevity-shimmer` keyframe.

Reads option `value` to pick variant; falls back to generic style for unknown values (safety).

**Edit `src/components/quiz/QuestionRenderer.tsx`**
- Add `LongevityOptions` import.
- In `case 'radio'`, add branch: `if (question.question_key === 'longevity' || question.answer_key === 'longevity')` → render `<LongevityOptions options={…} value={…} onChange={…} heading={heading} helper={helper} />`. No change to other branches.

**Edit `src/index.css`**
- Add keyframes: `longevity-slide-l`, `longevity-slide-r`, `longevity-burst` (gold flash), `longevity-trail-dash` (dash stroke), `longevity-clock-sweep`, `longevity-sun-arc`, `longevity-particle-rise`, `longevity-moon-fade`, `longevity-star-twinkle`, `longevity-shimmer`, plus a shared `longevity-fade-out` (300ms).
- Utility classes scoped under `.longevity-card--short`, `.longevity-card--allday`, `.longevity-card--long` driving border-glow strength and `--longevity-tint`.
- All wrapped with `@media (prefers-reduced-motion: reduce)` no-op fallback.

## Out of scope
- No changes to quiz data, scoring, formula math, other questions, or AI recommendations.
- No backend / RLS / migrations.

## Verification
- Open `/shop/quiz/for-someone-else`, advance to question 7. Confirm: staggered alt-side entry, each option's selection animation plays as described, deselecting fades out cleanly, reduced-motion users see only the static selected state.
