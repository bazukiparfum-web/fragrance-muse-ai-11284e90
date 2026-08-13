# New Hero Bottle Image

## What you get
A newly generated product shot — turquoise/teal glass bottle, silver metallic cap, black label with gold "Signature Essence" text, floating on pure black with sharp directional cool-toned highlights and no shadows — used as the homepage hero bottle.

## How it will be built
1. Generate the image at premium quality (legible label typography), portrait 1024x1536, saved to `src/assets/hero-signature-essence.png`.
2. Upload it via the assets CLI so it is CDN-hosted like the current bottle, producing `src/assets/hero-signature-essence.png.asset.json`, and remove the raw PNG from the repo.
3. Point `src/components/Hero.tsx` at the new asset pointer instead of `bazuki-bottle-clean.png.asset.json`. This single image drives all three campaign bottles (center plus the hue-rotated left/right variants) and the blurred background layer, so the whole hero updates at once.
4. Verify at 390px, 768px, and desktop that the bottle crops cleanly (`object-position: 50% 18%`) and that the overlaid Bazuki label SVG still sits correctly over the new bottle's label area; nudge `.label-wrap` top/width only if it visibly misaligns.

## Notes
- The existing hero asset stays in place (not deleted), so we can revert instantly.
- Since the generated bottle already carries a "Signature Essence" label, if the SVG label overlay ends up doubling text on the bottle, the overlay can be hidden for the center bottle — I'll confirm visually and ask before removing it.
