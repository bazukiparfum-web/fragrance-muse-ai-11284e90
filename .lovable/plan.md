## Goal
Improve the homepage SEO so search results and social previews reflect the actual content (AI quiz, custom fragrances, the Bazuki Machine) instead of generic copy.

## Files to edit

1. **`src/pages/Index.tsx`** — Update the `useSEO` call with a sharper, keyword-rich title and description that mention the AI quiz, custom fragrances starting at ₹700, and the AI filling machine. Add an `ItemList` JSON-LD describing the main homepage sections (How It Works, Meet the Machine, Signature Collection, FAQ) so crawlers and AI search surface them as distinct page sections.

2. **`index.html`** — Bring the static `<title>`, `<meta name="description">`, sitewide `og:*` and `twitter:*` tags in line with the new homepage messaging (so social-preview crawlers, which don't run JS, see the same story).

## Content

- **Title** (≤60 chars): `Bazuki – AI Custom Perfumes Made in India · From ₹700`
- **Description** (≤160 chars): `Take a 2-minute quiz and our AI filling machine blends 3 custom fragrances from 52 ingredients. Free delivery across India. From ₹700.`
- **Keywords** stay focused: custom perfume India, AI perfume, AI fragrance machine, personalized perfume, quiz perfume, niche fragrance India.
- **ItemList JSON-LD** (homepage only): named entries for "How It Works", "Meet the Bazuki Machine — India's First AI Fragrance Filling Machine", "Signature Collection", and "FAQ", each pointing to `/#section-id` anchors. Add matching `id` attributes to the existing section wrappers so the anchors resolve.

## Out of scope
- No new pages, no design changes, no copy changes in visible UI beyond adding `id` anchors to existing sections.
- og:image stays as the existing `/og-image.jpg`.