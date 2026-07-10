## Verification: OG/Twitter image fallback for Custom AI Fragrance

Reviewed the flow end-to-end and this is already correctly wired — no code changes needed.

### What's already in place

1. `src/pages/ProductDetail.tsx`
   - Imports `customAiFragranceImage` from `@/assets/custom-ai-fragrance.jpg` (Vite emits a hashed absolute path like `/assets/custom-ai-fragrance-xxxx.jpg`).
   - `fallbackImage = isCustomScent && images.length === 0 ? customAiFragranceImage : undefined`
   - `seoImage = images[0]?.node.url ?? fallbackImage` — passed to `useSEO({ image: seoImage })`.

2. `src/hooks/useSEO.ts` already:
   - Converts any non-`http` image to absolute via `${window.location.origin}${image}` (so the Vite-hashed `/assets/...` fallback becomes `https://www.bazukifragrance.com/assets/...`).
   - When an image resolves, sets `og:image`, `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `twitter:card = summary_large_image`, `twitter:image`, `twitter:image:alt`.
   - When no image resolves, downgrades `twitter:card` to `summary` and omits image tags — which does NOT trigger for Custom AI Fragrance because the fallback is always present.

### Net result

On `/products/custom-ai-fragrance` (or any `custom-scent-*` handle) with no Shopify images:
- `og:image` = `https://<origin>/assets/custom-ai-fragrance-<hash>.jpg`
- `twitter:image` = same absolute URL
- `twitter:card` = `summary_large_image`
- Width/height/alt tags all populated.

### Note on crawler visibility

`useSEO` mutates `document.head` client-side after hydration. JS-executing crawlers (Googlebot, Twitterbot with JS) will see the fallback image; non-JS social preview crawlers (LinkedIn, Slack, Facebook) only see the static `index.html` head. Lovable hosting injects a project-level social preview at serve time for those crawlers, so previews still render — they just aren't the per-route custom fallback. Making the per-route fallback visible to non-JS crawlers requires SSR, which this stack doesn't have.

If you want, I can also mirror the fallback into the static `index.html` `og:image` so non-JS crawlers use it as the sitewide default — otherwise no build changes needed.