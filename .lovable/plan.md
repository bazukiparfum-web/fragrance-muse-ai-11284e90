## FragrancePyramid component

Create `src/components/FragrancePyramid.tsx` — a reusable, embeddable visualization of a fragrance's three note layers.

### Props

```ts
interface Note { name: string; description: string }
interface FragrancePyramidProps {
  topNotes: Note[];
  heartNotes: Note[];
  baseNotes: Note[];
  size?: "sm" | "md" | "lg";   // default "md" — for product cards vs results screen
  className?: string;
}
```

### Visual structure

SVG-based pyramid (scales cleanly, sharp edges) with 3 horizontal trapezoidal bands stacked from apex to base:

```text
       ▲           Top    — pale gold  #F5E6C8  (~25% height, narrowest)
      ▲▲▲          Heart  — amber      #C9A84C  (~35% height, mid)
     ▲▲▲▲▲         Base   — deep brown #6B3F1A  (~40% height, widest)
```

Each band rendered as an SVG `<polygon>` with the corresponding fill. A label ("TOP", "HEART", "BASE") sits inside or beside each band in Cormorant Garamond small caps gold, and the comma-joined note names render as Inter body text overlaid on the band (auto-contrast: dark text on the pale-gold top, cream text on amber + brown).

Beside (right of) the pyramid on `md`/`lg` sizes, a vertical legend lists each layer's notes as pill tags (`rounded-pill border-gold/30`). On `sm` (product card embed), the legend collapses and only in-band names show.

### Interaction

- Hover/tap a band → band gets a warm gold glow (`box-shadow: 0 0 32px hsl(var(--bz-gold) / 0.45)`), opacity bump, and a Radix Tooltip / Popover anchored to the band shows a list of `{name — description}` for every note in that layer.
- Pill tags on the side legend each have their own tooltip (single note name + description) for fine-grained discovery.
- Keyboard accessible: each band is a `<button>` wrapper with `aria-label`, tooltips trigger on focus.

### Load-in animation

CSS keyframe `bz-pyramid-rise` (opacity 0 + translateY 12px → 0). Apply with staggered `animation-delay`: base 0ms, heart 200ms, top 400ms (bottom-up sequence as specified). Respect `prefers-reduced-motion` — skip animation, render final state.

### Longevity indicator

Below the pyramid, a 3-row mini-strip:

```text
Top   ●○○○○○○○  1–2 hr
Heart ●●●●○○○○  2–4 hr
Base  ●●●●●●●●  4–8 hr
```

Implemented as 8 small dots per row using `Circle` icons from lucide-react (filled vs outline), color-coded to the band. Uses `font-body text-xs text-cream-muted` for the label + duration text.

### Reusability

- Default export `FragrancePyramid`, named export the `Note` type.
- `size="sm"` → ~180px wide, no side legend, compact longevity strip → fits in `ScentCard` / `ShopifyProductCard`.
- `size="md"` (default) → ~320px → quiz result inline.
- `size="lg"` → ~480px with full legend → quiz results hero, product detail pages.
- Pure presentational — no data fetching, no store coupling.

### Tokens

All colors via Bazuki tokens already in `index.css` (gold, cream, bz-bg-card). The three brand-spec hex values (`#F5E6C8`, `#C9A84C`, `#6B3F1A`) are inlined as SVG fills since they're brand-locked layer colors, not theme tokens. Glow uses existing `--glow-gold-md`. Border radii follow `--radius` for the wrapper card.

### Files

- **Create** `src/components/FragrancePyramid.tsx`
- **Edit** `src/index.css` — add `@keyframes bz-pyramid-rise` + `.bz-pyramid-band` utility (animation + reduced-motion guard)

No integration into product cards / quiz results in this pass — component ships standalone and ready to drop in. I'll mention the import path in the closing message so you can wire it where you want next.
