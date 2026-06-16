## Summary
Improve accessibility and mobile layout polish on the merged `HowItWorks` section.

## Changes — `src/components/home/HowItWorks.tsx`

### Accessibility
- Add `aria-labelledby` to the `<section>` and give the `<h2>` a stable `id` so screen readers announce the section name.
- Add `aria-label="Start the fragrance quiz — takes about 2 minutes"` to the CTA `<Link>` so it's clearer than just "Start the Quiz".
- Mark the dashed connector SVG and divider with `aria-hidden="true"` (divider already has it; verify SVG).
- Wrap the 3 step cards in `<ol role="list">` with each card as `<li>` so the sequence (01 → 02 → 03) is semantic, and mark the big decorative number span `aria-hidden`.
- Wrap the 3 outcome icons in `<ul role="list">` with `<li>` children; give each icon `aria-hidden` and rely on the visible label as the accessible name.
- Add `aria-label="What you'll receive"` to the outcomes container (or use the visible eyebrow as an `aria-labelledby`).
- Add a visible focus ring to the CTA: append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bz-gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]`.
- Add `focus-visible:ring-2 ...` style to each step card. Since cards aren't currently interactive, do **not** make them focusable — only add the focus style if they remain non-interactive elements (skip otherwise to avoid fake interactivity).
- Trust-badge row: wrap in `<ul role="list" aria-label="Order benefits">` with `<li>` children; hide the `·` separators with `aria-hidden`.
- Reassurance line: leave as `<p>`, already readable.

### Mobile layout
- Step cards already stack via `grid md:grid-cols-3` (single column on mobile). Refine the **vertical dashed connector** on mobile:
  - Position it precisely behind the icon-circle column (left edge of the icon, ~`left-[calc(2.5rem+1.75rem)]` ≈ centered on the 14×14 icon inside `p-10` padding). Use `left-[68px]` (40px padding + 28px half of 56px icon = 68px) and span `top-20 bottom-20` so the line connects icon centers rather than card edges.
  - Use `border-l` with `border-dashed border-[hsl(var(--bz-gold)/0.25)]` and `z-0`; ensure cards sit on `z-10` so border doesn't bleed through.
- Trust badges: change `flex flex-wrap` so on mobile they wrap to two lines naturally — hide the `·` separators on mobile (`hidden sm:inline` is already there ✓), keep `gap-y-2` so wrapped lines have breathing room. Confirm `justify-center` so the wrapped second line stays centered.
- Outcome icons: already `flex flex-row` and stay in a single row on mobile — confirm `gap-4 sm:gap-12` and prevent label wrap squashing by capping each item to `flex-1 min-w-0` (already flex-1). No changes needed beyond verifying.
- CTA on mobile: already `w-full sm:w-auto`. Keep.

## Out of scope
No content, copy, or visual-design changes beyond the accessibility attributes, focus ring, and mobile connector/badge refinements above. No edits to other components or pages.