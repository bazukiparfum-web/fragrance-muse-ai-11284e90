import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PersonalityOptionsProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  heading: React.ReactNode;
  helper?: string | null;
  questionText: string;
}

type Personality = 'Calm' | 'Energetic' | 'Elegant' | 'Bold';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ENERGETIC_DOTS = 20;
const BOLD_DOTS = 28;
const PETALS = 10;
const BUBBLES = 8;

export const PersonalityOptions = ({
  options,
  value,
  onChange,
  heading,
  helper,
}: PersonalityOptionsProps) => {
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [flash, setFlash] = useState(0);
  const prevValueRef = useRef<string>(value);

  useEffect(() => {
    if (value && value !== prevValueRef.current) {
      const el = cardRefs.current[value];
      if (el) {
        const r = el.getBoundingClientRect();
        setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setBurstKey(Date.now());
      if (value === 'Bold') setFlash(Date.now());
      prevValueRef.current = value;
    }
  }, [value]);

  const reduce = prefersReducedMotion();
  const selected = value as Personality | '';

  return (
    <div className="space-y-8">
      {heading}
      {helper && <p className="text-gold-muted text-base md:text-lg">{helper}</p>}

      <div className="space-y-3" role="radiogroup">
        {options.map((option, index) => {
          const isSelected = value === option;
          const isBold = option === 'Bold';
          const isEnergetic = option === 'Energetic';
          const isElegant = option === 'Elegant';

          return (
            <button
              key={option}
              ref={(el) => (cardRefs.current[option] = el)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option)}
              className={`personality-row-in relative w-full flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer text-left transition-all duration-300 hover:bg-bz-card/60 overflow-visible ${
                isSelected
                  ? 'border-gold-strong bg-bz-card glow-gold-sm'
                  : 'border-gold bg-bz-card/40'
              } ${isSelected && isBold ? 'scale-[1.03]' : ''} ${
                isSelected && isEnergetic && !reduce ? 'energetic-bounce' : ''
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Radio dot */}
              <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
                <span
                  className={`block w-5 h-5 rounded-full border-2 transition-all ${
                    isSelected ? 'border-gold-strong' : 'border-gold'
                  }`}
                />
                {isSelected && <span className="absolute inset-1 rounded-full bg-gold-strong" />}
              </span>

              <span className="relative flex-1 text-lg md:text-xl text-cream font-medium">
                {option}
              </span>

              {/* Elegant corner glow */}
              {isSelected && isElegant && (
                <>
                  <span className="pointer-events-none absolute -top-1 -left-1 w-8 h-8 rounded-tl-xl elegant-corner-glow" />
                  <span
                    className="pointer-events-none absolute -top-1 -right-1 w-8 h-8 rounded-tr-xl elegant-corner-glow"
                    style={{ animationDelay: '200ms' }}
                  />
                  <span
                    className="pointer-events-none absolute -bottom-1 -left-1 w-8 h-8 rounded-bl-xl elegant-corner-glow"
                    style={{ animationDelay: '400ms' }}
                  />
                  <span
                    className="pointer-events-none absolute -bottom-1 -right-1 w-8 h-8 rounded-br-xl elegant-corner-glow"
                    style={{ animationDelay: '600ms' }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Body-portal atmosphere */}
      {typeof document !== 'undefined' && !reduce &&
        createPortal(
          <PersonalityAtmosphere
            selected={selected}
            origin={origin}
            burstKey={burstKey}
            flashKey={flash}
          />,
          document.body
        )}
    </div>
  );
};

interface AtmosphereProps {
  selected: Personality | '';
  origin: { x: number; y: number } | null;
  burstKey: number;
  flashKey: number;
}

const PersonalityAtmosphere = ({ selected, origin, burstKey, flashKey }: AtmosphereProps) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {/* CALM */}
      {selected === 'Calm' && origin && (
        <>
          {[0, 1, 2].map((i) => (
            <span
              key={`calm-ring-${burstKey}-${i}`}
              className="calm-ripple absolute rounded-full border-2"
              style={{
                left: origin.x,
                top: origin.y,
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderColor: 'var(--anim-gold)',
                animationDelay: `${i * 1000}ms`,
              }}
            />
          ))}
          {Array.from({ length: BUBBLES }).map((_, i) => (
            <span
              key={`bubble-${i}`}
              className="calm-bubble absolute rounded-full"
              style={{
                left: `${(i / BUBBLES) * 100 + Math.random() * 6}%`,
                bottom: -20,
                width: 6 + Math.random() * 6,
                height: 6 + Math.random() * 6,
                background: 'var(--anim-ivory)',
                opacity: 0.25,
                animationDelay: `${i * 1.6}s`,
                animationDuration: `${14 + Math.random() * 6}s`,
              }}
            />
          ))}
          <span
            className="calm-mist absolute rounded-full"
            style={{
              top: '20%',
              left: '-15%',
              width: '50vw',
              height: '50vw',
              background:
                'radial-gradient(circle, hsl(270 40% 80% / 0.12), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <span
            className="calm-mist absolute rounded-full"
            style={{
              top: '50%',
              left: '40%',
              width: '60vw',
              height: '60vw',
              background:
                'radial-gradient(circle, hsl(220 30% 90% / 0.10), transparent 70%)',
              filter: 'blur(50px)',
              animationDelay: '-6s',
              animationDuration: '18s',
            }}
          />
        </>
      )}

      {/* ENERGETIC */}
      {selected === 'Energetic' && origin && (
        <>
          <span
            key={`shimmer-${burstKey}`}
            className="energetic-shimmer absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at center, var(--anim-gold) 0%, transparent 70%)',
            }}
          />
          <span
            key={`eburst-${burstKey}`}
            className="absolute"
            style={{ left: origin.x, top: origin.y }}
          >
            {Array.from({ length: ENERGETIC_DOTS }).map((_, i) => {
              const angle = (i / ENERGETIC_DOTS) * 360;
              return (
                <span
                  key={i}
                  className="absolute top-0 left-0 w-0 h-0"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="energetic-burst-dot block w-2 h-2 rounded-full"
                    style={{ background: 'var(--anim-gold-bright)' }}
                  />
                </span>
              );
            })}
          </span>
        </>
      )}

      {/* ELEGANT */}
      {selected === 'Elegant' && (
        <>
          <svg
            key={`ribbon-${burstKey}`}
            className="elegant-ribbon absolute inset-0 w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            <path
              d="M -50 450 Q 250 100 500 300 T 1050 200"
              fill="none"
              stroke="var(--anim-gold-bright)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
          {Array.from({ length: PETALS }).map((_, i) => (
            <span
              key={`petal-${i}`}
              className="elegant-petal absolute rounded-full"
              style={{
                left: `${(i / PETALS) * 100}%`,
                top: -20,
                width: 6,
                height: 10,
                background: 'var(--anim-gold)',
                opacity: 0.5,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${8 + Math.random() * 6}s`,
              }}
            />
          ))}
        </>
      )}

      {/* BOLD */}
      {selected === 'Bold' && origin && (
        <>
          {flashKey > 0 && (
            <span
              key={`flash-${flashKey}`}
              className="bold-flash absolute inset-0"
              style={{ background: 'var(--anim-gold-bright)' }}
            />
          )}
          <span
            key={`bburst-${burstKey}`}
            className="absolute"
            style={{ left: origin.x, top: origin.y }}
          >
            {Array.from({ length: BOLD_DOTS }).map((_, i) => {
              const angle = (i / BOLD_DOTS) * 360;
              return (
                <span
                  key={i}
                  className="absolute top-0 left-0 w-0 h-0"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="bold-burst-dot block w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--anim-gold-bright)' }}
                  />
                </span>
              );
            })}
          </span>
        </>
      )}
    </div>
  );
};
