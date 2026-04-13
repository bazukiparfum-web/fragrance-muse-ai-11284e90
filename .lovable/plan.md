

## Plan: Public Fragrance Collection with Influencer & Celebrity Sections

### What We're Building

1. **"Publish" feature on saved scents** — Users can toggle their fragrances as public from the ScentDetail page and QuizResults page (a "Publish to Collection" button).

2. **Collection page (`/collection`)** — A new page displaying all published fragrances, organized into sections:
   - **All Published Fragrances** — Grid of community-created scents
   - **Influencer Picks** — Featured section for influencer-tagged fragrances
   - **Celebrity Scents** — Featured section for celebrity-tagged fragrances

3. **"Explore Collection" button** — Links to `/collection` from the Hero.

### Database Changes

- **Migration**: Add `creator_tag` column to `saved_scents` table (`text`, nullable, values like `'influencer'`, `'celebrity'`, or `null` for regular users). This lets admins tag certain published scents.
- **RLS**: The existing policy "Anyone can view public shared scents" (`is_public = true AND share_token IS NOT NULL`) already allows public viewing. We'll relax it slightly to allow viewing when `is_public = true` (without requiring `share_token`), so publishing doesn't depend on sharing.

### File Changes

1. **`supabase/migrations/` — new migration**
   - Add `creator_tag text` column to `saved_scents`
   - Update the public SELECT RLS policy to: `is_public = true` (remove `share_token IS NOT NULL` requirement)

2. **`src/pages/Collection.tsx` — new file**
   - Fetches all `saved_scents` where `is_public = true`
   - Renders three sections: Influencer Picks (filtered by `creator_tag = 'influencer'`), Celebrity Scents (`creator_tag = 'celebrity'`), and Community Collection (all others)
   - Each card shows fragrance name, creator name (from profiles), match score, visual data, and a "View Details" link

3. **`src/pages/ScentDetail.tsx` — edit**
   - Add a "Publish to Collection" / "Unpublish" toggle button that sets `is_public = true/false`

4. **`src/pages/QuizResults.tsx` — edit**
   - After saving a scent, offer a "Publish" option

5. **`src/components/Hero.tsx` — edit**
   - Wire "Explore Collection" button to navigate to `/collection`

6. **`src/App.tsx` — edit**
   - Add route: `/collection` → `Collection`

### Technical Details

- The Collection page queries `saved_scents` joined with `profiles` (for creator names) using the Supabase client
- Influencer/Celebrity tags are managed by admins via the admin dashboard (future enhancement) or direct DB updates
- The FragranceVisualizer component is reused on collection cards for visual appeal
- No authentication required to view the collection page

