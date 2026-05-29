## Cleanup after removing ml/sec and ETA columns

### Fixes

**`src/pages/admin/AdminProductionQueue.tsx`**
- Remove the empty line (428) between `Status` and `Dispense plan` `<TableHead>`s (leftover from the deleted ETA column). Purely whitespace cleanup; no rendering bug, but tidies the JSX.

**`src/pages/admin/AdminPumps.tsx`**
- The current table has no blank `<TableHead>` element, but the footer "Tip" card still mentions density/stock under a flow-rate context. Update it to also include the new admin-facing help note (see below).

### Admin help note

Add a short muted info note on the two pages where dispensing was previously shown in seconds:

1. **`AdminPumps.tsx`** — append a second line to the existing tip card:
   > Note: Dispensing duration is no longer calculated here. The system sends only the required ml per pump; the machine handles timing internally based on volume.

2. **`AdminProductionQueue.tsx`** — add a small muted note just above the queue table (or inside the totals strip area) with the same message, so machine operators understand why ETA is gone.

3. **`AdminFormulas.tsx`** dispense side-sheet — append a one-line muted hint under the "Pump dispense plan" header:
   > Volumes only — machine controls dispense timing.

### Out of scope
- No changes to data model, edge functions, or XLSX export schema.
- No new components; reuse existing `<Card>` / muted-text patterns.

### Files touched
- `src/pages/admin/AdminProductionQueue.tsx`
- `src/pages/admin/AdminPumps.tsx`
- `src/pages/admin/AdminFormulas.tsx`
