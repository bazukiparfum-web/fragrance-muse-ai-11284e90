# SEO metadata, Ingredient detail modal & homepage Ingredients teaser

## Overview
Three additions:
1. **SEO metadata** for `/ingredients` and `/about` (title, description, canonical, Open Graph, Twitter card).
2. **Click-to-open modal** on each Ingredients grid card showing role (top/heart/base), scent profile, and typical pairing notes.
3. **Homepage Ingredients teaser block** matching the uploaded image (image-left / text-right "10 essential building blocks" with "Discover the ingredients →" link).

No new dependencies — `react-helmet` is not installed and we don't need it. We'll use a tiny `useSEO` hook that mutates `document.title` and meta tags on mount/cleanup.

---

## 1. SEO metadata

### New file: `src/hooks/useSEO.ts`
Reusable hook. On mount it sets:
- `document.title`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
- Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

It creates tags if missing and restores prior values on unmount so navigation doesn't leave stale meta. Canonical URL = `window.location.origin + pathname`.

### Apply in pages
- **`src/pages/Ingredients.tsx`**:
  - Title: *"Our Ingredients — 10 IFRA-Compliant Building Blocks | Bazuki"*
  - Description: *"Explore the 10 premium, IFRA-compliant fragrance notes Bazuki uses to compose every personalised scent — from bergamot and rose to sandalwood and amber."*
  - OG image: imported `ingredients-hero.jpg` URL.
- **`src/pages/About.tsx`**:
  - Title: *"The Science & Technology Behind Bazuki Fragrances"*
  - Description: *"Discover how Bazuki blends AI-driven perfumery with a precision 10-pump dispensing machine to craft fragrances that feel unmistakably yours."*
  - OG image: imported `science-hero.jpg` URL.

---

## 2. Ingredient detail modal

### Edit `src/pages/Ingredients.tsx`
Extend the `LaunchNote` interface with:
- `role: "Top" | "Heart" | "Base"`
- `profile: string` — short sensory description
- `pairings: string[]` — 2–4 names from the same launch list

Role assignment: Bergamot/Lemon = Top; Lavender/Rose/Jasmine = Heart; Cedarwood/Sandalwood/Vanilla/Musk/Amber = Base. Pairings drawn only from the 10 launch notes.

Replace static cards with shadcn `Dialog`:
- Each card wrapped in `<Dialog>`, the card itself is `<DialogTrigger asChild>` with `cursor-pointer` + existing `hover:shadow-md`.
- `<DialogContent>` shows:
  - Header: family-color dot + note name + family chip.
  - **Role** badge (e.g., "Heart note") via shadcn `Badge`.
  - **Scent profile** paragraph.
  - **Pairs well with** — row of `Badge` chips per pairing.
  - Footer line: *"Dispensed by PUMP-XX"* using `(index + 1).toString().padStart(2, "0")`.
- Title/description use `text-primary-foreground` to match the existing dialog visual style memory.
- Cards get `aria-label="View details for {name}"`.

Per-card uncontrolled Dialogs (simpler than central state).

---

## 3. Homepage Ingredients teaser block

### New component: `src/components/IngredientsTeaser.tsx`
Mirrors the uploaded image — image-left, text-right, mobile stacks.

- Section: `py-16 md:py-24` with `container mx-auto px-4`.
- `grid md:grid-cols-2 gap-10 md:gap-16 items-center`.
- Left: rounded `ingredients-hero.jpg` (reuse existing asset).
- Right:
  - Eyebrow: `OUR PALETTE` (uppercase, gold).
  - Heading: *"10 essential building blocks"* (`font-serif text-4xl md:text-5xl`).
  - Two paragraphs (same copy as `/ingredients` hero).
  - Link: *"Discover the ingredients →"* — `react-router-dom` `Link` to `/ingredients`.

### Edit `src/pages/Index.tsx`
Insert `<IngredientsTeaser />` between `<ProductShowcase />` and `<FAQ />`.

---

## Files

**New**
- `src/hooks/useSEO.ts`
- `src/components/IngredientsTeaser.tsx`

**Modified**
- `src/pages/Ingredients.tsx` — apply `useSEO`, extend launch-note data, wrap each grid card in a Dialog with role / profile / pairings.
- `src/pages/About.tsx` — apply `useSEO`.
- `src/pages/Index.tsx` — mount `<IngredientsTeaser />`.

## Out of scope
- No DB changes (notes stay hardcoded — stable launch set).
- No new dependencies.
- No header nav changes.
- No edits to global `index.html` defaults (page-level meta overrides per route).