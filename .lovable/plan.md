Polish hero subheadline typography and add responsive line-break controls so the new copy never crowds the bottle row or CTAs on small screens.

### Current issue
The `.hero-subtext` block uses a fixed `16px` / `line-height: 1.7` with no mobile refinement. On a 390 px viewport the sentence wraps into 3-4 tall lines, pushing the bottle and CTAs downward and risking overlap on very short viewports. No `letter-spacing` is set, so the copy lacks the tight editorial rhythm expected from a luxury fragrance brand.

### What will change (all in `src/components/Hero.tsx`)

1. **Luxury typography polish**
   - Add `letter-spacing: 0.03em` for refined editorial feel.
   - Tighten `line-height` from `1.7` → `1.6` (desktop) and `1.5` (mobile) so the block stays compact without feeling cramped.
   - Scale `font-size` with `clamp(14px, 1.2vw + 11px, 16px)` so it drops to `14 px` on narrow screens while staying `16 px` on desktop.

2. **Responsive safe sizing**
   - Cap `max-width` at `480 px` on desktop and `340 px` on mobile (`max-width: 480px` default, `@media (max-width: 768px)` override to `340px`).
   - This forces the sentence to break into 2 clean lines on desktop and 3 short but balanced lines on mobile instead of 4+ ragged ones.

3. **Explicit line-break control**
   - Insert a `<br className="mobile-break" />` before the final clause "Just like you." so that phrase can sit on its own line when width permits, preventing orphan words.
   - The `<br>` will be hidden on desktop (`display: none` above 768 px) so the sentence flows in its natural wrap there.

4. **Guaranteed safe vertical spacing**
   - Change subtext margin from `margin: 16px 0 0` to `margin: 16px 0 8px`.
   - Keep `.bottles-row { margin-top: 24px; }` on desktop, but raise it to `margin-top: 28px` inside the `max-width: 768px` media query.
   - Result: at least `8 px` breathing room between the text block and the bottle row, and `28 px` on mobile, ensuring no collision even when the viewport is vertically short.

### Verification
After edits, screenshots will be captured at 1280 px, 768 px, and 390 px to confirm:
- Subtext never touches or overlaps the bottle image or CTA buttons.
- Line breaks look intentional and balanced.
- Font rhythm feels premium on both desktop and mobile.