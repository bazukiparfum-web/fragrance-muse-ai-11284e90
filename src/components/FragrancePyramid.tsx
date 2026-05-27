import { useState, useRef, CSSProperties, KeyboardEvent } from "react";
import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface Note {
  name: string;
  description: string;
}

export interface FragrancePyramidProps {
  topNotes: Note[];
  heartNotes: Note[];
  baseNotes: Note[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

type LayerKey = "top" | "heart" | "base";

interface LayerConfig {
  key: LayerKey;
  label: string;
  notes: Note[];
  color: string;
  textColor: string;
  duration: string;
  durationLabel: string;
  intensity: number;
  delay: number;
  points: string;
  bbox: { x: number; y: number; w: number; h: number };
  labelY: number;
  notesY: number;
  emptyCopy: string;
}

// Pyramid geometry — viewBox 0 0 320 240
function buildPoints(yTop: number, yBottom: number) {
  const wTop = ((yTop - 10) / 220) * 280;
  const wBot = ((yBottom - 10) / 220) * 280;
  const xTopL = 160 - wTop / 2;
  const xTopR = 160 + wTop / 2;
  const xBotL = 160 - wBot / 2;
  const xBotR = 160 + wBot / 2;
  return {
    points: `${xTopL},${yTop} ${xTopR},${yTop} ${xBotR},${yBottom} ${xBotL},${yBottom}`,
    bbox: { x: xBotL, y: yTop, w: xBotR - xBotL, h: yBottom - yTop },
  };
}

const SIZE_MAP = {
  sm: { svg: 200, showLegend: false, dotSize: 6 },
  md: { svg: 300, showLegend: true, dotSize: 8 },
  lg: { svg: 380, showLegend: true, dotSize: 10 },
} as const;

const LAYER_ORDER: LayerKey[] = ["top", "heart", "base"];

function LongevityRow({
  label,
  duration,
  intensity,
  color,
  dotSize,
}: {
  label: string;
  duration: string;
  intensity: number;
  color: string;
  dotSize: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-body text-cream-muted">
      <span className="w-12 shrink-0 uppercase tracking-wider text-[10px]">{label}</span>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <Circle
            key={i}
            size={dotSize}
            strokeWidth={1.5}
            style={{
              color,
              fill: i < intensity ? color : "transparent",
              opacity: i < intensity ? 1 : 0.35,
            }}
          />
        ))}
      </span>
      <span className="ml-auto text-dim">{duration}</span>
    </div>
  );
}

