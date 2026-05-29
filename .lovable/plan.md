## Age Range — playful, elegant entries

Create a new dedicated component for the age-range step (currently rendered by the generic `radio` branch in `QuestionRenderer.tsx`) so we can layer the bespoke animations without polluting other radio questions.

### New file
`src/components/quiz/AgeRangeOptions.tsx`

Props mirror the existing pattern used by `IdentityOptions` / `NostalgiaSettingOptions`:
- `options: string[]`
- `value: string`
- `onChange: (val) => void`
- `heading`, `helper`, `questionText`

### Behaviors

1. **Staggered card entrance** — Each option (`Label` row) gets `animate-age-card-in` with `animationDelay: index * 120ms`. Keyframe: `translateX(-30px) opacity 0 → translateX(0) opacity 1`, 500ms ease-out, fill-mode `both`.

2. **Selection burst** — When `value === option`:
   - Render an absolutely-positioned "ripple ring" of 8 small `bg-gold` dots arranged in a circle around the radio dot, animating `scale 0 → 2` + `opacity 1 → 0` over 500ms ease-out (key `value + Date.now()` so it replays on re-select). Triggered by `useEffect` on `value` change, stored in local state `burstKey`.
   - The selected `Label` gets an amber tint overlay: extra class `bg-[hsl(35_60%_15%/0.4)]` (warm dark amber) layered on top of existing styles.
   - Floating digit ghosts: for the just-selected option, split its label into individual digit chars (e.g. "26-35" → "26", "35"), render each in an absolutely positioned span with `animate-digit-float` (translateY 0 → -40px, opacity 1 → 0, 900ms ease-out), staggered 100ms apart, then removed.

3. **Hover timeline** — Above the option list, render a thin horizontal dotted gold line with 4 small circular marks evenly spaced. Track `hoveredIndex` via `onMouseEnter` on each row. Marks at index ≤ hoveredIndex light up (bg `gold-strong` + glow); others dim. Dotted line uses `border-t border-dotted border-gold/40`. Smooth `transition-all duration-300`.

### Wire-up
In `QuestionRenderer.tsx`, add a branch alongside `gender` / `setting`:
```ts
if (question.answer_key === 'ageRange') {
  return <AgeRangeOptions ... />;
}
```

### Tokens / keyframes
Add to `src/index.css` (under existing `@layer utilities` keyframes block) only what's missing:
- `@keyframes age-card-in` — translateX(-30px)/opacity 0 → 0/1
- `@keyframes burst-ring` — scale(0)/opacity 1 → scale(2)/opacity 0
- `@keyframes digit-float` — translateY(0)/opacity 1 → translateY(-40px)/opacity 0
- Matching `.animate-age-card-in`, `.animate-burst-ring`, `.animate-digit-float` utility classes (or inline `style={{ animation: ... }}`).

All colors via existing semantic tokens (`gold`, `gold-strong`, `cream`, `bz-card`); no raw hex.

### Out of scope
- No changes to other radio questions, no business logic edits, no changes to `QuizForYourself.tsx` data, no progress-bar or page-shell modifications.