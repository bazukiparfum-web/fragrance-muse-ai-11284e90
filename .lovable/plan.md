# Personality DNA — Slider Showstopper

Transform the 4-trait personality question into an animated "perfumer's bench" where each slider is an ingredient and the background reacts to the combined values.

## Files to change

### 1. `src/components/quiz/QuestionRenderer.tsx`
- In the `personality_sliders` case, render `<PersonalitySliders>` without the shared `wrap()` (which provides the static `<h2>`). Pass `questionText` and `helperText` props so the component can own the typewriter heading.
- All other question types keep using `wrap()` unchanged.

### 2. `src/components/quiz/PersonalitySliders.tsx` (full rewrite)
- **Typewriter heading**: new `useTypewriter(text, 40)` hook reveals the question text char-by-char; trailing caret (`▎`) blinks until done. Falls back to full text under `prefers-reduced-motion`.
- **Cascading row entry**: each row gets `.pds-row` with `style={{ animationDelay: `${300 + i*150}ms` }}` (heading-finish delay + 150ms stagger). Keyframe `pds-slide-in` does `translateX(-30px) → 0`, opacity `0 → 1`.
- **State refs**:
  - `draggingId: string | null` (set on `onPointerDown` of slider root, cleared on `onPointerUp`/`onLostPointerCapture`).
  - `touched: Set<traitId>` (added on first change). When `touched.size === traits.length` AND not yet crystallized, trigger crystallize flag for 900ms → triggers `.pds-crystallize` class on each track with `animationDelay: i*100ms`.
  - `releaseBurstKey` map per trait — bumped on pointer up to remount a `.pds-release-ripple` span.
  - `trailKey` per trait — bumped during `onValueChange` while dragging to mount up to 3 short-lived `.pds-trail-dot` spans behind the thumb (auto-clean via `setTimeout`).
- **Per-row markup**:
  - `<label class="pds-label" data-active={draggingId===id}>` — gold glow when active.
  - `<div class="pds-track-wrap" data-touched=...>`:
    - Slider with custom `[&_[role=slider]]:` classes for idle pulse (`.pds-thumb-idle` with `animation-delay: ${i*0.4}s`), drag-grow (`data-dragging` selector → scale 1.2), release ripple span overlay.
    - Filled range gets `.pds-fill-shimmer` (gold gloss sweep, 2.5s infinite).
    - Crystallize sweep overlay activated by parent flag.
  - End labels `<span class="pds-end pds-end-left" data-glow={value<50}>Not at all</span>` and `<span class="pds-end pds-end-right" data-glow={value>=50}>Very much</span>` — cool silver vs warm amber glow via CSS.
- **Atmosphere dispatch**: `useEffect` on `values` computes:
  - `talkative`, `reserved`, `quiet`, `shy` (look up by trait id; fall back to traits[0..3] order).
  - `energy = (talkative - reserved - quiet)/100` clamped, drives **count** (10–50) and **speed**.
  - `containment = (reserved + shy)/200` drives **spread** (centered ↔ wide).
  - Dispatches `window.dispatchEvent(new CustomEvent('bz:personality-atmos', { detail: { count, speed, spread, energy, shy } }))` (debounced via `rAF`).
- **Local atmosphere portal**: a fixed `.pds-atmosphere` layer (rendered via `createPortal` into `document.body`, behind quiz content with `z-index: 0`, `pointer-events: none`) renders N=`count` particle spans. Each particle uses CSS vars `--pds-speed`, `--pds-spread`, `--pds-shy` to modulate drift duration, lateral range, and inward bias. Re-render only when bucketed count changes (round to 5) to avoid thrash.

### 3. `src/index.css` (append)
- Keyframes: `pds-slide-in`, `pds-caret-blink`, `pds-thumb-pulse` (scale 1→1.08→1, 2s), `pds-fill-shimmer` (background-position sweep), `pds-release-ripple` (scale 0→2.4, opacity 0.7→0, 300ms), `pds-trail-fade` (opacity 1→0, translate small offset, 500ms), `pds-crystallize-sweep` (gradient mask left→right, 600ms), `pds-particle-drift` (translate + sway using `--pds-spread`/`--pds-shy`), `pds-label-glow`.
- Utility classes:
  - `.pds-row` (opacity:0, applies `pds-slide-in` 500ms ease-out forwards).
  - `.pds-heading` font-display sizing matching shared heading.
  - `.pds-caret` blink 800ms.
  - `.pds-label[data-active="true"]` → `text-shadow: 0 0 12px hsl(var(--gold)/0.8); color: hsl(var(--gold));`.
  - `.pds-thumb-idle` (applied to Slider thumb) → `animation: pds-thumb-pulse 2s ease-in-out infinite`; `[data-dragging="true"] .pds-thumb-idle` → `transform: scale(1.2); animation: none;`.
  - `.pds-fill-shimmer` overlays gradient on `[data-orientation=horizontal] > .relative` (the Range). Implement by adding a child `<span class="pds-fill-shimmer" />` absolutely positioned inside the slider track using `[&_[data-orientation]]` selectors, or just add a sibling pseudo via class on the Slider root.
  - `.pds-end[data-glow="true"].pds-end-left` → silver glow; `.pds-end-right` → amber glow.
  - `.pds-atmosphere`, `.pds-particle` with CSS variable-driven animation.
- All animations gated by `@media (prefers-reduced-motion: reduce)` → disable transforms/loops, keep static styles.

## Technical notes
- Use the existing `Slider` component; wrap with a div carrying `data-dragging`, `onPointerDown/Up` to capture drag state without modifying shadcn primitive.
- `bz:personality-atmos` is namespaced like the existing `bz:color-locked` event so other components could optionally subscribe later — no consumer required now.
- No backend, schema, or quiz-flow logic changes.

## Out of scope
- Other question types, quiz navigation, scoring, recommendations.
