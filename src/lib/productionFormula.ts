// Production formula helpers: turn a fragrance formula + bottle size + quiz answers
// into a per-pump dispense plan for the machine.

export interface Pump {
  id: string;
  pump_id: string;
  position: number;
  label: string;
  note_name: string | null;
  ingredient_code: string | null;
  ml_per_second: number;
  is_solvent: boolean;
  is_active: boolean;
}

export interface FormulaNoteEntry {
  note?: string;
  name?: string;
  percentage?: number | string;
  category?: string;
}

export type FormulaInput =
  | {
      top?: FormulaNoteEntry[];
      heart?: FormulaNoteEntry[];
      base?: FormulaNoteEntry[];
      intensity?: string;
      longevity?: string;
      total_volume_ml?: number;
    }
  | FormulaNoteEntry[]
  | null
  | undefined;

export type Longevity = '2-4 hours' | '6-8 hours' | '12+ hours' | string | null | undefined;
export type Intensity = 'low' | 'medium' | 'high' | string | null | undefined;

const WOODY_OUD_NOTES = new Set([
  'oud', 'sandalwood', 'cedarwood', 'cedar', 'vetiver', 'patchouli',
  'guaiac wood', 'birch', 'cypress',
]);

/** Fragrance concentration as a fraction (0–1) derived from longevity, bumped if intensity is high. */
export function fragrancePctFromQuiz(longevity: Longevity, intensity: Intensity): number {
  const l = String(longevity ?? '').toLowerCase().trim();
  let pct = 0.3; // default 6-8 hours
  if (l.includes('12')) pct = 0.4;
  else if (l.includes('6') || l.includes('8')) pct = 0.3;
  else if (l.includes('2') || l.includes('4')) pct = 0.2;

  const i = String(intensity ?? '').toLowerCase();
  if (i === 'high' && pct < 0.4) pct = Math.min(0.4, pct + 0.05);
  return pct;
}

export function parseBottleMl(size: string | number | null | undefined): number {
  if (typeof size === 'number') return size;
  const m = String(size ?? '').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 30;
}

function flattenNotes(formula: FormulaInput): FormulaNoteEntry[] {
  if (!formula) return [];
  if (Array.isArray(formula)) return formula;
  return [
    ...(formula.top ?? []),
    ...(formula.heart ?? []),
    ...(formula.base ?? []),
  ];
}

export function hasOudOrWoody(formula: FormulaInput): boolean {
  return flattenNotes(formula).some((n) => {
    const name = String(n.note ?? n.name ?? '').toLowerCase().trim();
    return WOODY_OUD_NOTES.has(name);
  });
}

export interface PumpDispenseRow {
  pump_id: string;
  position: number;
  label: string;
  note: string | null;
  is_solvent: boolean;
  ml: number;
}

export interface DispensePlan {
  totalVolumeMl: number;
  fragranceMl: number;
  solventMl: number;
  fragrancePct: number;
  perPump: PumpDispenseRow[];
  unmapped: { note: string; percentage: number; ml: number }[];
  warnings: string[];
}

export function computePumpDispense(args: {
  formula: FormulaInput;
  size: string | number;
  intensity?: Intensity;
  longevity?: Longevity;
  pumps: Pump[];
}): DispensePlan {
  const { formula, size, pumps } = args;
  const intensity =
    args.intensity ?? (formula && !Array.isArray(formula) ? formula.intensity : undefined);
  const longevity =
    args.longevity ?? (formula && !Array.isArray(formula) ? formula.longevity : undefined);

  const totalVolumeMl = parseBottleMl(size);
  const fragrancePct = fragrancePctFromQuiz(longevity, intensity);
  const fragranceMl = +(totalVolumeMl * fragrancePct).toFixed(2);
  const solventMl = +(totalVolumeMl - fragranceMl).toFixed(2);

  const notes = flattenNotes(formula).map((n) => ({
    name: String(n.note ?? n.name ?? '').trim(),
    percentage: Number(n.percentage ?? 0) || 0,
  }));
  const totalPct = notes.reduce((s, n) => s + n.percentage, 0) || 1;

  const activePumps = pumps.filter((p) => p.is_active);
  const byNote = new Map<string, Pump>();
  for (const p of activePumps) {
    if (p.note_name) byNote.set(p.note_name.toLowerCase().trim(), p);
  }
  const solventPump = activePumps.find((p) => p.is_solvent);

  const dispenseMap = new Map<string, PumpDispenseRow>();
  const unmapped: DispensePlan['unmapped'] = [];

  for (const n of notes) {
    const ml = +((fragranceMl * n.percentage) / totalPct).toFixed(2);
    if (ml <= 0) continue;
    const pump = byNote.get(n.name.toLowerCase());
    if (!pump) {
      unmapped.push({ note: n.name, percentage: n.percentage, ml });
      continue;
    }
    const existing = dispenseMap.get(pump.pump_id);
    const total = +((existing?.ml ?? 0) + ml).toFixed(2);
    dispenseMap.set(pump.pump_id, {
      pump_id: pump.pump_id,
      position: pump.position,
      label: pump.label,
      note: pump.note_name,
      is_solvent: false,
      ml: total,
      seconds: +(total / (pump.ml_per_second || 2)).toFixed(2),
    });
  }

  if (solventPump && solventMl > 0) {
    dispenseMap.set(solventPump.pump_id, {
      pump_id: solventPump.pump_id,
      position: solventPump.position,
      label: solventPump.label,
      note: null,
      is_solvent: true,
      ml: solventMl,
      seconds: +(solventMl / (solventPump.ml_per_second || 3)).toFixed(2),
    });
  }

  const perPump = Array.from(dispenseMap.values()).sort((a, b) => a.position - b.position);
  const totalSeconds = +perPump.reduce((s, r) => s + r.seconds, 0).toFixed(2);

  const warnings: string[] = [];
  if (!solventPump) warnings.push('No solvent pump configured — solvent volume will not be dispensed.');
  if (String(intensity ?? '').toLowerCase() === 'high' && !hasOudOrWoody(formula)) {
    warnings.push('High intensity recommended with an oud or woody base note.');
  }
  if (unmapped.length) {
    warnings.push(`${unmapped.length} note(s) have no pump mapping: ${unmapped.map((u) => u.note).join(', ')}`);
  }

  return { totalVolumeMl, fragranceMl, solventMl, fragrancePct, perPump, unmapped, warnings, totalSeconds };
}
