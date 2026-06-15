Remove all animation from the bottle image and its glow halo in `src/components/Hero.tsx`, restricting motion to only the `FloatingNoteTag` components.

**`src/components/Hero.tsx`**
1. Remove `animation: "bz-bob 6s ease-in-out infinite"` from the bottle `<img>` inline style (keep the `drop-shadow` class).
2. Remove `willChange: "transform"` from the bottle `<img>`.
3. Remove `animation: "bz-bottle-glow 6s ease-in-out infinite"` from the glow halo `<div>` behind the bottle. Replace with a static equivalent: keep the same `background` and `filter` values but drop the animation property.
4. Remove `@keyframes bz-bob` and `@keyframes bz-bottle-glow` from the scoped `<style>` block (no longer referenced).

**`src/components/hero/FloatingNoteTag.tsx`** — no changes. Drift keyframes and text cycling remain scoped to this component.

**Out of scope:** bottle image asset, headline, CTAs, marquee, orbs, grain, scroll indicator, and all other homepage sections.

**Verification:** Screenshot at desktop and observe for ~5s to confirm the bottle and its glow are perfectly still while the four note tags continue to drift and swap labels.