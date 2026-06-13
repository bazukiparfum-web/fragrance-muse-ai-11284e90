import { useEffect, useMemo, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const GOLD = '#C9A84C';
const GOLD_DIM = '#8B6914';
const IVORY = '#F5F0E8';
const BG = '#0D0C0A';

const TOP_COLOR = '#C9B08A';
const HEART_COLOR = '#B07840';
const BASE_COLOR = '#6B3E1A';

type LayerKey = 'top' | 'heart' | 'base';

interface FormulaNote {
  note: string;
  percentage?: number;
}

interface FormulaShape {
  top?: FormulaNote[];
  heart?: FormulaNote[];
  base?: FormulaNote[];
}

interface Scent {
  id: string;
  name: string;
  matchScore: number;
  formula: FormulaShape | any[];
  intensity: number;
  longevity: number;
}

interface Props {
  scent: Scent;
  /** Change to remount and replay animations (e.g. when mobile tab switches). */
  replayKey?: string | number;
}

const PILL_DESCRIPTORS: Record<LayerKey, string[]> = {
  top: ['Fresh', 'Citrus', 'Bright'],
  heart: ['Floral', 'Romantic', 'Soft'],
  base: ['Warm', 'Woody', 'Lasting'],
};

const DURATION: Record<LayerKey, string> = {
  top: '1–2 hr',
  heart: '2–4 hr',
  base: '4–8 hr',
};

const LAYER_COLOR: Record<LayerKey, string> = {
  top: TOP_COLOR,
  heart: HEART_COLOR,
  base: BASE_COLOR,
};

const LAYER_LABEL: Record<LayerKey, string> = {
  top: 'TOP NOTES',
  heart: 'HEART NOTES',
  base: 'BASE NOTES',
};

const BAR_TARGET: Record<LayerKey, number> = {
  top: 35,
  heart: 60,
  base: 90,
};

const BAR_DELAY: Record<LayerKey, number> = {
  top: 200,
  heart: 450,
  base: 700,
};

function getNotes(formula: any, category: LayerKey): FormulaNote[] {
  if (Array.isArray(formula)) {
    return formula.filter((n: any) => n.category === category);
  }
  return formula?.[category] || [];
}

function intensityLabel(v: number) {
  if (v <= 3) return 'Soft';
  if (v <= 7) return 'Medium';
  return 'Bold';
}

function longevityLabel(v: number) {
  if (v <= 4) return '2–4 hr';
  if (v <= 7) return '4–6 hr';
  return 'All-day';
}

function sillageLabel(intensity: number) {
  if (intensity <= 3) return 'Intimate';
  if (intensity <= 7) return 'Moderate';
  return 'Strong';
}

/* -------------------- Match Ring -------------------- */
function MatchRing({ value, inView }: { value: number; inView: boolean }) {
  const size = 80;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (value / 100);
  const count = useCountUp(value, inView, 1200);

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} percent match`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(201,168,76,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={GOLD}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (inView ? target : 0)}
          style={{
            transition: 'stroke-dashoffset 1200ms cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ lineHeight: 1 }}
      >
        <div
          className="font-serif tabular-nums"
          style={{ color: GOLD, fontSize: 18 }}
        >
          {count}
          <span style={{ fontSize: 11, marginLeft: 1 }}>%</span>
        </div>
        <div
          className="uppercase"
          style={{
            color: GOLD_DIM,
            fontSize: 9,
            letterSpacing: '0.14em',
            marginTop: 3,
          }}
        >
          match
        </div>
      </div>
    </div>
  );
}

/* -------------------- Mini Bottle -------------------- */
function MiniBottle({ inView }: { inView: boolean }) {
  // Bottle interior: x=18,y=58, w=44, h=86 → top 22 (~25%), heart 26 (~30%), base 30 (~35%)
  const interiorY = 58;
  const interiorH = 86;
  const baseH = 30;
  const heartH = 26;
  const topH = 22;

  const baseY = interiorY + interiorH - baseH;
  const heartY = baseY - heartH;
  const topY = heartY - topH;

  const transition = (ms: number, delay: number) =>
    `height ${ms}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, y ${ms}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;

  return (
    <svg width={80} height={160} viewBox="0 0 80 160" aria-hidden>
      <defs>
        <clipPath id="bottle-interior">
          <rect x={18} y={58} width={44} height={86} rx={6} />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x={28} y={6} width={24} height={20} rx={3} fill={GOLD} />
      {/* Collar */}
      <rect x={26} y={28} width={28} height={6} rx={1.5} fill={GOLD} opacity={0.85} />
      {/* Neck */}
      <rect x={32} y={36} width={16} height={18} fill="none" stroke={GOLD} strokeWidth={1} />

      {/* Glass body */}
      <rect
        x={16}
        y={54}
        width={48}
        height={94}
        rx={7}
        fill="rgba(201,168,76,0.04)"
        stroke={GOLD}
        strokeWidth={1}
      />

      {/* Liquid layers, clipped to interior */}
      <g clipPath="url(#bottle-interior)">
        {/* Base */}
        <rect
          x={18}
          y={inView ? baseY : interiorY + interiorH}
          width={44}
          height={inView ? baseH : 0}
          fill={BASE_COLOR}
          style={{ transition: transition(600, 0) }}
        />
        {/* Heart */}
        <rect
          x={18}
          y={inView ? heartY : interiorY + interiorH}
          width={44}
          height={inView ? heartH : 0}
          fill={HEART_COLOR}
          style={{ transition: transition(500, 400) }}
        />
        {/* Top */}
        <rect
          x={18}
          y={inView ? topY : interiorY + interiorH}
          width={44}
          height={inView ? topH : 0}
          fill={TOP_COLOR}
          style={{ transition: transition(400, 700) }}
        />
      </g>

      {/* Label outline */}
      <rect
        x={24}
        y={96}
        width={32}
        height={14}
        rx={1}
        fill="none"
        stroke={GOLD}
        strokeWidth={0.6}
        opacity={0.7}
      />
      <text
        x={40}
        y={106}
        textAnchor="middle"
        fill={GOLD}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 7,
          letterSpacing: '1px',
          fontWeight: 500,
        }}
      >
        BAZUKI
      </text>
    </svg>
  );
}

