import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Slider } from '@/components/ui/slider';

interface PersonalityTrait {
  id: string;
  label: string;
}

interface PersonalitySlidersProps {
  traits: PersonalityTrait[];
  values: Record<string, number>;
  onChange: (traitId: string, value: number) => void;
  questionText?: string;
  helperText?: string | null;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useTypewriter(text: string, speed = 40) {
  const [out, setOut] = useState(prefersReducedMotion() ? text : '');
  const [done, setDone] = useState(prefersReducedMotion());
  useEffect(() => {
    if (prefersReducedMotion()) {
      setOut(text);
      setDone(true);
      return;
    }
    setOut('');
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(t);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return { out, done };
}

const guessTraitWeight = (label: string) => {
  const l = label.toLowerCase();
  if (/talk|outgoing|extrovert|social/.test(l)) return 'talkative' as const;
  if (/reserved|introvert/.test(l)) return 'reserved' as const;
  if (/quiet|calm|peaceful/.test(l)) return 'quiet' as const;
  if (/shy|inhibited|timid/.test(l)) return 'shy' as const;
  return 'neutral' as const;
};

export const PersonalitySliders = ({
  traits,
  values,
  onChange,
  questionText = '',
  helperText,
}: PersonalitySlidersProps) => {
  const { out: typed, done: typedDone } = useTypewriter(questionText, 40);
  const headingDelay = questionText.length * 40;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [crystallize, setCrystallize] = useState(0);
  const [bursts, setBursts] = useState<Record<string, number>>({});
  const [trails, setTrails] = useState<Record<string, { id: number; v: number }[]>>({});
  const trailCounter = useRef(0);

  useEffect(() => {
    if (touched.size === traits.length && traits.length > 0 && crystallize === 0) {
      setCrystallize(Date.now());
      const t = setTimeout(() => setCrystallize(0), 1200);
      return () => clearTimeout(t);
    }
  }, [touched, traits.length, crystallize]);

  const markTouched = (id: string) => {
    setTouched((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleChange = (trait: PersonalityTrait, v: number) => {
    onChange(trait.id, v);
    markTouched(trait.id);
    if (draggingId === trait.id && !prefersReducedMotion()) {
      const id = ++trailCounter.current;
      setTrails((prev) => {
        const existing = prev[trait.id] || [];
        return { ...prev, [trait.id]: [...existing.slice(-2), { id, v }] };
      });
      setTimeout(() => {
        setTrails((prev) => ({
          ...prev,
          [trait.id]: (prev[trait.id] || []).filter((d) => d.id !== id),
        }));
      }, 500);
    }
  };

  const handleRelease = (traitId: string) => {
    setDraggingId((cur) => (cur === traitId ? null : cur));
    setBursts((prev) => ({ ...prev, [traitId]: (prev[traitId] || 0) + 1 }));
  };

  // Atmosphere computation
  const atmos = useMemo(() => {
    const get = (kind: string) => {
      const t = traits.find((tr) => guessTraitWeight(tr.label) === kind);
      if (t && values[t.id] !== undefined) return values[t.id];
      return null;
    };
    const fallback = (i: number) =>
      traits[i] && values[traits[i].id] !== undefined ? values[traits[i].id] : 50;
    const talkative = get('talkative') ?? fallback(0);
    const reserved = get('reserved') ?? fallback(1);
    const quiet = get('quiet') ?? fallback(2);
    const shy = get('shy') ?? fallback(3);

    const energy = Math.max(0, Math.min(1, (talkative - reserved * 0.5 - quiet * 0.5) / 100 + 0.3));
    const containment = (reserved + shy) / 200;
    const rawCount = Math.round(10 + energy * 40);
    const count = Math.round(rawCount / 5) * 5;
    const speed = 6 + (1 - energy) * 14 + (quiet / 100) * 6; // 6s..26s
    const spread = 1 - containment * 0.7; // 0.3..1
    return { count, speed, spread, shy: shy / 100, energy };
  }, [values, traits]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('bz:personality-atmos', { detail: atmos }));
    });
    return () => cancelAnimationFrame(id);
  }, [atmos]);

  const particles = useMemo(() => {
    const arr: { left: number; delay: number; size: number; dur: number }[] = [];
    for (let i = 0; i < atmos.count; i++) {
      arr.push({
        left: Math.random() * 100,
        delay: Math.random() * atmos.speed,
        size: 2 + Math.random() * 4,
        dur: atmos.speed * (0.8 + Math.random() * 0.4),
      });
    }
    return arr;
  }, [atmos.count, atmos.speed]);

  return (
    <div className="space-y-8 pds-root">
      <h2
        className="font-display text-cream text-balance pds-heading"
        style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {typed}
        {!typedDone && <span className="pds-caret">▎</span>}
      </h2>
      {helperText && (
        <p
          className="text-gold-muted text-base md:text-lg pds-helper"
          style={{ animationDelay: `${headingDelay}ms` }}
        >
          {helperText}
        </p>
      )}

      <div className="space-y-7">
        {traits.map((trait, i) => {
          const value = values[trait.id] !== undefined ? values[trait.id] : 50;
          const isDragging = draggingId === trait.id;
          const burstKey = bursts[trait.id] || 0;
          const rowTrails = trails[trait.id] || [];
          const isCrystallizing = crystallize > 0;
          return (
            <div
              key={trait.id}
              className="pds-row space-y-2"
              style={{ animationDelay: `${headingDelay + 200 + i * 150}ms` }}
            >
              <div
                className="pds-label text-lg font-medium"
                data-active={isDragging ? 'true' : 'false'}
              >
                {trait.label}
              </div>
              <div
                className="pds-track-wrap relative"
                data-dragging={isDragging ? 'true' : 'false'}
                onPointerDown={() => setDraggingId(trait.id)}
                onPointerUp={() => handleRelease(trait.id)}
                onPointerCancel={() => handleRelease(trait.id)}
                onLostPointerCapture={() => handleRelease(trait.id)}
              >
                <Slider
                  value={[value]}
                  onValueChange={(val) => handleChange(trait, val[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="pds-slider [&_[role=slider]]:pds-thumb [&_span[data-orientation=horizontal]>span]:pds-range"
                  style={{ ['--pds-thumb-delay' as any]: `${i * 0.4}s` }}
                />
                {isCrystallizing && (
                  <span
                    key={`crys-${crystallize}-${trait.id}`}
                    className="pds-crystallize"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                )}
                {burstKey > 0 && (
                  <span
                    key={`ripple-${burstKey}`}
                    className="pds-release-ripple"
                    style={{ left: `${value}%` }}
                  />
                )}
                {rowTrails.map((d) => (
                  <span
                    key={d.id}
                    className="pds-trail-dot"
                    style={{ left: `${d.v}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span
                  className="pds-end pds-end-left"
                  data-glow={value < 50 ? 'true' : 'false'}
                >
                  Not at all
                </span>
                <span
                  className="pds-end pds-end-right"
                  data-glow={value >= 50 ? 'true' : 'false'}
                >
                  Very much
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pds-atmosphere"
            style={{
              ['--pds-spread' as any]: atmos.spread.toFixed(2),
              ['--pds-shy' as any]: atmos.shy.toFixed(2),
            }}
            aria-hidden
          >
            {particles.map((p, idx) => (
              <span
                key={idx}
                className="pds-particle"
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `-${p.delay}s`,
                }}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
