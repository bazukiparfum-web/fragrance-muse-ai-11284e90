# Mood links, mood modal, and mood-matched product carousel

Three connected upgrades to the "Travel Through the Senses" experience.

## 1. Shareable mood links

The collection page already reads `?mood=` on load, but changing the filter chips does not update the URL, so reloading or sharing after a manual filter loses the selection.

- Make the mood filter the single source of truth in the URL: selecting a chip rewrites `?mood=Woody` (and clears it for "All") using `setSearchParams` with `replace`.
- Keep the existing read-on-load behaviour so a pasted or reloaded link restores the same filtered grid.
- Also carry the originating journey as `?journey=midnight-library` so shared links can show a small "Coming from Midnight Library" line above the grid, with a reset link back to the full library.
- Add the mood to the page title/description so shared links read correctly.

## 2. Mood detail modal on each SenseCard

Clicking a mood card currently jumps straight to a product. Instead it opens a preview first.

- Card click opens a dialog (existing shadcn Dialog, Bazuki dark/gold styling) with:
  - the mood illustration, title, and blurb
  - a fragrance-notes sketch for that mood (Top / Heart / Base), added as static data per journey
  - up to 3 recommended products matched from the already-loaded Shopify list using that journey's keywords, then falling back to its scent family
  - primary button "Explore all {Mood}" linking to `/collection?mood=…&journey=…`
- Each recommended product tile links to its product page and closes the modal.
- Keyboard and screen-reader support: cards stay focusable buttons, dialog traps focus, illustrations keep alt text, and reduced-motion users get no transform animation.

## 3. "Similar to this mood" carousel on product pages

On every fragrance product page, below the existing content and near the current "You Might Also Love" block:

- Derive the product's mood from the existing mood mapper.
- Show a horizontally scrollable carousel of other products in the same mood (excluding the current one), falling back to keyword matches when the mood has few products; hide the section when nothing matches.
- Header reads "Similar to this mood — {Mood}" with a "See all {Mood}" link to `/collection?mood={Mood}`.
- Reuse the existing product card and carousel primitives so styling and cart behaviour stay identical.

## Technical notes

- `src/data/senseJourneys.ts`: add `notes: { top, heart, base }` per journey.
- `src/lib/moodMatch.ts` (new): shared helpers to match products to a journey's keywords and to a `Mood`, reused by the gallery, modal, and product carousel.
- `src/components/home/SenseCard.tsx`: becomes a button that opens the modal; navigation moves into the modal.
- `src/components/home/SenseJourneyDialog.tsx` (new): the modal.
- `src/components/home/TravelThroughSenses.tsx`: owns dialog state and passes the fetched product list down.
- `src/components/product/SimilarMoodCarousel.tsx` (new), rendered from `src/pages/ProductDetail.tsx`.
- `src/pages/Collection.tsx`: two-way sync of mood with `useSearchParams`, plus the journey context line.
- No backend, schema, or checkout changes.
