## Goal

Give each of the 6 car freshener dummy products a multi-image PDP gallery in the same visual style as the current hero image — so the existing `CarFreshenerGallery` (already used on the PDP) actually swaps between multiple frames instead of showing a single still.

The PDP gallery component already exists and already reads `item.images[]`. Today, placeholder-backed items only expose one image, so the carousel has nothing to swap. This plan adds companion images and wires them through.

## What to build

### 1. Generate 2 additional images per scent (12 new files)

For each scent, generate two more frames in the exact same style (light neutral background, gold botanical line-art, silver-grey "UPTO 60 DAYS LASTING" typography, vertical scent word, Bazuki branding):

- **`-boxed.jpg`** — hero shot of the **closed gift box** on the pedestal, bottle *inside* the box tucked behind the lid; front-facing gold script scent name on the box; hero natural element at the base.
- **`-bottle.jpg`** — hero shot of **just the frosted glass bottle** hanging from its wooden cap + black cord on the pedestal, box removed; natural element still at base as scent cue.

Combined with the existing hero image (bottle + box together), each scent ends up with 3 frames the carousel can rotate through.

New files under `src/assets/car-fresheners/`:

```
midnight-oud-boxed.jpg          midnight-oud-bottle.jpg
amber-drive-boxed.jpg           amber-drive-bottle.jpg
citrus-highway-boxed.jpg        citrus-highway-bottle.jpg
white-musk-cabin-boxed.jpg      white-musk-cabin-bottle.jpg
sandalwood-cruise-boxed.jpg     sandalwood-cruise-bottle.jpg
rose-noir-boxed.jpg             rose-noir-bottle.jpg
```

All generated at 1600x1000 with `imagegen--generate_image` premium tier (for legible typography), matching the color palette already assigned to each scent.

### 2. Wire images through the catalog

Two small code changes:

- **`src/data/carFresheners.ts`** — add an `images: string[]` field to the `CarFreshener` type and populate `[hero, boxed, bottle]` per scent. Keep the existing `image` field pointing at the hero for backwards compatibility (cards, JSON-LD fallback).
- **`src/lib/carFreshenerCatalog.ts`** — in `fromPlaceholder`, return `images: item.images` instead of `[item.image]`. Shopify-backed products are untouched — they already use real product photos.

That's it. `CarFreshenerGallery` already handles thumbnails, prev/next arrows, counter, lightbox, and keyboard nav for any `images[]` length ≥ 2.

## Out of scope

- No changes to `CarFreshenerGallery` component, PDP layout, styling, or copy.
- No changes to card grid on the collection page (still uses `item.image`, the hero frame).
- Shopify-backed items are unaffected — their images come from Shopify and already flow through the same gallery.

## Technical notes

- Aspect ratio stays 1600x1000 to match the current hero and the gallery's `object-cover` square crop.
- Ordering `[hero, boxed, bottle]` puts the most recognizable frame first (bottle + box together), which is what the PDP thumbnails and share previews will highlight.
