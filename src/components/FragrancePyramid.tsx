import { useState, CSSProperties } from "react";
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
  intensity: number; // out of 8 dots
  /** stagger delay in ms — base first (0), heart (200), top (400) */
  delay: number;
  /** SVG polygon points */
  points: string;
  /** label position inside band */
  labelY: number;
  notesY: number;
}

// Pyramid SVG geometry — viewBox 0 0 320 240
// Apex at (160, 10), base corners (20, 230) and (300, 230)
// Heights: top band 25% (10 → 65), heart 35% (65 → 149), base 40% (149 → 230)
// Width at y is linear: w(y) = (y - 10) / 220 * 280
// At y=10  → 0      | At y=65  → 70   | At y=149 → 177  | At y=230 → 280
function buildPoints(yTop: number, yBottom: number): string {
  const wTop = ((yTop - 10) / 220) * 280;
  const wBot = ((yBottom - 10) / 220) * 280;
  const xTopL = 160 - wTop / 2;
  const xTopR = 160 + wTop / 2;
  const xBotL = 160 - wBot / 2;
  const xBotR = 160 + wBot / 2;
  return `${xTopL},${yTop} ${xTopR},${yTop} ${xBotR},${yBottom} ${xBotL},${yBottom}`;
}

const SIZE_MAP = {
  sm: { svg: 180, showLegend: false, dotSize: 6 },
  md: { svg: 280, showLegend: true, dotSize: 8 },
  lg: { svg: 360, showLegend: true, dotSize: 10 },
} as const;

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
  const cfg = SIZE_MAP[size];

  const layers: LayerConfig[] = [
    {
      key: "top",
      label: "Top",
      notes: topNotes,
      color: "#F5E6C8",
      textColor: "#2a1f10",
      duration: "1–2 hr",
      intensity: 2,
      delay: 400,
      points: buildPoints(10, 65),
      labelY: 30,
      notesY: 50,
    },
    {
      key: "heart",
      label: "Heart",
      notes: heartNotes,
      color: "#C9A84C",
      textColor: "#1a1206",
      duration: "2–4 hr",
      intensity: 4,
      delay: 200,
      points: buildPoints(65, 149),
      labelY: 95,
      notesY: 120,
    },
    {
      key: "base",
      label: "Base",
      notes: baseNotes,
      color: "#6B3F1A",
      textColor: "#F5ECD7",
      duration: "4–8 hr",
      intensity: 8,
      delay: 0,
      points: buildPoints(149, 230),
      labelY: 180,
      notesY: 205,
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div
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
              const noteNames = layer.notes.map((n) => n.name).join(", ");
              const animStyle: CSSProperties = {
                animation: `bz-pyramid-rise 0.6s ease-out ${layer.delay}ms both`,
                transformOrigin: "center",
                filter: isHovered
                  ? "drop-shadow(0 0 14px hsl(43 56% 55% / 0.55))"
                  : "drop-shadow(0 0 6px hsl(43 56% 55% / 0.12))",
                transition: "filter 0.2s ease, opacity 0.2s ease",
                opacity: hovered && !isHovered ? 0.7 : 1,
                cursor: "pointer",
              };

              return (
                <Tooltip key={layer.key}>
                  <TooltipTrigger asChild>
                    <g
                      style={animStyle}
                      onMouseEnter={() => setHovered(layer.key)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(layer.key)}
                      onBlur={() => setHovered(null)}
                      tabIndex={0}
                      aria-label={`${layer.label} notes: ${noteNames || "none"}`}
                    >
                      <polygon
                        points={layer.points}
                        fill={layer.color}
                        stroke="hsl(43 56% 55% / 0.25)"
                        strokeWidth={0.75}
                      />
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
                        }}
                      >
                        {layer.label}
                      </text>
                      {noteNames && (
                        <text
                          x={160}
                          y={layer.notesY}
                          textAnchor="middle"
                          fill={layer.textColor}
                          style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: layer.key === "top" ? 8 : 10,
                            opacity: 0.85,
                          }}
                        >
                          {noteNames.length > 38 ? noteNames.slice(0, 36) + "…" : noteNames}
                        </text>
                      )}
                    </g>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-xs bg-bz-card border-gold-strong"
                  >
                    <div className="space-y-1.5">
                      <p className="font-display text-gold uppercase tracking-wider text-xs">
                        {layer.label} Notes
                      </p>
                      {layer.notes.length === 0 ? (
                        <p className="text-xs text-cream-muted italic">No notes</p>
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
          </svg>

          {/* Longevity strip */}
          <div className="flex flex-col gap-1.5 px-1" style={{ width: cfg.svg }}>
            {layers
              .slice()
              .reverse() // display top → heart → base for reading order
              .map((l) => (
                <LongevityRow
                  key={l.key}
                  label={l.label}
                  duration={l.duration}
                  intensity={l.intensity}
                  color={l.color}
                  dotSize={cfg.dotSize}
                />
              ))
              .reverse()}
          </div>
        </div>

        {/* Legend (md/lg only) */}
        {cfg.showLegend && (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {layers
              .slice()
              .reverse()
              .map((layer) => (
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
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.notes.length === 0 ? (
                      <span className="text-xs text-dim italic font-body">—</span>
                    ) : (
                      layer.notes.map((n) => (
                        <Tooltip key={n.name}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded-pill border border-gold/30 bg-bz-card px-3 py-1 text-xs font-body text-cream-muted hover:border-gold-strong hover:text-cream hover:glow-gold-sm transition-all"
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
