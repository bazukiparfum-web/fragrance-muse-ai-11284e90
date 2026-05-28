## Goal
Make the Production Queue page testable end-to-end with the machine by:
1. Seeding realistic dummy queue jobs on demand.
2. Allowing admins to download the current queue as Excel.
3. Allowing admins to upload an Excel file to bulk-create queue jobs.

## Changes

### 1. New edge function: `admin-seed-production-queue`
- Admin-only (same auth pattern as `admin-manage-production`).
- Body: `{ count?: number }` (default 5).
- Picks the 10 launch-mapped notes (PUMP-01…PUMP-10) and randomly composes 3–5 note formulas per job that sum to 100%.
- Inserts rows into `production_queue` with:
  - `fragrance_code`: `DUMMY-<8charRand>`
  - `size`: random from `30ml` / `50ml` / `100ml`
  - `quantity`: 1
  - `status`: `pending`
  - `formula`: `{ notes: [{name, percentage}], total_volume_ml }`
  - `saved_scent_id`: null, `order_id`: null
- Returns inserted count.

### 2. Production Queue UI (`src/pages/admin/AdminProductionQueue.tsx`)
Add a toolbar above the table with three actions:
- **Generate dummy jobs** — number input (default 5) + button → calls seed function, then `load()`.
- **Download Excel** — exports current `items` to `production-queue-<date>.xlsx` using `xlsx` (SheetJS). Columns: code, size, qty, status, created_at, started_at, completed_at, formula (JSON string), machine_notes.
- **Upload Excel** — hidden file input + button. Parses rows client-side, validates required columns (`fragrance_code`, `size`, `formula`), then sends to a new bulk endpoint.

### 3. New edge function: `admin-bulk-import-queue`
- Admin-only.
- Body: `{ rows: Array<{ fragrance_code, size, quantity?, formula, machine_notes? }> }`.
- Validates each row (size ∈ 30/50/100ml, formula is object/array, fragrance_code non-empty), inserts in batch, returns `{ inserted, errors[] }`.
- Toast shows summary; refresh queue on success.

### 4. Dependency
- Add `xlsx` (SheetJS) to the project for parse/generate.

### Out of scope
- No DB schema changes (table already exists).
- No changes to machine API or the existing Start/Complete/Fail flow.
- No changes elsewhere in the app.

## Technical notes
- Excel column order matches a downloadable template — a user can download, edit, and re-upload.
- Dummy jobs use real pump-mapped note names so the machine API returns usable formulas.
- Both new edge functions follow the existing admin auth + service-role pattern.
