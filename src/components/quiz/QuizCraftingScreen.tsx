import { useEffect, useState } from 'react';
import { QuizBackground } from './QuizBackground';

const STATUS_LINES = [
  'Analyzing your personality…',
  'Selecting your top notes…',
  'Blending heart and base accords…',
  'Calibrating intensity and longevity…',
  'Finalizing your scent profile…',
];

export const QuizCraftingScreen = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % STATUS_LINES.length);
    }, 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-bz-primary flex items-center justify-center overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <QuizBackground particleCount={18} />
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="quiz-orb mb-10" aria-hidden="true" />
        <h2
          className="font-display text-cream mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.15 }}
        >
          Bazuki AI is crafting your scent profile…
        </h2>
        <p
          key={idx}
          className="text-gold text-base md:text-lg quiz-step-in"
          style={{ minHeight: '1.5em' }}
        >
          {STATUS_LINES[idx]}
        </p>
      </div>
    </div>
  );
};
