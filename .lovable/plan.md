# Identity Question — Per-Option Celebratory Animations

Scope: the radio question with `answer_key: 'gender'` ("Which gender do you identify with?"). Options: **Woman, Man, Transgender, Non-binary/non-conforming, Prefer not to respond** (the 5th option gets an equally warm treatment per requirement #7). Purely additive — no copy, layout, or data changes.

## Approach

Mirror the nostalgia pattern. Add a `gender` branch to `QuestionRenderer` that swaps in a dedicated component which owns its own option layout, per-option particles, card glow, flourish, and a fixed ambient layer. Generic radio path stays untouched.

## Files

**New**
- `src/components/quiz/IdentityOptions.tsx` — wraps the 5 radio options with Label + RadioGroupItem (preserves existing border/glow tokens), word-by-word heading entry, cascade-up option entry, hover shimmer, dim-unselected behavior, per-option particle stream, card inner glow, radio-button flourish, and a fixed `.identity-env-layer` rendering the option-specific atmosphere with 300ms cross-fade.

**Edited**
- `src/components/quiz/QuestionRenderer.tsx` — add `if (question.answer_key === 'gender')` branch before the generic radio case, rendering `<IdentityOptions ... />`.
- `src/index.css` — append keyframes & utility classes scoped under `.identity-root`, plus a `prefers-reduced-motion` block.

## Per-option behavior (all equally rich)

| Option | Particles | Card inner glow | Radio flourish | Background atmosphere |
|---|---|---|---|---|
| Woman | Soft rose-gold dots (#E8A0A0, #F5C7C7, #C9A84C), gentle upward drift with sway | Rose-gold inner shadow (~15% tint) | Gentle pulse-in fill (scale 0.6→1 + opacity) | Wide floral-bloom radial gradient at ~5% opacity, slow rotate |
| Man | Deep amber-gold dots (#B8862E, #C9A84C, #E0B355), steady upward rise, minimal sway | Rich warm amber inner shadow | Single clean ripple ring | Warm cedar/sandalwood-toned mist wisp drifting L→R |
| Transgender | Light blue (#5BCEFA), pink (#F5A9B8), white (#F5F0E8) particles in equal mix, gentle upward drift | Multi-tone glow that slowly shifts between blue and pink (8s loop) | Soft 3-color radial pulse | Aurora-like color shift gradient at ~4% opacity (slow blue↔pink hue cycle) |
| Non-binary/non-conforming | Gold (#C9A84C) + purple (#A78BFA) particles in two interweaving streams | Gold + purple dual-tone inner shadow | Cosmic sparkle burst from the radio dot | Deep purple-gold cosmic mist + 8 floating ✦ stars fading in/out around card edges |
| Prefer not to respond | Soft cream-gold (#F5F0E8, #C9A84C) particles, calm even cadence | Soft warm-cream inner glow | Gentle 2-ring pulse | Even soft cream glow (low-intensity wide gradient) |

All atmospheres mount/unmount via opacity transitions (300ms) when selection changes, so switching cross-fades cleanly.

## Page entry & global states

- Heading: split `question.question_text` into word spans; each fades up (opacity 0→1, translateY 20→0) with 80ms stagger.
- Options: cascade up from bottom (translateY +20→0, opacity 0→1) with 120ms stagger per option.
- Hover (all options): gold shimmer sweep L→R (400ms) + border brightens from `border-gold` to `border-gold-strong`.
- Dim non-selected: when any option is selected, the others transition to `opacity: 0.6` (300ms); selected option stays at 1.

## Keyframes to add in `index.css`

- `identity-word-rise` (opacity + translateY)
- `identity-option-rise` (translateY +20→0 + opacity)
- `identity-shimmer-sweep` (linear-gradient sweep)
- `identity-particle-rise` (generic upward drift with `--sway` var)
- `identity-radio-pulse-in` (scale 0.6→1 + opacity, for Woman)
- `identity-radio-ripple` (scale 0→3, opacity fade, for Man / Prefer-not)
- `identity-radio-tri-pulse` (3 colored rings for Transgender)
- `identity-cosmic-sparkle` (radial sparkle burst for Non-binary)
- `identity-star-twinkle` (✦ stars opacity loop for Non-binary)
- `identity-aurora-shift` (background-position + hue cycle)
- `identity-mist-drift` (translateX wisp)
- `identity-bloom-rotate` (slow rotate of floral bloom)
- `identity-glow-shift-tg` (Transgender card glow color cycle)
- `prefers-reduced-motion` fallback disables all animations and hides particle layers.

## What does NOT change

- No edits to other questions, the shell, or any tokens.
- `RadioGroup` semantics, value handling, and existing `border-gold` / `glow-gold-sm` tokens preserved.
- Existing global `QuizBackground` and shell transitions untouched; ambient atmosphere sits above them at low opacity.