export const FragrancePyramid = ({
  topNotes,
  heartNotes,
  baseNotes,
  size = "md",
  className,
}: FragrancePyramidProps) => {
  const [hovered, setHovered] = useState<LayerKey | null>(null);
  const [focused, setFocused] = useState<LayerKey | null>(null);
  const cfg = SIZE_MAP[size];
  const triggerRefs = useRef<Record<LayerKey, SVGRectElement | null>>({
    top: null,
    heart: null,
    base: null,
  });

  const top = buildPoints(10, 65);
  const heart = buildPoints(65, 149);
  const base = buildPoints(149, 230);

  const layers: LayerConfig[] = [
    {
      key: "top",
      label: "Top",
      notes: topNotes,
      color: "#F5E6C8",
      textColor: "#2a1f10",
      duration: "1–2 hr",
      durationLabel: "lasting 1 to 2 hours",
      intensity: 2,
      delay: 400,
      points: top.points,
      bbox: top.bbox,
      labelY: 32,
      notesY: 48,
      emptyCopy:
        "This composition keeps its top accord private — a quiet opening that lets the heart speak first.",
    },
    {
      key: "heart",
      label: "Heart",
      notes: heartNotes,
      color: "#C9A84C",
      textColor: "#1a1206",
      duration: "2–4 hr",
      durationLabel: "lasting 2 to 4 hours",
      intensity: 4,
      delay: 200,
      points: heart.points,
      bbox: heart.bbox,
      labelY: 95,
      notesY: 120,
      emptyCopy:
        "The heart of this scent is held in confidence — discovered only on the skin.",
    },
    {
      key: "base",
      label: "Base",
      notes: baseNotes,
      color: "#6B3F1A",
      textColor: "#F5ECD7",
      duration: "4–8 hr",
      durationLabel: "lasting 4 to 8 hours",
      intensity: 8,
      delay: 0,
      points: base.points,
      bbox: base.bbox,
      labelY: 180,
      notesY: 205,
      emptyCopy:
        "The base notes remain undisclosed — a quiet, lingering signature.",
    },
  ];

  const allEmpty =
    topNotes.length === 0 && heartNotes.length === 0 && baseNotes.length === 0;

  const focusLayer = (key: LayerKey) => {
    triggerRefs.current[key]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<SVGRectElement>, current: LayerKey) => {
    const idx = LAYER_ORDER.indexOf(current);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      focusLayer(LAYER_ORDER[Math.min(idx + 1, LAYER_ORDER.length - 1)]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      focusLayer(LAYER_ORDER[Math.max(idx - 1, 0)]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusLayer("top");
    } else if (e.key === "End") {
      e.preventDefault();
      focusLayer("base");
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="group"
        aria-label="Fragrance note pyramid"
        className={cn(
          "flex flex-col gap-4",
          cfg.showLegend && "md:flex-row md:items-start md:gap-6",
          className,
        )}
      >
        {/* Pyramid + longevity column */}
        <div className="flex flex-col gap-3 mx-auto md:mx-0">
          <svg
            viewBox="0 0 320 240"
            width={cfg.svg}
            height={cfg.svg * 0.75}
            role="img"
            aria-label="Fragrance pyramid showing top, heart, and base notes"
            style={{ overflow: "visible" }}
          >
            {layers.map((layer) => {
              const isHovered = hovered === layer.key;
              const isFocused = focused === layer.key;
              const isActive = isHovered || isFocused;
              const noteNames = layer.notes.map((n) => n.name).join(", ");
              const isEmpty = layer.notes.length === 0;

              const groupStyle: CSSProperties = {
                animation: `bz-pyramid-rise 0.6s ease-out ${layer.delay}ms both`,
                transformOrigin: "center",
                filter: isActive
                  ? "drop-shadow(0 0 14px hsl(43 56% 55% / 0.55))"
                  : "drop-shadow(0 0 6px hsl(43 56% 55% / 0.12))",
                transition: "filter 0.2s ease, opacity 0.2s ease",
                opacity: (hovered || focused) && !isActive ? 0.7 : 1,
              };

              const ariaLabel = isEmpty
                ? `${layer.label} notes, ${layer.durationLabel}: undisclosed`
                : `${layer.label} notes, ${layer.durationLabel}: ${noteNames}`;

              return (
                <Tooltip key={layer.key} open={isActive ? true : undefined}>
                  <TooltipTrigger asChild>
                    <g style={groupStyle}>
                      <polygon
                        points={layer.points}
                        fill={layer.color}
                        stroke="hsl(43 56% 55% / 0.25)"
                        strokeWidth={0.75}
                      />
                      {/* Focus ring */}
                      {isFocused && (
                        <polygon
                          points={layer.points}
                          fill="none"
                          stroke="hsl(43 56% 55%)"
                          strokeWidth={2}
                          strokeDasharray="4 3"
                          style={{ pointerEvents: "none" }}
                        />
                      )}
                      <text
                        x={160}
                        y={layer.labelY}
                        textAnchor="middle"
                        fill={layer.textColor}
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: layer.key === "top" ? 11 : 14,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                          pointerEvents: "none",
                        }}
                      >
                        {layer.label}
                      </text>
                      <text
                        x={160}
                        y={layer.notesY}
                        textAnchor="middle"
                        fill={layer.textColor}
                        style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: layer.key === "top" ? 8 : 10,
                          opacity: isEmpty ? 0.55 : 0.85,
                          fontStyle: isEmpty ? "italic" : "normal",
                          pointerEvents: "none",
                        }}
                      >
                        {isEmpty
                          ? "— undisclosed —"
                          : noteNames.length > 38
                            ? noteNames.slice(0, 36) + "…"
                            : noteNames}
                      </text>
                      {/* Focusable, clickable hit target on top */}
                      <rect
                        ref={(el) => (triggerRefs.current[layer.key] = el)}
                        x={layer.bbox.x}
                        y={layer.bbox.y}
                        width={layer.bbox.w}
                        height={layer.bbox.h}
                        fill="transparent"
                        tabIndex={0}
                        role="button"
                        aria-label={ariaLabel}
                        onMouseEnter={() => setHovered(layer.key)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setFocused(layer.key)}
                        onBlur={() => setFocused(null)}
                        onKeyDown={(e) => handleKeyDown(e, layer.key)}
                        style={{ cursor: "pointer", outline: "none" }}
                      />
                    </g>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-xs bg-bz-card border-gold-strong"
                  >
                    <div className="space-y-1.5">
                      <p className="font-display text-gold uppercase tracking-wider text-xs">
                        {layer.label} Notes · {layer.duration}
                      </p>
                      {isEmpty ? (
                        <p className="text-xs text-cream-muted italic leading-snug">
                          {layer.emptyCopy}
                        </p>
                      ) : (
                        layer.notes.map((n) => (
                          <p key={n.name} className="text-xs text-cream leading-snug">
                            <span className="font-medium">{n.name}</span>
                            <span className="text-cream-muted"> — {n.description}</span>
                          </p>
                        ))
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Whole-pyramid empty fallback */}
            {allEmpty && (
              <text
                x={160}
                y={235}
                textAnchor="middle"
                fill="hsl(43 56% 55%)"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  pointerEvents: "none",
                }}
              >
                Notes coming soon
              </text>
            )}
          </svg>

          {/* Longevity strip */}
          <div className="flex flex-col gap-1.5 px-1" style={{ width: cfg.svg }}>
            {layers.map((l) => (
              <LongevityRow
                key={l.key}
                label={l.label}
                duration={l.duration}
                intensity={l.intensity}
                color={l.color}
                dotSize={cfg.dotSize}
              />
            ))}
          </div>
        </div>

        {/* Legend (md/lg only) */}
        {cfg.showLegend && (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {layers.map((layer) => (
              <div key={layer.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: layer.color }}
                    aria-hidden
                  />
                  <span className="font-display text-gold uppercase tracking-[0.2em] text-xs">
                    {layer.label}
                  </span>
                  <span className="font-body text-[10px] text-dim ml-auto">
                    {layer.duration}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.notes.length === 0 ? (
                    <span
                      aria-disabled="true"
                      tabIndex={-1}
                      className="rounded-pill border border-dashed border-gold/20 px-3 py-1 text-xs font-body italic text-dim bg-bz-card/50"
                    >
                      Composition private
                    </span>
                  ) : (
                    layer.notes.map((n) => (
                      <Tooltip key={n.name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded-pill border border-gold/30 bg-bz-card px-3 py-1 text-xs font-body text-cream-muted hover:border-gold-strong hover:text-cream hover:glow-gold-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bz-gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bz-bg-card))]"
                          >
                            {n.name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-bz-card border-gold-strong">
                          <p className="text-xs text-cream">
                            <span className="font-medium">{n.name}</span>
                            <span className="text-cream-muted"> — {n.description}</span>
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FragrancePyramid;
