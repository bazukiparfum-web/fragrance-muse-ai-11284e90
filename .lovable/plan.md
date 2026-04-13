

## Plan: Admin Scent Tagging + Collection Search & Filters

### 1. New Admin Page: Scent Tag Manager (`src/pages/admin/AdminScents.tsx`)

A new admin page at `/admin/scents` that:
- Fetches all public scents (`is_public = true`) from `saved_scents`
- Displays them in a table with columns: Name, Creator, Current Tag, Actions
- Each row has a dropdown (Select component) to set `creator_tag` to `influencer`, `celebrity`, or clear it (community/null)
- Updates happen inline via `supabase.update()` on the `saved_scents` table
- Search input to filter scents by name

### 2. Admin Dashboard Update (`src/pages/admin/AdminDashboard.tsx`)

- Add a 5th card "Scent Tags" with a Tag/Award icon linking to `/admin/scents`
- Add the route in `App.tsx`

### 3. Collection Page Search & Filters (`src/pages/Collection.tsx`)

Add a filter bar below the page header with:
- **Search input**: Filter scents by name (client-side filtering on already-fetched data)
- **Category filter**: Dropdown to show All / Influencer Picks / Celebrity Scents / Community
- **Intensity filter**: Slider or dropdown for Low (1-3) / Medium (4-6) / High (7-10)
- **Sort by**: Newest / Oldest / Highest Match Score

Filtering is done client-side since the dataset is small. The filtered results still render into the existing section layout, but when a filter is active, all matching scents show in a single grid instead of separated sections.

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/pages/admin/AdminScents.tsx` | Create -- table of public scents with tag dropdown |
| `src/pages/admin/AdminDashboard.tsx` | Edit -- add Scent Tags card |
| `src/App.tsx` | Edit -- add `/admin/scents` route |
| `src/pages/Collection.tsx` | Edit -- add search bar, category/intensity/sort filters |

### No Database Changes Needed

The `creator_tag` column and RLS policies already exist. Admins can already update `saved_scents` via the existing admin RLS policy.

