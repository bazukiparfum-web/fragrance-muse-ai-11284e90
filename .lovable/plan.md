# Hero Bottle — Replace placeholder with AI-generated image

Generate a single cinematic, transparent-background bottle image and swap it into `Hero.tsx`.

## Generate

- Tool: `imagegen--generate_image`, `model: "premium"` (text legibility for "BAZUKI" label), `transparent_background: true`.
- Path: `src/assets/hero-bottle.png` (PNG for transparency).
- Dimensions: `768 x 1280` (tall portrait, matches hero column aspect).
- Prompt: photoreal modern minimalist flacon — tall rectangular glass with squared shoulders, deep amber/topaz liquid catching warm light, brushed gold rectangular cap, thin engraved gold "BAZUKI" wordmark on the front, soft gold rim-light on edges, subtle reflections, against pure transparent background, cinematic dark-luxury studio lighting, ultra-sharp product render, 8k.

## Swap into Hero

Edit `src/components/Hero.tsx`:

- Import: `import heroBottle from "@/assets/hero-bottle.png";`
- Replace the placeholder bottle block (the `<div>` styled as "180px × 300px" container with cap/neck/label children) with:

```tsx
<div className="relative" style={{ width: 240, height: 380 }}>
  {/* Halo glow behind bottle */}
  <div
    aria-hidden
    className="absolute inset-0 -z-10"
    style={{
      background: "radial-gradient(closest-side, rgba(201,168,76,0.28), transparent 70%)",
      filter: "blur(30px)",
      animation: "bz-bottle-glow 6s ease-in-out infinite",
    }}
  />
  <img
    src={heroBottle}
    alt="Bazuki signature perfume bottle"
    className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
    style={{ animation: "bz-bob 6s ease-in-out infinite" }}
  />
</div>
```

- Keep `bz-bottle-glow` and `bz-bob` keyframes already defined in the inline `<style>` block.
- Floating note tags, fragrance pyramid, eyebrow, headline, CTAs, trust stats, mobile marquee, scroll indicator — all unchanged.

## QA

- View the generated PNG to confirm transparent background, gold-on-dark palette, and a clean upright silhouette before claiming complete.
- If the image has visible background fringing or label is illegible, re-generate once with prompt tweaks (no infinite loop).

## Out of scope

- Changing layout, colors, or any other section.
- Generating multiple bottle variants.
