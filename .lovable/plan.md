# Premium Sticky Navigation — Bazuki

Replaces the existing `Header` sitewide with a new ghost-style nav matching the spec.

## Files

- **`index.html`** — add Google Fonts preconnect + `<link>` for `Cormorant+Garamond:wght@400;500;600` and `Inter:wght@400;500`.
- **`tailwind.config.ts`** — extend `fontFamily` with `cormorant: ['Cormorant Garamond', 'serif']` (keep existing `sans`/`serif`).
- **`src/components/Header.tsx`** — full rewrite to new spec (keeps the same export so `App.tsx` doesn't change).
- **`src/components/SearchOverlay.tsx`** *(new)* — full-screen search overlay (UI only, input + close, no backend hookup).

## Behavior

- Fixed top, `z-50`, full width.
- Scroll listener (`useEffect` + `window.scrollY`) toggles `scrolled` state at >80px.
  - Unscrolled: `bg-transparent`, no border.
  - Scrolled: `bg-[#0A0A0A]`, `border-b border-[#C9A84C]/10`.
  - `transition-[background-color,border-color] duration-300 ease-in-out`.
- No box-shadow ever.

## Layout (desktop ≥ md)

```
[ BAZUKI logo ]      [ Shop  Quiz  Library  B2B  About ]      [ 🔍  🛒(badge)  Take the Quiz ]
```

- **Logo** (left): `font-cormorant text-2xl tracking-[0.25em] text-[#F5ECD7]`, links to `/`.
- **Nav links** (center): `font-sans text-[12px] uppercase tracking-[0.12em] text-[#C8B99A]`. Each link is a `<Link>` with a `::after` pseudo underline (1px gold) animating `scale-x` from `origin-left` on hover, 0.2s ease — implemented via a small custom utility class in component (`group` + `after:` Tailwind arbitrary values).
- **Right cluster**:
  - Search icon — Lucide `Search` `strokeWidth={1}` `size={18}`, opens `SearchOverlay`.
  - Cart icon — Lucide `ShoppingBag` `strokeWidth={1}`, with absolute-positioned gold circle badge showing `useCartStore` item count (reuse existing store; hide badge if 0).
  - "Take the Quiz" CTA → `/shop/quiz`: pill (`rounded-full`), `border border-[#C9A84C]`, `bg-transparent text-[#F5ECD7]`, hover → `bg-[#C9A84C] text-black`, `transition-colors duration-300`.

## Route mapping

- Shop → `/collection`
- Scent Quiz → `/shop/quiz`
- Scent Library → `/ingredients`
- B2B → `/business`
- About → `/about`

## Mobile (< md)

- Logo + hamburger (3 thin gold lines, custom SVG or Lucide `Menu` `strokeWidth={1} className="text-[#C9A84C]"`).
- Tap → full-screen overlay: `fixed inset-0 bg-[#0A0A0A] z-[60]`, links stacked vertically, `font-cormorant text-3xl text-[#F5ECD7]` with gold dividers.
- Animation: slide-in from right using existing Tailwind `animate-slide-in-right` (already in design system) + `animate-fade-in` for backdrop.
- Close (X) top-right; tap link closes overlay and navigates.
- Right cluster (search, cart, CTA) stacked at bottom of mobile overlay.

## Search overlay

- `fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur z-[70]`.
- Centered input: `bg-transparent border-b border-[#C9A84C]/40 text-[#F5ECD7] placeholder:text-[#C8B99A]/50 font-cormorant text-2xl` with autofocus.
- Close button top-right; ESC key closes; submit is a no-op for now (logs query).

## Notes / preserved behavior

- Keep the existing admin shield + auth/account icon logic from current `Header.tsx`, restyled to match (thin gold icons in the right cluster). Back button is removed (the new spec is logo-only on the left).
- Cart drawer trigger: reuse existing `CartDrawer` opening pattern by wrapping the new cart icon as its trigger (or import the store directly and open).
- All colors are inlined per exact hex spec rather than added as CSS tokens, since they're brand-fixed and only used here.

## Out of scope

- Wiring search to a real backend.
- Changing any page content / other components.
