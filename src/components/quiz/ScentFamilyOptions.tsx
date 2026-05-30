import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Family {
  value: string;
  emoji: string;
}

interface ScentFamilyOptionsProps {
  families: Family[];
  selected: string[];
  onToggle: (value: string) => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const KEY: Record<string, string> = {
  Floral: 'floral',
  Woody: 'woody',
  Fresh: 'fresh',
  Oriental: 'oriental',
  Gourmand: 'gourmand',
  Spicy: 'spicy',
  'Herbal/Green': 'herbal',
};

const WISP_COLORS: Record<string, string> = {
  floral: 'hsl(340 70% 65% / 0.18)',
  woody: 'hsl(28 50% 35% / 0.20)',
  fresh: 'hsl(190 70% 55% / 0.16)',
  oriental: 'hsl(30 70% 45% / 0.22)',
  gourmand: 'hsl(35 60% 60% / 0.18)',
  spicy: 'hsl(12 80% 50% / 0.20)',
  herbal: 'hsl(140 50% 40% / 0.18)',
};

const WISP_POS: Record<string, { x: string; y: string }> = {
  floral: { x: '15%', y: '20%' },
  woody: { x: '70%', y: '30%' },
  fresh: { x: '40%', y: '70%' },
  oriental: { x: '80%', y: '60%' },
  gourmand: { x: '20%', y: '70%' },
  spicy: { x: '60%', y: '15%' },
  herbal: { x: '50%', y: '40%' },
};

export const ScentFamilyOptions = ({ families, selected, onToggle }: ScentFamilyOptionsProps) => {
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const prevSelected = useRef<string[]>(selected);

  // Track deselections for graceful fade-out, and dispatch sparkle on new selection
  useEffect(() => {
    const prev = prevSelected.current;
    const removed = prev.filter((v) => !selected.includes(v));
    const added = selected.filter((v) => !prev.includes(v));

    if (added.length > 0) {
      window.dispatchEvent(new CustomEvent('bz:scent-family-selected', { detail: added[0] }));
    }
    if (removed.length > 0) {
      setExiting((s) => {
        const next = new Set(s);
        removed.forEach((r) => next.add(r));
        return next;
      });
      const t = setTimeout(() => {
        setExiting((s) => {
          const next = new Set(s);
          removed.forEach((r) => next.delete(r));
          return next;
        });
      }, 320);
      prevSelected.current = selected;
      return () => clearTimeout(t);
    }
    prevSelected.current = selected;
  }, [selected]);

  const visible = (key: string) => selected.includes(key) || exiting.has(key);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {families.map((f, i) => {
          const k = KEY[f.value] || 'floral';
          const isOn = selected.includes(f.value);
          const isExiting = exiting.has(f.value);
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onToggle(f.value)}
              data-family={k}
              data-selected={isOn}
              className={`bloom-in relative overflow-hidden p-5 md:p-6 rounded-xl border-2 text-center transition-all duration-300 family-card ${
                isOn
                  ? `border-gold-strong bg-bz-card scale-[1.03] glow-${k}`
                  : 'border-gold bg-bz-card/40 hover:bg-bz-card/70'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`relative text-3xl md:text-4xl mb-2 inline-block ${isOn ? `emoji-${k}` : ''}`}>
                {f.emoji}
                {isOn && k === 'oriental' && <span className="oriental-halo" aria-hidden />}
              </div>
              <div className="text-cream font-medium relative">{f.value}</div>

              {(isOn || isExiting) && (
                <FamilyOverlay familyKey={k} exiting={isExiting} />
              )}
            </button>
          );
        })}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden" aria-hidden style={{ mixBlendMode: 'screen' }}>
            {Object.keys(KEY).map((label) => {
              const k = KEY[label];
              if (!visible(label)) return null;
              const pos = WISP_POS[k];
              return (
                <span
                  key={k}
                  className={`absolute rounded-full family-wisp ${exiting.has(label) ? 'family-fade-out' : ''}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: '55vw',
                    height: '55vw',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${WISP_COLORS[k]}, transparent 70%)`,
                    filter: 'blur(50px)',
                  }}
                />
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

interface OverlayProps {
  familyKey: string;
  exiting: boolean;
}

const FamilyOverlay = ({ familyKey, exiting }: OverlayProps) => {
  const reduce = prefersReducedMotion();
  if (reduce) return null;

  const wrap = (children: React.ReactNode) => (
    <span
      className={`pointer-events-none absolute inset-0 overflow-visible ${exiting ? 'family-fade-out' : ''}`}
      aria-hidden
    >
      {children}
    </span>
  );

  switch (familyKey) {
    case 'floral':
      return wrap(
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="petal-rise absolute rounded-full"
              style={{
                left: `${10 + i * 14}%`,
                bottom: 0,
                width: 7,
                height: 7,
                background: i % 2 === 0 ? 'hsl(340 80% 80%)' : 'hsl(0 0% 96%)',
                opacity: 0.7,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </>
      );
    case 'woody':
      return wrap(
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="needle-rise absolute"
              style={{
                left: `${10 + i * 14}%`,
                bottom: 0,
                width: 2,
                height: 10,
                background: 'hsl(120 30% 25%)',
                opacity: 0.7,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </>
      );
    case 'fresh':
      return wrap(
        <>
          {[0, 1, 2].map((i) => (
            <span
              key={`r${i}`}
              className="fresh-ripple absolute top-1/2 left-1/2 rounded-full border-2"
              style={{
                width: 30,
                height: 30,
                marginLeft: -15,
                marginTop: -15,
                borderColor: 'hsl(190 70% 60%)',
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={`d${i}`}
              className="droplet-fall absolute rounded-full"
              style={{
                left: `${15 + i * 18}%`,
                top: 0,
                width: 4,
                height: 4,
                background: 'hsl(190 80% 75%)',
                opacity: 0.8,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </>
      );
    case 'oriental':
      return wrap(
        <span className="absolute top-1/2 left-1/2 w-0 h-0">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 360;
            return (
              <span
                key={i}
                className="absolute top-0 left-0 w-0 h-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="oriental-spark block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 2 === 0 ? 'hsl(35 90% 60%)' : 'hsl(280 60% 55%)',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </span>
            );
          })}
        </span>
      );
    case 'gourmand':
      return wrap(
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const colors = ['hsl(340 70% 80%)', 'hsl(45 80% 75%)', 'hsl(180 50% 80%)', 'hsl(280 50% 80%)'];
            return (
              <span
                key={i}
                className="confetti-fall absolute rounded-sm"
                style={{
                  left: `${8 + i * 11}%`,
                  top: -6,
                  width: 5,
                  height: 5,
                  background: colors[i % colors.length],
                  opacity: 0.85,
                  animationDelay: `${i * 0.25}s`,
                }}
              />
            );
          })}
        </>
      );
    case 'spicy':
      return wrap(
        <>
          <span className="heat-wave absolute inset-0" />
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="ember-rise absolute rounded-full"
              style={{
                left: `${10 + i * 11}%`,
                bottom: 0,
                width: 4,
                height: 4,
                background: i % 2 === 0 ? 'hsl(15 90% 55%)' : 'hsl(30 95% 60%)',
                opacity: 0.85,
                boxShadow: '0 0 6px hsl(15 90% 55%)',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </>
      );
    case 'herbal':
      return wrap(
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="leaf-rise absolute rounded-full"
              style={{
                left: `${10 + i * 14}%`,
                bottom: 0,
                width: 6,
                height: 8,
                background: 'hsl(140 50% 45%)',
                opacity: 0.75,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </>
      );
    default:
      return null;
  }
};
