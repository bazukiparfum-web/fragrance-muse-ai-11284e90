## Why Add to Cart fails

On the quiz results page, every "Add to Cart" click is gated by `isValidFormula(scent.formula)` in `src/pages/QuizResults.tsx` (line 191). When it returns `false` the toast "This fragrance has no formula and cannot be saved." fires and the flow exits before any Shopify call.

The bug is in `src/lib/formulaValidation.ts`:

- `isValidFormula` only accepts a flat array of notes (`Array.isArray(formula)` → required).
- But the quiz recommendations (both `defaultRecommendations` in QuizResults and the AI engine output) use the nested object form: `{ top: [...], heart: [...], base: [...] }`.
- Result: nested formulas are always treated as empty, so add-to-cart is always blocked on the quiz results screen.

The rest of the codebase already handles both shapes — e.g. `getNotesByCategory` in `QuizResults.tsx` (lines 174–182) explicitly supports flat array OR nested object. The validator is the only place that doesn't.

## Fix

Update `src/lib/formulaValidation.ts` so `isValidFormula` accepts either:

1. A non-empty flat array of notes (current behavior), OR
2. A nested object with `top` / `heart` / `base` arrays — flatten them and apply the same checks (at least one named note + total percentage > 0).

No other file needs to change. The cart flow, save flow, and Shopify product creation downstream already work with either shape.

### Technical detail

```ts
function flattenFormula(formula: unknown): FormulaNoteLike[] {
  if (Array.isArray(formula)) return formula as FormulaNoteLike[];
  if (formula && typeof formula === "object") {
    const f = formula as Record<string, unknown>;
    const out: FormulaNoteLike[] = [];
    for (const key of ["top", "heart", "base"]) {
      const arr = f[key];
      if (Array.isArray(arr)) out.push(...(arr as FormulaNoteLike[]));
    }
    return out;
  }
  return [];
}

export function isValidFormula(formula: unknown): boolean {
  const notes = flattenFormula(formula);
  if (notes.length === 0) return false;
  let total = 0;
  let hasNamedNote = false;
  for (const n of notes) {
    if (!n || typeof n !== "object") continue;
    const label = (n.name ?? n.note ?? "").toString().trim();
    if (label) hasNamedNote = true;
    const pct = Number(n.percentage ?? 0);
    if (Number.isFinite(pct)) total += pct;
  }
  return hasNamedNote && total > 0;
}
```

(Return type drops the array type guard since it now accepts both shapes; current call sites use it only as a boolean check, so no consumers break.)

## Out of scope

- Cart store / Shopify integration (already correct).
- Quiz recommendation engine output shape.
- The "Testing Mode Active" debug panel.
