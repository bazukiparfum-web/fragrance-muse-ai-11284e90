# Hero image: graceful loading + fast responsive delivery

The hero currently loads a single 1.16 MB PNG and uses it for all three bottles plus the blurred background layer. On mobile that is the largest download on the page, and until it decodes the bottle area is an empty box.

## What changes

1. **No-layout-shift placeholder**
   - The bottle box already has a fixed `aspect-ratio: 2 / 3`, so the space is reserved. Add a placeholder layer inside it: a tiny blurred version of the bottle (inline base64 LQIP, ~1–2 KB) behind a soft gold shimmer, matching the hero's dark surface.
   - Track load state per image; fade the real photo in over ~400ms once it decodes, then fade the placeholder out. On error the placeholder stays as a dark tinted tile so nothing collapses.
   - Reduced-motion users get a flat tinted placeholder and an instant swap (no shimmer, no fade).

2. **Responsive, compressed image delivery**
   - Generate WebP renditions of the existing hero bottle at 480w, 720w, 1080w and 1440w, plus a JPEG/PNG fallback at 1080w, and upload them as CDN assets.
   - Serve them through a `<picture>` / `srcset` + `sizes` setup matching the real rendered widths (280px centre / 210px side desktop, ~230/170 at ≤1024px, narrower at ≤768px), so phones fetch a ~40–80 KB file instead of 1.16 MB.
   - Keep the centre bottle `fetchpriority="high"` + eager; side bottles stay lazy.
   - Point the blurred `.hero-bg-blur` background at the smallest rendition — it is blurred 55px, so the 480w file is indistinguishable and saves the full-size fetch.
   - Add `width`/`height` attributes on the img so intrinsic ratio is known before load.

3. **Verification**
   - Check at 390px, 768px and desktop that the bottle, the overlaid Bazuki label, and the badge are unchanged visually, and measure the transferred image bytes before/after.

## Technical notes

- Renditions are produced from the current CDN original (`hero-signature-essence.png`) with sharp/ffmpeg in the sandbox, uploaded via the assets CLI, referenced through their `.asset.json` pointers. The original asset stays in place for rollback.
- Placeholder/shimmer reuses the existing `shimmer-gold` animation and hero CSS variables — no new hardcoded colours.
- Presentation only: no data, routing or business-logic changes.
