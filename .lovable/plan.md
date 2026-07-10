## Hanging Car Freshener page — `/shop/car-fresheners`

A new product catalog page matching the site's dark/luxury aesthetic (Cormorant Garamond serif, gold accents, flat dark surfaces — same language as `/business` and `/collection`). Placeholder product data now; wire to Shopify later.

### What gets built

**1. New route** `src/pages/CarFresheners.tsx`
- `Header` + `Footer` + `ScrollToTop`
- SEO via `useSEO`: title "Hanging Car Perfumes & Fresheners | Bazuki", meta description, breadcrumbs JSON-LD, `ItemList` JSON-LD for the products
- Sections in order:
  1. **Hero** — eyebrow "Fine fragrance for your drive", H1 (serif) "Hanging car perfumes, crafted like fine fragrance", supporting copy, two CTAs (Shop below / Talk to us → `/business` for bulk)
  2. **Trust strip** — 3–4 icon+label items (long-lasting up to 45 days, IFRA-safe oils, made in India, plastic-free card)
  3. **Product grid** — heading "The collection", responsive grid (1 → 2 → 3 → 4 cols) of placeholder cards
  4. **How it works / Scent notes teaser** — 3 steps (Hang · Diffuse · Refresh)
  5. **Bulk / corporate gifting** strip → links to `/business` and prefills the archetype-style enquiry (reuses existing lead form event pattern optionally later; for now, plain CTA link)
  6. **FAQ** — 4 short Q&As (longevity, safety, refills, bulk)
  7. Final CTA strip

**2. Placeholder data** `src/data/carFresheners.ts`
- Exports `CAR_FRESHENERS: CarFreshener[]` with 6 entries: `id`, `name` (e.g. Midnight Oud, Amber Drive, Citrus Highway, White Musk Cabin, Sandalwood Cruise, Rose Noir), `tagline`, `notes: string[]`, `price` (₹), `accentHsl`, `image` (AI-generated flat product render on dark backdrop)
- Placeholder images: 6 generated square PNGs saved to `src/assets/car-fresheners/*.png` (dark luxury product shots of a wooden/card hanging freshener with cord)

**3. Product card** `src/components/car-fresheners/CarFreshenerCard.tsx`
- Dark card, subtle gold border, hover lifts border + slight translateY(-2px), aspect-square image stage (reuses look of `ProductImageStage` — gold corners, gradient fade)
- Title (Cormorant Garamond), tagline, note pills tinted with `accentHsl`, price, "Add to cart" button (disabled with "Coming soon" tooltip since no Shopify products yet)

**4. Routing + nav**
- `src/App.tsx`: add `<Route path="/shop/car-fresheners" element={<CarFresheners />} />` above the catch-all
- `src/components/Header.tsx`: add "Car Fresheners" link into the existing Shop nav group (both desktop dropdown and mobile menu)
- `src/components/Footer.tsx`: add link under the Shop column
- `public/sitemap.xml`: add the new URL

### Design tokens & rules honored
- No hardcoded colors — uses existing `luxury-black`, `luxury-gold`, `cream`, `cream-muted`, `primary`, `border` tokens
- No gradients on cards — flat dark surfaces
- Cormorant Garamond for H1/H2 and product names
- Mobile: 1 col → 2 col at `sm` → 3 at `md` → 4 at `lg`
- Respects `prefers-reduced-motion` (no hover lift when reduced)

### Explicitly out of scope (this turn)
- No Shopify product creation, no cart wiring — Add-to-cart button renders as "Coming soon" until real Shopify products exist for this category
- No new DB tables, edge functions, or lead-form changes
- No admin surface

### After approval
Once you confirm, I'll implement all files in one pass and generate the 6 placeholder product images. When you're ready to sell for real, we'll create the Shopify products (with the `car-freshener` tag) and swap the grid over to `fetchShopifyProducts(50, "tag:car-freshener")` — same pattern as `BusinessDiffusers.tsx`.