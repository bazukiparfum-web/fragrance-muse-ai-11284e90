export interface SimulatorInput {
  personality?: string;
  scentFamily?: string[];
  occasion?: string;
  climate?: string;
  intensity?: number;
  longevity?: string;
  ageRange?: string;
}

export interface Proportions {
  top: number;
  heart: number;
  base: number;
}

export interface SimRule {
  id: string;
  rule_name: string;
  rule_type: string;
  description?: string;
  conditions: any;
  actions: any;
  priority: number;
  is_active: boolean;
}

export interface SimulationResult {
  baseline: Proportions;
  finalFormula: Proportions;
  diff: { top: number; heart: number; base: number };
  matched: SimRule[];
  unmatched: SimRule[];
  requiredNotes: { top: string[]; heart: string[]; base: string[] };
  avoidedNotes: { top: string[]; heart: string[]; base: string[] };
}

const BASELINE: Proportions = { top: 25, heart: 35, base: 40 };

function valueMatches(condValue: any, inputValue: any): boolean {
  if (inputValue === undefined || inputValue === null || inputValue === '') return false;

  // Condition is an array of allowed values
  if (Array.isArray(condValue)) {
    const lowered = condValue.map((v) => String(v).toLowerCase());
    if (Array.isArray(inputValue)) {
      return inputValue.some((iv) => lowered.includes(String(iv).toLowerCase()));
    }
    return lowered.includes(String(inputValue).toLowerCase());
  }

  // Condition is a numeric range { min, max }
  if (typeof condValue === 'object' && condValue !== null && ('min' in condValue || 'max' in condValue)) {
    const n = Number(inputValue);
    if (Number.isNaN(n)) return false;
    if (condValue.min !== undefined && n < condValue.min) return false;
    if (condValue.max !== undefined && n > condValue.max) return false;
    return true;
  }

  // Scalar equality (case-insensitive for strings)
  if (Array.isArray(inputValue)) {
    return inputValue.map((v) => String(v).toLowerCase()).includes(String(condValue).toLowerCase());
  }
  return String(condValue).toLowerCase() === String(inputValue).toLowerCase();
}

function ruleMatches(rule: SimRule, input: SimulatorInput): boolean {
  const conds = rule.conditions || {};
  const keys = Object.keys(conds);
  if (keys.length === 0) return false;
  return keys.every((key) => valueMatches(conds[key], (input as any)[key]));
}

export function simulateRules(input: SimulatorInput, rules: SimRule[]): SimulationResult {
  const active = rules.filter((r) => r.is_active);
  const matched: SimRule[] = [];
  const unmatched: SimRule[] = [];

  for (const r of active) {
    if (ruleMatches(r, input)) matched.push(r);
    else unmatched.push(r);
  }

  // Apply highest priority first
  matched.sort((a, b) => b.priority - a.priority);

  let formula: Proportions = { ...BASELINE };
  const requiredNotes = { top: [] as string[], heart: [] as string[], base: [] as string[] };
  const avoidedNotes = { top: [] as string[], heart: [] as string[], base: [] as string[] };

  for (const rule of matched) {
    const a = rule.actions || {};
    if (a.proportions) {
      formula = {
        top: Number(a.proportions.top ?? formula.top),
        heart: Number(a.proportions.heart ?? formula.heart),
        base: Number(a.proportions.base ?? formula.base),
      };
    }
    if (a.requireNotes) {
      for (const layer of ['top', 'heart', 'base'] as const) {
        if (Array.isArray(a.requireNotes[layer])) {
          for (const n of a.requireNotes[layer]) {
            if (!requiredNotes[layer].includes(n)) requiredNotes[layer].push(n);
          }
        }
      }
    }
    if (a.avoidNotes) {
      for (const layer of ['top', 'heart', 'base'] as const) {
        if (Array.isArray(a.avoidNotes[layer])) {
          for (const n of a.avoidNotes[layer]) {
            if (!avoidedNotes[layer].includes(n)) avoidedNotes[layer].push(n);
          }
        }
      }
    }
  }

  return {
    baseline: BASELINE,
    finalFormula: formula,
    diff: {
      top: formula.top - BASELINE.top,
      heart: formula.heart - BASELINE.heart,
      base: formula.base - BASELINE.base,
    },
    matched,
    unmatched,
    requiredNotes,
    avoidedNotes,
  };
}

export const BASELINE_FORMULA = BASELINE;
