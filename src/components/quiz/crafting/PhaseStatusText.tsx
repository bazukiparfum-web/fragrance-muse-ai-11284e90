import { useEffect, useState } from 'react';

const MESSAGES = [
  'Selecting your top notes…',
  'Blending your base accords…',
  'Calibrating scent intensity…',
  'Personalizing your formula…',
  'Adding your signature touch…',
  'Sealing your unique blend…',
  'Your scent profile is ready…',
];

export const PhaseStatusText = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 2500);
    return () => window.clearInterval(t);
  }, []);

  return (
    <p
      key={idx}
      className="crafting-phase-text crafting-phase-enter"
      style={{ minHeight: '1.5em' }}
    >
      {MESSAGES[idx]}
    </p>
  );
};
