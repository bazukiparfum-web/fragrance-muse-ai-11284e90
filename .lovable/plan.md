## Goal
Redesign `/collection` into a premium, editorial fragrance-house experience that matches the quiz's dark luxury atmosphere. Pure visual + animation work — no changes to data, prices, variants, cart, navigation, or filtering logic.

## Files touched
- `src/pages/Collection.tsx` — wire ambient background, new product-count header, sort state, animated re-mount on filter/sort changes
- `src/components/library/HeroLibrary.tsx` — enlarged heading with word-stagger reveal, gold subtext, gold ✦ divider
- `src/components/library/MoodFilterBar.tsx` — luxury pill restyle, stagger entry, sort dropdown slot, mobile fade-right mask
- `src/components/library/ShopifyProductCard.tsx` — full premium card redesign (image stage, scent-note hover strip, gold button shimmer, click pulse)
- `src/components/library/ScentCard.tsx` — same visual language as the Shopify card so the grid feels unified
- `src/components/library/ProductImage.tsx` — dark "stage" mode: contain + padding + `mix-blend-mode: multiply`, elegant placeholder (gold bottle SVG + "Image Coming Soon")
- `src/components/library/CollectionStates.tsx` — `CollectionEmpty` becomes the elegant zero-results state with gold bottle icon + "View All" pill
- `src/index.css` — add tokens (`--lux-bg`, `--lux-card`, `--lux-card-hover`, `--lux-gold-dim`, gold border alphas), `mix-blend-multiply` image-stage helper, `shimmer-sweep` + `divider-draw` + `word-rise` keyframes (all with `prefers-reduced-motion` fallback)
- *(new)* `src/components/library/CollectionAmbience.tsx` — 25 drifting gold/ivory particles + 3 slow radial gold blobs, `pointer-events-none`, `z-0`. Reuses the same idea as `QuizBackground` but scoped to the page.
- *(new)* `src/components/library/SortDropdown.tsx` — small styled `<Select>` (Featured / Price ↑ / Price ↓ / Newest)
- *(new)* `src/components/library/GoldBottleIcon.tsx` — shared stroke-style perfume bottle SVG used by placeholder + empty state

## Section-by-section

**1. Background atmosphere** — `CollectionAmbience` mounted inside the page wrapper at `z-0`; main content wrapped at `z-10`. Particle keyframes already exist in the project — reuse the same drift/opacity loop, 25 count, gold/ivory mix.

**2. Hero** — Heading split into words; each `<span>` animates `opacity 0→1, translateY 20→0` with 80 ms stagger via inline `animationDelay`. Gold text-shadow on the `<h1>`. Subtext recolored to gold with `tracking-[0.05em]`, delayed 400 ms. Divider is a flex row: 60 px line → ✦ → 60 px line; lines animate `scaleX 0→1` on mount.

**3. Filter pills** — Restyled with tokens above. Active state gets a one-shot `shimmer-sweep` overlay + scale 1→1.05 spring. Pills stagger in (60 ms each, starting 400 ms). Wrapped in a flex row with sort on the right; mobile collapses sort below and applies an `overflow-x-auto` with right-edge mask-image gradient.

**4. Product cards** — New container styling per spec (bg `#141210`, gold-15 border, lift + glow + brighter border on hover). Image area is a fixed-height "stage" with dark bg, contained image at 85 % w, 20 px pad, `mix-blend-mode: multiply`, hover scale 1.06, radial gold glow that fades in on hover. Below image: serif name + gold price on one flex row, scent-note pill strip that fades in on hover (only when notes exist in `item.notes`), restyled variant `<Select>`, gold outline CTA with left→right shimmer on hover and a click pulse. Existing add-to-cart logic untouched; success checkmark already exists in the component.

**5. Grid** — Keep 1/2/3 column responsive grid, gap 24 px, `max-w-[1200px]`. Cards animate in with `opacity/translateY/scale` and an 80 ms stagger. On filter or sort change, we bump a `key` on the grid wrapper so cards re-mount and replay the cascade — gives the "exit small / enter staggered" feel without adding a new animation library.

**6. Sort dropdown** — Local state in `Collection.tsx`; sorts the `filtered` array before slicing. Featured = original order. Newest = `saved_scents.created_at` for scents, Shopify products keep their fetch order (push to end).

**7. Header count** — Small dim-gold line above the filter row: `Showing N {mood} fragrances` (omits the mood word when `All`).

**8. Empty state** — `CollectionEmpty` shown when `filtered.length === 0` post-filter: gold bottle icon, ivory serif "No scents found", gold subtext, gold "View All" pill that calls `onReset` (passed from `Collection.tsx` to reset mood to `"All"`).

**9. Mobile** — Filter row already `overflow-x-auto`; add `[mask-image:linear-gradient(to_right,black_85%,transparent)]` for the fade. Card image area becomes 240 px tall; hover effects degrade to `active:` variants so taps give a quick scale pulse.

## Animation & token notes
- All new keyframes added under `@layer utilities` in `src/index.css`, gated by `@media (prefers-reduced-motion: reduce)` to disable.
- Colors added as CSS variables and consumed via Tailwind arbitrary values or new utility classes — no hardcoded hex in JSX (per project memory rule).
- No new dependencies. No motion library — CSS keyframes + `key`-based remount only.

## Out of scope
Product data, prices, variant logic, cart store, routing, SEO, header/footer, drawer behavior, infinite-scroll sentinel (kept as-is).