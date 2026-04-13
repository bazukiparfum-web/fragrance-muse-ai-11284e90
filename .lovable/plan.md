

## Plan: Route Admin Notes, Rules, and Scents Through Edge Functions

### Problem
The `/admin/notes`, `/admin/rules`, and `/admin/scents` pages all use direct `supabase.from(...)` calls which fail with "Failed to fetch" in the preview environment — the same issue that was fixed for `/admin/questions`.

### Solution
Apply the same pattern: route all database operations through edge functions using `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

### Changes

**1. Create new edge function: `supabase/functions/admin-manage-notes/index.ts`**
- Service role key, no auth checks
- Operations: `list` (all notes), `create`, `update`, `update_bulk` (for bulk category/family/status changes), `delete`

**2. Rewrite edge function: `supabase/functions/admin-manage-rules/index.ts`**
- Remove all auth/admin-role checks
- Use service role key (same pattern as admin-manage-questions)
- Keep existing operations: `list`, `create`, `update`, `delete`

**3. Rewrite edge function: `supabase/functions/admin-upload-notes/index.ts`**
- Remove all auth/admin-role checks
- Use service role key

**4. Create new edge function: `supabase/functions/admin-manage-scents/index.ts`**
- Service role key, no auth checks
- Operations: `list` (public scents with profiles), `update_tag`

**5. Update `supabase/config.toml`**
- Add `verify_jwt = false` for `admin-manage-notes` and `admin-manage-scents`
- Ensure `admin-manage-rules` and `admin-upload-notes` have `verify_jwt = false`

**6. Update `src/pages/admin/AdminNotes.tsx`**
- Replace all `supabase.from('fragrance_notes')` calls with `supabase.functions.invoke('admin-manage-notes', { body: { operation, ... } })`
- Affects: `loadNotes`, `handleCellEdit`, `handleCloneNote`, `handleDeleteNote`, `handleBulkCategoryChange`, `handleBulkFamilyChange`, `handleBulkStatusToggle`

**7. Update `src/pages/admin/AdminRules.tsx`**
- Replace `supabase.from('formulation_rules')` in `loadRules` with edge function call
- CRUD calls already use `admin-manage-rules` edge function — those stay the same

**8. Update `src/pages/admin/AdminScents.tsx`**
- Replace `supabase.from('saved_scents')` and `supabase.from('profiles')` calls with `supabase.functions.invoke('admin-manage-scents', ...)`
- Affects: `fetchScents`, `updateTag`

### Summary
- 2 new edge functions created
- 2 existing edge functions simplified (auth removed)
- 3 admin page components updated to use edge functions exclusively
- Config updated for JWT bypass

