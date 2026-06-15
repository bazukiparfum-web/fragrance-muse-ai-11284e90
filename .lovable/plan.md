## Goal

Fix the messy double-label overlay on the hero bottle (the small "Signature Essence" cards floating on/beside the bottle) and bring the four note tags (Vetiver, Bergamot, Oud, Rose Absolute) to life with both drifting motion and rotating note names.

## Changes

### 1. `src/components/Hero.tsx`
- Remove `<BottleLabels />` from the bottle wrap and drop its import. The bottle image already contains its own printed label — no SVG overlay needed.
- Replace the static `NOTE_TAGS` rendering with a small `<FloatingNoteTag />` component that:
  - **Drifts**: each tag gets its own keyframe path (`bz-drift-1..4`) translating ±10–18px on X and ±8–14px on Y over 8–14s `ease-in-out infinite`, with unique delays so they're out of phase. Existing `bz-bob` is replaced by per-tag drift.
  - **Cycles text + emoji**: every 3.5s the tag's label fades out (200ms), swaps to the next note from a curated pool, and fades back in. Each tag starts at a different index in the pool so they never show the same note simultaneously.
  - Pauses cycling and drift on `:hover` (`animation-play-state: paused`) so users can read.
  - `prefers-reduced-motion`: disables drift; text cycling interval becomes 8s with instant swap (no fade).
- Curated pool (matches existing emoji families):
  - Greens 🌿: Vetiver, Basil, Mint, Fig Leaf
  - Citrus 🍊: Bergamot, Neroli, Yuzu, Mandarin
  - Woods 🪵: Oud, Sandalwood, Cedarwood, Patchouli
  - Florals 🌸: Rose Absolute, Jasmine, Peony, Iris
  - Each tag stays within its family so the emoji always matches the label.

### 2. `src/components/hero/BottleLabels.tsx`
- Leave the file in place (still exported with prop API for future reuse) but no longer rendered on the hero. No code changes needed beyond the Hero import removal.

## Out of scope
Bottle photo, headline, CTAs, marquee, orbs, grain, and all other homepage sections stay untouched.

## Verification
Screenshot the homepage at desktop (1440), tablet (1024), and mobile (414) to confirm: bottle image is clean (no SVG label cards), all four tags drift gently, and labels rotate through their family pool every ~3.5s without overlapping the bottle.
