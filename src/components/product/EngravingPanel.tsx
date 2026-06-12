import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  EngravingStyle,
  ENGRAVING_MAX,
  ENGRAVING_FEE,
  ENGRAVING_FONT_CLASS,
} from '@/hooks/useEngraving';
import { Check } from 'lucide-react';

interface Props {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  text: string;
  onTextChange: (v: string) => void;
  style: EngravingStyle;
  onStyleChange: (s: EngravingStyle) => void;
}

export interface EngravingPanelHandle {
  pulseInvalid: () => void;
  focusInput: () => void;
}

const STYLES: { id: EngravingStyle; sample: string; tagline: string }[] = [
  { id: 'Classic', sample: 'Classic', tagline: 'Timeless' },
  { id: 'Elegant', sample: 'Elegant', tagline: 'Romantic' },
  { id: 'Bold', sample: 'BOLD', tagline: 'Statement' },
];

const GOLD = '#C9A84C';
const GOLD_DIM = '#8B6914';
const GOLD_BRIGHT = '#F0C040';
const IVORY = '#F5F0E8';
const PANEL_BG = '#141210';
const INPUT_BG = '#0D0C0A';

export const EngravingPanel = forwardRef<EngravingPanelHandle, Props>(function EngravingPanel(
  { enabled, onEnabledChange, text, onTextChange, style, onStyleChange },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [tipVisible, setTipVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    pulseInvalid: () => {
      setPulseKey((k) => k + 1);
      setTipVisible(true);
      setTimeout(() => setTipVisible(false), 1800);
      wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current?.focus();
    },
    focusInput: () => inputRef.current?.focus(),
  }));

  const len = text.length;
  const counterColor =
    len >= 19 ? GOLD_BRIGHT : len >= 16 ? GOLD : GOLD_DIM;

  const inputFontClass = ENGRAVING_FONT_CLASS[style];

  return (
    <div
      className="mb-6 rounded-xl overflow-hidden"
      style={{ background: PANEL_BG, border: '1px solid rgba(201,168,76,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2" style={{ color: IVORY, fontSize: 14 }}>
            <span style={{ color: GOLD }}>✦</span>
            <span className="font-cormorant">Personalise Your Bottle</span>
          </div>
          <p className="mt-0.5" style={{ color: GOLD_DIM, fontSize: 11 }}>
            Laser engraved — permanent &amp; precise
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.1em]"
            style={{
              color: GOLD,
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.3)',
            }}
          >
            + ₹{ENGRAVING_FEE}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Toggle engraving"
          />
        </div>
      </div>

      {/* Collapsible body */}
      <div
        className={enabled ? 'engrave-panel-expanded' : 'engrave-panel-collapsed'}
        ref={wrapRef}
      >
        <div className="px-4 pb-5 pt-1">
          {/* Font cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {STYLES.map((s, idx) => {
              const selected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStyleChange(s.id)}
                  className={cn(
                    'relative rounded-lg text-center transition-all engrave-fade-in',
                    selected ? 'scale-[1.04]' : 'hover:scale-[1.02]',
                  )}
                  style={{
                    background: selected ? 'rgba(201,168,76,0.08)' : PANEL_BG,
                    border: `1px solid ${selected ? GOLD : 'rgba(201,168,76,0.2)'}`,
                    padding: '16px 12px',
                    animationDelay: `${idx * 80}ms`,
                  }}
                  aria-pressed={selected}
                >
                  {selected && (
                    <span
                      className="absolute -top-2 -right-2 flex items-center justify-center rounded-full"
                      style={{
                        width: 18,
                        height: 18,
                        background: GOLD,
                        color: '#0D0C0A',
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div
                    className="uppercase"
                    style={{
                      color: GOLD_DIM,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                    }}
                  >
                    {s.id}
                  </div>
                  <div
                    className={cn('my-1.5', ENGRAVING_FONT_CLASS[s.id])}
                    style={{ color: GOLD, fontSize: 22, lineHeight: 1.2 }}
                  >
                    {s.sample}
                  </div>
                  <div style={{ color: GOLD_DIM, fontSize: 10 }}>{s.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Input label row */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="engraving-input" style={{ color: IVORY, fontSize: 13 }}>
              Your Engraving Text
            </label>
            <span style={{ color: counterColor, fontSize: 12 }} className="tabular-nums">
              {len} / {ENGRAVING_MAX}
            </span>
          </div>

          {/* Input + tooltip */}
          <div className="relative" style={{ transform: 'translateY(0)' }}>
            {tipVisible && (
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-md engrave-fade-in z-10 whitespace-nowrap"
                style={{
                  background: PANEL_BG,
                  border: `1px solid ${GOLD}`,
                  color: IVORY,
                  fontSize: 12,
                }}
                role="status"
              >
                Please enter your engraving text
              </div>
            )}
            <div className="relative">
              <input
                id="engraving-input"
                ref={inputRef}
                key={`pulse-${pulseKey}`}
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                maxLength={ENGRAVING_MAX}
                placeholder="e.g. Priya, Forever Yours, 2024"
                className={cn(
                  'w-full rounded-lg outline-none transition-all',
                  inputFontClass,
                  pulseKey > 0 ? 'engrave-border-pulse' : '',
                )}
                style={{
                  background: INPUT_BG,
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: IVORY,
                  padding: '14px 36px 14px 18px',
                  fontSize: 16,
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: GOLD, fontSize: 14 }}
                aria-hidden
              >
                ✦
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
