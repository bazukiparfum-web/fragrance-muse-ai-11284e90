import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
}

export const CitySearch = ({ value, onChange }: CitySearchProps) => {
  const [focused, setFocused] = useState(false);
  const [pinKey, setPinKey] = useState(0);
  const [typeKey, setTypeKey] = useState(0);
  const isEmpty = !value;
  const density = Math.min(value.length, 12); // 0–12

  // Re-mount pin particles on focus
  const handleFocus = () => {
    setFocused(true);
    setPinKey((k) => k + 1);
  };

  // Re-mount sparkle on each keystroke
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setTypeKey((k) => k + 1);
  };

  return (
    <div
      className="city-search-root relative"
      data-focused={focused ? 'true' : 'false'}
      data-density={density}
    >
      {/* Ambient drifting background blobs */}
      <div className="city-ambient" aria-hidden="true">
        <span className="city-amber-blob" />
        <span className="city-cool-blob" />
      </div>

      <div className="city-search-field relative">
        <Search
          className={`city-search-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${
            isEmpty && !focused ? 'city-search-icon-pulse' : ''
          }`}
        />
        <Input
          type="text"
          placeholder="Search city"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          className="city-search-input pl-12 text-lg py-6 bg-muted/50 border-border"
        />
        <span className="city-search-glow" aria-hidden="true" />

        {/* Pin-drop particles on focus */}
        {focused && (
          <span key={`pins-${pinKey}`} className="city-pins" aria-hidden="true">
            {[15, 38, 62, 85].map((left, i) => (
              <span
                key={i}
                className="city-pin"
                style={{ left: `${left}%`, animationDelay: `${i * 70}ms` }}
              />
            ))}
          </span>
        )}

        {/* Typing sparkle near right edge */}
        {value && (
          <span
            key={`spark-${typeKey}`}
            className="city-type-sparkle"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
