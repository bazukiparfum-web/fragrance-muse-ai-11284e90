import { useEffect, useRef, useState } from 'react';
import ProductImageStage from './ProductImageStage';
import { cn } from '@/lib/utils';
import { EngravingStyle, ENGRAVING_FONT_CLASS } from '@/hooks/useEngraving';

interface Props {
  src?: string;
  alt: string;
  enabled: boolean;
  text: string;
  style: EngravingStyle;
  glowPulseKey?: number;
}

function fontSizeFor(len: number) {
  if (len <= 6) return 22;
  if (len <= 12) return 18;
  if (len <= 18) return 14;
  return 11;
}

export default function EngravedBottlePreview({ src, alt, enabled, text, style, glowPulseKey }: Props) {
  const prevLenRef = useRef(0);
  const [sparkKey, setSparkKey] = useState(0);
  const [shimmerKey, setShimmerKey] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Per-char animation: only newly added trailing chars animate.
  useEffect(() => {
    if (text.length > prevLenRef.current) {
      setSparkKey((k) => k + 1);
    }
    prevLenRef.current = text.length;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (text.length > 0) {
      idleTimerRef.current = setTimeout(() => setShimmerKey((k) => k + 1), 700);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [text]);

  const showOverlay = enabled && text.length > 0;
  const size = fontSizeFor(text.length);

  return (
    <div className={cn('relative', glowPulseKey ? '' : '')}>
      <div
        key={`glow-${glowPulseKey ?? 0}`}
        className={cn('rounded-xl', glowPulseKey ? 'engrave-glow-pulse' : '')}
      >
        <ProductImageStage src={src} alt={alt} />
      </div>

      {showOverlay && (
        <div
          key={`overlay-${style}`}
          className="engrave-overlay-wrap absolute pointer-events-none z-10 text-center"
          style={{
            top: '45%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '65%',
          }}
          aria-hidden
        >
          <div
            className={cn('relative inline-block', ENGRAVING_FONT_CLASS[style])}
            style={{
              fontSize: `${size}px`,
              lineHeight: 1.1,
              color: 'rgba(201,168,76,0.9)',
              textShadow: '0 0 8px rgba(201,168,76,0.4)',
              letterSpacing: '0.08em',
            }}
          >
            {text.split('').map((ch, i) => (
              <span
                key={`${i}-${ch}-${text.length}`}
                className={i === text.length - 1 ? 'engrave-char' : ''}
                style={i === text.length - 1 ? undefined : { opacity: 0.9 }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
            {sparkKey > 0 && (
              <span key={`spark-${sparkKey}`} className="engrave-spark">✦</span>
            )}
            {shimmerKey > 0 && (
              <span
                key={`shim-${shimmerKey}`}
                className="engrave-shimmer-overlay"
                aria-hidden
              >
                {text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