/* -------------------- Note Row -------------------- */
function NoteRow({
  layer,
  notes,
  inView,
  expanded,
  onToggle,
}: {
  layer: LayerKey;
  notes: FormulaNote[];
  inView: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const color = LAYER_COLOR[layer];
  const target = BAR_TARGET[layer];
  const delay = BAR_DELAY[layer];
  const noteNames = notes.length
    ? notes.map((n) => n.note).join(', ')
    : '—';
  const pills = PILL_DESCRIPTORS[layer];
  const panelId = `formula-layer-${layer}`;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md"
        style={{
          background: 'transparent',
          padding: '4px 2px',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                marginTop: 5,
                flexShrink: 0,
              }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="uppercase"
                style={{
                  color: GOLD,
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  fontWeight: 500,
                }}
              >
                {LAYER_LABEL[layer]}
              </div>
              <div
                className="truncate"
                style={{ color: IVORY, fontSize: 13, marginTop: 2 }}
                title={noteNames}
              >
                {noteNames}
              </div>
            </div>
          </div>
          <div
            className="shrink-0 tabular-nums"
            style={{ color: GOLD_DIM, fontSize: 11, marginTop: 2 }}
          >
            {DURATION[layer]}
          </div>
        </div>

        {/* Bar */}
        <div
          className="relative w-full mt-2 overflow-hidden"
          style={{
            height: 4,
            background: 'rgba(201,168,76,0.12)',
            borderRadius: 2,
          }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: inView ? `${target}%` : '0%',
              background: color,
              borderRadius: 2,
              transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
          >
            <span
              aria-hidden
              className="qr-shimmer absolute inset-0"
              style={{ borderRadius: 2 }}
            />
          </div>
        </div>
      </button>

      {/* Expanded pills */}
      <div
        id={panelId}
        role="region"
        aria-hidden={!expanded}
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 250ms ease-out',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
            {pills.map((p, i) => (
              <span
                key={p}
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  color: GOLD,
                  fontSize: 11,
                  fontStyle: 'italic',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? 'translateY(0)' : 'translateY(4px)',
                  transition: `opacity 220ms ease-out ${i * 60}ms, transform 220ms ease-out ${i * 60}ms`,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Main -------------------- */
export function FormulaReveal({ scent, replayKey }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [expanded, setExpanded] = useState<LayerKey | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [statsIn, setStatsIn] = useState(false);

  // Reset state when replayKey changes (mobile tab switch)
  useEffect(() => {
    setExpanded(null);
    setHintDismissed(false);
    setStatsIn(false);
  }, [replayKey]);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setStatsIn(true), 900);
    return () => window.clearTimeout(t);
  }, [inView]);

  const layers: LayerKey[] = ['top', 'heart', 'base'];
  const notesByLayer = useMemo(
    () => ({
      top: getNotes(scent.formula, 'top'),
      heart: getNotes(scent.formula, 'heart'),
      base: getNotes(scent.formula, 'base'),
    }),
    [scent.formula],
  );

  const toggle = (k: LayerKey) => {
    setHintDismissed(true);
    setExpanded((cur) => (cur === k ? null : k));
  };

  return (
    <div ref={ref} className="w-full flex flex-col items-center">
      {/* Match ring */}
      <MatchRing value={scent.matchScore} inView={inView} />

      {/* Mini bottle */}
      <div className="mt-3">
        <MiniBottle inView={inView} />
      </div>

      {/* Section label */}
      <div className="w-full flex items-center gap-3 mt-5 mb-3">
        <span
          className="flex-1"
          style={{ height: 1, background: 'rgba(201,168,76,0.25)' }}
        />
        <span
          className="uppercase"
          style={{
            color: GOLD,
            fontSize: 10,
            letterSpacing: '0.15em',
            fontWeight: 500,
          }}
        >
          Your Formula
        </span>
        <span
          className="flex-1"
          style={{ height: 1, background: 'rgba(201,168,76,0.25)' }}
        />
      </div>

      {/* Note rows */}
      <div className="w-full flex flex-col gap-3">
        {layers.map((k) => (
          <NoteRow
            key={k}
            layer={k}
            notes={notesByLayer[k]}
            inView={inView}
            expanded={expanded === k}
            onToggle={() => toggle(k)}
          />
        ))}
      </div>

      {/* Hint */}
      <p
        className="text-center italic mt-3"
        style={{
          color: 'rgba(139,105,20,0.7)',
          fontSize: 11,
          opacity: hintDismissed ? 0 : 1,
          transition: 'opacity 250ms ease-out',
          height: hintDismissed ? 0 : 'auto',
          overflow: 'hidden',
        }}
      >
        Tap each layer to explore the notes
      </p>

      {/* Divider */}
      <div
        className="w-full my-4"
        style={{ height: 1, background: 'rgba(201,168,76,0.18)' }}
      />

      {/* Stats row */}
      <TooltipProvider delayDuration={150}>
        <div
          className="w-full grid grid-cols-3 gap-2"
          style={{
            opacity: statsIn ? 1 : 0,
            transform: statsIn ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 300ms ease-out, transform 300ms ease-out',
          }}
        >
          <StatBox label="INTENSITY" value={intensityLabel(scent.intensity)} />
          <StatBox label="LONGEVITY" value={longevityLabel(scent.longevity)} />
          <StatBox
            label="SILLAGE"
            value={sillageLabel(scent.intensity)}
            tooltip="How far your scent projects from your skin"
          />
        </div>
      </TooltipProvider>
    </div>
  );
}

function StatBox({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  const labelEl = (
    <div
      className="uppercase"
      style={{
        color: GOLD_DIM,
        fontSize: 9,
        letterSpacing: '0.12em',
        cursor: tooltip ? 'help' : 'default',
        textDecoration: tooltip ? 'underline dotted rgba(139,105,20,0.5)' : 'none',
        textUnderlineOffset: 2,
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      className="text-center"
      style={{
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 8,
        padding: '10px 8px',
      }}
    >
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="bg-transparent border-0 p-0">
              {labelEl}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
            style={{
              background: BG,
              border: `1px solid ${GOLD}`,
              color: IVORY,
              fontSize: 11,
              padding: '6px 10px',
              maxWidth: 200,
            }}
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        labelEl
      )}
      <div
        className="font-serif"
        style={{ color: GOLD, fontSize: 14, fontWeight: 500, marginTop: 4 }}
      >
        {value}
      </div>
    </div>
  );
}

export default FormulaReveal;
