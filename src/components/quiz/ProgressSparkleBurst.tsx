import { useMemo } from 'react';

interface ProgressSparkleBurstProps {
  /** Horizontal offset (px) from left edge of the parent for the burst origin. */
  x: number;
}

/**
 * Burst of 7 tiny gold sparkles emitted from a single point.
 * Remount with key={step} on the parent to replay.
 */
export const ProgressSparkleBurst = ({ x }: ProgressSparkleBurstProps) => {
  const sparks = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const angle = -90 + (Math.random() - 0.5) * 140; // upward-fan
        const dist = 14 + Math.random() * 18;
        const rad = (angle * Math.PI) / 180;
        return {
          dx: Math.cos(rad) * dist,
          dy: Math.sin(rad) * dist,
          size: 3 + Math.random() * 2,
          delay: i * 15,
        };
      }),
    []
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: x,
        top: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {sparks.map((s, i) => (
        <span
          key={i}
          className="bar-sparkle"
          style={
            {
              fontSize: s.size,
              animationDelay: `${s.delay}ms`,
              ['--sx' as any]: `${s.dx}px`,
              ['--sy' as any]: `${s.dy}px`,
            } as React.CSSProperties
          }
        >
          ✦
        </span>
      ))}
    </div>
  );
};

export default ProgressSparkleBurst;
