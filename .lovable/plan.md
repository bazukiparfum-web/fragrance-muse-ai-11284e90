## Goal

Redesign `src/components/quiz/QuizCraftingScreen.tsx` so the AI-processing screen (shown between quiz completion and results) feels like watching the Bazuki machine physically assemble the user's formula. Text content and existing routing/timing stay intact — this is additive visual/animation work on the same dark `bg-bz-primary` background.

## Files

- **NEW** `src/components/quiz/crafting/BazukiMachineSVG.tsx` — inline SVG silhouette (top rail, 18 hanging vials, side uprights, conveyor, monitor with scanline, bottle on conveyor). Exposes refs so the parent can drive per-vial highlight + drop + splash animations. Static frame uses dark gold (`#8B6914`) at 15% opacity with upward fade mask. Idle: 6s breath scale (1→1.005), 4s ambient halo pulse.
- **NEW** `src/components/quiz/crafting/CraftingParticleCanvas.tsx` — single `<canvas>` particle system: 60 ambient gold/ivory particles with slow clockwise drift, periodic 8-particle bursts from active vial (via prop), 3–4 large low-opacity mist puffs. RAF-driven, paused under `prefers-reduced-motion`.
- **NEW** `src/components/quiz/crafting/NotesScanningText.tsx` — slot-machine note scanner: 200ms cycle through curated note list (Bergamot, Jasmine, Vetiver, Sandalwood, Rose, Oud, Amber, Cedar, Musk, Neroli, Vanilla, Patchouli, Iris, Ylang, Cardamom). Every ~3.5s "locks" a note (scale 1→1.1, brighten to `--anim-gold-bright`, ✦ + 3-particle burst). Stacks up to 3 locked notes below at 0.85 scale.
- **NEW** `src/components/quiz/crafting/PhaseStatusText.tsx` — rotating 7-message sequence on 2.5s cadence with fade+slide crossfade.
- **NEW** `src/components/quiz/crafting/FormulaProgressBar.tsx` — 2px gold bottom-of-screen bar that fills smoothly to 100% over the lifetime, with shimmer overlay and a 12px bottle icon riding the leading edge. Renders "Formula: NN% complete" tickered text using monospaced flips.
- **EDIT** `src/components/quiz/QuizCraftingScreen.tsx` — orchestrate all of the above, drive vial activation schedule (every 1.8s single vial + every 6s 3–4 vial burst), keep existing `role="status"` + dark `bg-bz-primary` + existing text "Bazuki AI is crafting your scent profile…", but apply typewriter intro, shimmer loop on the heading, and animated ellipsis. Trigger the 2.5s finale sequence when the parent signals completion (or when an internal max-duration timer hits 100%), then dispatch a `bz:crafting-complete` event the existing parent flow can wire to results navigation. Until that wiring is touched, the finale still plays purely visually and the component remains drop-in compatible.
- **EDIT** `src/index.css` — add keyframes/utility classes scoped under `.crafting-*`:
  - `.crafting-machine-breath`, `.crafting-machine-halo`
  - `.crafting-vial-active`, `.crafting-drop-fall`, `.crafting-splash-ring`, `.crafting-droplet-spark`
  - `.crafting-bottle-slide`, `.crafting-bottle-fill`, `.crafting-liquid-wave`
  - `.crafting-heading-shimmer`, `.crafting-ellipsis-dot` (3 staggered)
  - `.crafting-note-lock`, `.crafting-note-stack-shrink`
  - `.crafting-phase-enter`, `.crafting-phase-exit`
  - `.crafting-progress-shimmer`, `.crafting-digit-flip`
  - `.crafting-finale-flash`, `.crafting-finale-vial-wave`, `.crafting-finale-mist-exit` (4 layered)
  - All animations use existing tokens (`--anim-gold` #C9A84C, `--anim-gold-bright` #F0C040, `--anim-ivory` #F5F0E8, `--anim-amber` #1A1408), `will-change: transform, opacity` on every animated element, ease-out enters / ease-in exits / ease-in-out loops, durations within 200–800ms or 2–60s.
  - One `@media (prefers-reduced-motion: reduce)` block collapses everything: hide machine/canvas/particles, keep heading + a single pulsing gold dot loader, freeze phase text to first message + 1s simple fade per change.

## Behavior contract

- Vial activation: never repeat the previous vial. State held in a `useRef<number>`.
- Bottle position: tweens to active vial's x via inline `transform: translateX(...)` + 500ms cubic-bezier; drop emits after slide completes.
- Bottle fill level: increments ~3% per single drop, ~10% per burst, clamped to 92% pre-finale (finale fills the last 8% in one cascade).
- Particle bursts hook into the same vial schedule via a callback prop the canvas consumes (lightweight ref signal — no React re-renders per drop).
- Total max loading duration: 18s safety cap. If parent unmounts earlier, all RAF / intervals teardown in `useEffect` cleanups.
- No new dependencies — pure React + SVG + canvas + CSS.

## Performance + a11y guardrails

- Particles, drops, and shimmer reflections live on the canvas / pseudo-elements (no per-frame React state).
- Machine SVG inlined once; per-vial state toggled via CSS class on each `<g>` (cheap GPU-only transforms).
- `prefers-reduced-motion`: machine, canvas, drops, notes scanner, finale, and mist exit are all disabled — heading + first phase message + pulsing dot only.
- All gold colors via CSS vars, no hardcoded hex in components.

## Out of scope

- No text content changes beyond the 7 phase messages already specified by the user.
- No changes to results page, quiz navigation, or completion logic — only an optional `bz:crafting-complete` event is dispatched, existing callers keep working as-is.
- No new libraries (Framer Motion / GSAP / Lottie not introduced).
- No design exploration round — spec is fully concrete; will implement directly on approval.

## Verification

- Walk `/shop/quiz/for-yourself` → finish quiz → confirm crafting screen plays full sequence end-to-end on desktop (1067×672) and mobile widths.
- Toggle OS "Reduce motion" and confirm fallback: only heading + dot loader + first phase message visible, no canvas/svg activity.
- DevTools Performance: confirm long-task free, paint flashing shows canvas + finale overlay on isolated compositor layers.
- Screenshot before/after for the user.
