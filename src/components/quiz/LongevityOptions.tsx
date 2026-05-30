import { useEffect, useRef, useState } from 'react';

interface OptionItem {
  value: string;
  desc?: string;
}

interface LongevityOptionsProps {
  options: (OptionItem | string)[];
  value: string;
  onChange: (val: string) => void;
  heading: React.ReactNode;
  helper?: string | null;
}

type Variant = 'short' | 'allday' | 'long';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const variantOf = (val: string): Variant | null => {
  const v = val.toLowerCase();
  if (v.startsWith('short')) return 'short';
  if (v.startsWith('all')) return 'allday';
  if (v.startsWith('long')) return 'long';
  return null;
};

export const LongevityOptions = ({
  options,
  value,
  onChange,
  heading,
  helper,
}: LongevityOptionsProps) => {
  const reduce = prefersReducedMotion();
  // Track per-option selection key (bump on each selection to retrigger one-shot animations)
  const [selectionKeys, setSelectionKeys] = useState<Record<string, number>>({});
  // Track exiting (deselected) options for fade-out
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const prevValueRef = useRef<string>(value);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (value !== prev) {
      if (value) {
        setSelectionKeys((k) => ({ ...k, [value]: Date.now() }));
      }
      if (prev && prev !== value) {
        setExiting((s) => new Set(s).add(prev));
        const toRemove = prev;
        window.setTimeout(() => {
          setExiting((s) => {
            const n = new Set(s);
            n.delete(toRemove);
            return n;
          });
        }, 320);
      }
      prevValueRef.current = value;
    }
  }, [value]);

  return (
    <div className="space-y-8">
      {heading}
      {helper && <p className="text-gold-muted text-base md:text-lg">{helper}</p>}

      <div className="space-y-3" role="radiogroup">
        {options.map((opt, index) => {
          const item: OptionItem = typeof opt === 'string' ? { value: opt } : opt;
          const variant = variantOf(item.value);
          const isSelected = value === item.value;
          const isExiting = exiting.has(item.value);
          const key = selectionKeys[item.value] ?? 0;
          const slideClass = !reduce
            ? index % 2 === 0
              ? 'longevity-slide-l'
              : 'longevity-slide-r'
            : '';

          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(item.value)}
              className={`${slideClass} relative w-full flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer text-left transition-all duration-300 hover:bg-bz-card/60 overflow-hidden ${
                variant ? `longevity-card--${variant}` : ''
              } ${
                isSelected
                  ? `border-gold-strong bg-bz-card glow-gold-sm ${
                      variant === 'long' ? 'longevity-glow--max' : ''
                    }`
                  : 'border-gold bg-bz-card/40'
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {/* Radio dot */}
              <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0 z-10">
                <span
                  className={`block w-5 h-5 rounded-full border-2 transition-all ${
                    isSelected ? 'border-gold-strong' : 'border-gold'
                  }`}
                />
                {isSelected && <span className="absolute inset-1 rounded-full bg-gold-strong" />}
              </span>

              <span className="relative flex-1 z-10">
                <span className="block text-lg md:text-xl text-cream font-medium">
                  {item.value}
                </span>
                {item.desc && (
                  <span className="block text-sm text-cream-muted mt-1">{item.desc}</span>
                )}
              </span>

              {/* Per-option signature overlay */}
              {!reduce && variant && (isSelected || isExiting) && (
                <LongevityOverlay
                  variant={variant}
                  selectionKey={key}
                  exiting={isExiting}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface OverlayProps {
  variant: Variant;
  selectionKey: number;
  exiting: boolean;
}

const LongevityOverlay = ({ variant, selectionKey, exiting }: OverlayProps) => {
  const fadeClass = exiting ? 'longevity-fade-out' : '';

  if (variant === 'short') {
    return (
      <span
        className={`pointer-events-none absolute inset-0 rounded-xl overflow-hidden ${fadeClass}`}
        aria-hidden
      >
        {/* dashed trail across card */}
        <svg
          key={`trail-${selectionKey}`}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
        >
          <path
            d="M 10 60 Q 100 20 200 50 T 390 30"
            fill="none"
            stroke="var(--anim-gold-bright)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity="0.8"
            className="longevity-trail"
          />
        </svg>
        {/* gold burst */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          return (
            <span
              key={`burst-${selectionKey}-${i}`}
              className="absolute top-1/2 right-6"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <span
                className="longevity-burst-dot block w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--anim-gold-bright)' }}
              />
            </span>
          );
        })}
        {/* clock hand */}
        <svg
          key={`clock-${selectionKey}`}
          className="absolute top-1/2 right-4 w-6 h-6 -translate-y-1/2 longevity-clock"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" fill="none" stroke="var(--anim-gold)" strokeWidth="1.2" opacity="0.6" />
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="5"
            stroke="var(--anim-gold-bright)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="longevity-clock-hand"
          />
        </svg>
      </span>
    );
  }

  if (variant === 'allday') {
    return (
      <span
        className={`pointer-events-none absolute inset-0 rounded-xl overflow-hidden ${fadeClass}`}
        aria-hidden
      >
        {/* warm daylight wash */}
        <span
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, hsl(42 90% 60% / 0.18), transparent 65%)',
          }}
        />
        {/* sun arc */}
        <svg
          key={`arc-${selectionKey}`}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
        >
          <path
            d="M 20 70 Q 200 -10 380 70"
            fill="none"
            stroke="var(--anim-gold-bright)"
            strokeWidth="1.6"
            opacity="0.55"
            className="longevity-sun-arc"
          />
        </svg>
        <span
          key={`sun-${selectionKey}`}
          className="longevity-sun absolute w-3 h-3 rounded-full"
          style={{
            top: 6,
            left: 0,
            background: 'var(--anim-gold-bright)',
            boxShadow: '0 0 12px var(--anim-gold-bright), 0 0 24px var(--anim-gold)',
          }}
        />
        {/* steady particle stream */}
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={`p-${i}`}
            className="longevity-particle absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${20 + i * 22}%`,
              bottom: -6,
              background: 'var(--anim-gold)',
              opacity: 0.7,
              animationDelay: `${i * 0.75}s`,
            }}
          />
        ))}
      </span>
    );
  }

  // long
  return (
    <span
      className={`pointer-events-none absolute inset-0 rounded-xl overflow-hidden ${fadeClass}`}
      aria-hidden
    >
      {/* dusk wash */}
      <span
        className="absolute inset-0 longevity-dusk"
        style={{
          background:
            'linear-gradient(90deg, hsl(28 60% 30% / 0.20) 0%, hsl(260 50% 25% / 0.28) 60%, hsl(240 60% 18% / 0.32) 100%)',
        }}
      />
      {/* moon */}
      <svg
        className="absolute top-2 right-4 w-5 h-5 longevity-moon"
        viewBox="0 0 24 24"
      >
        <path
          d="M 17 4 A 9 9 0 1 0 20 17 A 7 7 0 0 1 17 4 Z"
          fill="var(--anim-ivory)"
          opacity="0.85"
        />
      </svg>
      {/* stars */}
      {[
        { top: '20%', left: '15%', delay: 0 },
        { top: '38%', left: '32%', delay: 0.6 },
        { top: '25%', left: '55%', delay: 1.2 },
        { top: '55%', left: '72%', delay: 0.3 },
      ].map((s, i) => (
        <span
          key={`star-${i}`}
          className="longevity-star absolute w-1 h-1 rounded-full"
          style={{
            top: s.top,
            left: s.left,
            background: 'var(--anim-ivory)',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* dense gold particle stream */}
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={`lp-${i}`}
          className="longevity-particle absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${8 + i * 13}%`,
            bottom: -6,
            background: 'var(--anim-gold-bright)',
            opacity: 0.85,
            animationDelay: `${i * 0.5}s`,
            animationDuration: '4.2s',
          }}
        />
      ))}
      {/* slow majestic shimmer sweep every 3s */}
      <span
        className="longevity-shimmer absolute inset-y-0 w-1/3"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(45 90% 70% / 0.25), transparent)',
        }}
      />
    </span>
  );
};
