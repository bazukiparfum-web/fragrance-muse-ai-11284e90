Rewrite `src/components/TrustedByCarousel.tsx` to match the detailed spec. No changes to logos, label text, callers, or page positions.

## Implementation

### Structure
- Section wrapper with top + bottom 1px gold borders (rendered as absolutely positioned spans so they can animate width from 0→100% on intersect).
- Centered radial gold glow as a pseudo background layer.
- Heading row: `——— TRUSTED BY ———` flex row with two animated gold lines and the label.
- Marquee track: duplicated logos, single CSS `@keyframes` translating `0 → -50%` on a 35s linear infinite loop. Gap 80px. Edge fade via `mask-image` linear-gradient (60px each side). `:hover` on track sets `animation-play-state: paused`.
- Each logo: 52px tall container, `filter: grayscale(1) brightness(.75)`, `opacity .55`; on hover → full color, opacity 1, `translateY(-3px)`. Tooltip is a small dark gold-bordered card with a triangle, fade+slide-up on group-hover.

### Scroll-triggered entry
- Single `IntersectionObserver` (threshold 0.3) toggling an `is-in` class on the section root.
- CSS state-driven sequence (all gated on `.is-in`):
  - Border lines: `width: 0 → 100%`, 600ms ease-out
  - Side lines on label: `width: 0 → 40px`, 400ms ease-out, 200ms delay
  - "TRUSTED BY" text: opacity 0→1, 300ms, 200ms delay
  - Logo strip wrapper: opacity 0→1, 400ms ease-out, 300ms delay
  - Marquee animation: `animation-play-state: paused` by default → `running` after 700ms delay via a transition trigger (use `animation-delay: 700ms` on the keyframes combined with `animation-play-state` flip when `.is-in`)

### Reduced motion
- `@media (prefers-reduced-motion: reduce)`: skip all entry transitions (state shown immediately), disable marquee.

### Desktop vs mobile
Drop the existing two-track (mobile marquee + desktop Embla carousel) split — spec calls for a single marquee everywhere. Remove `embla-carousel-autoplay` usage inside this component; keep the dependency installed (not worth uninstalling).

### Props / API
Keep existing `TrustedByCarouselProps` exactly as-is so `Business.tsx` and `About.tsx` don't need edits. `headingVisible` still hides the H2 visually (sr-only) — the ornament line+label always render.

### Files touched
- **Edit** `src/components/TrustedByCarousel.tsx` — full rewrite per spec.
- **No other files.**
