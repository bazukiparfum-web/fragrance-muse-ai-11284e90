
# Scent Library — `/collection` rebuild

Replace the existing `/collection` page with a new dark-luxury **Scent Library**, merging Shopify signature products and public AI-generated scents into one filterable grid, with a slide-in drawer for details.

## Scope

- Frontend-only rebuild of `src/pages/Collection.tsx`.
- New supporting components under `src/components/library/`.
- Reuse existing infra: `fetchShopifyProducts`, `supabase` (`saved_scents`), `useCartStore`, `FragrancePyramid`, `Header`, `Footer`, `useSEO`.
- No DB schema changes, no edge function changes, no auth changes.

## Page structure

```
<Header />
<HeroLibrary />              ← headline + sub-copy, gold glow backdrop
<MoodFilterBar />            ← sticky under header, gold pill chips
<ScentGrid />                ← 1 / 2 / 3 col responsive masonry-feel grid
<ScentDetailDrawer />        ← right slide-in (Sheet), opens on card click
<Footer />
```

### Hero
- Headline `Discover Our Scent Universe` (Cormorant Garamond, h1).
- Sub-copy `Every bottle is a unique formula created by Bazuki's AI engine` (Inter).
- Backdrop: subtle gold radial glow on `bz-bg-primary`. No image (keeps LCP on the headline).

### Mood filter bar
- Categories: **All, Woody, Floral, Citrus, Oriental, Musky, Fresh**.
- Pills: rounded-full, `border-gold/40`, active = `bg-gold text-primary-foreground`.
- Sticky `top-16`, `bg-bz-primary/80 backdrop-blur`.
- Filtering is client-side based on a derived `mood` for each item (see Technical).

### Scent card
- Layout: vertical card, `bg-bz-card`, `border-gold/15`, `rounded-xl`, padding `p-5`.
- Top: small `<FragrancePyramid size="sm" />` as visual.
- Name (Cormorant 22px), 1-line mood description (cream-muted, italic).
- Note pills row: small amber chips grouped Top / Heart / Base (max 2 each, `+N more`).
- Price block: `30ml ₹X · 50ml ₹Y` in gold.
- Footer: `Details →` ghost-gold button (full width on mobile).
- Hover: `transition-all duration-300`, soft gold border + `glow-gold-sm` shadow, 1px translateY(-2px).

### Detail drawer
- Right-side `Sheet` (`SheetContent side="right"`, `w-full sm:max-w-xl`).
- Contents:
  - Name + creator/family tagline.
  - Full description (uses `formulation_notes` for DB scents, Shopify `description` for products).
  - `<FragrancePyramid size="lg" />` with sequential layer animation (already built-in).
  - Size selector toggle: 30ml / 50ml.
  - CTAs (stacked, gold primary first):
    - **Add to Cart** → `useCartStore.addItem()` with selected size/variant.
    - **Tweak This Scent** → navigates to `/shop/quiz?seed=<id>` (graceful: just routes to quiz landing if seed unsupported).
- Close on overlay click / Esc / X button.

## Technical

### Data model
```ts
type LibraryItem = {
  id: string;
  source: "shopify" | "scent";
  name: string;
  description: string;
  mood: "Woody"|"Floral"|"Citrus"|"Oriental"|"Musky"|"Fresh";
  notes: { top: string[]; heart: string[]; base: string[] };
  prices: { ml30?: number; ml50?: number };
  shopify?: { productId: string; variants: ShopifyVariant[] };
  raw: ShopifyProduct | PublicScent;
};
```

### Merge logic (in `Collection.tsx`)
- `Promise.allSettled([fetchShopifyProducts(50), supabase.from('saved_scents').select('*').eq('is_public', true).limit(60)])`.
- Map each source through `toLibraryItem()`; concat; dedupe by `name`.
- **Mood derivation**:
  - Shopify: parse from `product_type` / tags if present, else infer from name keywords; default `Oriental`.
  - DB scent: derive from `visual_data.family` if present, else infer from notes (heart-note keyword map).
- **Notes**:
  - Shopify: parse from product `description` lines like `Top:`, `Heart:`, `Base:` if present; otherwise empty arrays → pyramid uses its built-in empty state.
  - DB scent: from `formula.notes` ({ top, heart, base } arrays).
- **Prices**:
  - Shopify: from variant titles matching `/30 ?ml/i` / `/50 ?ml/i`.
  - DB scent: from `prices` JSON, fallback to ₹700 / ₹1100 (per memory).

### Files

**Edited**
- `src/pages/Collection.tsx` — full rewrite to new layout. SEO title `Scent Library — Bazuki Fragrance`.

**Created**
- `src/components/library/HeroLibrary.tsx`
- `src/components/library/MoodFilterBar.tsx`
- `src/components/library/ScentCard.tsx`
- `src/components/library/ScentDetailDrawer.tsx`
- `src/lib/libraryMapper.ts` — `toLibraryItem`, `inferMood`, `parseNotesFromDescription`, `pickPrices`.

**Untouched**
- `ScentDetail.tsx` route still works at `/collection/:id` for direct links.
- All Shopify tools, edge functions, RLS, and other pages.

### Styling
- Uses existing tokens: `bg-bz-primary`, `bg-bz-card`, `text-cream`, `text-gold`, `border-gold`, `glow-gold-sm`, `rounded-pill`, `font-display`.
- No new colors. No raw hex in JSX.
- Animations: card fade-up via existing `Reveal` component (stagger 60ms); pyramid uses its built-in `bz-pyramid-rise`.

### Responsive
- Mobile (<640): 1 col, drawer becomes full-width.
- Tablet (≥768): 2 cols.
- Desktop (≥1024): 3 cols.
- Filter bar: horizontal scroll on overflow, `snap-x`.

## Out of scope
- Editing community scent data, AI prompts, or pricing logic.
- Adding new bottle sizes (5ml not included — 30ml/50ml only per project memory).
- Changes to checkout flow, header, or footer.
- Server-side filtering or new endpoints.
