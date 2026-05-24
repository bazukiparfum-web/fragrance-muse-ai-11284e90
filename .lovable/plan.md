## Goal
Make "Level to 100%" in the Tweak Formula dialog respect locked notes — keep their percentages fixed and rescale only unlocked notes to fill the remainder.

## Change
File: `src/components/FormulaTweakDialog.tsx`, function `handleLevelTo100`.

New behaviour:
1. Compute `lockedTotal = sum(percentage of locked notes)`.
2. If `lockedTotal >= 100` → toast error ("Locked notes already total ≥100%") and return.
3. `remaining = 100 - lockedTotal`.
4. Compute `unlockedTotal = sum(percentage of unlocked notes)`.
   - If no unlocked notes or `unlockedTotal === 0` → toast error ("No unlocked notes to rescale") and return.
5. Scale each unlocked note: `p * (remaining / unlockedTotal)`, rounded to 2 dp.
6. Fix rounding drift on the first unlocked note so total === 100 exactly.
7. Locked notes pass through unchanged.

Also update the button's `disabled` so it disables when there are no unlocked notes (in addition to the existing `totalPercentage === 0` check).

## Out of scope
- Slider drag behaviour, lock UI, delete behaviour, save flow — all unchanged.
- No backend/schema changes.

## Verification
- Lock Oud at 10%, click "Level to 100%": Oud stays 10, other 5 notes rescale to sum 90 (totals = 100).
- Lock everything → button disabled / error toast.
- No locks → behaves exactly as before.
