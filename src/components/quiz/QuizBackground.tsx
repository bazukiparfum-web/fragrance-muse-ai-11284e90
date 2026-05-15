import { useMemo } from 'react';

interface QuizBackgroundProps {
  particleCount?: number;
}

export const QuizBackground = ({ particleCount = 14 }: QuizBackgroundProps) => {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => ({
        left: `${(i * 97) % 100}%`,
        delay: `${(i * 1.7) % 18}s`,
        duration: `${18 + ((i * 3) % 14)}s`,
        size: 2 + ((i * 5) % 4),
      })),
    [particleCount]
  );

  return (
    <div className="quiz-bg" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="quiz-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
};
