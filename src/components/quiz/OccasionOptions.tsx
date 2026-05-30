import { useEffect, useRef, useState } from 'react';

interface OccasionOptionsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const VARIANT: Record<string, string> = {
  daily: 'daily',
  office: 'office',
  evening: 'evening',
  sport: 'sport',
  travel: 'travel',
};

const keyOf = (v: string) => VARIANT[v.toLowerCase()] || 'daily';

export const OccasionOptions = ({ options, value, onChange }: OccasionOptionsProps) => {
  const [exiting, setExiting] = useState<string | null>(null);
  const prev = useRef<string>(value);
  const [pop, setPop] = useState(0);

  useEffect(() => {
    if (prev.current && prev.current !== value) {
      setExiting(prev.current);
      const t = setTimeout(() => setExiting(null), 320);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
    if (value) setPop((p) => p + 1);
  }, [value]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {options.map((occ, i) => {
        const k = keyOf(occ);
        const isOn = value === occ;
        const isExit = exiting === occ;
        return (
          <button
            key={occ}
            type="button"
            onClick={() => onChange(occ)}
            className={`occasion-card occasion-card--${k} occasion-deal-in relative overflow-hidden p-5 md:p-6 rounded-xl border-2 transition-all ${
              isOn
                ? 'border-gold-strong bg-bz-card scale-[1.02] occasion-card--on'
                : 'border-gold bg-bz-card/40 hover:bg-bz-card/70'
            } ${isOn && k === 'sport' ? 'occasion-pop' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="relative z-10 text-cream font-medium">{occ}</span>
            {(isOn || isExit) && <OccasionOverlay variant={k} exiting={isExit} popKey={pop} />}
          </button>
        );
      })}
    </div>
  );
};

const OccasionOverlay = ({
  variant,
  exiting,
  popKey,
}: {
  variant: string;
  exiting: boolean;
  popKey: number;
}) => {
  if (prefersReducedMotion()) return null;
  const wrap = (children: React.ReactNode) => (
    <span
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-xl ${
        exiting ? 'occasion-fade-out' : ''
      }`}
      aria-hidden
    >
      {children}
    </span>
  );

  switch (variant) {
    case 'daily':
      return wrap(
        <>
          <span className="absolute inset-0 occasion-sunrise" />
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute occasion-rise rounded-full"
              style={{
                left: `${10 + i * 14}%`,
                bottom: 0,
                width: 4,
                height: 4,
                background: 'hsl(42 95% 70%)',
                opacity: 0.8,
                animationDelay: `${i * 0.45}s`,
              }}
            />
          ))}
        </>
      );
    case 'office':
      return wrap(
        <>
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[25, 50, 75].map((p, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={p}
                x2="100"
                y2={p}
                stroke="hsl(45 80% 60%)"
                strokeWidth="0.5"
                strokeDasharray="100"
                strokeDashoffset="100"
                className="occasion-grid-line"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
            {[25, 50, 75].map((p, i) => (
              <line
                key={`v${i}`}
                x1={p}
                y1="0"
                x2={p}
                y2="100"
                stroke="hsl(45 80% 60%)"
                strokeWidth="0.5"
                strokeDasharray="100"
                strokeDashoffset="100"
                className="occasion-grid-line"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              />
            ))}
          </svg>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="absolute occasion-column-rise rounded-full"
              style={{
                left: `${15 + i * 18}%`,
                bottom: 0,
                width: 3,
                height: 3,
                background: 'hsl(210 70% 75%)',
                opacity: 0.7,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </>
      );
    case 'evening':
      return wrap(
        <>
          <span className="absolute inset-0 occasion-evening-bg" />
          {Array.from({ length: 14 }).map((_, i) => {
            const x = (i * 53) % 100;
            const y = (i * 37) % 100;
            return (
              <span
                key={`s${i}`}
                className="absolute occasion-twinkle rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: 2,
                  height: 2,
                  background: 'hsl(45 100% 85%)',
                  boxShadow: '0 0 4px hsl(45 100% 80%)',
                  animationDelay: `${(i % 7) * 0.22}s`,
                }}
              />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={`sh${i}`}
              className="absolute occasion-shimmer-fall rounded-full"
              style={{
                left: `${8 + i * 12}%`,
                top: -6,
                width: 3,
                height: 3,
                background: 'hsl(45 90% 75%)',
                opacity: 0.7,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
          <svg
            className="absolute top-2 right-2 occasion-moon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="hsl(45 95% 78%)" />
          </svg>
        </>
      );
    case 'sport':
      return wrap(
        <>
          <span className="absolute inset-0 occasion-pulse-cool" />
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={`p${popKey}-${i}`}
              className="absolute occasion-rise-fast rounded-full"
              style={{
                left: `${5 + i * 9}%`,
                bottom: 0,
                width: 3,
                height: 3,
                background: i % 2 === 0 ? 'hsl(175 70% 60%)' : 'hsl(195 80% 65%)',
                opacity: 0.85,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </>
      );
    case 'travel':
      return wrap(
        <>
          <svg className="absolute inset-0 m-auto" width="60%" height="60%" viewBox="0 0 100 100" style={{ top: '20%', left: '20%' }}>
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="hsl(32 60% 70%)"
              strokeWidth="1"
              strokeDasharray="220"
              strokeDashoffset="220"
              className="occasion-compass"
              opacity="0.5"
            />
            <path
              d="M50 15 L55 50 L50 85 L45 50 Z"
              fill="none"
              stroke="hsl(32 80% 65%)"
              strokeWidth="1"
              strokeDasharray="160"
              strokeDashoffset="160"
              className="occasion-compass"
              style={{ animationDelay: '0.2s' }}
              opacity="0.6"
            />
            <path
              d="M15 50 L50 45 L85 50 L50 55 Z"
              fill="none"
              stroke="hsl(32 80% 65%)"
              strokeWidth="1"
              strokeDasharray="160"
              strokeDashoffset="160"
              className="occasion-compass"
              style={{ animationDelay: '0.35s' }}
              opacity="0.6"
            />
          </svg>
          {Array.from({ length: 8 }).map((_, i) => {
            const dx = Math.cos((i / 8) * Math.PI * 2) * 40;
            const dy = Math.sin((i / 8) * Math.PI * 2) * 40;
            return (
              <span
                key={i}
                className="absolute occasion-wind rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: 3,
                  height: 3,
                  background: 'hsl(32 70% 75%)',
                  opacity: 0.7,
                  ['--dx' as any]: `${dx}px`,
                  ['--dy' as any]: `${dy}px`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            );
          })}
        </>
      );
    default:
      return null;
  }
};
