/** Seconds a pump runs to dispense `ml` at `mlPerSecond`. Null when the rate is unknown. */
export function pumpSeconds(ml: number, mlPerSecond: number | null | undefined): number | null {
  const r = Number(mlPerSecond);
  if (!r || r <= 0) return null;
  return +(ml / r).toFixed(1);
}
