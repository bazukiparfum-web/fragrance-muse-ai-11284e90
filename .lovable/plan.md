

## Top 5 Priority Fixes — Implementation Plan

### 1. Add Mobile Hamburger Menu
**Problem:** Header has desktop nav (`hidden md:flex`) but no mobile menu. Mobile users cannot navigate.

**Solution:** Add a Sheet-based mobile menu triggered by hamburger icon.

**Files to modify:**
- `src/components/Header.tsx`

**Changes:**
- Import `Sheet`, `SheetContent`, `SheetTrigger`, `Menu` icon
- Add hamburger button visible only on mobile (`md:hidden`)
- Sheet slides from right with nav links + Account + Cart
- Close sheet on navigation

---

### 2. Add Social Proof / Trust Strip Below Hero
**Problem:** No trust signals above the fold. Hero has pricing but no social proof.

**Solution:** Add a trust strip component below Hero with star rating, review count, and trust badges.

**Files to modify:**
- `src/components/Hero.tsx` (add strip below CTA buttons)
- Or create new `src/components/TrustStrip.tsx` and import in `Index.tsx`

**Content:**
- "★★★★★ 4.8 from 312+ happy customers"
- Trust badges: "Made in India" · "IFRA Compliant" · "Cruelty-Free" · "7-Day Delivery"

---

### 3. Replace Placeholder OG Images in index.html
**Problem:** OG and Twitter images use Lovable placeholder `https://lovable.dev/opengraph-image-p98pqg.png`

**Solution:** Create branded OG image and update meta tags.

**Files to modify:**
- `index.html` (lines 14, 19)

**Changes:**
- Replace both `og:image` and `twitter:image` URLs
- Use a branded image URL (e.g., `/og-image.png` or external CDN)
- Ensure image is 1200×630px for OG, 1200×600px for Twitter

**Note:** If no branded image exists, create a simple one or use a placeholder service with brand colors.

---

### 4. De-duplicate /business Page Content
**Problem:** `Business.tsx` has a hero section, then `BusinessAroma` component repeats similar content (badge, heading, description, features).

**Solution:** Remove redundant content from `BusinessAroma` when used on the dedicated `/business` page.

**Files to modify:**
- `src/components/BusinessAroma.tsx`
- `src/pages/Business.tsx`

**Changes:**
- Add a `showHero` prop to `BusinessAroma` (default `true`)
- When `showHero={false}`, hide the badge, H2, description paragraph, and feature list
- Keep only the CTA button and consultation dialog
- In `Business.tsx`, pass `showHero={false}` to `BusinessAroma`

---

### 5. Fix Product Card Routing to Specific Product Pages
**Problem:** `ShopifyProductCard` in `ProductShowcase.tsx` navigates to `/collection` instead of the specific product detail page.

**Solution:** Update navigation to go to specific product detail route.

**Files to modify:**
- `src/components/ProductShowcase.tsx` (line 89)
- `src/pages/Collection.tsx` (ShopifyProductCard, line ~98)

**Changes:**
- Change `onClick={() => navigate('/collection')}` to `onClick={() => navigate(`/collection/${node.id}`)}`
- Ensure the product detail route exists in `App.tsx` (e.g., `/collection/:id`)
- If no product detail page exists, create a simple one or link to external Shopify product URL

**Note:** Check if `node.id` is the Shopify GraphQL ID (gid://shopify/Product/...) or a simplified ID. May need to extract numeric ID.

---

## Implementation Order

1. **Mobile hamburger menu** (highest UX impact for mobile users)
2. **Fix product card routing** (fixes broken navigation)
3. **De-duplicate /business page** (polish, quick win)
4. **Trust strip** (conversion improvement)
5. **OG images** (SEO/social sharing)

