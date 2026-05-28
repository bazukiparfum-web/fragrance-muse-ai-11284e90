## Goal

Make the Production Queue machine-ready by showing exactly how many ml each pump should dispense, including a dedicated ethanol-solvent pump whose volume is derived from quiz answers (intensity + longevity) and bottle size.

## 1. Pump configuration (data model)

New table `public.pumps` to make pump count flexible (add/remove pumps without code changes):

```
id uuid pk
pump_id text unique           -- e.g. PUMP-01 … PUMP-11
position int unique           -- display order
label text                    -- e.g. "Rose", "Ethanol Solvent"
note_name text null           -- FK-by-name to fragrance_notes / ingredient_mappings
ingredient_code text null     -- e.g. ING-ROSE or ING-ETHANOL
ml_per_second numeric default 2.0
is_solvent bool default false -- exactly one row is the ethanol pump
is_active bool default true
created_at / updated_at
```

Seed: PUMP-01…PUMP-10 from the 10 active `ingredient_mappings`, plus PUMP-11 = Ethanol Solvent (`is_solvent=true`, `note_name=null`). RLS: admin full access, authenticated read; standard GRANTs.

Keep `ingredient_mappings` as the source of truth for which fragrance note sits on which pump (already has `pump_id`). The new `pumps` table just adds: ordering, `is_solvent`, and lets us list pumps that have no note yet (empty slots, or the solvent).

## 2. New admin page `/admin/pumps`

Sidebar item "Pumps". Page shows a table of all pumps in `position` order:

| # | Pump ID | Assigned Note | Ingredient Code | ml/sec | Solvent | Active | Actions |

- Inline edit pump_id, label, note_name (select from `fragrance_notes` / `ingredient_mappings`), ml_per_second, is_solvent toggle, is_active.
- "Add pump" button → appends next PUMP-XX at next position.
- "Remove pump" with confirm (blocked if it's the only `is_solvent` pump).
- Validation: exactly one `is_solvent=true` pump required; warn if zero or multiple.
- Links to `/admin/notes` and `/admin/ingredients` for note management.

## 3. Concentration logic (frontend helper)

New `src/lib/productionFormula.ts` with pure function:

```ts
computePumpDispense({
  formula,                  // {top,heart,base:[{note,percentage}]}, percentages sum to 100 of fragrance
  size,                     // '30ml' | '50ml' | '100ml' | custom
  intensity,                // 'low' | 'medium' | 'high' | quiz value
  longevity,                // '2-4 hours' | '6-8 hours' | '12+ hours'
  pumps,                    // from public.pumps
}) => {
  fragrancePct,             // 0.20 / 0.30 / 0.40 derived
  totalVolumeMl,
  fragranceMl,
  solventMl,
  perPump: [{ pump_id, label, note, ml, seconds }]
}
```

Rules:

- Longevity → base fragrance %: `2-4 hours` = 20%, `6-8 hours` = 30%, `12+ hours` = 40%.
- Intensity = `high` and formula has no oud/woody note → flag a warning ("High intensity recommended with oud/woody base"). Does not auto-mutate the formula; surfaced as a badge on the row.
- Each note's ml = `fragranceMl * (note.percentage / 100)`.
- Solvent ml = `totalVolumeMl - fragranceMl`, dispensed by the `is_solvent` pump.
- Seconds = `ml / pump.ml_per_second`.
- Notes whose name doesn't match any active pump → listed as `unmapped` (red badge), not silently dropped.

## 4. Production Queue table changes (`src/pages/admin/AdminProductionQueue.tsx`)

Add columns derived from `computePumpDispense`, rendered as a compact horizontal strip per row:

```
Pump 01 (Rose) 2.0 ml · Pump 02 (Bergamot) 1.0 ml · … · Pump 11 (Ethanol) 20.0 ml
```

Implementation:

- Load `pumps` once on mount alongside the queue.
- Each row stores intensity/longevity inside `formula` already (seed function will include them); for existing rows missing them, default to `6-8 hours` / `medium` and show a subtle "defaults" hint.
- Row "View" sheet gains a **Pump dispense plan** section: table of pump → ml → seconds → total time, plus fragrance vs solvent ratio (e.g. "Fragrance 30% · Solvent 70%").
- Excel download/upload extended with new columns: `intensity`, `longevity`, and one column per pump (`pump_01_ml`, …). Upload still accepts files without pump columns (recomputed from formula).
- Seed function (`admin-seed-production-queue`) updated to pick a random intensity + longevity per job and persist them in `formula.intensity` / `formula.longevity`. Dummy notes continue to be picked only from non-solvent active pumps.

## 5. Sidebar + routing

- `src/App.tsx`: add `/admin/pumps` route → `AdminPumps`.
- `src/components/admin/AdminSidebar.tsx`: add "Pumps" entry between "Ingredients" and "Production Queue".

## Out of scope

- No changes to the quiz or recommendation engine; intensity/longevity are read from quiz answers when an order is enqueued, but the existing enqueue paths can be wired up in a follow-up — this change focuses on (a) storage model, (b) admin tooling, (c) dispense math, (d) UI surfaces.
- No changes to `machine-production-api` payload yet (machine still reads `formula`); we can extend it once you confirm the per-pump JSON shape you want the firmware to consume.

## Open question

Do you want the per-pump ml shown **inline as columns** in the main table (wide, one column per pump — gets crowded past ~6 pumps), or as a **single "Dispense plan" cell** with a compact chip list per row that expands in the side sheet? My recommendation is the chip list in the row + full table in the side sheet, since pump count is variable.  
  
Answer: based on your recommendation is the chip list in the row + full table in the side sheet, since pump count is variable. 