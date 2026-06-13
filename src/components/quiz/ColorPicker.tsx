import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ColorPickerProps {
  hue: number;
  saturation: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (saturation: number) => void;
}

type Zone = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink';

const hueToZone = (h: number): Zone => {
  const n = ((h % 360) + 360) % 360;
  if (n < 15 || n >= 345) return 'red';
  if (n < 45) return 'orange';
  if (n < 70) return 'yellow';
  if (n < 160) return 'green';
  if (n < 200) return 'cyan';
  if (n < 250) return 'blue';
  if (n < 290) return 'purple';
  return 'pink';
};

const zoneToTrait: Record<Zone, { word: string; desc: string }> = {
  red:    { word: 'Passionate',   desc: 'Intense · Driven' },
  orange: { word: 'Adventurous',  desc: 'Free · Spirited' },
  yellow: { word: 'Optimistic',   desc: 'Bright · Warm' },
  green:  { word: 'Balanced',     desc: 'Grounded · Whole' },
  cyan:   { word: 'Calm',         desc: 'Peaceful · Focused' },
  blue:   { word: 'Calm',         desc: 'Peaceful · Focused' },
  purple: { word: 'Mysterious',   desc: 'Deep · Intuitive' },
  pink:   { word: 'Romantic',     desc: 'Tender · Loving' },
};

const zoneToScentHint: Record<Zone, string> = {
  red:    '✦ Hints at bold, spicy oriental notes',
  orange: '✦ Points toward warm amber accords',
  yellow: '✦ Suggests bright citrus top notes',
  green:  '✦ Leans toward fresh herbal scents',
  cyan:   '✦ Suggests clean aquatic freshness',
  blue:   '✦ Suggests clean aquatic freshness',
  purple: '✦ Points toward rich oud & musk',
  pink:   '✦ Hints at delicate floral accords',
};

interface Trail { id: number; x: number; y: number; }
interface BurstDot { deg: number; dist: number; }

