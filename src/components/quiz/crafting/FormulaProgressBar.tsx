import { useEffect, useState } from 'react';

interface Props {
  durationMs?: number;
}

export const FormulaProgressBar = ({ durationMs = 16000 }: Props) => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(100, (elapsed / durationMs) * 100);
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  const rounded = Math.floor(pct);

  return (
    <>
      <div className="crafting-progress-percent" aria-hidden="true">
        Formula: {String(rounded).padStart(2, '0')}% complete
      </div>
      <div className="crafting-progress-track" aria-hidden="true">
        <div className="crafting-progress-fill" style={{ width: `${pct}%` }}>
          <span className="crafting-progress-shimmer" />
          <span className="crafting-progress-bottle" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <rect x="4" y="0" width="4" height="2" fill="var(--anim-gold-bright)" />
              <rect x="3" y="2" width="6" height="9" rx="1" fill="none" stroke="var(--anim-gold-bright)" strokeWidth="1" />
            </svg>
          </span>
        </div>
      </div>
    </>
  );
};
