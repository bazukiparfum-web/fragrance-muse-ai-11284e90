# SEO pages: fragrance categories, moods, and how-to guides

Goal: give Bazuki dedicated, indexable pages for the searches people actually type — "woody perfume for men india", "best perfume for monsoon", "how to make perfume last longer" — instead of funnelling everything through the homepage and quiz.

Reuses the existing `SeoLandingPage` template (same layout, breadcrumbs, JSON-LD, CTA style as `/custom-perfume-india`), so nothing new visually.

## 1. Fragrance category pages — `/perfume/:family`

Eight data-driven pages, one per scent family already used by the quiz and collection filters:

woody, floral, citrus, oriental/amber, fresh-aquatic, spicy, gourmand, musk.

Each page: keyword-targeted H1 and intro, "who it suits", note breakdown, how Bazuki composes it, links into `/collection?mood=<family>`, related families, and one quiz CTA.

## 2. Mood keyword pages — `/scent/:slug`

Twelve pages generated from the existing Travel Through the Senses journeys (Midnight Library, Monsoon Forest, Desert Oud, Coastal Salt, …). Each mood already has a title, blurb, image, and top/heart/base notes, so the page is copy plus the existing note data, product matches for that mood, and links to the matching category page and `/collection?journey=<slug>`.

## 3. Hubs, linking, and discovery

- `/perfume` index listing all category pages; `/scent` index listing all mood pages; `/guides` index listing all guides.
- Footer gets a "Explore scents" column linking the three hubs.
- Homepage: the existing Travel Through the Senses cards link through to the new mood pages.
- `public/sitemap.xml` extended with all new URLs.

## Technical notes

- New data files `src/data/scentCategories.ts` and `src/data/guides.ts`; mood pages read from the existing `src/data/senseJourneys.ts`.
- Routes are dynamic (`/perfume/:family`, `/scent/:slug`, `/guide/:slug`) rendered through `SeoLandingPage`, with unknown slugs falling through to the 404 page. Existing three guide routes keep their current components and URLs.
- Per-page `<title>`, meta description, canonical, og tags, plus `BreadcrumbList` and `Article`/`ItemList` JSON-LD, using the same helpers the current SEO pages use.
- Metadata is applied client-side (this stack has no SSR), which Google handles; social-preview crawlers still read the static head. SSR is available via a template upgrade if per-page social previews matter later — [what the upgrade gives you](https://lovable.dev/blog/building-apps-using-tanstack-start).
- Total: 24 new indexable pages + 3 hubs, no backend changes.