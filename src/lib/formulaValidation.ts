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

export function isValidFormula(formula: unknown): formula is FormulaNoteLike[] {
  if (!Array.isArray(formula) || formula.length === 0) return false;

  let total = 0;
  let hasNamedNote = false;
  for (const n of formula) {
    if (!n || typeof n !== "object") continue;
    const note = n as FormulaNoteLike;
    const label = (note.name ?? note.note ?? "").toString().trim();
    if (label) hasNamedNote = true;
    const pct = Number(note.percentage ?? 0);
    if (Number.isFinite(pct)) total += pct;
  }

  return hasNamedNote && total > 0;
}

export const EMPTY_FORMULA_MESSAGE =
  "This fragrance has no formula and cannot be saved.";
