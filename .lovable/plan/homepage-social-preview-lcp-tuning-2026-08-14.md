# Homepage social preview + LCP tuning

Three related pieces of work: fix the homepage's social/SEO tags, preload what the hero needs, then measure and clear remaining above-the-fold bottlenecks.

## 1. Homepage Open Graph and SEO tags

Confirmed issue: `/home` sets `og:image` to `/og-image.jpg`, but no such file exists in `public/` — social shares of the homepage currently fall back to whatever the crawler picks, or nothing.

- Generate a 1200x630 branded share card for the homepage (dark surface, gold Bazuki wordmark, hero bottle, "AI-crafted custom perfumes, made in India") and add it as `public/home-og.jpg`.
- Point the homepage `useSEO` call at it with an absolute `https://www.bazukifragrance.com/...` URL so crawlers resolve it, and keep title/description/canonical self-referencing `/home`.
- Add matching `og:image:width/height/alt` and `twitter:image:alt` (the hook already supports these once an image is passed).

Honest limitation: this app is a client-rendered SPA, so the static `index.html` head is what non-JS social crawlers (WhatsApp, LinkedIn, Slack) actually read — those tags are currently written for `/coming-soon`. Options:
- **A (default):** keep `index.html` as-is for the prelaunch page and rely on Googlebot for `/home` tags. Simple, but WhatsApp previews of `/home` links will show the coming-soon card.
- **B:** switch the sitewide `index.html` og:* to neutral brand-level tags that read correctly for either page.

I'll go with B unless you say otherwise — a neutral brand card is correct for every shared link.

Note: crawlers cache previews, so a changed image won't show in shared links until they re-scrape; a link-preview debugger can force a refresh.

## 2. Preload hero image and fonts

- Add `<link rel="preload" as="image">` for the hero bottle with `imagesrcset`/`imagesizes` matching the component's existing srcset/sizes, plus `fetchpriority="high"`, so the correct rendition starts downloading during HTML parse rather than after React mounts. The hero box already reserves space via a fixed aspect ratio, so no new layout shift.
- Fonts: the Google Fonts stylesheet is currently a render-blocking `<link>`. Preconnect already exists; add `rel="preload" as="style"` for the stylesheet and preload the two woff2 files actually used above the fold (Cinzel headline weight, Inter body weight), keeping `display=swap` so text paints immediately.
- The hero is only above the fold on `/home`; on `/coming-soon` the preload would be a wasted fetch. To avoid that, the hero preload is added as a route-aware tag rather than blindly in `index.html`.

## 3. Lighthouse pass and fixes

- Run Lighthouse (mobile + desktop) against `/home` in the sandbox, capture LCP, CLS, TBT and the opportunities list.
- Fix what the report actually flags above the fold — likely candidates: unused CSS/JS in the initial bundle, non-hero images loading eagerly, and any late-injected element shifting the hero.
- Re-run after the fixes and report before/after numbers rather than claiming an improvement.

## Technical notes

- Hero renditions already exist as CDN assets (480/720/1080 WebP + 1024 JPEG fallback); the preload reuses those URLs, no new assets.
- Changes stay in `index.html`, `src/pages/Index.tsx`, `src/components/Hero.tsx`, and a small head-preload helper. No data, routing, or business-logic changes.
