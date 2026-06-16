## Verification results

Checked the live preview at three breakpoints and inspected the bottle/label region for each.

### 1024 × 900 (tablet/laptop breakpoint)
- All three bottles render with gold cap fully visible and base (lemon/leaf props) uncut.
- Side bottles `210px → 170px` and center `230px` from the `≤1024px` media query — no overflow into heading or CTAs.
- Label sits inside the dark face plate, but visually it reads a touch high — closer to the top edge of the plate rather than centered on it.

### 768 × 1024 (tablet portrait — side bottles hidden)
- Center bottle scales to `min(82vw, 300px)`. Cap and base both fully visible.
- Heading, subtext, BEST MATCH badge, bottle, name tag, and CTA buttons stack cleanly with no overlap.

### 390 × 844 (phone)
- Same single-bottle layout. Cap fully visible, base uncut, full reflection visible.
- Label `42% / top:60%` sits on the upper portion of the dark plate, not centered on it. The plate's vertical center is closer to `~68–70%` of the image wrap.
- CTA row stacks (full-width buttons). No collision with bottle or heading.

### Overlap check (all sizes)
- Hero heading → bottles: clean gap (`bottles-row { margin-top: 24px }` plus `BEST MATCH` badge spacer).
- Bottles → CTAs: `hero-cta-row { margin-top: 24px }` keeps them clear; on mobile the stacked CTAs sit well below the name tag.
- No element overlaps the heading or buttons at any tested size.

## Proposed adjustment (single CSS tweak)

The crop and sizing are correct; only the label vertical position needs a nudge so it visually centers on the dark plate at every size.

In `src/components/Hero.tsx`, update `.label-wrap`:

```css
.label-wrap {
  top: 68%;        /* was 60% */
  width: 42%;      /* unchanged */
}
```

No other rules change. Width stays at 42% because text length ("Signature Essence", "Timeless Harmony", "Modern Classic") fits inside the plate without crowding at both 280px and 210px wraps, and scales proportionally on the mobile `min(82vw, 300px)` wrap.

### Re-verification after change
Re-screenshot at 1024, 768, and 390 and confirm:
- Cap still fully visible (no change — label move doesn't affect crop).
- Label visually centered on the dark plate at all three sizes.
- No overlap with name tag below (the name tag sits outside `.bottle-img-wrap`, so moving the label inside the wrap cannot collide with it).

## Out of scope
- No changes to bottle image, label SVG, fragrance names, colors, animations, or other sections.
- No changes to `BazukiLabel.tsx`, atmosphere glows, or CTA styling.
