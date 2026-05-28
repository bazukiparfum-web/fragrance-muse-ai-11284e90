## Bulk download & upload on /admin/formulas

Add XLSX-based bulk export/import to the Formula Library, with a dry-run preview before any writes.

### UI additions (`src/pages/admin/AdminFormulas.tsx`)

Header toolbar gets two new buttons next to the search bar:

- **Download all (.xlsx)** — exports the entire library regardless of current search filter.
- **Upload (.xlsx)** — opens a hidden file input, then a preview dialog.

### Export format — multi-sheet workbook

Built client-side with `xlsx` (SheetJS, ~400KB, already widely used). One file: `formula-library-YYYY-MM-DD.xlsx`.

Sheets:
1. **Formulas** — one row per formula: `fragrance_code`, `formula_name`, `version`, `total_volume_ml`, `saved_scent_id`, `creator_email`, `created_at`, `updated_at`.
2. **Notes** — long-format, one row per note: `fragrance_code`, `layer` (top/heart/base), `note`, `percentage`.
3. **Pumps** — one row per pump step: `fragrance_code`, `pump_id`, `ingredient_code`, `duration_sec`.
4. **README** — fixed sheet explaining the format, which columns are editable on re-upload, and the `fragrance_code` rule (immutable join key).

### Import flow — dry-run preview, then apply

1. Admin picks a `.xlsx`. Parsed client-side.
2. Client validates: required columns present, percentages per layer sum to ~100, every pump's `ingredient_code` exists in current pumps list, `total_volume_ml` in {30, 50, 100}.
3. Client posts parsed rows to `admin-manage-formulas` with `action: 'import_preview'`. Edge function compares to DB and returns:
   - `new[]` — codes not in DB (will insert)
   - `updated[]` — codes in DB with diffs (per-field old → new, version will bump)
   - `unchanged[]` — codes identical to DB
   - `invalid[]` — validation errors with row + reason
4. Preview dialog (`ImportPreviewDialog`) shows the four buckets with counts and expandable diff rows. Per-conflict admin can:
   - Toggle each `updated` row to **Apply**, **Skip**, or **Keep DB version** (default: Apply).
   - Bulk actions: "Apply all updates", "Skip all updates".
   - `new[]` rows always insert (toggle to skip individually if desired).
   - `invalid[]` rows are blocked and listed read-only.
5. On confirm, client posts the resolved set with `action: 'import_apply'`. Edge function upserts only the selected rows, bumping `version` on updates. Returns `{ inserted, updated, skipped, failed }`.
6. Toast summary + auto-reload list.

### Edge function changes (`supabase/functions/admin-manage-formulas/index.ts`)

Add two new actions to the existing function (no new function needed):

- `import_preview` — accepts `{ formulas: [{ fragrance_code, formula_name, total_volume_ml, notes_formula, pump_instructions }] }`. Fetches matching codes from `machine_formulas`, computes per-field diffs, returns buckets.
- `import_apply` — accepts the same shape plus a `resolutions: Record<code, 'apply' | 'skip'>` map. For each apply: upsert into `machine_formulas` (existing `ON CONFLICT (fragrance_code)` in `generate_machine_formula` already handles version bump, but here we write directly so we mirror that — set `version = current + 1` on update).

No DB schema changes required — `machine_formulas` already has everything needed and `fragrance_code` is the unique key.

### New file
- `src/components/admin/FormulaImportPreviewDialog.tsx` — the preview/confirm dialog.

### Out of scope
- CSV/JSON formats (XLSX only, per choice).
- Editing `fragrance_code` itself via upload — it's the join key; rows with codes not in DB always insert as new.
- Bulk delete via upload (would need a separate destructive flow).
- Pump/ingredient autocreation — uploads referencing unknown pumps fail validation.

### Files touched
- `src/pages/admin/AdminFormulas.tsx` (toolbar buttons, file input, wire-up)
- `src/components/admin/FormulaImportPreviewDialog.tsx` (new)
- `supabase/functions/admin-manage-formulas/index.ts` (+ `import_preview`, `import_apply` actions)
- `package.json` (add `xlsx` if not already present)