import { useMemo } from "react";

/**
 * Ambient atelier atmosphere for the /collection page.
 * 25 drifting gold/ivory particles + 3 slow gold mist blobs.
 * Pointer-events: none, z-index: 0. Reuses tokens + keyframes from QuizBackground.
 */
export default function CollectionAmbience({ particleCount = 25 }: { particleCount?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => {
        const r = (seed: number) => {
          const x = Math.sin(i * 9.13 + seed) * 10000;
          return x - Math.floor(x);
        };
        const size = 1 + Math.round(r(1) * 2);
        const isGold = r(2) > 0.5;
        return {
          left: `${r(3) * 100}%`,
          delay: `${r(4) * 18}s`,
          duration: `${8 + r(5) * 10}s`,
          driftDuration: `${4 + r(6) * 4}s`,
          driftAmp: `${15 + r(7) * 15}px`,
          opacity: 0.25 + r(8) * 0.35,
          size,
          color: isGold ? "var(--anim-gold)" : "var(--anim-ivory)",
        };
      }),
    [particleCount],
  );

  return (
    <div className="quiz-bg" aria-hidden>
      <span className="quiz-mist quiz-mist-1" />
      <span className="quiz-mist quiz-mist-2" />
      <span className="quiz-mist quiz-mist-3" />
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
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                opacity: p.opacity,
                ["--drift-amp" as any]: p.driftAmp,
                ["--drift-dur" as any]: p.driftDuration,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
