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

export function flattenFormula(formula: unknown): FormulaNoteLike[] {
  if (Array.isArray(formula)) return formula as FormulaNoteLike[];
  if (formula && typeof formula === "object") {
    const f = formula as Record<string, unknown>;
    const out: FormulaNoteLike[] = [];
    for (const key of ["top", "heart", "base"]) {
      const arr = f[key];
      if (Array.isArray(arr)) {
        for (const n of arr as any[]) {
          if (!n || typeof n !== "object") continue;
          out.push({ ...n, category: n.category ?? key });
        }
      }
    }
    return out;
  }
  return [];
}

/**
 * Normalize any formula shape into the flat array required by the
 * saved_scents_formula_nonempty check constraint:
 *   [{ category, name, percentage, ...}, ...]
 */
export function normalizeFormulaForDb(formula: unknown): Array<{
  category: string;
  name: string;
  percentage: number;
  intensity?: number;
  cost?: number;
}> {
  return flattenFormula(formula)
    .map((n) => {
      const name = (n.name ?? n.note ?? "").toString().trim();
      const percentage = Number(n.percentage ?? 0);
      if (!name) return null;
      return {
        category: (n.category ?? "heart").toString(),
        name,
        percentage: Number.isFinite(percentage) ? percentage : 0,
        ...(typeof (n as any).intensity === "number" ? { intensity: (n as any).intensity } : {}),
        ...(typeof (n as any).cost === "number" ? { cost: (n as any).cost } : {}),
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);
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
