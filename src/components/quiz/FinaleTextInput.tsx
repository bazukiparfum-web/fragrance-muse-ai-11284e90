import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';

interface FinaleTextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  questionText: string;
  helperText?: string | null;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useTypewriter(text: string, speed = 30) {
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

let sparkleCounter = 0;
let echoCounter = 0;

export const FinaleTextInput = ({
  value,
  onChange,
  placeholder,
  questionText,
  helperText,
}: FinaleTextInputProps) => {
  const { out, done } = useTypewriter(questionText, 30);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; dx: number }[]>([]);
  const [echoes, setEchoes] = useState<{ id: number; text: string }[]>([]);
  const lastEchoTs = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const intensity = Math.min(1, value.length / 12);

  const handleChange = (newVal: string) => {
    const grew = newVal.length > value.length;
    onChange(newVal);
    if (!grew || prefersReducedMotion()) return;

    // 3 sparkles per keystroke
    const rect = wrapRef.current?.getBoundingClientRect();
    const x = rect ? rect.right - 18 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const newSparks = Array.from({ length: 3 }).map(() => ({
      id: ++sparkleCounter,
      x,
      y,
      dx: (Math.random() - 0.5) * 40,
    }));
    setSparkles((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparks.find((n) => n.id === s.id)));
    }, 950);

    // Word echo throttled to ~200ms
    const now = Date.now();
    if (newVal.trim().length >= 2 && now - lastEchoTs.current > 200) {
      lastEchoTs.current = now;
      const id = ++echoCounter;
      setEchoes((prev) => [...prev.slice(-3), { id, text: newVal }]);
      setTimeout(() => {
        setEchoes((prev) => prev.filter((e) => e.id !== id));
      }, 1250);
    }
  };

  return (
    <div
      className="space-y-8 finale-root"
      style={{ ['--finale-intensity' as any]: intensity.toFixed(2) }}
    >
      <h2
        className="font-display text-cream text-balance"
        style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {out}
        {!done && <span className="finale-caret">▎</span>}
      </h2>
      {helperText && <p className="text-gold-muted text-base md:text-lg">{helperText}</p>}

      <div ref={wrapRef} className="finale-input-wrap relative">
        <Input
          type="text"
          autoFocus
          placeholder={placeholder || ''}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="finale-input text-lg md:text-xl p-6 bg-bz-card/60 border-gold text-cream placeholder:text-cream-muted/60 relative z-10"
        />
        {/* Word echoes float above the field */}
        <div className="finale-echo-layer" aria-hidden="true">
          {echoes.map((e) => (
            <span key={e.id} className="finale-word-echo font-display">
              {e.text}
            </span>
          ))}
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <div className="finale-sparkle-portal" aria-hidden="true">
            {sparkles.map((s) => (
              <span
                key={s.id}
                className="finale-keystroke-sparkle"
                style={{
                  left: `${s.x}px`,
                  top: `${s.y}px`,
                  ['--ks-dx' as any]: `${s.dx}px`,
                }}
              />
            ))}
            {/* Anticipation atmosphere: extra particles scaled by intensity */}
            <div
              className="finale-atmosphere"
              style={{ ['--finale-intensity' as any]: intensity.toFixed(2) }}
            >
              {Array.from({ length: Math.round(8 + intensity * 22) }).map((_, i) => (
                <span
                  key={i}
                  className="finale-atmos-particle"
                  style={{
                    left: `${(i * 97) % 100}%`,
                    animationDuration: `${10 - intensity * 5}s`,
                    animationDelay: `-${(i * 0.7) % 10}s`,
                  }}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FinaleTextInput;
