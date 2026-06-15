/**
 * Bottle label overlays — Front (Classic Noir) + Back (Heritage Ivory).
 *
 * All visible copy is exposed via props so product name, tagline, and volume
 * can be updated without touching the SVG markup.
 *
 *   <BottleLabels
 *     front={{ productLine1: "Midnight", productLine2: "Velvet", volume: "30 ML" }}
 *     back={{ productLine1: "Midnight", productLine2: "Velvet" }}
 *   />
 */

export type BottleLabelCopy = {
  brand?: string;
  brandTagline?: string;
  productLine1?: string;
  productLine2?: string;
  concentration?: string;
  formulaNote?: string;
  formulaNote2?: string;
  volume?: string;
  origin?: string;
};

export type BottleLabelsProps = {
  front?: BottleLabelCopy;
  back?: BottleLabelCopy;
  showBack?: boolean;
};

export const DEFAULT_FRONT_COPY: Required<BottleLabelCopy> = {
  brand: "BAZUKI",
  brandTagline: "",
  productLine1: "Signature",
  productLine2: "Essence",
  concentration: "EAU DE PARFUM",
  formulaNote: "AI · ALGORITHMIC",
  formulaNote2: "FORMULA",
  volume: "50 ML · 1.7 FL.OZ",
  origin: "MADE IN INDIA",
};

