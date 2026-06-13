/**
 * Shared validation for fragrance formulas before persisting to saved_scents.
 *
 * A valid formula is a non-empty array of notes where at least one note has
 * a name/note field and the percentages sum to > 0.
 */

export interface FormulaNoteLike {
  name?: string;
  note?: string;
  percentage?: number;
  category?: string;
  locked?: boolean;
}

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

export const EMPTY_FORMULA_MESSAGE =
  "This fragrance has no formula and cannot be saved.";
