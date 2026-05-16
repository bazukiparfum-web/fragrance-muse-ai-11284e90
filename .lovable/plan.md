## Add infinite scroll to /collection (full mixed list)

Keep the current fetch-once strategy (Shopify + community scents loaded in parallel on mount), then paginate the combined filtered list client-side as the user scrolls. This preserves mood filtering across the entire library and avoids cursor complexity.

### 1. `src/pages/Collection.tsx`
- Add `visibleCount` state, default `12`.
- Reset `visibleCount` back to `12` whenever `mood` changes (so switching filters starts fresh from the top).
- Slice `filtered` to `filtered.slice(0, visibleCount)` for rendering.
- Add a `sentinelRef` div placed after the grid. Use existing `useInView` hook (`{ rootMargin: "0px 0px 400px 0px", once: false }`) to detect when the sentinel approaches the viewport.
- In an effect on `inView`, if `visibleCount < filtered.length`, increment `visibleCount` by `12` (wrap in `setTimeout(..., 150)` to debounce and avoid double-trigger).
- Render 3 `<CardSkeleton />` placeholders inside the sentinel area while more items exist (loading-more hint).
- When `visibleCount >= filtered.length` and `filtered.length > 0`, render a small centered `text-cream-muted` line: `"You've reached the end of the library."`.

### 2. Accessibility & UX
- Sentinel is `aria-hidden`; the end-of-list message uses `role="status"`.
- Respect reduced motion (the `useInView` hook already does).
- Existing skeleton/error/empty states unchanged.

### 3. No changes to
- `src/lib/shopify.ts` (no Storefront cursor pagination needed for v1)
- Cart, drawer, ScentCard, ShopifyProductCard
- Supabase query (already capped at 60 public scents)

### Verification
1. Load /collection → first 12 cards render.
2. Scroll down → next 12 appear smoothly without flicker; 3 skeletons briefly visible.
3. Continue until end → end-of-library message appears, no further fetches.
4. Switch mood filter → list resets to top with first 12 of that mood.
5. Empty mood → existing `<CollectionEmpty />` shows (no sentinel).
6. Fetch error → existing `<CollectionError />` shows (no sentinel).

### Files touched
- Edit: `src/pages/Collection.tsx`

No new files, no schema or cart changes.