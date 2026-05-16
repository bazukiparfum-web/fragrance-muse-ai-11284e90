## Update hero mosaic in `src/components/business/HeroB2B.tsx`

Single-file change. Replace the radial-gradient-only tiles with real Unsplash photos, a dark gradient overlay, and a thin gold-line grid frame around the 2×2 mosaic. Mobile scroll strip uses the same tiles, so it inherits the photos for free.

### 1. Add `image` (and per-tile `bgPosition`) to the tile data

```ts
type TileData = {
  label: string;
  descriptor: string;
  image: string;
  bgPosition?: string; // defaults to "center"
};

const tiles: TileData[] = [
  { label: "Hospitality", descriptor: "Hotels · Resorts · Boutique Stays",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    bgPosition: "center top" },
  { label: "Retail", descriptor: "Boutiques · Showrooms · Flagship Stores",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" },
  { label: "Corporate", descriptor: "Offices · Co-working · HQ Lobbies",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" },
  { label: "Wellness", descriptor: "Spas · Clinics · Yoga Studios",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    bgPosition: "center top" },
];
```

The old `color` field is dropped (no longer used).

### 2. Rewrite the `Tile` component

- Outer `<div>`: keep `group relative overflow-hidden rounded-xl`, change border to `border border-[rgba(201,168,76,0.15)]`, keep the gold hover glow.
- Background-image layer: `position: absolute; inset: 0; background-image: url(...); background-size: cover; background-position: <bgPosition>;`.
- Overlay layer (real DOM element, not `::after`, to keep Tailwind-friendly and allow hover state):
  - `background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)`
  - `transition: opacity 0.4s ease` — on `group-hover` reduce opacity (approximates the "0.85 → 0.65" softening at the bottom by lowering the whole overlay's opacity to ~0.75).
- Hover descriptor: keep as-is, ensure it sits above overlay (`relative z-10`).
- Label pill: keep current styling, add `z-index: 2` (Tailwind `z-[2]`) so it stays above the overlay.

### 3. Add the gold grid frame to the 2×2 mosaic

Replace the existing `<div className="hidden lg:grid grid-cols-2 gap-3">` wrapper with:

```tsx
<div
  className="hidden lg:grid grid-cols-2 rounded-xl"
  style={{
    gap: "1px",
    backgroundColor: "rgba(201,168,76,0.15)",
    boxShadow: "inset 0 0 60px rgba(201,168,76,0.06)",
    padding: "1px",
  }}
>
```

The 1px gap renders the parent's gold background between cells, creating the luxury grid line. Inner box-shadow gives the subtle gold vignette. Mobile scroll strip is left untouched (it's a horizontal strip, not a 2×2 grid).

### 4. Files touched

- `src/components/business/HeroB2B.tsx` only.

No new dependencies, no asset downloads (Unsplash URLs are loaded directly by the browser). No copy or layout changes outside the mosaic.
