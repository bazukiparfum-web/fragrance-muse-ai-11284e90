## Goal

Ensure the three new SEO landing pages (`/custom-perfume-india`, `/unique-perfume`, `/niche-perfume-india`) and the homepage emit clean, consistent canonical + Open Graph + Twitter Card metadata so shared links preview well and Google doesn't see duplicates.

## Current state

- `useSEO` already injects per-route `<link rel="canonical">`, `og:title/description/type/url`, and `twitter:card/title/description` on mount, and restores prior values on unmount.
- `index.html` ships sitewide canonical + OG + Twitter tags pointing at `https://www.bazukifragrance.com/` with `og:image = /og-image.jpg`.
- `SeoLandingPage` calls `useSEO({ title, description })` but does **not** pass an `image`, so the three new pages currently inherit no `og:image` / `twitter:image` after navigation (the static one from `index.html` gets overwritten as the user navigates between routes only for title/desc/canonical — image stays as whatever was last set).
- The three SEO pages render fine but their share previews will fall back to no image or a stale one.

## Changes

### 1. Canonicals — verify + harden

`useSEO` already writes a per-route canonical using `window.location.origin + pathname`. That's correct for the three SEO routes. No code change needed beyond confirming they render — but to be explicit and avoid any race with the static `index.html` canonical, keep the static `<link rel="canonical" href="https://www.bazukifragrance.com/">` in `index.html` (it's the homepage canonical fallback for non-JS crawlers) and rely on `useSEO` to overwrite per route. No edit required here.

### 2. Add a shared OG image to the SEO landing pages

- Extend `SeoLandingPage` props with an optional `image?: string` (defaults to `/og-image.jpg`).
- Pass it through to `useSEO` so each SEO page emits `og:image` and `twitter:image` (large card).
- The three landing page components (`CustomPerfumeIndia`, `UniquePerfume`, `NichePerfumeIndia`) don't need changes unless we want page-specific images later — they'll inherit the default `/og-image.jpg`.

### 3. Extend `useSEO` with richer OG/Twitter coverage

Add the following meta tags to the upsert list in `src/hooks/useSEO.ts`:

- `og:site_name` = "Bazuki Perfumes"
- `og:locale` = "en_IN"
- `og:image:width` = "1200", `og:image:height` = "630" (only when image is set)
- `twitter:site` = "@bazukiperfume" (only if we want it — will include since brand has social presence)
- `twitter:image:alt` = same as title (only when image is set)

All are restored on unmount via the existing `restorers` pattern.

### 4. Homepage parity

`src/pages/Index.tsx` already calls `useSEO`. After the hook gains the extra fields above, the homepage automatically benefits. Confirm `Index.tsx` passes `image="/og-image.jpg"` (or add it if missing) so `og:image` is set explicitly rather than inherited from the static head.

### 5. `index.html` cleanup

- Keep the sitewide canonical, OG, and Twitter tags as fallbacks for non-JS social crawlers (LinkedIn, Slack, Facebook) — they only ever see the static head.
- Add the two missing static tags so first-paint previews are complete: `og:image:width`, `og:image:height`, `og:locale`, `twitter:site` (mirroring what `useSEO` will set per route).

## Files touched

- `src/hooks/useSEO.ts` — add og:site_name, og:locale, og:image dimensions, twitter:site, twitter:image:alt to the upsert + restore list.
- `src/pages/seo/SeoLandingPage.tsx` — accept optional `image` prop (default `/og-image.jpg`), pass to `useSEO`.
- `src/pages/Index.tsx` — ensure `useSEO({ ..., image: "/og-image.jpg" })` is set explicitly.
- `index.html` — add `og:image:width`, `og:image:height`, `og:locale`, `twitter:site` static tags.

No new assets, no routing changes, no backend, no design tokens.

## Out of scope

- Generating per-page custom OG images (can be done later via `imagegen` if you want unique share cards per landing page).
- Updating `sitemap.xml` / `robots.txt` (already done in the previous turn).
- Adding `react-helmet-async` — current `useSEO` hook is sufficient.