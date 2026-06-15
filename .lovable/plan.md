
## Problem
1. **Bottle silhouettes invisible.** The uploaded teal bottle photo has a near-black background (~#0A0805) that matches the hero background, so the glass body and cap blend in. Only the gold label and the teal mist at the base remain visible — making the bottles read as "missing."
2. **Mobile verification.** Spec says only the center bottle shows under 768px. Current CSS already does this (`.bz-bottle-side { display: none }` in the `@media (max-width: 767px)` block) so the behavior is correct — but spacing and the CTA stack could be tightened.

## Fix

### `src/components/Hero.tsx`
- Add `mix-blend-mode: screen` to `.bz-bottle-img`. Screen blend drops every black pixel of the source photo to transparent against the dark hero, revealing the full teal glass body, gold cap, lime/jasmine props, and teal smoke. Labels stay sharp because they're a separate SVG layered above (z-index 2) outside the blend.
- Belt-and-braces: also raise `.bz-bottle-img` brightness slightly (`filter` chain gains `brightness(1.05)`) so the glass pops against the blurred ambient background without washing out.
- Wrap `.bz-bottle-inner` with `isolation: isolate` so the screen blend composites only against the bottle's own glow/backdrop, not the page header behind it.

### Mobile tightening (same file, existing `@media (max-width: 767px)` block)
- Center the lone bottle vertically with a smaller `gap` between the text block and the bottle (48px → 32px) so the hero fits one viewport on short phones.
- Reduce hero content top padding on mobile from 96px to 80px (header clearance only).
- Ensure CTA buttons stretch full-width on mobile (already done) and confirm `text-align: center` cascades — add `text-align: center` to `.bz-hero-content` as a safety net.
- Keep headline `clamp(36px, 6vw, 60px)` — already responsive.

## Verification
- Re-check the preview at desktop, tablet (768–1024), and mobile (<768) viewports. Confirm:
  - Desktop/tablet: 3 visible bottle silhouettes with glass, cap, smoke, labels — center larger.
  - Mobile: only center bottle, headline/sub/CTAs centered in column with no horizontal overflow.

## Out of scope
- Bottle image itself is not re-processed or re-uploaded; the blend-mode handles the dark backdrop at render time.
- No other components touched.
