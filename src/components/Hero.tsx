import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import bottleAsset from "@/assets/bazuki-bottle-clean.png.asset.json";
import BazukiLabel from "@/components/hero/BazukiLabel";

const BOTTLES = [
  { line1: "Timeless", line2: "Harmony", name: "Timeless Harmony", variant: "left" as const },
  { line1: "Signature", line2: "Essence", name: "Signature Essence", variant: "center" as const },
  { line1: "Modern", line2: "Classic", name: "Modern Classic", variant: "right" as const },
];

const Hero = () => {
  const bottleUrl = bottleAsset.url;

  return (
    <section className="hero-section" aria-label="Bazuki signature fragrance campaign">
      <style>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          background: #0A0805;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px 80px;
        }
        .hero-bg-blur {
          position: absolute;
          inset: -10%;
          background-image: url('${bottleUrl}');
          background-size: cover;
          background-position: center 35%;
          filter: blur(55px) brightness(0.18) saturate(0.7);
          z-index: 0;
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 70% 60% at 50% 40%,
            rgba(0,180,200,0.04) 0%,
            rgba(10,8,5,0.65) 55%,
            rgba(10,8,5,0.96) 100%
          );
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
        }

        .hero-eyebrow {
          color: #C9A84C;
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          color: #F5F0E8;
          font-weight: 300;
          line-height: 1.1;
          font-size: clamp(36px, 6vw, 60px);
          text-align: center;
          margin: 0;
        }
        .hero-headline .it { font-style: italic; display: block; }
        .hero-subtext {
          color: #C8C0B0;
          font-size: 16px;
          line-height: 1.7;
          text-align: center;
          font-family: 'Inter', sans-serif;
          max-width: 520px;
          margin: 0;
        }

        .bottles-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0px;
          margin-top: 48px;
        }
        .bottle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          position: relative;
          transition: transform 300ms ease-out;
        }
        .bottle-card.center { transform: translateY(0); z-index: 3; }
        .bottle-card.left { transform: translateY(30px); z-index: 2; }
        .bottle-card.right { transform: translateY(30px); z-index: 2; }

        .bottle-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          aspect-ratio: 3 / 4;
        }
        .bottle-card.center .bottle-img-wrap { width: 300px; }
        .bottle-card.side .bottle-img-wrap { width: 220px; }

        .bottle-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 28%;
          filter:
            drop-shadow(0 24px 48px rgba(0,0,0,0.9))
            drop-shadow(0 0 35px rgba(0,180,200,0.18));
          display: block;
        }
        .bottle-card.side .bottle-photo {
          opacity: 0.82;
          filter:
            drop-shadow(0 20px 40px rgba(0,0,0,0.9))
            drop-shadow(0 0 20px rgba(0,180,200,0.10));
        }

        .label-wrap {
          position: absolute;
          top: 62%;
          left: 50%;
          width: 68%;
          transform: translate(-50%, -50%) perspective(800px) rotateY(-4deg);
          z-index: 2;
          pointer-events: none;
        }
        .label-wrap svg {
          width: 100%;
          height: auto;
          display: block;
          filter:
            drop-shadow(0 3px 10px rgba(0,0,0,0.7))
            drop-shadow(0 0 15px rgba(201,168,76,0.10));
        }

        /* Center special effects */
        .bottle-card.center .bottle-img-wrap::before {
          content: '';
          position: absolute;
          inset: -20%;
          background: radial-gradient(
            ellipse 70% 80% at 50% 45%,
            rgba(0,200,220,0.12) 0%,
            transparent 65%
          );
          z-index: 0;
          pointer-events: none;
        }
        @keyframes bottleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .bottle-card.center .bottle-img-wrap {
          animation: bottleFloat 4s ease-in-out infinite;
        }
        @keyframes labelShimmer {
          0%, 85%, 100% { opacity: 0; }
          88%, 96% { opacity: 1; }
        }
        .bottle-card.center .label-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 35%,
            rgba(255,255,255,0.07) 50%,
            transparent 65%
          );
          animation: labelShimmer 8s ease-in-out infinite;
          pointer-events: none;
          border-radius: 4px;
        }

        /* Hover */
        .bottle-card.side:hover .bottle-img-wrap {
          transform: translateY(-8px);
          transition: transform 300ms ease-out;
        }
        .bottle-card.side:hover .bottle-photo {
          opacity: 1;
          filter:
            drop-shadow(0 28px 50px rgba(0,0,0,0.9))
            drop-shadow(0 0 35px rgba(0,180,200,0.25));
          transition: all 300ms ease-out;
        }
        .bottle-card.center:hover .bottle-img-wrap {
          transform: translateY(-6px) scale(1.02);
          transition: transform 300ms ease-out;
        }

        /* Best match */
        .best-match-badge {
          background: rgba(201,168,76,0.10);
          border: 1px solid rgba(201,168,76,0.40);
          border-radius: 20px;
          padding: 5px 16px;
          font-size: 10px;
          color: #C9A84C;
          letter-spacing: 0.12em;
          font-family: 'Cinzel', serif;
          margin-bottom: 8px;
          animation: badgePulse 2.5s ease-in-out infinite;
          text-transform: uppercase;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 rgba(201,168,76,0); }
          50% { box-shadow: 0 0 12px rgba(201,168,76,0.25); }
        }

        /* Name tag */
        .bottle-name-tag {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #8B6914;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .bottle-name-tag.center {
          font-size: 16px;
          color: #C9A84C;
        }

        /* CTAs */
        .hero-cta-row {
          display: flex; flex-wrap: wrap;
          gap: 16px; justify-content: center;
          margin-top: 28px;
        }
        .hero-cta-primary {
          background: #C9A84C;
          color: #0A0805;
          padding: 16px 36px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 200ms, transform 200ms;
        }
        .hero-cta-primary:hover { background: #F0C040; transform: scale(1.03); }
        .hero-cta-secondary {
          background: transparent;
          border: 1px solid rgba(201,168,76,0.5);
          color: #C9A84C;
          padding: 16px 36px;
          border-radius: 4px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: background 200ms, border-color 200ms;
        }
        .hero-cta-secondary:hover {
          background: rgba(201,168,76,0.06);
          border-color: #C9A84C;
        }

        @media (max-width: 1024px) {
          .bottle-card.center .bottle-img-wrap { width: 240px; }
          .bottle-card.side .bottle-img-wrap { width: 170px; }
        }
        @media (max-width: 768px) {
          .bottle-card.side { display: none; }
          .bottle-card.center .bottle-img-wrap { width: min(85vw, 300px); }
          .bottles-row { margin-top: 32px; }
          .hero-cta-row { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
          .hero-cta-primary, .hero-cta-secondary { justify-content: center; text-align: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bottle-card.center .bottle-img-wrap,
          .bottle-card.center .label-wrap::after,
          .best-match-badge {
            animation: none !important;
          }
        }
      `}</style>

      <div className="hero-bg-blur" aria-hidden />
      <div className="hero-bg-overlay" aria-hidden />

      <div className="hero-content">
        <p className="hero-eyebrow">AI-Crafted · Made in India</p>
        <h1 className="hero-headline">
          <span>Your Scent,</span>
          <span className="it">Engineered by AI.</span>
        </h1>
        <p className="hero-subtext">
          Three formulas. Crafted uniquely for you. No two bottles alike.
        </p>

        <div className="bottles-row">
          {BOTTLES.map((b) => {
            const isCenter = b.variant === "center";
            const sideClass = isCenter ? "center" : `side ${b.variant}`;
            return (
              <div key={b.name} className={`bottle-card ${sideClass}`}>
                {isCenter && <div className="best-match-badge">✦ Best Match</div>}
                <div className="bottle-img-wrap">
                  <img
                    src={bottleUrl}
                    alt={`${b.name} Bazuki fragrance bottle`}
                    className="bottle-photo"
                    loading={isCenter ? "eager" : "lazy"}
                  />
                  <div className="label-wrap">
                    <BazukiLabel line1={b.line1} line2={b.line2} />
                  </div>
                </div>
                <div className={`bottle-name-tag ${isCenter ? "center" : ""}`}>{b.name}</div>
              </div>
            );
          })}
        </div>

        <div className="hero-cta-row">
          <Link to="/shop/quiz" className="hero-cta-primary">
            Discover Your Scent <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link to="/collection" className="hero-cta-secondary">
            Browse the Library
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
