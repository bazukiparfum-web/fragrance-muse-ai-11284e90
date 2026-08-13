# Travel Through the Senses — mood gallery on the homepage

A 12-card illustrated gallery that turns "where do you want to go?" into a product click. Each card is a scent world (a misty forest, a Kyoto blossom morning, a leather-and-oud library) and tapping it opens the matching fragrance product page.

## Where it goes

On the homepage (`/home`), placed between **Meet the Machine** and **Featured Scents** — after the story of how the fragrance is made, right before the products themselves.

## What the section looks like

- Heading "TRAVEL THROUGH THE SENSES" in the existing display font, gold accent mark and the same underline treatment used elsewhere on the site.
- One-line subhead: pick a world, we'll take you to the scent.
- Grid of 12 cards: 2 columns on mobile, 3 on tablet, 6 on desktop (two rows of six, matching the reference).
- Each card is a landscape illustration with the mood name revealed on hover/tap, a soft gold border glow on hover, and a gentle lift. Reduced-motion users get the border change only.
- Cards are real links (keyboard focusable, gold focus ring, alt text per card) so they work for screen readers and are crawlable.

## The 12 moods

Midnight Library, Monsoon Forest, Kyoto Blossom, Desert Oud, Citrus Harbour, Velvet Rose, Smoke & Amber, Alpine Frost, Spice Bazaar, Coastal Salt, Vetiver Fields, Vanilla Dusk.

## Where each card links

Each mood carries an ordered list of target product handles plus a scent-family fallback:

1. If a Shopify product matching the mood's handle exists, the card links straight to `/products/{handle}`.
2. If not, the card links to `/collection?mood={slug}` so the visitor still lands on relevant fragrances instead of a dead end.

Resolution happens once when the section loads, using the existing Storefront product fetch already used by the homepage — no new backend.

## Artwork

I generate 12 illustrated cards in the Bazuki palette (near-black ground, gold linework, cream highlights), one per mood, sized 1024x1024 and cropped to a 4:3 card. They are stored as project assets and lazy-loaded below the fold. No Scent Trunk branding — the reference is used for layout only.

## Technical notes

- New `src/data/senseJourneys.ts`: the 12 moods with slug, title, blurb, candidate Shopify handles, fallback family, and image import.
- New `src/components/home/TravelThroughSenses.tsx`: fetches products via `fetchShopifyProducts`, resolves each mood to a link, renders the grid. Renders nothing extra if fetch fails — falls back to collection links.
- `src/components/home/SenseCard.tsx`: single card (image, label, hover state, focus ring).
- `src/pages/Index.tsx`: mount the section between `MeetTheMachine` and `FeaturedScents`.
- `/collection` reads an optional `mood` query param and preselects the matching scent family filter.
- Colors come from existing CSS variables (`--anim-gold`, `--anim-ivory`); no hardcoded hex.
