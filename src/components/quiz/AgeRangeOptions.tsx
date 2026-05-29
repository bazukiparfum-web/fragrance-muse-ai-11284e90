import { useEffect, useRef, useState } from 'react';

interface AgeRangeOptionsProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  heading: React.ReactNode;
  helper?: string | null;
  questionText: string;
}

const BURST_DOTS = 8;

export const AgeRangeOptions = ({
  options,
  value,
  onChange,
  heading,
  helper,
}: AgeRangeOptionsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [burst, setBurst] = useState<{ value: string; key: number; digits: string[] } | null>(null);
  const prevValueRef = useRef<string>(value);

  useEffect(() => {
    if (value && value !== prevValueRef.current) {
      const digits = value.match(/\d+/g) || [];
      setBurst({ value, key: Date.now(), digits });
      const t = setTimeout(() => setBurst(null), 1100);
      prevValueRef.current = value;
      return () => clearTimeout(t);
    }
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="space-y-8">
      {heading}
      {helper && <p className="text-gold-muted text-base md:text-lg">{helper}</p>}

      {/* Hover-lit journey timeline */}
      <div className="relative h-4 px-2" aria-hidden>
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-dotted border-gold/40" />
        <div className="relative flex justify-between items-center h-full">
          {options.map((_, i) => {
            const lit = i <= hoveredIndex;
            return (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                  lit
                    ? 'bg-gold-strong shadow-glow-gold-sm scale-125'
                    : 'bg-gold/40 scale-100'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3" role="radiogroup">
        {options.map((option, index) => {
          const selected = value === option;
          const isBurstRow = burst?.value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex((h) => (h === index ? -1 : h))}
              onClick={() => onChange(option)}
              className={`age-card-in relative w-full flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer text-left transition-all hover:bg-bz-card/60 overflow-visible ${
                selected
                  ? 'border-gold-strong bg-bz-card glow-gold-sm'
                  : 'border-gold bg-bz-card/40'
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {selected && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{ background: 'hsl(35 60% 15% / 0.4)' }}
                  aria-hidden
                />
              )}

              {/* Radio dot */}
              <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
                <span
                  className={`block w-5 h-5 rounded-full border-2 transition-all ${
                    selected ? 'border-gold-strong' : 'border-gold'
                  }`}
                />
                {selected && (
                  <span className="absolute inset-1 rounded-full bg-gold-strong" />
                )}
                {/* Burst ring */}
                {isBurstRow && burst && (
                  <span
                    key={burst.key}
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden
                  >
                    {Array.from({ length: BURST_DOTS }).map((_, i) => {
                      const angle = (i / BURST_DOTS) * Math.PI * 2;
                      const x = Math.cos(angle) * 18;
                      const y = Math.sin(angle) * 18;
                      return (
                        <span
                          key={i}
                          className="age-burst-dot absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gold"
                          style={{
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                          }}
                        />
                      );
                    })}
                  </span>
                )}
              </span>

              <span className="relative flex-1 text-lg md:text-xl text-cream font-medium">
                {option}
              </span>

              {/* Floating digit ghosts */}
              {isBurstRow && burst && (
                <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 flex gap-3" aria-hidden>
                  {burst.digits.map((d, i) => (
                    <span
                      key={`${burst.key}-${i}`}
                      className="age-digit-float font-display text-gold/80 text-3xl md:text-4xl"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {d}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
