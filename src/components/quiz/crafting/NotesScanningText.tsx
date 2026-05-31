import { useEffect, useRef, useState } from 'react';

const NOTES = [
  'Bergamot', 'Jasmine', 'Vetiver', 'Sandalwood', 'Rose',
  'Oud', 'Amber', 'Cedar', 'Musk', 'Neroli',
  'Vanilla', 'Patchouli', 'Iris', 'Ylang', 'Cardamom',
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const NotesScanningText = () => {
  const [current, setCurrent] = useState(NOTES[0]);
  const [locked, setLocked] = useState<string[]>([]);
  const lockedRef = useRef<string[]>([]);
  const lockingRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let scanIdx = 0;
    const scanInterval = window.setInterval(() => {
      if (lockingRef.current) return;
      scanIdx = (scanIdx + 1) % NOTES.length;
      setCurrent(NOTES[scanIdx]);
    }, 200);

    const lockInterval = window.setInterval(() => {
      if (lockedRef.current.length >= 3) return;
      lockingRef.current = true;
      const pool = NOTES.filter((n) => !lockedRef.current.includes(n));
      const pick = pool[Math.floor(Math.random() * pool.length)] || NOTES[0];
      setCurrent(pick);
      window.setTimeout(() => {
        lockedRef.current = [...lockedRef.current, pick];
        setLocked([...lockedRef.current]);
        lockingRef.current = false;
      }, 700);
    }, 3500);

    return () => {
      window.clearInterval(scanInterval);
      window.clearInterval(lockInterval);
    };
  }, []);

  return (
    <div className="crafting-notes" aria-hidden="true">
      <div className={`crafting-note-scan ${lockingRef.current ? 'is-locking' : ''}`}>
        {current}
        {lockingRef.current && <span className="crafting-note-spark"> ✦</span>}
      </div>
      <div className="crafting-note-stack">
        {locked.map((n) => (
          <span key={n} className="crafting-note-locked">
            {n} <span className="crafting-note-spark-small">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
