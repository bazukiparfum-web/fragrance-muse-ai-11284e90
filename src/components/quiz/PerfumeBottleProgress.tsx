import { useEffect, useRef, useState } from 'react';

interface PerfumeBottleProgressProps {
  /** Number of completed steps (0..total). */
  current: number;
  total: number;
}

/**
 * Tiny SVG perfume bottle indicator. Fill rises with completed steps.
 * Bubbles spawn on each fill change. Idle breathing + ambient glow.
 */
export const PerfumeBottleProgress = ({ current, total }: PerfumeBottleProgressProps) => {
  const pct = Math.max(0, Math.min(1, current / Math.max(total, 1)));
  const [bubbleKey, setBubbleKey] = useState(0);
  const [glow, setGlow] = useState(false);
  const prev = useRef(current);

  useEffect(() => {
    if (current !== prev.current) {
      prev.current = current;
      setBubbleKey((k) => k + 1);
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 600);
      return () => clearTimeout(t);
    }
  }, [current]);

  // Bottle interior bounds (SVG coords). Liquid fills from bottom = y=60 up to y=18.
  const INTERIOR_TOP = 18;
  const INTERIOR_BOTTOM = 60;
  const liquidHeight = (INTERIOR_BOTTOM - INTERIOR_TOP) * pct;
  const liquidY = INTERIOR_BOTTOM - liquidHeight;

  return (
    <div
      className="bottle-indicator"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 16,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        zIndex: 15,
        pointerEvents: 'none',
        width: 40,
        textAlign: 'center',
      }}
    >
      <svg
        width="40"
        height="70"
        viewBox="0 0 40 70"
        className={`bottle-breathe ${glow ? 'bottle-glow-pulse' : ''}`}
        style={{ filter: 'drop-shadow(0 0 2px hsl(var(--bz-gold) / 0.5))' }}
      >
        <defs>
          <clipPath id="bottle-interior">
            <path d="M12,18 Q12,15 14,14 L14,8 Q14,6 16,6 L24,6 Q26,6 26,8 L26,14 Q28,15 28,18 L28,58 Q28,62 24,62 L16,62 Q12,62 12,58 Z" />
          </clipPath>
          <linearGradient id="bottle-liquid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#F0C040" />
          </linearGradient>
        </defs>

        {/* Liquid + wave, clipped to bottle interior */}
        <g clipPath="url(#bottle-interior)">
          {liquidHeight > 0 && (
            <>
              <rect
                x="10"
                y={liquidY + 2}
                width="20"
                height={liquidHeight}
                fill="url(#bottle-liquid)"
                style={{ transition: 'y 400ms ease-in-out, height 400ms ease-in-out' }}
              />
              {/* Wavy top edge */}
              <path
                className="bottle-wave"
                d={`M10,${liquidY} Q15,${liquidY - 1.5} 20,${liquidY} T30,${liquidY} L30,${liquidY + 2} L10,${liquidY + 2} Z`}
                fill="url(#bottle-liquid)"
                style={{ transition: 'd 400ms ease-in-out' }}
              />
              {/* Bubbles */}
              <g key={bubbleKey}>
                <circle className="bottle-bubble bottle-bubble-1" cx="16" cy={INTERIOR_BOTTOM - 2} r="1" fill="#F5F0E8" opacity="0.8" />
                <circle className="bottle-bubble bottle-bubble-2" cx="20" cy={INTERIOR_BOTTOM - 2} r="0.8" fill="#F5F0E8" opacity="0.7" />
                <circle className="bottle-bubble bottle-bubble-3" cx="24" cy={INTERIOR_BOTTOM - 2} r="1.2" fill="#F5F0E8" opacity="0.8" />
              </g>
            </>
          )}
        </g>

        {/* Bottle outline */}
        <path
          d="M12,18 Q12,15 14,14 L14,8 Q14,6 16,6 L24,6 Q26,6 26,8 L26,14 Q28,15 28,18 L28,58 Q28,62 24,62 L16,62 Q12,62 12,58 Z"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="1.2"
        />
        {/* Cap */}
        <rect x="16" y="2" width="8" height="5" rx="1" fill="#C9A84C" opacity="0.85" />
      </svg>
      <div
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 9,
          color: '#C9A84C',
          opacity: 0.7,
          marginTop: 2,
          letterSpacing: '0.05em',
        }}
      >
        Your Formula
      </div>
    </div>
  );
};

export default PerfumeBottleProgress;
