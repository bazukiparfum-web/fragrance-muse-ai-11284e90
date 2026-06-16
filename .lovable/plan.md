## Goal
Add a compact "Trusted By" silent logo marquee directly below the Hero on the homepage, using the existing `CLIENT_LOGOS` data.

## Approach
The existing `TrustedByCarousel` component is too tall (64–80px vertical padding + visible heading + eyebrow lines + 56px logos ≈ 200px+) and doesn't match the requested 80px-total compact strip. Rather than mutate it (used on About + Business), create a new lightweight component sized exactly to the spec.

## Changes

### 1. New component: `src/components/home/TrustedByStrip.tsx`
A compact homepage-only marquee:
- Full-width `<section>`, background `#0A0805`, total height **80px**
- Top + bottom border: `1px solid rgba(201,168,76,0.1)`
- Centered "TRUSTED BY" label above marquee:
  - Cinzel, 9px, letter-spacing 4px, color `#8B6914`
  - Thin gold horizontal lines on either side (matching `tb-eyebrow-line` style: `rgba(201,168,76,0.5)`, 40px wide, 1px tall)
- Marquee:
  - Imports `CLIENT_LOGOS` from `@/data/clientLogos`
  - Duplicates the array (`[...logos, ...logos]`) for seamless loop
  - 35s infinite linear left-scroll via `@keyframes` (translateX 0 → -50%)
  - Logos: `grayscale(100%) brightness(1.8) opacity(0.5)` at rest; `grayscale(0%) opacity(1)` on hover with 300ms transition
  - Left/right edge fade via CSS `mask-image` linear gradient
  - Pause animation on hover of the track
  - `prefers-reduced-motion`: disable animation, show static row
- Logo height tuned small (~24–28px) so label + marquee fit inside 80px total
- Scoped `<style>` block (consistent with existing pattern in `TrustedByCarousel.tsx`)

### 2. `src/pages/Index.tsx`
- Import `TrustedByStrip`
- Render `<TrustedByStrip />` between `<Hero />` and `<QuizResultPreview />`

## Out of scope
- No changes to existing `TrustedByCarousel` (still used on About/Business)
- No new logo assets
- No changes to Hero, QuizResultPreview, or any other section
