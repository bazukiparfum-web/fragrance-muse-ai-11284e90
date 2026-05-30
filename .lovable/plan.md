## Goal
Codify the animation system as a project rule and bring existing quiz animations into compliance — without changing any choreography, timing intent, or behavior the user already approved.

## 1. Save the rules to memory

Create `mem://design/animation-system` (type: `design`) capturing:
- **Palette tokens** (already present in `src/index.css` as `--anim-gold #C9A84C`, `--anim-gold-bright #F0C040`, `--anim-ivory #F5F0E8`, `--anim-bg #0D0C0A`, `--anim-amber #1A1408`) — always reference via CSS variables, never hardcode.
- **Easing**: entrances → `ease-out` / `var(--ease-out-soft)`; exits → `ease-in` / `var(--ease-in-soft)`; loops → `ease-in-out`. `linear` only for continuous left-to-right sweeps (bar shimmer, sparkle rain fall, button shimmer sweep).
- **Durations**: interactions 200–800ms; ambient loops 2–60s.
- **Performance**: every particle / floating / transforming element gets `will-change: transform, opacity`.
- **A11y**: every animation must have a `@media (prefers-reduced-motion: reduce)` fallback that reduces to a simple fade or `animation: none`.
- **Libraries**: Framer Motion for React page transitions, GSAP for complex particle systems, Lottie for the perfume-bottle fill, pure CSS keyframes for ambient background — current quiz uses CSS keyframes by design; do not introduce new libs unless the task warrants it.

Add a one-liner under `## Core` in `mem://index.md` plus a `## Memories` entry pointing at the new file. The existing index content is preserved verbatim.

## 2. Audit & normalize `src/index.css`

Targeted, mechanical edits — no visual redesign:

### a) Easing fixes on loop animations
Currently using `linear infinite` where the rule says `ease-in-out`:
- `.occasion-column-rise` (line 2751) — `linear infinite` → `ease-in-out infinite`
- `.occasion-shimmer-fall` (2778) — `linear infinite` → `ease-in-out infinite`
- `.quiz-particle` `particle-rise` / `particle-float` (258, 271) — `linear infinite` → `ease-in-out infinite`
- `.nostalgia-mist` drifts (774, 778, 808) — `linear` → `ease-in-out`
- `.city-blob-drift-*` (971, 976) — `linear` → `ease-in-out`
- `.nostalgia-particle-rise` (833) — `linear infinite` → `ease-in-out infinite`

Keep `linear` on these (intentional uniform sweeps): `.bar-shimmer`, `.finale-btn-shimmer`, `.finale-rain` (gravity drop), `.mist-rotate-drift` (continuous rotation reads better linear).

### b) Add `will-change: transform, opacity`
On particle/floating elements missing it:
- `.finale-rain-drop`, `.finale-burst-particle`, `.finale-keystroke-sparkle`, `.finale-atmos-particle`, `.finale-word-echo`
- `.occasion-rise`, `.occasion-rise-fast`, `.occasion-column-rise`, `.occasion-twinkle`, `.occasion-shimmer-fall`, `.occasion-wind` particle wrappers
- `.longevity-trail`, longevity sparkle/particle classes
- `.quiz-finale-glow`

### c) Reduced-motion coverage
Verify (and add where missing) `@media (prefers-reduced-motion: reduce)` entries for the longevity block (around line 2572+) and the quiz-finale-glow block. Pattern: set `animation: none`, snap to final state (full opacity, final transform).

### d) Color-token consistency
Spot-check the longevity / occasion / finale CSS for stray hardcoded hexes; replace with `var(--anim-gold)`, `var(--anim-gold-bright)`, `var(--anim-ivory)`, or `hsl(var(--bz-gold) / α)` as appropriate. No new colors introduced.

## Out of scope
- No new animations, no choreography changes, no JS/TSX changes (the principles are CSS-level).
- Bottle Lottie swap, Framer/GSAP introduction: not now — flag as future option in memory only.
- Other (non-quiz) pages.

## Verification
After build: walk `/shop/quiz/for-yourself` steps 1 → 10 → results. Confirm visuals look identical to current. Toggle OS "reduce motion" and confirm all quiz animations collapse to static/fade. DevTools → Rendering → Paint flashing: particle layers should stay on their own compositor layer (will-change verification).

## Files touched
- `mem://design/animation-system` (new)
- `mem://index.md` (append one Core line + one Memories entry; rest preserved)
- `src/index.css` (~20 line-level edits across longevity / occasion / finale / quiz-particle / nostalgia / city blocks)
