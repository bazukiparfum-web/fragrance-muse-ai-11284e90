import { useEffect, useMemo, useState } from 'react';

interface QuizBackgroundProps {
  particleCount?: number;
}

interface AtmosDetail {
  density: number;
  speedFactor: number;
  opacity: number;
  mistScale: number;
}

const DEFAULT_ATMOS: AtmosDetail = { density: 35, speedFactor: 1, opacity: 0.4, mistScale: 1 };

/**
 * Persistent atelier background: 3 breathing mist blobs + ambient gold/ivory
 * particle drift. Reacts to `bz:intensity-atmos` events so the intensity
 * slider can dial density/speed/opacity in real time.
 */
export const QuizBackground = ({ particleCount = 35 }: QuizBackgroundProps) => {
  const [atmos, setAtmos] = useState<AtmosDetail>({ ...DEFAULT_ATMOS, density: particleCount });

  useEffect(() => {
    const onAtmos = (e: Event) => {
      const detail = (e as CustomEvent).detail as AtmosDetail | null;
      if (!detail) {
        setAtmos({ ...DEFAULT_ATMOS, density: particleCount });
      } else {
        setAtmos(detail);
      }
    };
    window.addEventListener('bz:intensity-atmos', onAtmos);
    return () => window.removeEventListener('bz:intensity-atmos', onAtmos);
  }, [particleCount]);

  const particles = useMemo(
    () =>
      Array.from({ length: atmos.density }).map((_, i) => {
        const r = (seed: number) => {
          const x = Math.sin(i * 9.13 + seed) * 10000;
          return x - Math.floor(x);
        };
        const size = 1 + Math.round(r(1) * 2);
        const isGold = r(2) > 0.5;
        const baseDur = 8 + r(5) * 10;
        return {
          left: `${r(3) * 100}%`,
          delay: `${r(4) * 18}s`,
          duration: `${baseDur / atmos.speedFactor}s`,
          driftDuration: `${(4 + r(6) * 4) / atmos.speedFactor}s`,
          driftAmp: `${15 + r(7) * 15}px`,
          opacity: Math.min(atmos.opacity + 0.15, 0.15 + r(8) * 0.4 + atmos.opacity * 0.4),
          size,
          color: isGold ? 'var(--anim-gold)' : 'var(--anim-ivory)',
        };
      }),
    [atmos]
  );

  return (
    <div
      className="quiz-bg"
      aria-hidden="true"
      style={
        {
          ['--mist-scale' as any]: atmos.mistScale,
          ['--mist-opacity' as any]: (atmos.opacity / 0.4).toFixed(2),
        } as React.CSSProperties
      }
    >
      <span className="quiz-mist quiz-mist-1" />
      <span className="quiz-mist quiz-mist-2" />
      <span className="quiz-mist quiz-mist-3" />

      <div className="quiz-particles">
        {particles.map((p, i) => (
          <span
            key={`${atmos.density}-${i}`}
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
