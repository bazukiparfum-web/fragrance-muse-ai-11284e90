# Color Wheel — Real-Time Atmosphere & Lock-Burst Showstopper

Scope: the `color_picker` question (rendered by `ColorPicker.tsx`). Adds real-time page-wide color reactivity, per-zone atmospheres, drag trail, idle rotation, release-burst, and color hand-off to the progress bar tip and perfume-bottle indicator. Purely additive — no copy/layout/data changes, no new dependencies.

## Files

**Edited**
- `src/components/quiz/ColorPicker.tsx` — wrap in `.color-wheel-root`; add entry spring + slow idle rotation on the wheel; tag thumb with pulsing colored halo; track drag trail; render a fixed `.color-atmosphere-layer` (mist blobs + particle stream + vignette) whose CSS variables `--cw-hue`, `--cw-sat`, `--cw-color` are driven by props; on pointer-up emit a 14-particle release burst from the thumb position and dispatch a `bz:color-locked` `CustomEvent({ hex, hue, sat })`.
- `src/components/quiz/PerfumeBottleProgress.tsx` — add a `useEffect` window listener for `bz:color-locked`; toggle a transient class `is-color-flash` that tints the bottle glow to the chosen color for ~800ms, then returns to gold.
- `src/components/quiz/ImmersiveQuizShell.tsx` — add the same `bz:color-locked` listener on the progress bar wrapper; overlay a brief colored shimmer span (`.progress-tip-flash`) at the leading edge for ~800ms. No layout change.
- `src/index.css` — append keyframes and `.color-wheel-root` / `.color-atmosphere-layer` scoped styles plus reduced-motion fallback.

## Behavior

1. **Entry** — `.cw-wheel` runs `cw-wheel-enter` once: scale 0.7 → 1.03 → 1 + rotate 0 → 360 (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 1200ms ease-out for rotation, 600ms spring for scale; combined). After entry, the wheel switches to `cw-wheel-idle` (rotate 0 → 360 in 30s linear infinite) — paused while dragging via `data-dragging="true"`.
2. **Real-time atmosphere** — `ColorPicker` writes CSS vars on the root every render: `--cw-hue`, `--cw-sat`, `--cw-color: hsl(var(--cw-hue), var(--cw-sat)%, 55%)`. The fixed `.color-atmosphere-layer` (mounted via portal to `document.body` only while this question is on-screen) contains:
   - 2 large blurred radial blobs tinted via `--cw-color`, at ~10% opacity, with 400ms `background-color` transition + slow drift loops.
   - 24 CSS particles re-tinted to `--cw-color` (400ms transition).
   - Edge vignette: `radial-gradient(transparent 50%, var(--cw-color)/0.10 100%)` overlay at low opacity.
3. **Per-zone tuning** — Hue ranges set `data-zone` on the layer (`red|orange|yellow|green|cyan|blue|purple|pink`). Each zone tweaks: particle speed/density via CSS variables, optional zone flourish (yellow gets a one-shot `cw-sunburst` radial pulse when entering; cyan adds an icy shimmer overlay; pink uses `cw-petal-drift` particle path; blue slows particle duration; green adds horizontal sway). Computed in JS via `useMemo(hue → zone)`.
4. **Thumb halo + trail** — Replace the SVG thumb with an HTML element overlaid at the indicator position (absolute, transformed) so we can use `box-shadow` halos:
   - Halo: `box-shadow: 0 0 15px var(--cw-color)` with 1.5s pulse loop.
   - White inner core kept.
   - On pointer move while dragging, push the last 4 thumb positions to a ring buffer rendered as fading colored dots behind the cursor.
5. **Idle rotation** — Whole wheel SVG gets `cw-wheel-idle` 30s linear infinite; paused when `data-dragging="true"` and during the 1.2s entry animation.
6. **Release burst** — On `pointerup`, mount a one-shot `<CWReleaseBurst hue=… sat=… x=… y=…>` that renders 14 absolutely-positioned dots flying outward (random angles, 600–900ms, ease-out, fade). Also dispatches `bz:color-locked` `CustomEvent` with `{ hue, sat, hex }` on `window`.
7. **Progress bar tip flash** — `ImmersiveQuizShell` listens for `bz:color-locked`. Sets `colorFlash` state for 800ms; renders a `.progress-tip-flash` span positioned at the bar's leading edge with `background: linear-gradient(90deg, transparent, var(--flash))` and an 800ms fade. Cleans up via timeout.
8. **Bottle indicator flash** — `PerfumeBottleProgress` listens for the same event and toggles `is-color-flash` for 800ms, swapping the bottle's stroke/filter glow to the chosen color via inline CSS var, then naturally returning to the existing gold tokens. No structural changes.
9. **Saturation slider** — Stays as native range. Add:
   - A pseudo-element on the parent wrapper that runs `cw-shimmer-sweep` along the gradient (linear-gradient overlay translated L→R, 2.4s loop).
   - On `change`, push a small colored dot (using current `--cw-color`) above the thumb that fades over 500ms — handled by re-mounting a single span via a counter state.
   - Slider already drives `saturation`, which already feeds `--cw-sat`; this fulfills the "combine hue + brightness" requirement automatically.

## Keyframes to add in `index.css`

- `cw-wheel-enter` (scale + rotate spring)
- `cw-wheel-idle` (rotate 30s linear infinite)
- `cw-thumb-pulse` (box-shadow pulse 1.5s loop)
- `cw-trail-fade` (opacity + scale fade)
- `cw-blob-drift-a`, `cw-blob-drift-b` (translate loops)
- `cw-particle-rise` (translate + sway with `--sway`)
- `cw-sunburst` (one-shot scale + opacity for yellow zone)
- `cw-icy-shimmer` (cyan zone overlay)
- `cw-release-burst` (per-dot translate + opacity, uses `--deg` and `--dist`)
- `cw-shimmer-sweep` (saturation slider sweep)
- `cw-progress-flash` (progress tip overlay fade)
- `cw-bottle-color-flash` (bottle glow color → gold return over 800ms)
- `@media (prefers-reduced-motion: reduce)` disables wheel rotation, trails, bursts, and particles; keeps the atmosphere as a static low-opacity tint.

## What does NOT change

- Picker math, hue/saturation state, props API, and the existing color preview swatch are untouched.
- No edits to recommendation logic or other questions.
- The `bz:color-locked` event is optional — listeners are isolated; if any is removed the others still work.
