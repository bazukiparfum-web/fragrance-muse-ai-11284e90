# City Search — Map-Focus Animation Layer

Scope: the `city_search` question (rendered by `CitySearch.tsx`, used by the "What city do you currently live in?" step in both quiz flows). All work is purely additive — no copy, layout, validation, or data changes.

## Files

**Edited**
- `src/components/quiz/CitySearch.tsx` — wrap output in a `.city-search-root` container; add focus tracking, a typing-burst counter, and decorative layers (ambient drifting gradients, pin-drop particles on focus, diamond sparkles on each keypress, idle radar pulse on the icon).
- `src/index.css` — append keyframes & utility classes scoped under `.city-search-root` plus a `prefers-reduced-motion` block.

No edits to `QuestionRenderer`, `ImmersiveQuizShell`, or the shared `Auto-saving` indicator — the shell already pulses on input activity (`.autosave-active`), which already satisfies requirement #6.

## Behavior

1. **Page entry** — Heading entry is owned by the shell's `quiz-step-in` cascade; we only animate the search field itself: `translateY(15px → 0)` + `opacity 0 → 1`, 400ms, 300ms delay, via `.city-search-field`.
2. **Idle radar pulse** — When the input value is empty AND not focused, the `Search` icon gets `.city-search-icon-pulse` (scale 1 → 1.1 → 1, opacity 0.7 → 1 → 0.7, 2s loop).
3. **Focus state** — Local `focused` state on the wrapper toggles `data-focused="true"`:
   - Field gets a `.city-search-glow` ring: `box-shadow: 0 0 25px hsl(var(--bz-gold) / 0.35)` with a 300ms ease transition, plus brightened gold border.
   - Icon pulse stops (selector excludes `[data-focused="true"]`), icon holds at full opacity.
   - On focus event, mounts 4 pin-shaped (📍 style — small SVG-less CSS shape: rounded teardrop) gold particles that rise from the field's bottom edge and fade upward over ~900ms, then unmount.
4. **Typing sparkles** — `onChange` increments a `burstKey`. A small absolutely-positioned overlay near the cursor approximation (right edge of typed text, fallback to right padding) renders 1 diamond-rotated (`rotate(45deg)`) gold sparkle that floats up and fades over ~700ms. Each keystroke remounts (keyed by `burstKey`) so the animation re-fires. Sparkles are pointer-events-none and absolutely positioned so they don't reflow input.
5. **Ambient background** — Two large blurred radial gradients (`.city-amber-blob`, `.city-cool-blob`) inside `.city-search-root`'s background layer, drifting diagonally at opposite trajectories on a 20s loop. Plus a `data-density` attribute on the root (incremented as `value.length` grows) that scales blob opacity from 0.25 → 0.45 across the first ~12 characters — fulfilling "background particles populate as you type" without spawning many DOM nodes.
6. **Auto-saving** — Already handled by `ImmersiveQuizShell.autosave-active` pulse; no change.

## Keyframes / utilities to add in `index.css`

- `@keyframes city-field-rise` (translateY + opacity)
- `@keyframes city-icon-radar` (scale + opacity 2s loop)
- `@keyframes city-pin-drop-rise` (translateY upward + opacity in→out, 900ms)
- `@keyframes city-type-sparkle` (translateY up + scale + opacity, 700ms)
- `@keyframes city-blob-drift-a` and `city-blob-drift-b` (translate + slight scale, 20s linear infinite, opposite directions)
- `.city-search-root`, `.city-search-field`, `.city-search-glow`, `.city-search-icon-pulse`, `.city-pin`, `.city-type-sparkle`, `.city-amber-blob`, `.city-cool-blob` utility classes.
- `@media (prefers-reduced-motion: reduce)` disables animations and hides decorative particle layers.

## What does NOT change

- No edits to other questions or to the shell.
- Input value, placeholder, validation, and submit logic are untouched.
- No new dependencies; everything is pure CSS + small React state inside `CitySearch`.
