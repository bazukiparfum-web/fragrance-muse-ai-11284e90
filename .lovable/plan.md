
## 1. Fragrance code = name + unique suffix

Today `fragrance_code` is `{USERNAME}-{NNN}` (e.g. `VISHVAM-001`). Reorders work, but the code carries no scent identity, and different users can't share the same formula.

Change the generator to: **`{FRAGRANCE_NAME_SLUG}-{SHORT_HASH}`**, e.g. `MIDNIGHT-VELVET-7K4Q`.

- `FRAGRANCE_NAME_SLUG`: uppercase, alphanumerics + dashes, max 24 chars, trimmed.
- `SHORT_HASH`: 4-char base36 derived from the saved_scent UUID (deterministic, collision-checked against `saved_scents.fragrance_code`).
- Deterministic from `(name, saved_scent_id)` so the same scent always resolves to the same code — reorders pull the exact stored `machine_formulas` row.
- Update `src/lib/fragranceCodeGenerator.ts` signature to `(scentName, scentId)` and update all callers (`SaveScentDialog`, `account/ReorderModal`, `FormulaTweakDialog`, `admin-simulate-order`, `create-shopify-product-from-scent`).
- Existing `saved_scents.fragrance_code` rows stay untouched (they remain valid lookup keys); only new saves get the new format.

## 2. Admin Formula Library page

The `machine_formulas` table already stores every generated formula keyed by unique `fragrance_code` with versioning, pump instructions, and ingredient breakdown — perfect backing store. **No new table needed.**

New page **`/admin/formulas`** (`AdminFormulas.tsx`), admin-only via `AdminRoute`:

- Table columns: Fragrance code · Name · Version · Total volume · Source (saved_scent owner email) · Times produced · Updated.
- Filters: search by code/name, version > 1 only, has pending queue jobs.
- Row click → side sheet with:
  - Pump dispense plan rendered via existing `computePumpDispense()` (so the library shows the same per-pump ml table as Production Queue).
  - Raw `notes_formula`, `ingredients_formula`, `pump_instructions` JSON (collapsible, copy buttons).
  - Linked saved_scent + creator profile.
  - Recent `production_queue` jobs for this code (status timeline).
  - "Re-queue" button → inserts a new `production_queue` row using this formula + chosen size/qty (admin shortcut for reorder/QA).
- Sidebar: add **"Formula Library"** under Operations (icon `BookOpen`), route in `App.tsx` wrapped in `AdminRoute`.
- All reads/writes go through a new `admin-manage-formulas` edge function (service role; verifies admin via `has_role`) so RLS doesn't block cross-user formula browsing.

## 3. Production Queue improvements

Same page (`AdminProductionQueue.tsx`), additive UX polish:

- **Status tabs** at top: All · Pending · In Progress · Completed · Failed (counts in badges).
- **Search bar**: fragrance code / size / status.
- **Bulk actions**: row checkboxes + "Start selected" / "Mark completed" / "Delete dummy jobs" (only `DUMMY-` codes).
- **Totals strip**: pending count, est. total minutes (sum of `totalSeconds`), solvent ml needed, top 3 most-used pumps right now — useful for the operator before pressing Start.
- **Per-row ETA** badge from `DispensePlan.totalSeconds`.
- **Link to Formula Library** from each row's fragrance code (click code → opens library sheet).
- **"Re-queue"** button on completed rows.
- Keep the existing dummy-seed, Excel import/export, and dispense-plan chips.

## 4. Suggestions for other admin pages (not built unless approved)

- `/admin/pumps`: add a "Test prime" button per pump that posts a 1ml dispense to `machine-production-api` for hardware sanity check.
- `/admin/ingredients`: show stock alert chip when `stock_level` < threshold; auto-calc "bottles remaining" per ingredient from current pumps & average usage.
- `/admin/dashboard`: surface a "Production today" card (counts by status) and "Low-stock ingredients".
- `/admin/scents`: add a column linking to the formula library row so admins can jump from creator → formula.

## Technical notes

- New file: `src/pages/admin/AdminFormulas.tsx`.
- New edge function: `supabase/functions/admin-manage-formulas/index.ts` (list / get / re-queue actions); `verify_jwt = false`, validates admin in-code via JWT + `has_role`.
- Update `src/lib/fragranceCodeGenerator.ts` + every import site (5 files).
- Update `src/components/admin/AdminSidebar.tsx` and `src/App.tsx` routing.
- No schema migration needed; `machine_formulas` already has unique `fragrance_code`, `version`, and the trigger that auto-fills it from `saved_scents`.

## Open questions

1. Code style: prefer **`MIDNIGHT-VELVET-7K4Q`** (4-char hash) or **`MIDNIGHT-VELVET-001`** (sequential per name)?
2. For the Production Queue improvements — do all four (tabs, search, bulk actions, totals strip) in one pass, or only tabs + search now and bulk/totals later?
3. Should "Re-queue" be available on the Formula Library only, or also on completed Production Queue rows?
