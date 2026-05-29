import { useEffect, useMemo, useRef, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type SettingKey =
  | 'city'
  | 'small-town'
  | 'countryside'
  | 'suburbs'
  | 'various'
  | 'metropolis';

const toKey = (value: string): SettingKey => {
  const v = value.toLowerCase().trim();
  if (v.startsWith('city')) return 'city';
  if (v.startsWith('small')) return 'small-town';
  if (v.startsWith('country')) return 'countryside';
  if (v.startsWith('suburb')) return 'suburbs';
  if (v.startsWith('metro')) return 'metropolis';
  return 'various';
};

interface ParticleSpec {
  left: number;
  size: number;
  delay: number;
  duration: number;
  swayAmp: number;
  color: string;
  shape: 'dot' | 'square';
}

const buildParticles = (key: SettingKey): ParticleSpec[] => {
  const cfg: Record<
    SettingKey,
    { count: number; sizeMin: number; sizeMax: number; durMin: number; durMax: number; sway: number; colors: string[]; shape: 'dot' | 'square' }
  > = {
    city: { count: 22, sizeMin: 1, sizeMax: 2, durMin: 2.2, durMax: 3.4, sway: 6, colors: ['#C9A84C', '#E6CB7A'], shape: 'square' },
    'small-town': { count: 14, sizeMin: 1.5, sizeMax: 3, durMin: 5.5, durMax: 7.5, sway: 14, colors: ['#C9A84C', '#F5E0A8'], shape: 'dot' },
    countryside: { count: 18, sizeMin: 1.5, sizeMax: 3, durMin: 5, durMax: 7, sway: 22, colors: ['#B8C97A', '#C9A84C', '#9FB36A'], shape: 'dot' },
    suburbs: { count: 16, sizeMin: 1.5, sizeMax: 2.5, durMin: 3.8, durMax: 5, sway: 8, colors: ['#C9A84C', '#F5F0E8'], shape: 'dot' },
    various: { count: 20, sizeMin: 1, sizeMax: 3, durMin: 3, durMax: 6.5, sway: 16, colors: ['#C9A84C', '#F5F0E8', '#B8C97A'], shape: 'dot' },
    metropolis: { count: 28, sizeMin: 1, sizeMax: 2, durMin: 2, durMax: 3, sway: 4, colors: ['#C9A84C', '#E6CB7A', '#F5F0E8'], shape: 'square' },
  };
  const c = cfg[key];
  return Array.from({ length: c.count }).map(() => ({
    left: Math.random() * 100,
    size: c.sizeMin + Math.random() * (c.sizeMax - c.sizeMin),
    delay: Math.random() * c.durMax,
    duration: c.durMin + Math.random() * (c.durMax - c.durMin),
    swayAmp: c.sway,
    color: c.colors[Math.floor(Math.random() * c.colors.length)],
    shape: c.shape,
  }));
};

const SkylineTrace = () => (
  <svg
    className="nostalgia-skyline"
    viewBox="0 0 120 18"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M0 17 L0 12 L8 12 L8 7 L14 7 L14 13 L22 13 L22 4 L28 4 L28 10 L36 10 L36 8 L44 8 L44 2 L50 2 L50 11 L58 11 L58 6 L66 6 L66 13 L74 13 L74 5 L82 5 L82 11 L90 11 L90 8 L98 8 L98 14 L106 14 L106 9 L114 9 L114 12 L120 12 L120 17 Z"
      stroke="#C9A84C"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
);

interface Props {
  options: any[];
  value: string;
  onChange: (val: string) => void;
  heading: React.ReactNode;
  helper?: React.ReactNode;
  questionText: string;
}

export const NostalgiaSettingOptions = ({
  options,
  value,
  onChange,
  helper,
  questionText,
}: Props) => {
  const selectedKey = value ? toKey(value) : null;
  const [burstId, setBurstId] = useState(0);

  // Re-trigger card flourish each time the user (re)selects an option
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (value && value !== lastValueRef.current) {
      lastValueRef.current = value;
      setBurstId((n) => n + 1);
    }
  }, [value]);

  // Particle field is regenerated when the selection changes
  const particles = useMemo(
    () => (selectedKey ? buildParticles(selectedKey) : []),
    [selectedKey, burstId]
  );

  const words = questionText.split(/(\s+)/);

  return (
    <div className="space-y-8 nostalgia-root">
      {/* Fixed environmental atmosphere layer */}
      <div
        className="nostalgia-env-layer"
        data-setting={selectedKey ?? 'none'}
        aria-hidden="true"
      >
        <div className="nostalgia-env city-grid" />
        <div className="nostalgia-env town-bloom" />
        <div className="nostalgia-env country-mist country-mist-a" />
        <div className="nostalgia-env country-mist country-mist-b" />
        <div className="nostalgia-env suburbs-glow" />
        <div className="nostalgia-env metro-streaks" />
        <div className="nostalgia-particles" key={`p-${selectedKey}-${burstId}`}>
          {particles.map((p, i) => (
            <span
              key={i}
              className={`np ${p.shape === 'square' ? 'np-square' : 'np-dot'}`}
              style={
                {
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  ['--sway' as any]: `${p.swayAmp}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Heading: word-by-word fade up */}
      <h2
        className="font-display text-cream text-balance nostalgia-heading"
        style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {words.map((w, i) =>
          w.trim() === '' ? (
            <span key={i}>{w}</span>
          ) : (
            <span
              key={i}
              className="nostalgia-word"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {w}
            </span>
          )
        )}
      </h2>

      {helper && <p className="text-gold-muted text-base md:text-lg">{helper}</p>}

      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        className="space-y-3 relative z-[1]"
      >
        {options.map((option: any, idx: number) => {
          const val = typeof option === 'string' ? option : option.value;
          const desc = typeof option === 'object' ? option.desc : null;
          const selected = value === val;
          const key = toKey(val);
          return (
            <Label
              key={val}
              htmlFor={`opt-${val}`}
              data-setting={key}
              data-selected={selected ? 'true' : 'false'}
              className={`nostalgia-option group relative flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:bg-bz-card/60 ${
                selected
                  ? 'border-gold-strong bg-bz-card glow-gold-sm'
                  : 'border-gold bg-bz-card/40'
              }`}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              {/* Hover shimmer sweep */}
              <span className="nostalgia-hover-shimmer" aria-hidden="true" />

              {/* Per-card inner glow when selected */}
              <span className="nostalgia-card-glow" aria-hidden="true" />

              <span className="relative">
                <RadioGroupItem value={val} id={`opt-${val}`} />
                {/* Ripple emanating from the radio dot on (re)select */}
                {selected && (
                  <span
                    key={`r-${burstId}`}
                    className="nostalgia-radio-ripple"
                    aria-hidden="true"
                  />
                )}
              </span>

              <span className="flex-1 relative">
                <span className="block text-lg md:text-xl text-cream font-medium">{val}</span>
                {desc && <span className="block text-sm text-cream-muted mt-1">{desc}</span>}
              </span>

              {/* City-only: skyline self-draw */}
              {selected && key === 'city' && (
                <span key={`s-${burstId}`} className="nostalgia-skyline-wrap" aria-hidden="true">
                  <SkylineTrace />
                </span>
              )}

              {/* Countryside-only: leaf drift */}
              {selected && key === 'countryside' && (
                <span key={`l-${burstId}`} className="nostalgia-leaves" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className="nostalgia-leaf"
                      style={{
                        left: `${10 + i * 14}%`,
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  ))}
                </span>
              )}

              {/* Metropolis-only: vertical light streaks */}
              {selected && key === 'metropolis' && (
                <span key={`m-${burstId}`} className="nostalgia-metro-trails" aria-hidden="true">
                  <span className="nostalgia-metro-trail" style={{ left: '22%' }} />
                  <span className="nostalgia-metro-trail" style={{ left: '74%', animationDelay: '120ms' }} />
                </span>
              )}

              {/* Various-only: sparkle burst */}
              {selected && key === 'various' && (
                <span key={`v-${burstId}`} className="nostalgia-sparkles" aria-hidden="true">
                  {[0, 90, 180, 270].map((deg) => (
                    <span
                      key={deg}
                      className="nostalgia-sparkle"
                      style={{ ['--deg' as any]: `${deg}deg` }}
                    />
                  ))}
                </span>
              )}
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};
