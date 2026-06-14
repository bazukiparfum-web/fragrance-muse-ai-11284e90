import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const GOLD = "#C9A84C";

interface AIFragranceStickerProps {
  notes?: [string, string, string, string]; // top, right, bottom, left
  className?: string;
  style?: React.CSSProperties;
}

const AIFragranceSticker = ({
  notes = ["BERGAMOT", "OUD", "SANDALWOOD", "ROSE"],
  className = "",
  style,
}: AIFragranceStickerProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
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

  const outer = verts(42.5); // 85% of 50 radius
  const inner = verts(30); // 60% of 50

  const polyToPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  const handleClick = () => navigate("/shop/quiz");

  return (
    <div
      className={`ai-sticker-wrap ${mounted ? "is-mounted" : ""} ${hovered ? "is-hovered" : ""} ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="AI-crafted fragrance — take the quiz"
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
          transition: opacity 300ms ease;
        }
        .ai-label-top { top: -14px; left: 50%; transform: translateX(-50%); }
        .ai-label-right { top: 50%; right: -8px; transform: translate(100%, -50%); }
        .ai-label-bottom { bottom: -14px; left: 50%; transform: translateX(-50%); }
        .ai-label-left { top: 50%; left: -8px; transform: translate(-100%, -50%); }
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
        }
      `}</style>

      <div className="ai-sticker-disc" aria-hidden />
      <div className="ai-dashed-ring" aria-hidden />

      <svg className="ai-svg" viewBox="0 0 100 100" aria-hidden>
        {/* 8 radial spokes */}
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
        {/* Outer polygon */}
        <polygon
          points={polyToPoints(outer)}
          fill="rgba(201,168,76,0.06)"
          stroke={GOLD}
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        {/* Inner polygon */}
        <polygon
          points={polyToPoints(inner)}
          fill="rgba(201,168,76,0.04)"
          stroke={GOLD}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* 8 nodes */}
        {outer.map((p, i) => (
          <circle
            key={i}
            className={`ai-node ${i % 2 === 0 ? "a" : "b"}`}
            cx={p.x} cy={p.y} r="1.4"
          />
        ))}
      </svg>

      <span className="ai-label ai-label-top">{notes[0]}</span>
      <span className="ai-label ai-label-right">{notes[1]}</span>
      <span className="ai-label ai-label-bottom">{notes[2]}</span>
      <span className="ai-label ai-label-left">{notes[3]}</span>

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
