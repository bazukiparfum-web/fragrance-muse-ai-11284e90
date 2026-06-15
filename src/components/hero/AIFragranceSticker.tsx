import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const GOLD = "#C9A84C";

const FAMILIES: string[][] = [
  ["BERGAMOT", "LEMON", "NEROLI", "GRAPEFRUIT", "MANDARIN", "YUZU"],
  ["ROSE", "JASMINE", "IRIS", "YLANG", "VIOLET", "PEONY", "MAGNOLIA", "TUBEROSE"],
  ["SANDALWOOD", "CEDARWOOD", "VETIVER", "PATCHOULI", "GUAIAC", "BIRCH"],
  ["OUD", "AMBER", "BENZOIN", "FRANKINCENSE", "MYRRH", "LABDANUM"],
  ["CARDAMOM", "SAFFRON", "PEPPER", "CINNAMON", "GINGER", "CLOVE"],
  ["MUSK", "VANILLA", "TONKA", "CARAMEL", "HELIOTROPE"],
  ["MINT", "BASIL", "GREEN TEA", "LAVENDER", "SAGE"],
];

type Position = "top" | "right" | "bottom" | "left";
const POSITIONS: Position[] = ["top", "right", "bottom", "left"];

interface AIFragranceStickerProps {
  notes?: [string, string, string, string]; // top, right, bottom, left
  className?: string;
  style?: React.CSSProperties;
}

const findFamilyIndex = (note: string) =>
  FAMILIES.findIndex((f) => f.includes(note));

const pickFromFamilyExcluding = (familyIdx: number, exclude: string) => {
  const family = FAMILIES[familyIdx];
  const available = family.filter((n) => n !== exclude);
  const pool = available.length > 0 ? available : family;
  return pool[Math.floor(Math.random() * pool.length)];
};

