import { useMemo } from 'react';

interface QuizBackgroundProps {
  particleCount?: number;
}

/**
 * Persistent atelier background: 3 breathing mist blobs + ambient gold/ivory
 * particle drift. All decorative, pointer-events: none, GPU-friendly.
 */
export const QuizBackground = ({ particleCount = 35 }: QuizBackgroundProps) => {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => {
        // Deterministic-ish but varied
        const r = (seed: number) => {
          const x = Math.sin(i * 9.13 + seed) * 10000;
          return x - Math.floor(x);
        };
        const size = 1 + Math.round(r(1) * 2); // 1..3
        const isGold = r(2) > 0.5;
        return {
          left: `${r(3) * 100}%`,
          delay: `${r(4) * 18}s`,
          duration: `${8 + r(5) * 10}s`, // 8..18
          driftDuration: `${4 + r(6) * 4}s`, // 4..8
          driftAmp: `${15 + r(7) * 15}px`, // 15..30
          opacity: 0.15 + r(8) * 0.4, // 0.15..0.55
          size,
          color: isGold ? 'var(--anim-gold)' : 'var(--anim-ivory)',
        };
      }),
    [particleCount]
  );

  return (
    <div className="quiz-bg" aria-hidden="true">
      {/* Mist blobs */}
      <span className="quiz-mist quiz-mist-1" />
      <span className="quiz-mist quiz-mist-2" />
      <span className="quiz-mist quiz-mist-3" />

      {/* Particles */}
      <div className="quiz-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            className="quiz-particle"
            style={
              {
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color as string,
                boxShadow: `0 0 6px ${p.color}`,
                opacity: p.opacity,
                ['--drift-amp' as any]: p.driftAmp,
                ['--drift-dur' as any]: p.driftDuration,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
};
