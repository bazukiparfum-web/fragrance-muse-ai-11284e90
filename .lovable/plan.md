# Skeleton loaders for Travel Through the Senses

The 12 mood cards render from local data, so the only thing that actually "loads" is each card's image (lazy-loaded) and the matched-product data used by the mood modal. On mobile this shows as empty dark tiles before images decode. Add graceful skeletons so the grid always looks intentional.

## What changes

1. **Per-card image skeleton (`SenseCard.tsx`)**
   - Track `loaded` / `errored` state on the image.
   - While not loaded, show a gold shimmer placeholder filling the card's aspect box (reuses the existing `shimmer-gold` animation from the global stylesheet), plus muted placeholder bars where the title and blurb sit.
   - Fade the real image in (opacity transition, ~400ms) once `onLoad` fires; on error keep a static dark tile with the title text so nothing breaks.
   - Respect reduced motion: shimmer falls back to a flat tinted surface.

2. **Grid-level skeleton on mobile first paint (`TravelThroughSenses.tsx`)**
   - Keep the same grid/gap/aspect classes for skeletons so there is zero layout shift between skeleton and loaded card.
   - Mark the first row of images as eager/high priority so above-the-fold cards settle fast; the rest stay lazy with skeletons.

3. **Modal product list skeleton (`SenseJourneyDialog.tsx`)**
   - While the Shopify product fetch is still in flight, show 2–3 shimmer rows in the recommendations area instead of an empty gap or an early "no matches" state.
   - Requires exposing a `loading` flag from the fetch in `TravelThroughSenses.tsx` and passing it into the dialog.

## Technical notes

- Reuse the existing `.shimmer-gold` keyframes; no new global animation.
- Skeleton blocks use design tokens (`bg-bz-card`, `border-gold/15`) — no hardcoded hex.
- Skeletons are `aria-hidden` and the grid gets `aria-busy` while images are pending.
- No data or business-logic changes; presentation only.
