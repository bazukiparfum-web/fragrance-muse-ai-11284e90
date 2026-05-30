## Personality — soulful per-option animations

Currently the "How would you describe your/their personality?" radio (options: Calm, Energetic, Elegant, Bold) is rendered by the generic `radio` branch in `QuestionRenderer.tsx`. Create a dedicated component so each option carries its own animated personality.

### New file
`src/components/quiz/PersonalityOptions.tsx`

Props match the existing `IdentityOptions` / `AgeRangeOptions` pattern:
`options`, `value`, `onChange`, `heading`, `helper`, `questionText`.

### Behaviors

5. **Staggered entry (all rows)** — Each row animates with `personality-row-in` (translateY +20px → 0, opacity 0→1, 500ms ease-out, fill `both`), 150ms stagger.

Per-option signature, keyed off `value` (re-fires effects on change):

1. **Calm** — Body-portal layer with 3 concentric SVG circles expanding from the card's center (computed via `getBoundingClientRect` on selection), scale 0→3, opacity 0.15→0, 3s ease-out, infinite loop, deep blue→gold stroke. Slow upward "bubble" particles (8, 14–20s drift). Soft lavender/white mist wisps (2 large blurred blobs, 12s drift across screen).

2. **Energetic** — One-shot 20-particle gold firework burst from card center (radial via rotated parent + translateY, 400ms ease-out). Card runs `energetic-bounce` (translateY 0→-8px→0, 300ms). Background shimmer pulse via a full-screen overlay `energetic-shimmer` (opacity 0→0.08→0, 700ms).

3. **Elegant** — A golden ribbon SVG arc sweeps across the screen once (`stroke-dasharray` draw-on then fade, 1.8s ease-in-out). Falling petal particles (10, translateY 0→100vh + rotate, 8–14s, swaying). Card gets ornate corner-glow via 4 absolutely-positioned corner spans with soft gold radial-gradient glow.

4. **Bold** — Brief full-screen gold flash overlay (opacity 0→0.1→0, 100ms). Large confident burst (28 particles, travel ~220px vs 120px for Energetic, 600ms ease-out). Card scales to 1.03 and holds (`transition-transform 300ms`).

### Implementation details

- One canonical body-portal layer `<PersonalityAtmosphere selected={value} originRect={…}>` that swaps its children based on the selected option. Stored in local state, updates on `onChange`.
- Card center origin: stored in a `Map<option, DOMRect>` populated via `ref` callbacks on each row.
- All particles use the existing rotated-parent + child-translateY pattern from `AgeRangeOptions` for radial bursts.
- Reduced-motion: `prefers-reduced-motion` short-circuits all keyframe animations (apply tint/scale only, no particles/ribbon/flash).
- All colors via existing tokens (`gold`, `gold-strong`, `cream`, `bz-card`, `--anim-gold`, `--anim-ivory`); no raw hex outside the existing CSS-var system. Lavender mist uses a soft HSL added to `index.css` as `--anim-lavender` for consistency.

### Wire-up
In `QuestionRenderer.tsx`, add branch alongside `gender`/`setting`/`ageRange`:
```ts
if (question.answer_key === 'personality' || question.question_key === 'personality') {
  return <PersonalityOptions ... />;
}
```
(`question_key` covers the For-Someone-Else flow which uses `question_key` instead of `answer_key`.)

### CSS (src/index.css)
Add keyframes + utilities (gated by `prefers-reduced-motion`):
- `personality-row-in`
- `calm-ripple` (scale 0→3, opacity 0.15→0)
- `calm-bubble` (translateY 0→-120vh, slow)
- `calm-mist-drift`
- `energetic-bounce`
- `energetic-shimmer`
- `energetic-burst-dot` (reuse age-burst-dot pattern with longer travel)
- `elegant-ribbon-draw` (stroke-dashoffset → 0, then opacity → 0)
- `elegant-petal-fall` (translateY + rotate + sway)
- `elegant-corner-glow` (opacity pulse)
- `bold-flash`
- `bold-burst-dot`

### Out of scope
- No business logic changes, no question data edits, no progress/shell changes.
- No edits to other radio questions or to `PersonalitySliders`.
- Existing `radio` fallback in `QuestionRenderer.tsx` remains for any other radio questions.
