
## Decisions locked in

1. **Fragrance code format: `{NAME-SLUG}-{4CHAR_HASH}`** (e.g. `MIDNIGHT-VELVET-7K4Q`).
   - Deterministic from `(name, saved_scent_id)` — same scent always resolves to same code, so reorders reliably pull the exact `machine_formulas` row.
   - No transaction/lock needed (sequential codes would require coordination per name).
   - Already implemented in `src/lib/fragranceCodeGenerator.ts`; keep as-is.

2. **Production Queue: ship all four enhancements in one pass** — tabs, search, bulk actions, totals strip. They share state (filtered rows, selection) and shipping together avoids reworking the same component twice.

3. **Re-queue available in BOTH places**:
   - **Formula Library** = "produce this *formula* again" (pick a bottle size).
   - **Production Queue completed/failed rows** = "redo this *job*" (one-click, same bottle size).
   - Both call the same `admin-manage-formulas` re-queue endpoint.

## Implementation scope

### Formula Library (`/admin/formulas`) — already built
No changes needed; keep existing `AdminFormulas.tsx` + `admin-manage-formulas` edge function.

### Production Queue (`AdminProductionQueue.tsx`) — polish pass

- **Status tabs**: All · Pending · In Progress · Completed · Failed, with count badges. Tab state filters the rows.
- **Search bar**: filter by fragrance code, size, or saved-scent name. Combined with active tab.
- **Bulk actions**: row checkboxes + header checkbox. Action bar appears when ≥1 selected:
  - "Start selected" → bulk update status `pending → in_progress`.
  - "Mark completed" → bulk update `in_progress → completed`.
  - "Delete dummy jobs" → only enabled when every selected row has `DUMMY-` code prefix.
- **Totals strip** (sticky above table): pending count · est. total minutes (sum of `DispensePlan.totalSeconds`) · solvent ml needed · top 3 most-used pumps right now.
- **Per-row ETA badge** from `DispensePlan.totalSeconds`.
- **Re-queue button** on completed/failed rows → opens small popover to pick size (30/50/100ml) then calls `admin-manage-formulas`.
- **Fragrance code → Formula Library link** (click code opens the library sheet for that code; reuse the existing sheet by lifting it or navigating with a query param).

Keep existing dummy-seed, Excel import/export, and per-row dispense-plan chips.

### Backing edge function changes
`admin-manage-formulas` already supports `requeue`. Add bulk-status update support to existing `admin-manage-production` (or use direct service-role call from a small extension) for the bulk actions.

## Technical notes

- No schema migration needed.
- All admin writes continue to route through edge functions (service-role) to bypass RLS — pattern already in use.
- New UI uses existing shadcn primitives (Tabs, Checkbox, Popover, Badge).
- Selection state lives in component-local `Set<string>`; cleared on tab change.

## Out of scope (deferred — propose later)

- `/admin/pumps` "Test prime" button.
- `/admin/ingredients` stock alerts + bottles-remaining calc.
- `/admin/dashboard` production-today + low-stock cards.
- `/admin/scents` formula-library link column.