export const DEFAULT_BACK_COPY: Required<BottleLabelCopy> = {
  brand: "BAZUKI",
  brandTagline: "LIVE PERFUME BAR",
  productLine1: "Signature",
  productLine2: "Essence",
  concentration: "EAU DE PARFUM",
  formulaNote: "",
  formulaNote2: "",
  volume: "50 ML · 1.7 FL.OZ",
  origin: "MADE IN INDIA",
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
          top: 50%;
          left: 60%;
          z-index: 2;
          transform-origin: left center;
          animation: labelBackIn 400ms ease-out 800ms both;
          transition: transform 300ms ease-out, opacity 300ms ease;
          pointer-events: none;
        }
        .label-front-wrap {
          position: absolute;
          top: 54%;
          left: 50%;
          z-index: 3;
          transform-origin: center;
          animation: labelFrontIn 500ms ease-out 1100ms both;
          transition: transform 300ms ease-out;
          pointer-events: none;
          overflow: hidden;
          border-radius: 4px;
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
          from {
            opacity: 0;
            transform: translateY(-50%) rotate(6deg) perspective(400px) rotateY(-25deg) scale(0.82) translateX(20px);
          }
          to {
            opacity: 0.75;
            transform: translateY(-50%) rotate(6deg) perspective(400px) rotateY(-25deg) scale(0.82) translateX(0);
          }
        }
        @keyframes labelFrontIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) perspective(600px) rotateY(-8deg) scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) perspective(600px) rotateY(-8deg) scale(1) translateY(0);
          }
        }
        @keyframes foilShimmer {
          0%, 70%  { left: -100%; opacity: 0; }
          72%      { opacity: 1; }
          88%      { left: 150%; opacity: 0.6; }
          100%     { left: 150%; opacity: 0; }
        }

        .hero-bottle-wrap:hover .label-front-wrap {
          transform: translate(-50%, -50%) perspective(600px) rotateY(-4deg) scale(1.04);
        }
        .hero-bottle-wrap:hover .label-back-wrap {
          opacity: 0.9;
          transform: translateY(-50%) rotate(6deg) perspective(400px) rotateY(-20deg) scale(0.82);
        }

        @media (max-width: 900px) {
          .label-front-wrap {
            top: 56%;
            transform: translate(-50%, -50%) perspective(600px) rotateY(-8deg) scale(0.9);
          }
        }
        @media (max-width: 768px) {
          .label-back-wrap { display: none; }
          .label-front-wrap {
            transform: translate(-50%, -50%) perspective(600px) rotateY(-5deg) scale(0.72);
          }
          .hero-bottle-wrap:hover .label-front-wrap {
            transform: translate(-50%, -50%) perspective(600px) rotateY(-5deg) scale(0.75);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .label-back-wrap, .label-front-wrap { animation-duration: 1ms !important; transition: none !important; }
          .label-front-wrap::after { animation: none; display: none; }
        }
      `}</style>

      {/* Back label — Heritage Ivory */}
      {showBack && (
        <div className="label-back-wrap" aria-hidden>
          <svg width="110" height="145" viewBox="0 0 110 145">
            <rect x="0" y="0" width="110" height="145" rx="3" fill="#f5f0e0" />
            <rect x="3" y="3" width="104" height="139" rx="2" fill="none" stroke="#8b6914" strokeWidth="1" />
            <rect x="6" y="6" width="98" height="133" rx="1" fill="none" stroke="#8b6914" strokeWidth="0.3" opacity="0.4" />
            <path d="M12 22 Q55 14 98 22" fill="none" stroke="#8b6914" strokeWidth="0.6" opacity="0.5" />
            <path d="M12 123 Q55 131 98 123" fill="none" stroke="#8b6914" strokeWidth="0.6" opacity="0.5" />
            <text x="55" y="18" textAnchor="middle" fontSize="7" fill="#412402" fontFamily="Georgia,serif" letterSpacing="4">{b.brand}</text>
            {b.brandTagline && (
              <text x="55" y="26" textAnchor="middle" fontSize="5" fill="#633806" fontFamily="Georgia,serif" letterSpacing="2">{b.brandTagline}</text>
            )}
            <line x1="12" y1="30" x2="98" y2="30" stroke="#8b6914" strokeWidth="0.5" opacity="0.4" />
            <text x="55" y="60" textAnchor="middle" fontSize="18" fill="#1a0e04" fontFamily="Georgia,serif" fontStyle="italic">{b.productLine1}</text>
            <text x="55" y="82" textAnchor="middle" fontSize="18" fill="#1a0e04" fontFamily="Georgia,serif" fontStyle="italic">{b.productLine2}</text>
            <line x1="12" y1="90" x2="98" y2="90" stroke="#8b6914" strokeWidth="0.5" opacity="0.4" />
            <text x="55" y="103" textAnchor="middle" fontSize="6.5" fill="#633806" fontFamily="Georgia,serif" letterSpacing="2">{b.concentration}</text>
            <text x="55" y="115" textAnchor="middle" fontSize="6" fill="#854F0B" fontFamily="Georgia,serif" letterSpacing="1">{b.volume}</text>
            <line x1="30" y1="120" x2="80" y2="120" stroke="#8b6914" strokeWidth="0.4" opacity="0.3" />
            <text x="55" y="130" textAnchor="middle" fontSize="5.5" fill="#854F0B" fontFamily="Georgia,serif" letterSpacing="1">{b.origin}</text>
          </svg>
        </div>
      )}

      {/* Front label — Classic Noir */}
      <div className="label-front-wrap" aria-hidden>
        <svg width="130" height="168" viewBox="0 0 130 168" style={{ display: "block" }}>
          <rect x="0" y="0" width="130" height="168" rx="4" fill="#0a0805" />
          <rect x="3" y="3" width="124" height="162" rx="3" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
          <rect x="6" y="6" width="118" height="156" rx="2" fill="none" stroke="#c9a84c" strokeWidth="0.4" opacity="0.4" />
          <line x1="10" y1="28" x2="120" y2="28" stroke="#c9a84c" strokeWidth="0.6" opacity="0.6" />
          <line x1="10" y1="140" x2="120" y2="140" stroke="#c9a84c" strokeWidth="0.6" opacity="0.6" />
          <text x="65" y="20" textAnchor="middle" fontSize="7.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="5" fontWeight="500">{f.brand}</text>
          <text x="65" y="60" textAnchor="middle" fontSize="22" fill="#c9a84c" fontFamily="Georgia,serif" fontStyle="italic">{f.productLine1}</text>
          <text x="65" y="86" textAnchor="middle" fontSize="22" fill="#c9a84c" fontFamily="Georgia,serif" fontStyle="italic">{f.productLine2}</text>
          <line x1="30" y1="96" x2="100" y2="96" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
          <text x="65" y="110" textAnchor="middle" fontSize="6.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="2.5" opacity="0.8">{f.concentration}</text>
          {f.formulaNote && (
            <text x="65" y="124" textAnchor="middle" fontSize="6" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1.5" opacity="0.6">{f.formulaNote}</text>
          )}
          {f.formulaNote2 && (
            <text x="65" y="136" textAnchor="middle" fontSize="6" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1" opacity="0.5">{f.formulaNote2}</text>
          )}
          <text x="65" y="153" textAnchor="middle" fontSize="6.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1.5" opacity="0.6">{f.volume}</text>
          <text x="65" y="163" textAnchor="middle" fontSize="5.5" fill="#c9a84c" fontFamily="Georgia,serif" letterSpacing="1" opacity="0.4">{f.origin}</text>
        </svg>
      </div>
    </>
  );
};

export default BottleLabels;
