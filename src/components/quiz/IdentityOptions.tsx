import { useEffect, useMemo, useRef, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type IdentityKey = 'woman' | 'man' | 'transgender' | 'non-binary' | 'prefer-not';

const toKey = (value: string): IdentityKey => {
  const v = value.toLowerCase().trim();
  if (v.startsWith('woman')) return 'woman';
  if (v.startsWith('man')) return 'man';
  if (v.startsWith('trans')) return 'transgender';
  if (v.startsWith('non')) return 'non-binary';
  return 'prefer-not';
};

interface ParticleSpec {
  left: number;
  size: number;
  delay: number;
  duration: number;
  swayAmp: number;
  color: string;
}

const PARTICLE_CONFIG: Record<IdentityKey, { count: number; colors: string[]; sway: number; dur: [number, number]; size: [number, number] }> = {
  woman:        { count: 18, colors: ['#E8A0A0', '#F5C7C7', '#C9A84C'], sway: 18, dur: [5.5, 8],   size: [1.5, 3] },
  man:          { count: 20, colors: ['#B8862E', '#C9A84C', '#E0B355'], sway: 6,  dur: [3.5, 5],   size: [1.5, 2.5] },
  transgender:  { count: 22, colors: ['#5BCEFA', '#F5A9B8', '#F5F0E8'], sway: 14, dur: [5, 7.5],   size: [1.5, 2.5] },
  'non-binary': { count: 22, colors: ['#C9A84C', '#A78BFA', '#E0B355', '#C4B5FD'], sway: 16, dur: [4.5, 7], size: [1.5, 3] },
  'prefer-not': { count: 16, colors: ['#F5F0E8', '#C9A84C'], sway: 10, dur: [4.5, 6.5], size: [1.5, 2.5] },
};

const buildParticles = (key: IdentityKey): ParticleSpec[] => {
  const c = PARTICLE_CONFIG[key];
  return Array.from({ length: c.count }).map(() => ({
    left: Math.random() * 100,
    size: c.size[0] + Math.random() * (c.size[1] - c.size[0]),
    delay: Math.random() * c.dur[1],
    duration: c.dur[0] + Math.random() * (c.dur[1] - c.dur[0]),
    swayAmp: c.sway,
    color: c.colors[Math.floor(Math.random() * c.colors.length)],
  }));
};

interface Props {
  options: any[];
  value: string;
  onChange: (val: string) => void;
  helper?: React.ReactNode;
  questionText: string;
}

export const IdentityOptions = ({ options, value, onChange, helper, questionText }: Props) => {
  const selectedKey = value ? toKey(value) : null;
  const [burstId, setBurstId] = useState(0);

  const lastValueRef = useRef(value);
  useEffect(() => {
    if (value && value !== lastValueRef.current) {
      lastValueRef.current = value;
      setBurstId((n) => n + 1);
    }
  }, [value]);

  const particles = useMemo(
    () => (selectedKey ? buildParticles(selectedKey) : []),
    [selectedKey, burstId]
  );

  const words = questionText.split(/(\s+)/);

  return (
    <div className="space-y-8 identity-root">
      <div
        className="identity-env-layer"
        data-identity={selectedKey ?? 'none'}
        aria-hidden="true"
      >
        <div className="identity-env woman-bloom" />
        <div className="identity-env man-mist" />
        <div className="identity-env tg-aurora" />
        <div className="identity-env nb-cosmic" />
        <div className="identity-env pn-glow" />
        <div className="identity-particles" key={`p-${selectedKey}-${burstId}`}>
          {particles.map((p, i) => (
            <span
              key={i}
              className="ip"
              style={
                {
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}aa`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  ['--sway' as any]: `${p.swayAmp}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Heading word-by-word */}
      <h2
        className="font-display text-cream text-balance identity-heading"
        style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {words.map((w, i) =>
          w.trim() === '' ? (
            <span key={i}>{w}</span>
          ) : (
            <span
              key={i}
              className="identity-word"
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
        data-has-selection={value ? 'true' : 'false'}
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
              data-identity={key}
              data-selected={selected ? 'true' : 'false'}
              className={`identity-option group relative flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:bg-bz-card/60 ${
                selected
                  ? 'border-gold-strong bg-bz-card glow-gold-sm'
                  : 'border-gold bg-bz-card/40'
              }`}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <span className="identity-hover-shimmer" aria-hidden="true" />
              <span className="identity-card-glow" aria-hidden="true" />

              <span className="relative">
                <RadioGroupItem value={val} id={`opt-${val}`} />
                {selected && key === 'woman' && (
                  <span key={`w-${burstId}`} className="identity-pulse-in" aria-hidden="true" />
                )}
                {selected && key === 'man' && (
                  <span key={`m-${burstId}`} className="identity-ripple" aria-hidden="true" />
                )}
                {selected && key === 'transgender' && (
                  <span key={`t-${burstId}`} className="identity-tri-pulse" aria-hidden="true">
                    <span style={{ borderColor: '#5BCEFA' }} />
                    <span style={{ borderColor: '#F5A9B8', animationDelay: '120ms' }} />
                    <span style={{ borderColor: '#F5F0E8', animationDelay: '240ms' }} />
                  </span>
                )}
                {selected && key === 'non-binary' && (
                  <span key={`n-${burstId}`} className="identity-cosmic-burst" aria-hidden="true">
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <span
                        key={deg}
                        style={{
                          ['--deg' as any]: `${deg}deg`,
                          background: i % 2 ? '#A78BFA' : '#C9A84C',
                        } as React.CSSProperties}
                      />
                    ))}
                  </span>
                )}
                {selected && key === 'prefer-not' && (
                  <span key={`pn-${burstId}`} className="identity-double-ripple" aria-hidden="true">
                    <span />
                    <span style={{ animationDelay: '200ms' }} />
                  </span>
                )}
              </span>

              <span className="flex-1 relative">
                <span className="block text-lg md:text-xl text-cream font-medium">{val}</span>
                {desc && <span className="block text-sm text-cream-muted mt-1">{desc}</span>}
              </span>

              {/* Non-binary: floating stars around card edges */}
              {selected && key === 'non-binary' && (
                <span className="identity-stars" aria-hidden="true">
                  {[10, 28, 48, 68, 84, 18, 38, 78].map((left, i) => (
                    <span
                      key={i}
                      className="identity-star"
                      style={{
                        left: `${left}%`,
                        top: i < 4 ? '8%' : '78%',
                        animationDelay: `${i * 180}ms`,
                      }}
                    >
                      ✦
                    </span>
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
