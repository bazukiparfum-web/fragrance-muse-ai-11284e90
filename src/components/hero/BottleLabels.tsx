/**
 * Bottle label overlays — Front (Classic Noir) + Back (Heritage Ivory).
 *
 * All visible copy is exposed via props so product name and volume can be
 * updated without touching SVG markup.
 *
 *   <BottleLabels
 *     front={{ productLine1: "Midnight", productLine2: "Velvet", volume: "30 ML · INDIA" }}
 *     back={{ productLine1: "Midnight", productLine2: "Velvet" }}
 *   />
 */

export type BottleLabelCopy = {
  brand?: string;
  productLine1?: string;
  productLine2?: string;
  concentration?: string;
  formulaNote?: string;
  volume?: string;
};

export type BottleLabelsProps = {
  front?: BottleLabelCopy;
  back?: BottleLabelCopy;
  showBack?: boolean;
};

export const DEFAULT_FRONT_COPY: Required<BottleLabelCopy> = {
  brand: "BAZUKI",
  productLine1: "Signature",
  productLine2: "Essence",
  concentration: "EAU DE PARFUM",
  formulaNote: "AI · ALGORITHMIC",
  volume: "50 ML · INDIA",
};

export const DEFAULT_BACK_COPY: Required<BottleLabelCopy> = {
  brand: "BAZUKI",
  productLine1: "Signature",
  productLine2: "Essence",
  concentration: "EAU DE PARFUM",
  formulaNote: "",
  volume: "50 ML · INDIA",
};

const merge = (
  defaults: Required<BottleLabelCopy>,
  overrides?: BottleLabelCopy,
): Required<BottleLabelCopy> => ({ ...defaults, ...(overrides ?? {}) });

