import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface ColorPickerProps {
  hue: number;
  saturation: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (saturation: number) => void;
}

export const ColorPicker = ({ hue, saturation, onHueChange, onSaturationChange }: ColorPickerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const wheelRadius = 150;
  const centerX = wheelRadius;
  const centerY = wheelRadius;

  const handleWheelClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // Calculate angle (hue)
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    onHueChange(angle);
  };

  const getColorFromHue = (h: number, s: number = 100) => {
    return `hsl(${h}, ${s}%, 50%)`;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Color Wheel */}
      <div className="relative">
        <svg
          width={wheelRadius * 2}
          height={wheelRadius * 2}
          onClick={handleWheelClick}
          className="cursor-pointer"
        >
          {/* Draw color wheel as segments */}
          {Array.from({ length: 360 }, (_, i) => {
            const startAngle = (i - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) - 90) * (Math.PI / 180);
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
                fill={getColorFromHue(i)}
              />
            );
          })}
          
          {/* Selected color indicator */}
          <circle
            cx={centerX + (wheelRadius - 10) * Math.cos((hue - 90) * Math.PI / 180)}
            cy={centerY + (wheelRadius - 10) * Math.sin((hue - 90) * Math.PI / 180)}
            r="12"
            fill={getColorFromHue(hue, saturation)}
            stroke="white"
            strokeWidth="3"
            className="pointer-events-none"
          />
        </svg>
      </div>

      {/* Saturation Slider */}
      <div className="w-full max-w-md px-4">
        <Slider
          value={[saturation]}
          onValueChange={(val) => onSaturationChange(val[0])}
          min={0}
          max={100}
          step={1}
          className="mb-2"
          style={{
            background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`
          }}
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
          style={{ backgroundColor: getColorFromHue(hue, saturation) }}
        />
        <div className="text-sm text-muted-foreground">
          <div>Hue: {Math.round(hue)}°</div>
          <div>Saturation: {Math.round(saturation)}%</div>
        </div>
      </div>
    </div>
  );
};