const AIFragranceSticker = ({
  notes = ["BERGAMOT", "OUD", "SANDALWOOD", "ROSE"],
  className = "",
  style,
}: AIFragranceStickerProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [labels, setLabels] = useState<Record<Position, string>>({
    top: notes[0],
    right: notes[1],
    bottom: notes[2],
    left: notes[3],
  });
  const [animState, setAnimState] = useState<Record<Position, "idle" | "out" | "in">>({
    top: "idle",
    right: "idle",
    bottom: "idle",
    left: "idle",
  });

  // Track family assigned to each position so we keep families diverse across positions.
  const familyByPosRef = useRef<Record<Position, number>>({
    top: findFamilyIndex(notes[0]),
    right: findFamilyIndex(notes[1]),
    bottom: findFamilyIndex(notes[2]),
    left: findFamilyIndex(notes[3]),
  });

  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    pausedRef.current = hovered;
  }, [hovered]);

  const updateLabel = (pos: Position) => {
    setAnimState((s) => ({ ...s, [pos]: "out" }));

    // Swap text while invisible
    setTimeout(() => {
      setLabels((prev) => {
        // Pick a family not currently used by any other position
        const usedFamilies = new Set(
          POSITIONS.filter((p) => p !== pos).map(
            (p) => familyByPosRef.current[p]
          )
        );
        const candidates = FAMILIES.map((_, i) => i).filter(
          (i) => !usedFamilies.has(i)
        );
        const familyIdx =
          candidates[Math.floor(Math.random() * candidates.length)] ??
          Math.floor(Math.random() * FAMILIES.length);

        const newNote = pickFromFamilyExcluding(familyIdx, prev[pos]);
        familyByPosRef.current[pos] = familyIdx;
        return { ...prev, [pos]: newNote };
      });
      setAnimState((s) => ({ ...s, [pos]: "in" }));
    }, 250);

    // Settle
    setTimeout(() => {
      setAnimState((s) => ({ ...s, [pos]: "idle" }));
    }, 950);
  };

  useEffect(() => {
    if (reducedMotion.current) return;

    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (pausedRef.current) return;
        const pos = POSITIONS[indexRef.current];
        updateLabel(pos);
        indexRef.current = (indexRef.current + 1) % POSITIONS.length;
      }, 1500);
    }, 3000);

    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  // 8 radar vertices around a circle. Index 0 = top, clockwise.
  const verts = (radiusPct: number) =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const r = radiusPct;
      return {
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      };
    });

  const outer = verts(42.5);
  const inner = verts(30);

  const polyToPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  const handleClick = () => navigate("/shop/quiz");

  const labelClass = (pos: Position) => {
    const s = animState[pos];
    return `ai-label ai-label-${pos} ${
      s === "out" ? "is-out" : s === "in" ? "is-in" : ""
    }`;
  };

  return (
    <div
      className={`ai-sticker-wrap ${mounted ? "is-mounted" : ""} ${hovered ? "is-hovered" : ""} ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Bazuki AI Fragrance — algorithmically crafted scent formula"
    >
      <style>{`
        .ai-sticker-wrap {
          position: relative;
          width: var(--sticker-size, 140px);
          height: var(--sticker-size, 140px);
          cursor: pointer;
          opacity: 0;
          transform: scale(0.5) rotate(-15deg);
        }
        .ai-sticker-wrap.is-mounted {
          animation:
            ai-stamp-in 750ms cubic-bezier(.2,.8,.2,1) 600ms forwards,
            ai-float 4s ease-in-out 1500ms infinite;
        }
        .ai-sticker-wrap.is-hovered {
          animation: none !important;
          opacity: 1;
          transform: scale(1.1) rotate(0deg);
          transition: transform 200ms ease-out;
        }
        .ai-sticker-disc {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: #0D0C0A;
          border: 2px solid #C9A84C;
          box-shadow: 0 0 8px rgba(201,168,76,0.2);
          animation: ai-glow 3s ease-in-out infinite;
        }
        .ai-sticker-wrap.is-hovered .ai-sticker-disc {
          box-shadow: 0 0 24px rgba(201,168,76,0.7);
          border-color: #C9A84C;
          animation: none;
        }
        .ai-dashed-ring {
          position: absolute;
          top: 2.5%; left: 2.5%;
          width: 95%; height: 95%;
          border-radius: 50%;
          border: 1px dashed rgba(201,168,76,0.15);
          animation: ai-spin 30s linear infinite;
        }
        .ai-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .ai-center {
          position: absolute;
          top: 50%; left: 50%;
          width: 52px; height: 52px;
          margin: -26px 0 0 -26px;
          border-radius: 50%;
          background: #1A1408;
          border: 1.5px solid #C9A84C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: Georgia, serif;
          line-height: 1;
        }
        .ai-center::before {
          content: "";
          position: absolute;
          top: 5%; left: 5%; width: 90%; height: 90%;
          border-radius: 50%;
          border: 0.5px solid rgba(201,168,76,0.3);
          pointer-events: none;
        }
        .ai-c1 { font-size: 12px; font-weight: 700; color: #C9A84C; letter-spacing: 1px; }
        .ai-c2 { font-size: 7px; color: #C9A84C; letter-spacing: 1.5px; margin-top: 2px; }
        .ai-c3 { font-size: 6px; color: rgba(201,168,76,0.6); letter-spacing: 1px; margin-top: 2px; }

        .ai-label {
          position: absolute;
          font-family: Georgia, serif;
          font-size: 7px;
          color: rgba(201,168,76,0.7);
          letter-spacing: 2px;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 250ms ease, transform 300ms ease, color 200ms ease;
          will-change: opacity, transform, color;
        }
        .ai-label-top    { top: -14px; left: 50%; transform: translateX(-50%); }
        .ai-label-right  { top: 50%; right: -8px; transform: translate(100%, -50%); }
        .ai-label-bottom { bottom: -14px; left: 50%; transform: translateX(-50%); }
        .ai-label-left   { top: 50%; left: -8px; transform: translate(-100%, -50%); }

        /* Animating out — push away from center, fade */
        .ai-label-top.is-out    { opacity: 0; transform: translate(-50%, -4px); transition-duration: 250ms; transition-timing-function: ease-in; }
        .ai-label-right.is-out  { opacity: 0; transform: translate(calc(100% + 4px), -50%); transition-duration: 250ms; transition-timing-function: ease-in; }
        .ai-label-bottom.is-out { opacity: 0; transform: translate(-50%, 4px); transition-duration: 250ms; transition-timing-function: ease-in; }
        .ai-label-left.is-out   { opacity: 0; transform: translate(calc(-100% - 4px), -50%); transition-duration: 250ms; transition-timing-function: ease-in; }

        /* Animating in — fade back to rest with brief highlight */
        .ai-label.is-in {
          color: rgba(201,168,76,1);
          animation: ai-label-highlight 700ms ease-out;
        }

        @keyframes ai-label-highlight {
          0%   { color: rgba(201,168,76,0.7); }
          40%  { color: rgba(201,168,76,1); }
          100% { color: rgba(201,168,76,0.7); }
        }

        .ai-node { fill: #C9A84C; transform-origin: center; }
        .ai-node.a { animation: ai-pulse 2s ease-in-out infinite; }
        .ai-node.b { animation: ai-pulse 2s ease-in-out 1s infinite; }

        .ai-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: #0D0C0A;
          border: 1px solid #C9A84C;
          color: #C9A84C;
          font-family: Georgia, serif;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .ai-sticker-wrap.is-hovered .ai-tooltip { opacity: 1; }

        @keyframes ai-stamp-in {
          0%   { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          40%  { opacity: 1; transform: scale(1.08) rotate(5deg); }
          60%  { transform: scale(0.98) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ai-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-6px) scale(1); }
        }
        @keyframes ai-pulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        @keyframes ai-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ai-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(201,168,76,0.2); }
          50%      { box-shadow: 0 0 16px rgba(201,168,76,0.5); }
        }

        @media (max-width: 767px) {
          .ai-sticker-wrap { --sticker-size: 90px; }
          .ai-center { width: 38px; height: 38px; margin: -19px 0 0 -19px; }
          .ai-c1 { font-size: 10px; }
          .ai-c2 { font-size: 5.5px; }
          .ai-c3 { font-size: 5px; }
          .ai-label { display: none; }
          @keyframes ai-float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-sticker-wrap,
          .ai-sticker-wrap.is-mounted,
          .ai-dashed-ring,
          .ai-sticker-disc,
          .ai-node.a, .ai-node.b {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .ai-label {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            color: rgba(201,168,76,0.7) !important;
          }
        }
      `}</style>

      <div className="ai-sticker-disc" aria-hidden />
      <div className="ai-dashed-ring" aria-hidden />

      <svg className="ai-svg" viewBox="0 0 100 100" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
          const x2 = 50 + 45 * Math.cos(angle);
          const y2 = 50 + 45 * Math.sin(angle);
          return (
            <line
              key={i}
              x1="50" y1="50" x2={x2} y2={y2}
              stroke="rgba(201,168,76,0.08)"
              strokeWidth="0.5"
            />
          );
        })}
        <polygon
          points={polyToPoints(outer)}
          fill="rgba(201,168,76,0.06)"
          stroke={GOLD}
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        <polygon
          points={polyToPoints(inner)}
          fill="rgba(201,168,76,0.04)"
          stroke={GOLD}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {outer.map((p, i) => (
          <circle
            key={i}
            className={`ai-node ${i % 2 === 0 ? "a" : "b"}`}
            cx={p.x} cy={p.y} r="1.4"
          />
        ))}
      </svg>

      <span className={labelClass("top")} aria-live="polite">{labels.top}</span>
      <span className={labelClass("right")} aria-live="polite">{labels.right}</span>
      <span className={labelClass("bottom")} aria-live="polite">{labels.bottom}</span>
      <span className={labelClass("left")} aria-live="polite">{labels.left}</span>

      <div className="ai-center">
        <span className="ai-c1">AI</span>
        <span className="ai-c2">FRAGRANCE</span>
        <span className="ai-c3">BAZUKI ®</span>
      </div>

      <div className="ai-tooltip">AI-crafted formula — unique to you</div>
    </div>
  );
};

export default AIFragranceSticker;