const BottleLabels = ({ front, back, showBack = true }: BottleLabelsProps) => {
  const f = merge(DEFAULT_FRONT_COPY, front);
  const b = merge(DEFAULT_BACK_COPY, back);

  return (
    <>
      <style>{`
        .hero-bottle-wrap { position: relative; display: inline-block; width: fit-content; }
        .hero-bottle-wrap > img { display: block; position: relative; z-index: 1; }

        .label-back-wrap {
          position: absolute;
          top: 54%;
          left: 64%;
          z-index: 2;
          opacity: 0.55;
          transform-origin: left center;
          transform: translateY(-50%) rotate(4deg) perspective(300px) rotateY(-30deg) scale(0.85);
          animation: labelBackIn 500ms ease-out 800ms both;
          transition: transform 300ms ease-out, opacity 300ms ease;
          pointer-events: none;
        }
        .label-front-wrap {
          position: absolute;
          top: 52%;
          left: 50%;
          z-index: 3;
          transform-origin: center;
          transform: translate(-50%, -50%) perspective(500px) rotateY(-6deg);
          animation: labelFrontIn 500ms ease-out 1100ms both;
          transition: transform 300ms ease-out;
          pointer-events: none;
          overflow: hidden;
          border-radius: 3px;
        }
        .label-front-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          animation: foilShimmer 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes labelBackIn {
          from { opacity: 0; transform: translateY(-50%) rotate(4deg) perspective(300px) rotateY(-30deg) scale(0.7) translateX(10px); }
          to   { opacity: 0.55; transform: translateY(-50%) rotate(4deg) perspective(300px) rotateY(-30deg) scale(0.85); }
        }
        @keyframes labelFrontIn {
          from { opacity: 0; transform: translate(-50%, -50%) perspective(500px) rotateY(-6deg) scale(0.9); }
          to   { opacity: 1; transform: translate(-50%, -50%) perspective(500px) rotateY(-6deg) scale(1); }
        }
        @keyframes foilShimmer {
          0%, 70%  { left: -100%; opacity: 0; }
          72%      { opacity: 1; }
          88%      { left: 150%; opacity: 0.6; }
          100%     { left: 150%; opacity: 0; }
        }

        .hero-bottle-wrap:hover .label-front-wrap {
          transform: translate(-50%, -50%) perspective(500px) rotateY(-3deg) scale(1.04);
        }
        .hero-bottle-wrap:hover .label-back-wrap {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .label-back-wrap { display: none; }
          .label-front-wrap {
            transform: translate(-50%, -50%) perspective(500px) rotateY(-5deg) scale(0.8);
          }
          .hero-bottle-wrap:hover .label-front-wrap {
            transform: translate(-50%, -50%) perspective(500px) rotateY(-5deg) scale(0.84);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .label-back-wrap, .label-front-wrap { animation-duration: 1ms !important; transition: none !important; }
          .label-front-wrap::after { animation: none; display: none; }
        }
      `}</style>

      {/* Back label — Heritage Ivory (peeks from behind bottle right edge) */}
      {showBack && (
        <div className="label-back-wrap" aria-hidden>
          <svg width="60" height="78" viewBox="0 0 60 78">
            <rect x="0" y="0" width="60" height="78" rx="2" fill="#f5f0e0" />
            <rect x="2" y="2" width="56" height="74" rx="1" fill="none" stroke="#8b6914" strokeWidth="0.8" />
            <text x="30" y="14" textAnchor="middle" fontSize="5.5" fill="#412402" fontFamily="Georgia,serif" letterSpacing="3">{b.brand}</text>
            <line x1="6" y1="18" x2="54" y2="18" stroke="#8b6914" strokeWidth="0.4" opacity="0.5" />
            <text x="30" y="36" textAnchor="middle" fontSize="11" fill="#1a0e04" fontFamily="Georgia,serif" fontStyle="italic">{b.productLine1}</text>
            <text x="30" y="50" textAnchor="middle" fontSize="11" fill="#1a0e04" fontFamily="Georgia,serif" fontStyle="italic">{b.productLine2}</text>
            <line x1="6" y1="56" x2="54" y2="56" stroke="#8b6914" strokeWidth="0.4" opacity="0.5" />
            <text x="30" y="66" textAnchor="middle" fontSize="4.5" fill="#633806" fontFamily="Georgia,serif" letterSpacing="1.5">{b.concentration}</text>
            <text x="30" y="74" textAnchor="middle" fontSize="4" fill="#854F0B" fontFamily="Georgia,serif" letterSpacing="1">{b.volume}</text>
          </svg>
        </div>
      )}

      {/* Front label — Classic Noir (centered on bottle body) */}
      <div className="label-front-wrap" aria-hidden>
        <svg width="80" height="100" viewBox="0 0 80 100" style={{ display: "block" }}>
          <rect x="0" y="0" width="80" height="100" rx="3" fill="#0a0805" />
          <rect x="2" y="2" width="76" height="96" rx="2" fill="none" stroke="#c9a84c" strokeWidth="1.2" />
          <line x1="6" y1="18" x2="74" y2="18" stroke="#c9a84c" strokeWidth="0.5" opacity="0.6" />
          <line x1="6" y1="82" x2="74" y2="82" stroke="#c9a84c" strokeWidth="0.5" opacity="0.6" />
          <text x="40" y="13" textAnchor="middle" fontSize="6" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="4">{f.brand}</text>
          <text x="40" y="42" textAnchor="middle" fontSize="14" fill="#c9a84c" fontFamily="Georgia,serif" fontStyle="italic">{f.productLine1}</text>
          <text x="40" y="58" textAnchor="middle" fontSize="14" fill="#c9a84c" fontFamily="Georgia,serif" fontStyle="italic">{f.productLine2}</text>
          <text x="40" y="72" textAnchor="middle" fontSize="5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1.5" opacity="0.7">{f.concentration}</text>
          {f.formulaNote && (
            <text x="40" y="81" textAnchor="middle" fontSize="4.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1" opacity="0.5">{f.formulaNote}</text>
          )}
          <text x="40" y="92" textAnchor="middle" fontSize="4.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1" opacity="0.4">{f.volume}</text>
        </svg>
      </div>
    </>
  );
};

export default BottleLabels;
