## Goal
Add a "Trusted By" client logo carousel on the Scent Marketing (`/business`) and About (`/about`) pages. Responsive hybrid: auto-scrolling marquee on mobile, clickable arrow carousel on desktop.

## What we'll build

### 1. New shared component: `src/components/TrustedByCarousel.tsx`
A self-contained, reusable section component.

**Props:**
- `eyebrow?: string` — small label (default: `"Trusted By"`)
- `title?: string` — heading (default: `"Brands that trust Bazuki"`)
- `logos: { name: string; src: string; href?: string }[]`
- `className?: string`

**Behavior:**
- **Mobile (`< md`)**: pure CSS infinite marquee (duplicated logo track, `@keyframes` translateX). Pauses on touch/hover. No arrows.
- **Desktop (`>= md`)**: shadcn `Carousel` (Embla) showing 5–6 logos at a time, with prev/next arrows, `loop: true`, `align: "start"`, and Embla autoplay plugin (slow drift, pauses on hover).
- Logos rendered as `<img>` with grayscale + reduced opacity by default, full color on hover (subtle, brand-respectful).
- `prefers-reduced-motion`: marquee/autoplay disabled, static row shown.
- Fully a11y: `role="region"` with `aria-label="Trusted by"`, alt text from `name`.

**Styling:** Dark theme aware, uses Bazuki tokens (`bg-bz-secondary` / `border-gold/15`). Logo tile: ~`h-12 md:h-14`, `object-contain`, `px-6`, separated by faint vertical dividers.

### 2. Logos data + assets
- Add **`src/data/clientLogos.ts`** exporting a single `CLIENT_LOGOS` array consumed by both pages.
- Place uploaded logo files under **`src/assets/clients/`** (e.g., `narayani-heights.png`, `adani-menswear.png`, etc.) and import them.
- Until you upload real files, the array will be **empty** and the component will render nothing (graceful no-op). Once you drop logos in, both pages light up automatically.

You'll provide the actual logo files. We'll add each as an `import` in `clientLogos.ts`.

### 3. Placement

**`src/pages/Business.tsx`** — insert `<TrustedByCarousel />` between `<B2BPackages />` and `<ClientStories />` (i.e., right after Scent Marketing Packages, in a "Trusted By" strip).

**`src/pages/About.tsx`** — insert as a new `<section>` between the existing stats strip and the bottom CTA.

### 4. Dependency
Add `embla-carousel-autoplay` (small, official Embla plugin) for the desktop autoplay drift. Already-installed `embla-carousel-react` powers the rest via the existing shadcn `Carousel`.

### 5. SEO / structure
- Use a proper `<section aria-labelledby="trusted-by-…">` with a visible `<h2>` (sr-only on Business if it'd clutter, visible on About). No JSON-LD needed (logos alone aren't a structured-data entity).

## File changes summary
- **Add** `src/components/TrustedByCarousel.tsx`
- **Add** `src/data/clientLogos.ts`
- **Add** `src/assets/clients/` (directory; you'll upload logo files here)
- **Edit** `src/pages/Business.tsx` — import + render after `B2BPackages`
- **Edit** `src/pages/About.tsx` — import + render after stats strip
- **Install** `embla-carousel-autoplay`

## Out of scope
- No backend / DB changes.
- No edits to other pages, header, footer, or Shopify.
- No logo-management admin UI (logos are code-managed for now — fast to add, simple to maintain).

## Next step from you
Upload the customer logo files (PNG with transparent background preferred, or SVG). Drop them anywhere and tell me the brand names + order; I'll wire them into `clientLogos.ts` during build.
