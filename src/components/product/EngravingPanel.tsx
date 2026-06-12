import { forwardRef, useImperativeHandle, useRef, useState, KeyboardEvent } from 'react';
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

const STYLES: { id: EngravingStyle; sample: string; tagline: string; sr: string }[] = [
  { id: 'Classic', sample: 'Classic', tagline: 'Timeless', sr: 'Classic — timeless serif' },
  { id: 'Elegant', sample: 'Elegant', tagline: 'Romantic', sr: 'Elegant — romantic italic' },
  { id: 'Bold', sample: 'BOLD', tagline: 'Statement', sr: 'Bold — statement uppercase' },
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
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
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
  const nearLimit = len >= 18;

  const inputFontClass = ENGRAVING_FONT_CLASS[style];

  const focusCard = (idx: number) => {
    const next = (idx + STYLES.length) % STYLES.length;
    onStyleChange(STYLES[next].id);
    cardRefs.current[next]?.focus();
  };

  const onCardKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusCard(idx + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusCard(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusCard(0);
        break;
      case 'End':
        e.preventDefault();
        focusCard(STYLES.length - 1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        onStyleChange(STYLES[idx].id);
        break;
    }
  };

  return (
    <div
      className="mb-6 rounded-xl overflow-hidden"
      style={{ background: PANEL_BG, border: '1px solid rgba(201,168,76,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <label htmlFor="engraving-toggle" className="min-w-0 cursor-pointer flex-1">
          <div className="flex items-center gap-2" style={{ color: IVORY, fontSize: 14 }}>
            <span style={{ color: GOLD }} aria-hidden>✦</span>
            <span className="font-cormorant">Personalise Your Bottle</span>
          </div>
          <p id="engraving-toggle-desc" className="mt-0.5" style={{ color: GOLD_DIM, fontSize: 11 }}>
            Laser engraved — permanent &amp; precise (+₹{ENGRAVING_FEE})
          </p>
        </label>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            aria-hidden
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
            id="engraving-toggle"
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Toggle laser engraving personalisation"
            aria-describedby="engraving-toggle-desc"
            aria-expanded={enabled}
            aria-controls="engraving-panel-body"
          />
        </div>
      </div>

      {/* Body — always visible; toggle only controls whether engraving is active */}
      <div
        id="engraving-panel-body"
        className="engrave-panel-expanded"
        ref={wrapRef}
      >
        <div className="px-4 pb-5 pt-1">
          {/* Font cards */}
          <div
            role="radiogroup"
            aria-label="Engraving font style"
            className="grid grid-cols-3 gap-2 mb-4"
          >
            {STYLES.map((s, idx) => {
              const selected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  ref={(el) => (cardRefs.current[idx] = el)}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onStyleChange(s.id)}
                  onKeyDown={(e) => onCardKeyDown(e, idx)}
                  className={cn(
                    'relative rounded-lg text-center transition-all engrave-fade-in',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141210]',
                    selected ? 'scale-[1.04]' : 'hover:scale-[1.02]',
                  )}
                  style={{
                    background: selected ? 'rgba(201,168,76,0.08)' : PANEL_BG,
                    border: `1px solid ${selected ? GOLD : 'rgba(201,168,76,0.2)'}`,
                    padding: '16px 12px',
                    animationDelay: `${idx * 80}ms`,
                    boxShadow: undefined,
                    // gold focus ring via inline outline
                    outlineColor: GOLD,
                  }}
                >
                  <span className="sr-only">{s.sr}{selected ? ', selected' : ''}</span>
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute -top-2 -right-2 flex items-center justify-center rounded-full"
                      style={{ width: 18, height: 18, background: GOLD, color: '#0D0C0A' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <div
                    aria-hidden
                    className="uppercase"
                    style={{ color: GOLD_DIM, fontSize: 11, letterSpacing: '0.15em' }}
                  >
                    {s.id}
                  </div>
                  <div
                    aria-hidden
                    className={cn('my-1.5', ENGRAVING_FONT_CLASS[s.id])}
                    style={{ color: GOLD, fontSize: 22, lineHeight: 1.2 }}
                  >
                    {s.sample}
                  </div>
                  <div aria-hidden style={{ color: GOLD_DIM, fontSize: 10 }}>
                    {s.tagline}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Input label row */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="engraving-input" style={{ color: IVORY, fontSize: 13 }}>
              Your Engraving Text
            </label>
            <span
              id="engraving-counter"
              aria-live="polite"
              aria-atomic="true"
              style={{ color: counterColor, fontSize: 12 }}
              className="tabular-nums"
            >
              {len} / {ENGRAVING_MAX}
              {nearLimit && (
                <span className="sr-only">
                  {' '}
                  — {ENGRAVING_MAX - len} characters remaining
                </span>
              )}
            </span>
          </div>

          {/* Input + tooltip */}
          <div className="relative">
            {tipVisible && (
              <div
                role="alert"
                className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-md engrave-fade-in z-10 whitespace-nowrap"
                style={{
                  background: PANEL_BG,
                  border: `1px solid ${GOLD}`,
                  color: IVORY,
                  fontSize: 12,
                }}
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
                aria-describedby="engraving-counter engraving-toggle-desc"
                aria-invalid={pulseKey > 0 && text.trim().length === 0 ? true : undefined}
                className={cn(
                  'w-full rounded-lg outline-none transition-all',
                  'focus-visible:ring-2',
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
                aria-hidden
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: GOLD, fontSize: 14 }}
              >
                ✦
              </span>
            </div>

            {/* SR-only live announcement of preview state */}
            <div className="sr-only" aria-live="polite">
              {text.trim().length > 0
                ? `Preview updated: ${text} in ${style} style`
                : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
