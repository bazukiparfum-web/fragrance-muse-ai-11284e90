# Bazuki Product Detail Page (PDP)

Rebuild `src/pages/ProductDetail.tsx` to match the Bazuki dark-luxury design system, and switch routing from `/product/:handle` to `/products/:handle`.

## Routing changes

- `src/App.tsx`: change `<Route path="/product/:handle" ...>` to `<Route path="/products/:handle" ...>`. Keep the old path as a redirect to the new one for safety.
- `src/components/library/ShopifyProductCard.tsx`: wrap the card / title in a click handler that navigates to `/products/{handle}` (currently the card only opens a detail drawer). Add-to-cart button keeps `stopPropagation`.
- Any other links to `/product/:handle` get updated to `/products/:handle` (grep and patch).

## Data

- Continue using `fetchShopifyProductByHandle(handle)` from `src/lib/shopify.ts` — already returns the full product node (images, variants, options, description).
- Note metafields are not currently fetched. For v1 the Fragrance Pyramid will parse simple "Top: …, Heart: …, Base: …" hints out of the product description, with graceful empty state when nothing is detected. (Adding a Storefront metafield fetch can be a follow-up; out of scope for this UI task.)

## Page structure (`ProductDetail.tsx`)

Wrap everything in the existing `Header` + `Footer`, dark background.

- Top-left link: "← Back to Scent Library" — gold text, Inter, navigates to `/collection`.
- Two-column grid (`grid lg:grid-cols-2 gap-12`), stacks on mobile.

### Left column — gallery
- Main image: `aspect-square w-full rounded-xl overflow-hidden border border-[hsl(var(--bz-gold)/0.15)]`.
- If `images.length > 1`: thumbnail strip of small squares (`w-16 h-16 rounded-md`), selected thumb gets full-opacity gold border, others 20%.

### Right column — details
- Eyebrow: product `productType` (or first collection / fallback "Bazuki") — Inter 10px, `text-bz-gold uppercase tracking-[0.2em]`.
- Title: `font-serif text-[44px] leading-tight text-bz-cream` (Cormorant Garamond via existing token).
- Short description: first sentence of `product.description`, Inter 15px, `text-[#8A7A6A] leading-[1.75]`.
- Price: `font-serif text-[32px] text-bz-gold`, formatted as `₹{amount}`, updates with selected variant.
- Variant selector (only if >1 variant):
  - Label "SELECT SIZE" — gold eyebrow style.
  - Pill buttons: `rounded-full px-5 h-10 text-sm`. Unselected: `bg-bz-secondary/60 border border-bz-gold/20 text-bz-cream`. Selected: `bg-bz-gold text-black border-bz-gold`. Disabled (unavailable) gets reduced opacity.
- Quantity selector: label "QUANTITY" gold eyebrow + `−`/`+` controls (same component style as `BazukiCartDrawer`), min 1.
- Add to Cart button: full width, `h-[52px] rounded-full bg-bz-gold text-black font-medium`, with the existing async `addItem` flow + spinner / "Added ✓" feedback (mirror the pattern from `ShopifyProductCard`). On success opens the cart drawer.
- Buy Now button: full width, `h-[52px] rounded-full border border-bz-gold text-bz-cream bg-transparent`. Calls `addItem(...)` for the selected variant+quantity, then on success opens `useCartStore.getState().checkoutUrl` in a new tab with `channel=online_store` (helper already exists in `lib/shopify.ts`).
- Fragrance Notes:
  - Label "FRAGRANCE NOTES" gold eyebrow.
  - `<FragrancePyramid topNotes={...} heartNotes={...} baseNotes={...} size="md" />`.
  - Parser util `parseNotesFromDescription(description)` (local helper) extracts `Top|Heart|Base: a, b, c` lines; falls back to empty arrays which the pyramid already handles.
- Tabs section (shadcn `Tabs`, Inter 13px triggers, gold underline on active):
  - "Description" — full `product.description` (preserve whitespace).
  - "How to Use" — static copy: apply to pulse points (wrists, neck, behind ears), avoid rubbing, layer with unscented moisturiser for longevity, store away from direct light.
  - "Shipping" — "Ships within 2–4 business days via Delhivery/Shiprocket. Free shipping on orders above ₹999."

Keep the existing SEO (`useSEO`) and JSON-LD blocks intact.

## Files touched
- `src/pages/ProductDetail.tsx` — rewrite layout + add Buy Now + pyramid + tabs.
- `src/App.tsx` — route rename + redirect.
- `src/components/library/ShopifyProductCard.tsx` — make card navigate to `/products/:handle`.
- New tiny helper inside `ProductDetail.tsx` (or `src/lib/parseNotes.ts`) for note parsing.

No schema or backend changes. No new dependencies (Tabs, Button, Sheet, FragrancePyramid all exist).
