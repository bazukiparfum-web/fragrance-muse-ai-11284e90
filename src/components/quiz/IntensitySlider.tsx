import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';

interface IntensitySliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

interface Burst {
  id: number;
  left: number; // %
  particles: { angle: number; dist: number; size: number; delay: number }[];
}

const tierFor = (v: number, min: number, max: number) => {
  const span = max - min;
  const t = (v - min) / (span || 1);
  if (t < 0.33) return 'subtle';
  if (t < 0.66) return 'medium';
  return 'bold';
};

const atmosFor = (tier: 'subtle' | 'medium' | 'bold') => {
  if (tier === 'subtle') return { tier, density: 10, speedFactor: 0.5, opacity: 0.2, mistScale: 0.7 };
  if (tier === 'medium') return { tier, density: 25, speedFactor: 1, opacity: 0.35, mistScale: 1 };
  return { tier, density: 50, speedFactor: 1.6, opacity: 0.55, mistScale: 1.35 };
};

let burstCounter = 0;

export function IntensitySlider({ value, min, max, onChange }: IntensitySliderProps) {
  const span = max - min || 1;
  const ratio = (value - min) / span;
  const tier = tierFor(value, min, max);
  const draggingRef = useRef(false);
  const [bursts, setBursts] = useState<Burst[]>([]);

  // Broadcast atmosphere when value changes
  useEffect(() => {
    const atmos = atmosFor(tier);
    window.dispatchEvent(new CustomEvent('bz:intensity-atmos', { detail: atmos }));
  }, [tier]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('bz:intensity-atmos', { detail: null }));
    };
  }, []);

  const triggerBurst = () => {
    const count = Math.round(3 + ratio * 12); // 3..15
    const id = ++burstCounter;
    const particles = Array.from({ length: count }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      dist: 80 + Math.random() * 100,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 60,
    }));
    setBursts((prev) => [...prev, { id, left: ratio * 100, particles }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 800);
  };

  const handleRelease = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    triggerBurst();
  };

  const glow = 0.1 + ratio * 0.9;

  // Interpolate number color from soft gold -> bright gold
  const numLightness = 55 + ratio * 15;
  const numSat = 50 + ratio * 45;
  const numColor = `hsl(45 ${numSat}% ${numLightness}%)`;

  const subtleGlow = value <= min + Math.max(1, span * 0.2);
  const boldGlow = value >= max - Math.max(1, span * 0.2);

  return (
    <div
      className="pt-4 px-2 intensity-root"
      data-tier={tier}
      style={{ ['--int-glow' as any]: glow.toFixed(3) }}
    >
      <div
        className="intensity-track-wrap relative"
        onPointerDown={() => {
          draggingRef.current = true;
        }}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        onLostPointerCapture={handleRelease}
      >
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={min}
          max={max}
          step={1}
          className="intensity-slider mb-6"
        />
        {bursts.map((b) => (
          <span key={b.id} className="intensity-burst" style={{ left: `${b.left}%` }}>
            {b.particles.map((p, i) => (
              <span
                key={i}
                className="intensity-burst-dot"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}ms`,
                  ['--bx' as any]: `${Math.cos(p.angle) * p.dist}px`,
                  ['--by' as any]: `${Math.sin(p.angle) * p.dist}px`,
                }}
              />
            ))}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm text-cream-muted">
        <span
          className="intensity-end"
          data-side="subtle"
          data-glow={subtleGlow ? 'true' : 'false'}
        >
          Subtle ({min})
        </span>
        <span
          key={value}
          className="intensity-number font-display"
          style={{ color: numColor, textShadow: `0 0 ${8 + ratio * 24}px ${numColor}` }}
        >
          {value}
        </span>
        <span
          className="intensity-end"
          data-side="bold"
          data-glow={boldGlow ? 'true' : 'false'}
        >
          Bold ({max})
        </span>
      </div>
    </div>
  );
}
