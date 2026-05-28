## Remove ml/sec from /admin/pumps and hide seconds everywhere

Flow rate (`ml_per_second`) is no longer meaningful — the machine takes a target volume and handles its own timing. Remove all user-facing references to seconds while leaving DB columns intact (no migration, reversible).

### Changes

**`src/pages/admin/AdminPumps.tsx`**
- Drop the `ml/sec` column from the table header and body.
- Remove the inline `<Input type="number">` for `ml_per_second` in edit mode.
- Stop sending `ml_per_second` in `saveEdit` and `addPump` (DB default of `2.0` stays for legacy rows).
- Remove the `ml_per_second` auto-fill in `onNoteChange`.
- Update the footer tip card to drop the density/stock mention if it references flow.

**`src/lib/productionFormula.ts`**
- Remove `seconds` from `PumpDispenseRow` and `totalSeconds` from `DispensePlan` (or set to 0 if removing breaks too many callers — but check first).
- Stop computing `seconds = ml / ml_per_second` in `computePumpDispense`.

**`src/pages/admin/AdminFormulas.tsx`** (Formula Library side-sheet)
- Remove `~Xs` from the dispense plan header line.

**`src/pages/admin/AdminProductionQueue.tsx`**
- Remove per-row ETA badges and any `totalSeconds`/minutes in the totals strip that derive from flow rate. Keep counts and ml totals.

**`src/pages/admin/AdminIngredients.tsx`**
- If it exposes `ml_per_second` as an editable field, hide it too (for consistency with the new model).

### Out of scope
- No DB migration. `pumps.ml_per_second` and `ingredient_mappings.ml_per_second` columns stay (defaults preserved) so we can reintroduce flow-rate tracking later without data loss.
- No changes to `machine-production-api` payloads — if it emits `duration_sec` from `pump_instructions.sequence`, leave it (the machine ignores it). Can be revisited.
- Bulk download/upload XLSX: no schema change to the Pumps sheet column set (it currently includes `duration_sec` from `pump_instructions`; leaving for backward compat with previously exported files).

### Files touched
- `src/pages/admin/AdminPumps.tsx`
- `src/lib/productionFormula.ts`
- `src/pages/admin/AdminFormulas.tsx`
- `src/pages/admin/AdminProductionQueue.tsx`
- `src/pages/admin/AdminIngredients.tsx` (only if it surfaces the field)