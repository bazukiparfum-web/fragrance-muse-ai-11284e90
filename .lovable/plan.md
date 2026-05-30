## Goal

Most of the finale ritual is already wired up. This pass closes the one remaining gap from the brief — the ambient background on Step 10 for someone special flow and Step 13 for Myself flow — and verifies the other six behaviors are firing correctly.

## What already exists (no changes needed)

- **Entry celebration** — `ImmersiveQuizShell` triggers `finale-sparkle-rain` (20+ gold drops) and dispatches `bz:bottle-happy-pulse`; bottle shows 90% (`current=totalSteps-1`) with happy-pulse class.
- **Typewriter heading** — `FinaleTextInput.useTypewriter` at 30ms/char with blinking caret.
- **Enhanced typing magic** — 3 sparkles per keystroke, inner golden glow via `.finale-input` `finale-input-breath` keyframe, density-scaling `finale-atmosphere` particles driven by `--finale-intensity = min(1, length/12)`.
- **Word echo** — throttled ghost copies float upward via `finale-word-echo` keyframe.
- **Reveal button climax** — `is-finale-breathing` (2s breathing) + `is-finale-halo` (gold halo); on click runs bottle fill → 42-particle burst → flash overlay → button shimmer → mist exit transition, all timed to `mistDuration` before `onNext()`.

## What's missing — the richest background

The brief asks Step 10's ambient layer to feel like "all the ingredients are present" — floral wisps, golden particles, warm glow — the most complex of all pages. Today `QuizBackground` just renders default density unless the intensity slider changed it.

## Files

**Edit `src/components/quiz/ImmersiveQuizShell.tsx**`

- In the existing finale-entry `useEffect` (`isLast && !finaleEnteredRef.current`), also dispatch `window.dispatchEvent(new CustomEvent('bz:finale-atmosphere', { detail: true }))` on enter and `{ detail: false }` on leaving the last step (reset branch).

**Edit `src/components/quiz/QuizBackground.tsx**`

- Subscribe to `bz:finale-atmosphere`. When active, override atmos to a "finale" preset: `density = max(atmos.density, 60)`, `speedFactor = 1.15`, `opacity = 0.55`, `mistScale = 1.4` — keep the intensity-slider override semantics, finale wins only if the user hasn't dialed intensity above it.
- Render 4 extra absolutely-positioned `<span class="quiz-finale-glow quiz-finale-glow--{floral|woody|fresh|warm}">` blobs when finale mode is active. Each is a soft radial-gradient circle in its family hue (rose, deep amber-brown, cool aqua, warm sunset gold), `mix-blend-mode: screen`, `filter: blur(80px)`, drifting slowly. They fade in over 800ms when entering, fade out over 600ms when leaving (component-local `entering` flag + `finale-glow-fade-out` class).

**Edit `src/index.css**`

- Add the four `.quiz-finale-glow--*` color tokens and positions.
- Add `quiz-finale-glow-drift` keyframe (slow translate + scale, 18s ease-in-out infinite, distinct delay per blob).
- Add `quiz-finale-glow-in` (opacity 0→1, 800ms) and `quiz-finale-glow-out` (1→0, 600ms) keyframes.
- Wrap all new animations in `prefers-reduced-motion` no-op fallback.

## Out of scope

- No change to scoring, AI, navigation, or per-question data.
- No tweaks to the already-working finale entry, typewriter, input glow, echoes, breathing button, or click sequence (those match the brief).

## Verification

- `/shop/quiz/for-yourself` → advance to Step 13. Confirm: heading types out, input glows with breathing halo, typing spawns 3 sparkles + ghost echoes + denser ambient particles, the page now carries four layered family-tinted glows + ~60 ambient particles. Click Reveal My Scents → bottle fills to 100%, burst + flash + mist-exit transition plays, then results route. Toggle reduced-motion → static state, glows fade in but don't drift.