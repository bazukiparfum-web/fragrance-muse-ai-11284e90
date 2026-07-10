## Car Freshener detail pages + Shopify wiring

Two related tracks per your answers. No Shopify products get created this turn — the grid/detail gracefully falls back to placeholder data when no `car-freshener`-tagged Shopify products exist, and swaps to real products the moment you add them with that tag.

### 1) Detail page — `src/pages/CarFreshenerDetail.tsx`
Route: `/shop/car-fresheners/:handle`

- `Header` + `Footer` + `ScrollToTop`
- SEO via `useSEO` + `Product` JSON-LD (name, image, description, offers)
- Layout (2-col on `md+`, single on mobile):
  - **Left:** aspect-square image stage matching card look (gold corner brackets, dark surface)
  - **Right:** eyebrow "Hanging Car Perfume", H1 (Cormorant Garamond) product name, tagline, note pills tinted with `accentHsl`, price, size line ("Card diffuser · ~45 days"), primary CTA (Add to cart — see §3), secondary CTA "Bulk / gifting → /business"
- Sections below the fold:
  - **Use instructions** — 3 numbered steps (Unwrap · Hang from mirror · Refresh in ~45 days) with concise copy
  - **Notes breakdown** — top / heart / base pills (from `notes` for now; when Shopify wired, prefer product description metadata if present, else fall back to the local `notes` array by handle)
  - **What's inside / safety** — IFRA-safe oils, alcohol-free card, plastic-free packaging
  - **FAQ** — 4 items (longevity, refills, safety, bulk)
  - **You might also like** — 3 sibling fresheners (reuse `CarFreshenerCard`)
- Handles unknown `:handle` → renders a small "Not found" state with link back to `/shop/car-fresheners` (no `NotFound` redirect, keeps user in section)

### 2) Shopify wiring by tag — no product creation this turn
- New helper `src/lib/carFreshenerCatalog.ts`:
  - `fetchCarFreshenerProducts()` → `fetchShopifyProducts(50, "tag:car-freshener")`
  - `mergeWithPlaceholders(products)` → returns a unified `CarFreshenerListItem[]`:
    - If Shopify returns items, use them (real variantId, price, images) and enrich with local `notes`/`accentHsl`/`tagline` by matching on `handle` from `src/data/carFresheners.ts` (fall back to derived values when no local match)
    - If Shopify returns `[]` (none tagged yet, or 402/error) → return the current 6 placeholders unchanged
  - `getCarFreshenerByHandle(handle)` → tries `fetchShopifyProductByHandle`, falls back to placeholder by `id === handle`
- `CarFresheners.tsx` grid + `CarFreshenerDetail.tsx` both call these helpers via `useEffect`, with a skeleton state while loading
- `CarFreshenerCard.tsx` gains an optional `variantId?: string`; when present, the button becomes a real **Add to cart** using `useCartStore().addItem(...)` (same pattern as `ShopifyProductCard.tsx`). When absent → shows the notify-me state (§3 note: you chose to skip the waitlist track, so when no variantId we keep the current disabled "Coming soon" tooltip — see "Out of scope" below).

### 3) Add-to-cart flow
- When a Shopify product is resolved for a handle, the detail page's primary CTA calls `useCartStore().addItem({ product, variantId, variantTitle, price, quantity, selectedOptions })` — identical shape to existing product cards, so cart drawer + checkout Just Work
- Loading + disabled states while `isLoading`
- Toast on add (existing sonner setup)

### Routing + nav
- `src/App.tsx`: add `<Route path="/shop/car-fresheners/:handle" element={<CarFreshenerDetail />} />` above catch-all
- `CarFreshenerCard.tsx`: wrap image + title in a `Link to={`/shop/car-fresheners/${item.id}`}` (whole-card click, keeps Add-to-cart button un-nested)
- `public/sitemap.xml`: add 6 detail URLs (placeholder handles)

### Design tokens & rules honored
- No hardcoded colors, no gradients on surfaces
- Cormorant Garamond for H1/H2/product name; existing `luxury-*`, `cream*`, `gold` tokens
- Respects `prefers-reduced-motion`
- Mobile-first; sticky add-to-cart bar on mobile for detail page

### Explicitly out of scope (per your answers)
- **No Shopify products will be created** this turn. Until you add products tagged `car-freshener` in Shopify, the page shows placeholders and Add-to-cart stays disabled ("Coming soon" tooltip).
- **No notify-me form / waitlist table** this turn (you selected "Skip Shopify for now" and did not select the notify-me option). Say the word and I'll add a `car_freshener_waitlist` table + form in a follow-up.
- No admin surface, no new edge functions.

### After you tag products in Shopify
Zero code changes needed — the helpers detect tagged products and switch the grid/detail to real Shopify data, enabling the real Add-to-cart flow automatically.