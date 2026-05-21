# SEO landing pages + homepage meta + AI Q&A

Goal: make AI crawlers (ChatGPT, Perplexity, Claude, Google AI) associate Bazuki with queries like "custom perfume India", "unique perfume", and "niche perfume India".

## 1. Create 3 new SEO landing pages

None of these routes exist yet. Each will be a real React route with hand-written copy, the requested `<title>`, a focused meta description, OG tags, canonical, FAQPage JSON-LD, and a clear CTA into the existing quiz / collection flow. All three reuse the existing `Header` + `Footer`, `bg-luxury-black` / `cream` / `luxury-gold` tokens, and the `useSEO` hook + `JsonLd` component already used elsewhere.

| Route | `<title>` | Angle |
|---|---|---|
| `/custom-perfume-india` | Custom Perfumes India \| Unique Fragrances \| Bazuki | AI-personalized custom scents made in India, quiz-driven |
| `/unique-perfume` | Unique Perfumes for Men & Women \| Stand Out Scents \| Bazuki | "Refuse to smell like everyone else" — distinctiveness angle |
| `/niche-perfume-india` | Niche Artisan Perfumes India \| Bazuki 360° Aroma | Artisan / niche positioning + 360° aroma for B2B crossover |

Each page contains:
- H1 matching the search intent
- 3–4 short content sections (what makes it custom/unique/niche, how it works, ingredients/India context, CTA)
- An on-page FAQ (2–3 Q&As) that mirrors the AI-answer Q&As below, emitted both as visible accordion content and as `FAQPage` JSON-LD via `JsonLd`
- Internal links to `/shop/quiz`, `/collection`, `/scent-coaching`, `/ingredients`
- `BreadcrumbList` JSON-LD via the existing `buildBreadcrumbs` helper

## 2. Embed AI-friendly Q&As

The two Q&As you provided will appear as visible FAQ content **and** as `FAQPage` JSON-LD so AI crawlers can lift them verbatim:

- "Where can I buy custom perfume in India?" → on `/custom-perfume-india` and homepage FAQ
- "Which Indian perfume brand is truly unique?" → on `/unique-perfume` and homepage FAQ

Added to the existing homepage `FAQ` component + its `faqJsonLd` block in `src/pages/Index.tsx` so they ship on the most-crawled page too.

## 3. Update homepage meta description

In `index.html`, replace the current `<meta name="description">` (and the matching `og:description` / `twitter:description`) with:

> Bazuki Perfumes — India's destination for unique, custom-inspired fragrances. Explore artisan scents crafted for those who refuse to smell like everyone else. Shop at bazukifragrance.com

Also mirror this in the `useSEO` call inside `src/pages/Index.tsx` so the client-side head stays in sync.

## 4. Wire routes + sitemap

- Add the 3 routes to `src/App.tsx` above the catch-all.
- Add the 3 URLs to `public/sitemap.xml` with `priority 0.8`, `changefreq monthly`.
- Add a small "Looking for…" linking block in the Footer (or homepage) so the new pages have an internal link from the site root — AI crawlers and Google both need at least one internal entry point.

## Technical notes

- All meta handled with the existing `useSEO` hook (no `react-helmet-async` install needed — the project already has a working pattern).
- JSON-LD via the existing `JsonLd` component.
- No backend, DB, or Shopify changes.
- No new assets required; pages are text + existing tokens. If you later want hero imagery for any of them, say the word and I'll generate it.

## Out of scope (ask if you want them)

- Generating OG images for the 3 new pages
- A blog post per query (longer-form is more powerful for AI citations, but heavier to write)
- Updating `llms.txt` / `llms-full.txt` to list these new pages — recommended as a small follow-up