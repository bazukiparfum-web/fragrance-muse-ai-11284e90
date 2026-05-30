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
  const [finale, setFinale] = useState(false);
  const [finaleExiting, setFinaleExiting] = useState(false);

  useEffect(() => {
    const onAtmos = (e: Event) => {
      const detail = (e as CustomEvent).detail as AtmosDetail | null;
      if (!detail) {
        setAtmos({ ...DEFAULT_ATMOS, density: particleCount });
      } else {
        setAtmos(detail);
      }
    };
    const onFinale = (e: Event) => {
      const active = !!(e as CustomEvent).detail;
      if (active) {
        setFinaleExiting(false);
        setFinale(true);
      } else if (finale) {
        setFinaleExiting(true);
        window.setTimeout(() => {
          setFinale(false);
          setFinaleExiting(false);
        }, 600);
      }
    };
    window.addEventListener('bz:intensity-atmos', onAtmos);
    window.addEventListener('bz:finale-atmosphere', onFinale);
    return () => {
      window.removeEventListener('bz:intensity-atmos', onAtmos);
      window.removeEventListener('bz:finale-atmosphere', onFinale);
    };
  }, [particleCount, finale]);

  // Finale wins only where it makes the atmosphere richer than user's intensity choice
  const effective: AtmosDetail = finale
    ? {
        density: Math.max(atmos.density, 60),
        speedFactor: Math.max(atmos.speedFactor, 1.15),
        opacity: Math.max(atmos.opacity, 0.55),
        mistScale: Math.max(atmos.mistScale, 1.4),
      }
    : atmos;

  const particles = useMemo(
    () =>
      Array.from({ length: effective.density }).map((_, i) => {
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
          duration: `${baseDur / effective.speedFactor}s`,
          driftDuration: `${(4 + r(6) * 4) / effective.speedFactor}s`,
          driftAmp: `${15 + r(7) * 15}px`,
          opacity: Math.min(effective.opacity + 0.15, 0.15 + r(8) * 0.4 + effective.opacity * 0.4),
          size,
          color: isGold ? 'var(--anim-gold)' : 'var(--anim-ivory)',
        };
      }),
    [effective]
  );

  const glowFamilies = ['floral', 'woody', 'fresh', 'warm'] as const;

  return (
    <div
      className="quiz-bg"
      aria-hidden="true"
      style={
        {
          ['--mist-scale' as any]: effective.mistScale,
          ['--mist-opacity' as any]: (effective.opacity / 0.4).toFixed(2),
        } as React.CSSProperties
      }
    >
      <span className="quiz-mist quiz-mist-1" />
      <span className="quiz-mist quiz-mist-2" />
      <span className="quiz-mist quiz-mist-3" />

      {finale &&
        glowFamilies.map((fam, i) => (
          <span
            key={fam}
            className={`quiz-finale-glow quiz-finale-glow--${fam} ${finaleExiting ? 'is-exiting' : ''}`}
            style={{ animationDelay: `${i * 1.5}s` }}
          />
        ))}

      <div className="quiz-particles">
        {particles.map((p, i) => (
          <span
            key={`${effective.density}-${i}`}
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
