import { useRef, useState } from 'react';

interface ColorPickerProps {
  hue: number;
  saturation: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (saturation: number) => void;
}

export const ColorPicker = ({ hue, saturation, onHueChange, onSaturationChange }: ColorPickerProps) => {
  const wheelRadius = 150;
  const centerX = wheelRadius;
  const centerY = wheelRadius;
  const innerDeadZone = 20;
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getColor = (h: number, s: number = 100, l: number = 50) =>
    `hsl(${h}, ${s}%, ${l}%)`;

  const updateHueFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map client coords into SVG coordinate space (handles scaling)
    const scaleX = (wheelRadius * 2) / rect.width;
    const scaleY = (wheelRadius * 2) / rect.height;
    const x = (clientX - rect.left) * scaleX - centerX;
    const y = (clientY - rect.top) * scaleY - centerY;

    const dist = Math.hypot(x, y);
    if (dist < innerDeadZone) return; // ignore center clicks

    // Wheel is drawn rotated by -90° (red at top). Add +90° to align.
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    angle = ((angle % 360) + 360) % 360;
    onHueChange(angle);
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
  };

  // Indicator position on the ring
  const indicatorAngle = (hue - 90) * (Math.PI / 180);
  const indicatorX = centerX + (wheelRadius - 10) * Math.cos(indicatorAngle);
  const indicatorY = centerY + (wheelRadius - 10) * Math.sin(indicatorAngle);

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Color Wheel */}
      <div className="relative touch-none select-none">
        <svg
          ref={svgRef}
          width={wheelRadius * 2}
          height={wheelRadius * 2}
          viewBox={`0 0 ${wheelRadius * 2} ${wheelRadius * 2}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-pointer touch-none"
          style={{ touchAction: 'none' }}
        >
          {/* Wheel as 360 thin segments — saturation reflects current value */}
          {Array.from({ length: 360 }, (_, i) => {
            // Slight overlap (+0.6°) to avoid hairline gaps between segments
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

          {/* Invisible inner disc to capture drags inside the wheel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={wheelRadius - 20}
            fill="transparent"
          />

          {/* Selected color indicator — double stroke for visibility on any color */}
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r="13"
            fill={getColor(hue, Math.max(saturation, 20))}
            stroke="black"
            strokeWidth="1.5"
            className="pointer-events-none"
          />
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r="11"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="pointer-events-none"
          />
        </svg>
      </div>

      {/* Saturation Slider — native range with live gradient track */}
      <div className="w-full max-w-md px-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={saturation}
          onChange={(e) => onSaturationChange(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary"
          style={{
            background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`,
          }}
          aria-label="Saturation"
        />
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