export const ColorPicker = ({
  hue,
  saturation,
  onHueChange,
  onSaturationChange,
}: ColorPickerProps) => {
  const wheelRadius = 150;
  const centerX = wheelRadius;
  const centerY = wheelRadius;
  const innerDeadZone = 20;
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [trail, setTrail] = useState<Trail[]>([]);
  const [burstKey, setBurstKey] = useState(0);
  const trailIdRef = useRef(0);
  const [satDotKey, setSatDotKey] = useState(0);
  const [zoneFlashKey, setZoneFlashKey] = useState(0);
  const prevZoneRef = useRef<Zone | null>(null);
  const [entered, setEntered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const zone = useMemo(() => hueToZone(hue), [hue]);
  const trait = zoneToTrait[zone];
  const scentHint = zoneToScentHint[zone];

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1300);
    return () => clearTimeout(t);
  }, []);

  // Trigger zone-specific one-shot flourish on zone change
  useEffect(() => {
    if (prevZoneRef.current && prevZoneRef.current !== zone) {
      setZoneFlashKey((k) => k + 1);
    }
    prevZoneRef.current = zone;
  }, [zone]);

  const colorValue = `hsl(${hue}, ${saturation}%, 55%)`;
  const colorHex = colorValue; // We pass HSL string downstream — works in CSS and style

  const getColor = (h: number, s: number = 100, l: number = 50) =>
    `hsl(${h}, ${s}%, ${l}%)`;

  const updateHueFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = (wheelRadius * 2) / rect.width;
    const scaleY = (wheelRadius * 2) / rect.height;
    const x = (clientX - rect.left) * scaleX - centerX;
    const y = (clientY - rect.top) * scaleY - centerY;
    const dist = Math.hypot(x, y);
    if (dist < innerDeadZone) return;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    angle = ((angle % 360) + 360) % 360;
    onHueChange(angle);

    // record trail point in CSS pixels relative to wheel container
    const px = (clientX - rect.left);
    const py = (clientY - rect.top);
    trailIdRef.current += 1;
    setTrail((t) => [...t.slice(-3), { id: trailIdRef.current, x: px, y: py }]);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateHueFromPointer(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updateHueFromPointer(e.clientX, e.clientY);
  };
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    setBurstKey((k) => k + 1);
    setTrail([]);
    // Dispatch global color-lock event for bottle/progress flash
    try {
      window.dispatchEvent(
        new CustomEvent('bz:color-locked', {
          detail: { hue, sat: saturation, hex: colorHex },
        })
      );
    } catch {}
  };

  // Indicator position on the ring
  const indicatorAngle = (hue - 90) * (Math.PI / 180);
  const indicatorX = centerX + (wheelRadius - 10) * Math.cos(indicatorAngle);
  const indicatorY = centerY + (wheelRadius - 10) * Math.sin(indicatorAngle);

  // Burst dots
  const burstDots = useMemo<BurstDot[]>(
    () =>
      Array.from({ length: 14 }).map(() => ({
        deg: Math.random() * 360,
        dist: 40 + Math.random() * 35,
      })),
    [burstKey]
  );

  const cssVars: React.CSSProperties = {
    ['--cw-hue' as any]: `${hue}`,
    ['--cw-sat' as any]: `${saturation}%`,
    ['--cw-color' as any]: colorValue,
  };

  // Render atmosphere portal only client-side
  const atmosphere =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className="color-atmosphere-layer"
            data-zone={zone}
            style={cssVars}
            aria-hidden="true"
          >
            <span className="cw-blob cw-blob-a" />
            <span className="cw-blob cw-blob-b" />
            <span className="cw-vignette" />
            <span className="cw-icy" />
            <span key={`sun-${zoneFlashKey}`} className="cw-sunburst" />
            <div className="cw-particles">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="cwp"
                  style={
                    {
                      left: `${(i * 4.17) % 100}%`,
                      animationDelay: `${(i * 0.31) % 6}s`,
                      ['--sway' as any]: `${((i % 5) - 2) * 8}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="color-wheel-root flex flex-col items-center space-y-8" style={cssVars}>
      {atmosphere}

      {/* Color Wheel */}
      <div
        className="relative touch-none select-none cw-wheel-wrap"
        data-dragging={isDragging ? 'true' : 'false'}
        data-entered={entered ? 'true' : 'false'}
      >
        <svg
          ref={svgRef}
          width={wheelRadius * 2}
          height={wheelRadius * 2}
          viewBox={`0 0 ${wheelRadius * 2} ${wheelRadius * 2}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-pointer touch-none cw-wheel"
          style={{ touchAction: 'none' }}
        >
          {Array.from({ length: 360 }, (_, i) => {
            const startAngle = (i - 90) * (Math.PI / 180);
            const endAngle = (i + 1.0 - 90) * (Math.PI / 180);
            const x1 = centerX + (wheelRadius - 20) * Math.cos(startAngle);
            const y1 = centerY + (wheelRadius - 20) * Math.sin(startAngle);
            const x2 = centerX + wheelRadius * Math.cos(startAngle);
            const y2 = centerY + wheelRadius * Math.sin(startAngle);
            const x3 = centerX + wheelRadius * Math.cos(endAngle);
            const y3 = centerY + wheelRadius * Math.sin(endAngle);
            const x4 = centerX + (wheelRadius - 20) * Math.cos(endAngle);
            const y4 = centerY + (wheelRadius - 20) * Math.sin(endAngle);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`}
                fill={getColor(i, saturation)}
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r={wheelRadius - 20} fill="transparent" />
        </svg>

        {/* Trail dots */}
        <div className="cw-trail" aria-hidden="true">
          {trail.map((t, i) => (
            <span
              key={t.id}
              className="cw-trail-dot"
              style={
                {
                  left: t.x,
                  top: t.y,
                  background: colorValue,
                  opacity: (i + 1) / (trail.length + 1) * 0.6,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* HTML thumb overlay with halo */}
        <span
          className="cw-thumb"
          aria-hidden="true"
          style={{
            left: `${(indicatorX / (wheelRadius * 2)) * 100}%`,
            top: `${(indicatorY / (wheelRadius * 2)) * 100}%`,
            background: colorValue,
          }}
        >
          <span className="cw-thumb-core" />
        </span>

        {/* Release burst */}
        {burstKey > 0 && (
          <div
            key={`burst-${burstKey}`}
            className="cw-burst"
            aria-hidden="true"
            style={{
              left: `${(indicatorX / (wheelRadius * 2)) * 100}%`,
              top: `${(indicatorY / (wheelRadius * 2)) * 100}%`,
            }}
          >
            {burstDots.map((d, i) => (
              <span
                key={i}
                style={
                  {
                    background: colorValue,
                    boxShadow: `0 0 6px ${colorValue}`,
                    ['--deg' as any]: `${d.deg}deg`,
                    ['--dist' as any]: `${d.dist}px`,
                    animationDelay: `${Math.random() * 80}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Saturation Slider */}
      <div className="w-full max-w-md px-4 relative cw-slider-wrap">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={saturation}
          onChange={(e) => {
            onSaturationChange(Number(e.target.value));
            setSatDotKey((k) => k + 1);
          }}
          className="w-full h-3 rounded-full appearance-none cursor-pointer mb-2 cw-slider [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary"
          style={{
            background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`,
          }}
          aria-label="Saturation"
        />
        <span className="cw-slider-shimmer" aria-hidden="true" />
        {satDotKey > 0 && (
          <span
            key={`sd-${satDotKey}`}
            className="cw-slider-dot"
            aria-hidden="true"
            style={{
              left: `calc(${saturation}% )`,
              background: colorValue,
              boxShadow: `0 0 8px ${colorValue}`,
            }}
          />
        )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Desaturated</span>
          <span>Saturated</span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: getColor(hue, saturation) }}
        />
        <div className="text-sm text-muted-foreground">
          <div>Hue: {Math.round(hue)}°</div>
          <div>Saturation: {Math.round(saturation)}%</div>
        </div>
      </div>
    </div>
  );
};
