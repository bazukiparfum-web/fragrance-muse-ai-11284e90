## Goal
Replace the single static image on `/shop/car-fresheners/:handle` with a luxury multi-image gallery: large main image, thumbnail rail, and smooth transitions — matching the dark/gold PDP aesthetic already in `CarFreshenerDetail.tsx`.

## Scope
- Frontend only, `src/pages/CarFreshenerDetail.tsx` + one new component.
- No changes to Shopify fetching logic or catalog types beyond exposing an image list.
- No changes to the sibling grid / other PDP sections.

## Changes

### 1. Extend catalog to return an image array
`src/lib/carFreshenerCatalog.ts`
- Add `images: string[]` to `CarFreshenerListItem` (keep `image` as the primary/first for back-compat with `CarFreshenerCard` and JSON-LD).
- `fromShopify`: map `p.node.images.edges` → `url[]`. If empty, fall back to `[local?.image]`.
- `fromPlaceholder`: `images: [item.image]` (only one placeholder today, so gallery gracefully renders a single slide).

### 2. New component: `CarFreshenerGallery`
`src/components/car-fresheners/CarFreshenerGallery.tsx`
- Props: `{ images: string[]; alt: string; accentHsl: string }`.
- Built on existing shadcn `Carousel` (embla) for the main stage — gives swipe on mobile, keyboard arrows, and smooth slide transitions out of the box.
- Layout:
  - Main stage: square, dark card bg (`bg-bz-secondary`), gold corner brackets (reuse the 4 `<span>` bracket pattern already in `CarFreshenerDetail`), image `object-cover` with a subtle `scale-105` on hover.
  - Prev/next arrow buttons overlaid, gold-tinted, fade in on hover (desktop) / always visible on mobile.
  - Slide counter pill `1 / 4` bottom-right in gold micro-caps.
- Thumbnail rail below (only when `images.length > 1`):
  - Horizontal flex, `gap-2`, scroll-x on overflow.
  - Each thumb: square 64–72px, rounded, border transitions from `border-gold/15` → `border-gold` on active; active thumb also gets a soft gold ring using `accentHsl`.
  - Click thumb → `api.scrollTo(index)`; embla `select` event keeps active thumb in sync.
- Transitions:
  - Embla default slide (smooth translate).
  - Main image cross-fades using a keyed `<img>` with `animate-fade-in` (already in tailwind config) layered above the carousel item — feels more "gallery" than "slider".
  - Thumb border/ring uses `transition-all duration-300`.
- Accessibility: arrows have `aria-label`, thumbs are real `<button>`s with `aria-label="View image N"` and `aria-current="true"` when active. Respects `prefers-reduced-motion` (skip fade + hover scale) per the project animation rule.
- Single-image case: renders just the main stage, no arrows, no thumbnails, no counter.

### 3. Wire into `CarFreshenerDetail.tsx`
- Replace the existing image `<div className="relative aspect-square …">…</div>` block with `<CarFreshenerGallery images={item.images} alt={\`${item.name} hanging car freshener\`} accentHsl={item.accentHsl} />`.
- Update `productJsonLd.image` to `item.images` (array) instead of `[item.image]`.
- No changes to the sticky mobile add-to-cart bar or other sections.

## Out of scope
- Fullscreen lightbox / zoom modal (can be a follow-up).
- Video slides.
- Any redesign of `CarFreshenerCard` or the listing page.

## Verification
- `/shop/car-fresheners/<handle>` with placeholder data: single slide, no arrows, no rail — visually identical to today.
- Once Shopify products with multiple images are wired, arrows + rail appear, click/swipe/keyboard all advance smoothly, active thumb highlights, counter updates.
- Reduced-motion: no fade or scale.
