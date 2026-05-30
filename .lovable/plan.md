## Scent Families — living micro-world per card

Replace the inline `scent_family` block in `QuestionRenderer.tsx` with a dedicated component so each family card carries its own animated atmosphere. Multi-select layering is preserved.

### New file
`src/components/quiz/ScentFamilyOptions.tsx`

Props:
- `families: { value: string; emoji: string }[]` (passed from QuestionRenderer's existing `SCENT_FAMILIES` constant)
- `selected: string[]`
- `onToggle: (value: string) => void`

### Per-card structure
Each card is a `<button>` with:
- `bloom-in` entry animation (scale 0.8→1 + opacity 0→1, 500ms ease-out, fill `both`), `animationDelay = index * 80ms`.
- Selection state drives a CSS class `family-card--<key>` (e.g. `family-card--floral`), which controls inner-glow color (token-based, HSL).
- A per-card emoji wrapper with family-specific keyframe when selected (`floral-spin`, `woody-grow`, `fresh-oscillate`, `oriental-pulse`, `gourmand-wobble`, `spicy-shake`, `herbal-sway`).
- A per-card overlay layer (absolute, pointer-events-none) hosting local particles/ripples for that family — only mounted while selected; on deselect it stays mounted for a 300ms `fade-out` then unmounts via state.

### Family signatures (local layer only)

- **Floral** — 6 pink/white petal spans floating upward (`petal-rise`, 2.4s loop, staggered). Rose-pink inner glow via `box-shadow: inset 0 0 40px hsl(340 70% 65% / 0.25)`. Emoji `floral-spin` (rotate 0→360°, 600ms ease-out, once).
- **Woody** — 6 dark-green needle particles drifting up (`needle-rise`). Inner amber/brown glow. Emoji `woody-grow` (scale 1→1.2→1, 700ms).
- **Fresh** — 3 concentric ellipses expanding outward (`fresh-ripple`, 2.4s loop, 800ms stagger). 5 aqua droplet sparkles (`droplet-fall`). Cool blue-teal inner tint. Emoji `fresh-oscillate` (rotate ±8°, 1.2s loop).
- **Oriental** — 10 amber/purple sparkles in starburst (`oriental-spark`, rotated-parent + child translateY 0→-70px, 1.2s loop). Deep amber/burgundy inner glow. Emoji `oriental-pulse` with golden halo (radial-gradient overlay).
- **Gourmand** — 8 pastel confetti dots sprinkling downward (`confetti-fall`). Caramel/vanilla inner glow. Emoji `gourmand-wobble` (rotate ±5°, 400ms loop).
- **Spicy** — 8 orange/red embers rising (`ember-rise`, randomized horizontal jitter). Red-orange inner glow. Emoji `spicy-shake` (translateX ±2px, 300ms, then settles — runs only when newly selected, then once-per-select via key). Subtle heat-wave on card: `backdrop-filter: blur(0.5px)` cycled via `heat-wave`.
- **Herbal** — 6 fresh green leaves swaying upward (`leaf-rise` with horizontal sway). Forest-green inner glow. Emoji `herbal-sway` (rotate ±10°, 1.6s loop).

### Background atmosphere (body-portal, shared)
A new `ScentFamilyAtmosphere` component renders one fixed-position pointer-none layer that mounts a "global mist wisp" per selected family. Each wisp is a large blurred radial gradient at a deterministic offset, fading in over 600ms and out over 300ms on deselect. With multiple selections, multiple wisps layer naturally (additive blending via `mix-blend-mode: screen`). Wisp colors:
- Floral: rose-pink
- Woody: warm brown
- Fresh: aqua
- Oriental: deep amber
- Gourmand: caramel
- Spicy: red-orange
- Herbal: forest green

### Bottle sparkle burst
On any selection change (selected array length increases), dispatch a `window` CustomEvent `bz:scent-family-selected`. `PerfumeBottleProgress.tsx` (already in tree) can listen and trigger an existing sparkle effect — if no such hook exists, add a lightweight listener inside the bottle component that flips a `sparkle` key for 500ms. (Scope: only add listener; reuse existing `ProgressSparkleBurst` if exported.)

### Deselect
- Track `exitingFamilies: Set<string>` in component state. On toggle-off, add to set, schedule `setTimeout(remove, 300)`. Local overlay and atmosphere wisp both apply `family-fade-out` (opacity 1→0, 300ms) while in the exiting set.

### Wire-up
In `QuestionRenderer.tsx`, replace the existing `case 'scent_family'` block body with:
```tsx
return wrap(
  <ScentFamilyOptions
    families={SCENT_FAMILIES}
    selected={selected}
    onToggle={toggle}
  />
);
```
(The `SCENT_FAMILIES` constant and `selected` / `toggle` helpers already exist in the case.)

### CSS (src/index.css, appended after personality block)
Add keyframes + utility classes:
- `bloom-in`, `family-fade-out`
- `petal-rise`, `needle-rise`, `droplet-fall`, `confetti-fall`, `ember-rise`, `leaf-rise`
- `fresh-ripple`, `oriental-spark`, `heat-wave`
- Emoji animations: `floral-spin`, `woody-grow`, `fresh-oscillate`, `oriental-pulse`, `gourmand-wobble`, `spicy-shake`, `herbal-sway`
- Inner-glow utility classes `.glow-floral`, `.glow-woody`, `.glow-fresh`, `.glow-oriental`, `.glow-gourmand`, `.glow-spicy`, `.glow-herbal` (all `box-shadow: inset ...` with HSL).
- All animations gated by `prefers-reduced-motion` (animations off, glows + selected border still apply).

### Out of scope
- No edits to `SCENT_FAMILIES` data, no business logic changes.
- No changes to other question types or progress bar.
- Bottle sparkle hook only added if `PerfumeBottleProgress` has no existing listener — otherwise just dispatch the event.
