# Fragrance blog

A blog hub at `/blog` with individual article pages, matching the existing guide pages' dark/gold styling, and linked from the homepage and footer.

## Blog hub (`/blog`)

- Heading "The Bazuki Journal" with a one-line intro.
- Card grid (1 col mobile, 2 tablet, 3 desktop): cover image, category tag, title, 1-line excerpt, read time.
- Category filter chips: Notes, Mood, Choosing a Fragrance.
- Bottom CTA banner: "Take the Quiz" with the standard reassurance line.

## Launch articles (6)

Notes
1. Top, Heart and Base Notes: How a Fragrance Unfolds on Skin
2. The 10 Notes in Bazuki's Launch Library (and Who Each Suits)

Mood pairing
3. Scent and Mood: Which Fragrance Family Fits How You Want to Feel
4. Day to Night: Pairing Fragrance with Occasion, Weather and Season in India

Choosing a fragrance
5. How to Choose a Fragrance You Won't Get Bored Of
6. EDP vs EDT, Sillage and Longevity: What Actually Matters When You Buy

Each article page: hero image, intro, scannable H2 sections, a summary/takeaway block, internal links to `/ingredients`, `/collection`, `/guide/perfume-notes-explained`, and a closing quiz CTA. Content is grounded in the existing note library and site facts — no invented statistics, testimonials or claims.

## Homepage link

A "From the Journal" strip below Travel Through the Senses: three latest article cards plus a "Read the journal" link to `/blog`. Also added to the footer nav.

## SEO

- Per-page title/description via the existing `useSEO` hook, plus `Article` and `BreadcrumbList` JSON-LD (same pattern as `src/pages/guides/PerfumeNotesExplained.tsx`).
- `Blog` + `ItemList` JSON-LD on the hub.
- New routes added to `public/sitemap.xml`.

## Technical notes

- `src/data/blogPosts.ts` — typed post metadata (slug, title, excerpt, category, date, read time, cover image import, related links). Article bodies live as React components so they can use existing UI primitives.
- `src/pages/blog/BlogIndex.tsx` and `src/pages/blog/BlogPost.tsx` (renders the body component matched by `:slug`, 404s on unknown slug).
- `src/components/blog/BlogCard.tsx`, `src/components/home/JournalStrip.tsx`.
- Routes `/blog` and `/blog/:slug` added lazily in `src/App.tsx`; existing `/guide/*` pages stay where they are and get cross-linked from the hub.
- 6 cover images generated in the Bazuki palette, lazy-loaded below the fold, with alt text.
- Colors from existing tokens only; no hardcoded hex.
