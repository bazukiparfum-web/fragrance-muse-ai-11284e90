# Fix invisible product images (remove mix-blend-mode: multiply)

## Root cause
`mix-blend-mode: multiply` was applied to product `<img>` elements assuming a light page background. On the dark `#0D0C0A` / `#141210` cards the multiply blend mode crushes images to near-black, making the product photos invisible on both the collection grid and the PDP. Replace blend mode with a clean `object-fit: contain` + a bottom-gradient fade pseudo-element on the container.

## File changes

### 1. `src/components/library/ProductImage.tsx` (collection card image)
- Remove `mix-blend-mode: multiply` from the `<img>` (and any darkening filter).
- Keep container relative + dark `#141210` bg, `overflow-hidden`, fixed height.
- Image: `width 100% / height 100% / object-contain / object-position center / padding 16px / filter: none`.
- Add a `::after` overlay class (or inline span) on the container: bottom 35%, `linear-gradient(to top, #141210 0%, transparent 100%)`, `pointer-events: none`, `z-index: 1`. Image sits at `z-index: 0`.
- Leave the "Image Coming Soon" placeholder branch untouched.

### 2. `src/components/product/ProductImageStage.tsx` (PDP main image)
- Remove `style={{ mixBlendMode: "multiply" }}` from the `<img>`.
- Container background changes from `#0D0C0A` to `#141210` (matches spec) — corner brackets and gold border kept.
- Image: `object-contain / object-position center / padding 20px / filter: none / w-full h-full`.
- Add gradient fade `::after` overlay: height 25%, same `#141210 → transparent` linear gradient, `pointer-events: none`, above image (`z-index: 1`) but below corner brackets (`z-index: 2`, already set).
- Keep entry fade/scale + hover scale + gold radial glow.

### 3. `src/index.css`
- Add a small utility class `.pdp-image-fade` (and reuse for collection container, e.g. `.lux-image-fade`) implementing the `::after` gradient overlay, so both components can apply it via className. Keep the existing `.pdp-image-stage`/corner bracket rules; only the image element styling and the new overlay change.
- Remove any leftover `mix-blend-multiply` helper / `lux-image-stage` multiply rule if present (search and clean).

### 4. PDP thumbnails (`src/pages/ProductDetail.tsx`)
- Remove `style={{ mixBlendMode: 'multiply' }}` from the small thumbnail `<img>` strip under the main image. Use `object-contain` on a `#141210` background. No gradient overlay needed at thumbnail size.

## Out of scope
Card layout, gold borders, corner brackets, hover effects, animations, prices, cart logic, placeholder ("Image Coming Soon"), text/typography, any other page.

## Verification
- `rg -n "mix-blend|multiply"` across `src/` returns no hits on product image elements after the change.
- Manually verify on `/collection` (Discovery Set, 30ml Discovery Set bottles fully visible, Custom AI still shows placeholder) and on `/products/discovery-set` (main image and thumbnails fully visible, corner brackets and gold border intact).
