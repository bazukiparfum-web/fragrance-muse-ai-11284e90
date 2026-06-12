import { useState, useCallback } from 'react';

export type EngravingStyle = 'Classic' | 'Elegant' | 'Bold';

export const ENGRAVING_MAX = 20;
export const ENGRAVING_FEE = 199;

export interface EngravingState {
  enabled: boolean;
  text: string;
  style: EngravingStyle;
}

export function useEngraving() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [style, setStyle] = useState<EngravingStyle>('Classic');

  const setTextSafe = useCallback((v: string) => {
    let next = v;
    if (style === 'Bold') next = next.toUpperCase();
    setText(next.slice(0, ENGRAVING_MAX));
  }, [style]);

  const setStyleSafe = useCallback((s: EngravingStyle) => {
    setStyle(s);
    setText((t) => (s === 'Bold' ? t.toUpperCase() : t));
  }, []);

  const trimmed = text.trim();
  const isActive = enabled && trimmed.length > 0;

  return {
    enabled,
    setEnabled,
    text,
    setText: setTextSafe,
    style,
    setStyle: setStyleSafe,
    trimmed,
    isActive,
  };
}

export const ENGRAVING_FONT_CLASS: Record<EngravingStyle, string> = {
  Classic: 'font-engravingClassic',
  Elegant: 'font-engravingElegant italic font-light',
  Bold: 'font-engravingBold uppercase',
};
