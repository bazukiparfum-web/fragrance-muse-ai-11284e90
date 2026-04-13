

## Plan: Seed Dummy Fragrances + Revamp Signature Collection as Featured Showcase

### Concept

Instead of showing an empty Shopify product grid in the "Signature Collection" section on the homepage, we transform it into a dynamic showcase that pulls from the `saved_scents` database. It will display:

1. **Fragrance of the Week** -- A single highlighted fragrance that rotates based on the current week (deterministic pick from public scents)
2. **Trending Picks** -- A curated row of 4 fragrances randomly selected from influencer/celebrity-tagged scents
3. **Community Favorites** -- 4 community scents shown in a rotating selection

The section still links to `/collection` via a "View Full Collection" button.

### Database Changes

**Seed 8-10 dummy public fragrances** via a migration that inserts directly into `saved_scents` with:
- Realistic fragrance names (e.g., "Midnight Oud", "Velvet Rose", "Citrus Bloom")
- `is_public = true`
- `creator_tag` set to `'influencer'` (4 scents), `'celebrity'` (3 scents), and `null` (3 community scents)
- Proper `visual_data` with color palettes matching each fragrance theme
- `formula` as valid JSON with top/heart/base notes
- `formulation_notes` with evocative descriptions
- `match_score`, `intensity`, `longevity` values
- `fragrance_code` values
- `user_id` set to a placeholder UUID (we'll use `gen_random_uuid()` and also seed a matching dummy profile)

**Seed 1 dummy profile** for the dummy fragrances creator.

### File Changes

1. **`supabase/migrations/` -- new migration**
   - Insert a dummy profile row
   - Insert 10 dummy `saved_scents` rows with varied `creator_tag` values, visual data, and formulas

2. **`src/components/ProductShowcase.tsx` -- rewrite**
   - Replace Shopify product fetch with a query to `saved_scents` where `is_public = true`
   - Add three sub-sections:
     - **Fragrance of the Week**: One featured scent card (large), picked deterministically by week number
     - **Influencer and Celebrity Picks**: Row of tagged scents with badges
     - **Community Favorites**: Row of community scents
   - Each card reuses `FragranceVisualizer` for the visual orb
   - "View Full Collection" button links to `/collection`
   - Falls back gracefully if no public scents exist yet

3. **`src/pages/Collection.tsx` -- minor update**
   - Add a "Fragrance of the Week" highlighted card at the top (same deterministic logic)

### Technical Details

- Dummy scents use a single seeded profile with `full_name = 'Fragrance Muse'` to avoid orphan references
- Week-based selection: `Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % scents.length` for deterministic weekly rotation
- Visual data uses hand-crafted color arrays matching each fragrance's personality (warm ambers, cool blues, floral pinks, etc.)
- No authentication needed to view any of this

