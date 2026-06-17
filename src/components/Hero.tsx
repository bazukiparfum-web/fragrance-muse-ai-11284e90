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
          --hero-bg: #0A0805;
          --hero-ivory: #F5F0E8;
          --hero-body: #C8C0B0;
          --hero-gold: #C9A84C;
          --hero-gold-bright: #F0C040;
          --hero-dim-gold: #8B6914;
          --hero-warm-amber: #C9943A;
          --hero-violet: #A87CC9;
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--hero-bg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 1.5rem) clamp(3rem, 8vw, 5rem);
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
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
          max-width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .hero-eyebrow {
          color: var(--hero-gold);
          font-size: 10px;
          font-size: clamp(0.625rem, 0.55rem + 0.2vw, 0.75rem);
          letter-spacing: 0.35em;
          line-height: 1.4;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          margin-top: 1em;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          color: var(--hero-ivory);
          font-weight: 300;
          line-height: 1.15;
          font-size: 36px;
          font-size: clamp(2rem, 1.4rem + 3.2vw, 3.75rem);
          text-align: center;
          text-wrap: balance;
          overflow-wrap: anywhere;
          hyphens: auto;
          margin: 0.6em 0 0;
          font-feature-settings: "kern";
          -webkit-font-smoothing: antialiased;
        }
        .hero-headline .it { font-style: italic; display: block; }
        .hero-subtext {
          color: var(--hero-body);
          font-size: 15px;
          font-size: clamp(0.9375rem, 0.85rem + 0.4vw, 1rem);
          line-height: 1.6;
          letter-spacing: 0.03em;
          text-align: center;
          font-family: 'Inter', sans-serif;
          max-width: min(92vw, 32rem);
          overflow-wrap: anywhere;
          hyphens: auto;
          margin: 1em 0 0.5em;
        }
        .hero-subtext .mobile-break { display: none; }


        .bottles-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0px;
          margin-top: 24px;
        }
        .bottle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          position: relative;
          transition: transform 300ms ease-out;
        }
        .bottle-card.center { transform: translateY(0); z-index: 3; gap: 0; }
        .bottle-card.left { transform: translateY(30px); z-index: 2; }
        .bottle-card.right { transform: translateY(30px); z-index: 2; }

        .bottle-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          aspect-ratio: 2 / 3;
        }
        .bottle-card.center .bottle-img-wrap { width: 280px; }
        .bottle-card.side .bottle-img-wrap { width: 210px; }

        .bottle-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 18%;
          display: block;
        }
        .bottle-card.side .bottle-photo {
          opacity: 0.80;
        }
        .bottle-card.left .bottle-photo {
          filter:
            hue-rotate(-110deg)
            saturate(1.3)
            brightness(0.9)
            drop-shadow(0 20px 40px rgba(0,0,0,0.9))
            drop-shadow(0 0 30px rgba(180,120,20,0.20));
        }
        .bottle-card.right .bottle-photo {
          filter:
            hue-rotate(75deg)
            saturate(1.3)
            brightness(0.88)
            drop-shadow(0 20px 40px rgba(0,0,0,0.9))
            drop-shadow(0 0 30px rgba(120,40,200,0.20));
        }
        .bottle-card.center .bottle-photo {
          filter:
            saturate(1.2)
            brightness(1.0)
            drop-shadow(0 24px 50px rgba(0,0,0,0.9))
            drop-shadow(0 0 40px rgba(0,180,200,0.22));
        }

        .label-wrap {
          position: absolute;
          top: 68%;
          left: 50%;
          width: 42%;
          transform: translate(-50%, -50%) perspective(600px) rotateY(-4deg);
          z-index: 3;
          pointer-events: none;
        }
        .label-wrap svg {
          width: 100%;
          height: auto;
          display: block;
          filter:
            drop-shadow(0 4px 12px rgba(0,0,0,0.8))
            drop-shadow(0 0 8px rgba(201,168,76,0.12));
        }

        /* Color overlays */
        .bottle-card.left .bottle-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(160, 90, 10, 0.15);
          mix-blend-mode: color;
          pointer-events: none;
          z-index: 2;
          border-radius: 8px;
        }
        .bottle-card.right .bottle-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(90, 20, 170, 0.14);
          mix-blend-mode: color;
          pointer-events: none;
          z-index: 2;
          border-radius: 8px;
        }

        /* Behind-bottle glows */
        .bottle-card.left .bottle-img-wrap::before {
          content: '';
          position: absolute;
          inset: -15%;
          background: radial-gradient(
            ellipse 70% 80% at 50% 45%,
            rgba(200, 130, 20, 0.14) 0%,
            rgba(180, 100, 10, 0.06) 40%,
            transparent 70%
          );
          z-index: 0;
          pointer-events: none;
          filter: blur(8px);
        }
        .bottle-card.center .bottle-img-wrap::before {
          content: '';
          position: absolute;
          inset: -15%;
          background: radial-gradient(
            ellipse 70% 80% at 50% 45%,
            rgba(0, 200, 220, 0.14) 0%,
            rgba(0, 160, 180, 0.06) 40%,
            transparent 70%
          );
          z-index: 0;
          pointer-events: none;
          filter: blur(8px);
        }
        .bottle-card.right .bottle-img-wrap::before {
          content: '';
          position: absolute;
          inset: -15%;
          background: radial-gradient(
            ellipse 70% 80% at 50% 45%,
            rgba(120, 40, 220, 0.14) 0%,
            rgba(80, 20, 160, 0.06) 40%,
            transparent 70%
          );
          z-index: 0;
          pointer-events: none;
          filter: blur(8px);
        }

        @keyframes bottleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .bottle-card.center .bottle-img-wrap {
          animation: bottleFloat 4s ease-in-out infinite;
        }


        /* Hover */
        .bottle-card.side:hover .bottle-img-wrap {
          transform: translateY(-8px);
          transition: transform 300ms ease-out;
        }
        .bottle-card.left:hover .bottle-photo {
          opacity: 1;
          filter:
            hue-rotate(-110deg)
            saturate(1.55)
            brightness(0.96)
            sepia(0.25)
            drop-shadow(0 28px 50px rgba(0,0,0,0.9))
            drop-shadow(0 0 40px rgba(200,140,30,0.30));
          transition: all 300ms ease-out;
        }
        .bottle-card.right:hover .bottle-photo {
          opacity: 1;
          filter:
            hue-rotate(75deg)
            saturate(1.5)
            brightness(0.95)
            drop-shadow(0 28px 50px rgba(0,0,0,0.9))
            drop-shadow(0 0 40px rgba(140,50,220,0.28));
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
          color: var(--hero-gold);
          letter-spacing: 0.12em;
          font-family: 'Cinzel', serif;
          margin-bottom: 10px;
          position: relative;
          z-index: 4;
          text-transform: uppercase;
        }


        /* Name tag */
        .bottle-name-tag {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: var(--hero-dim-gold);
          letter-spacing: 0.04em;
          text-align: center;
        }
        .bottle-name-tag.center {
          font-size: 16px;
          color: var(--hero-gold);
        }
        .bottle-card.center .bottle-name-tag { margin-top: 14px; }
        .bottle-card.left .bottle-name-tag { color: var(--hero-warm-amber); }
        .bottle-card.right .bottle-name-tag { color: var(--hero-violet); }

        /* CTAs */
        .hero-cta-row {
          display: flex; flex-wrap: wrap;
          gap: 16px; justify-content: center; align-items: flex-start;
          margin-top: 24px;
        }
        .hero-cta-primary-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .quiz-reassurance {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: var(--hero-dim-gold);
          letter-spacing: 0.05em;
          text-align: center;
          margin-top: 8px;
        }
        .hero-cta-primary {
          background: var(--hero-gold);
          color: var(--hero-bg);
          padding: 15px 36px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Cinzel', serif;
          display: inline-flex; align-items: center; gap: 8px;
          border: none;
          cursor: pointer;
          transition: background 200ms ease, transform 200ms ease;
        }
        .hero-cta-primary:hover { background: var(--hero-gold-bright); transform: scale(1.03); }

        .hero-cta-primary:hover { background: var(--hero-gold-bright); transform: scale(1.03); }
        .hero-cta-secondary {
          background: transparent;
          border: 1px solid rgba(201,168,76,0.45);
          color: var(--hero-gold);
          padding: 15px 36px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Cinzel', serif;
          cursor: pointer;
          transition: background 200ms, border-color 200ms;
        }
        .hero-cta-secondary:hover {
          background: rgba(201,168,76,0.08);
          border-color: rgba(201,168,76,0.8);
        }

        /* Ground glow */
        .bottle-ground-glow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 50px;
          filter: blur(16px);
          z-index: 0;
          pointer-events: none;
        }
        .bottle-card.left .bottle-ground-glow {
          background: radial-gradient(
            ellipse at center,
            rgba(200, 140, 30, 0.20) 0%,
            transparent 70%
          );
        }
        .bottle-card.center .bottle-ground-glow {
          background: radial-gradient(
            ellipse at center,
            rgba(0, 200, 220, 0.22) 0%,
            transparent 70%
          );
        }
        .bottle-card.right .bottle-ground-glow {
          background: radial-gradient(
            ellipse at center,
            rgba(140, 50, 220, 0.20) 0%,
            transparent 70%
          );
        }

        /* Scroll hint */
        .scroll-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 5;
        }
        .scroll-hint span {
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(201,168,76,0.4);
          font-family: 'Cinzel', serif;
        }
        .scroll-arrow {
          color: rgba(201,168,76,0.4);
          font-size: 14px;
          animation: scrollPulse 3s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }


        /* Section atmosphere glows */
        .hero-atmosphere-left {
          position: absolute;
          top: 30%;
          left: 5%;
          width: 300px;
          height: 400px;
          background: radial-gradient(
            ellipse at center,
            rgba(180, 110, 20, 0.06) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 1;
          filter: blur(20px);
        }
        .hero-atmosphere-center {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 500px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 180, 200, 0.07) 0%,
            transparent 65%
          );
          pointer-events: none;
          z-index: 1;
          filter: blur(20px);
        }
        .hero-atmosphere-right {
          position: absolute;
          top: 30%;
          right: 5%;
          width: 300px;
          height: 400px;
          background: radial-gradient(
            ellipse at center,
            rgba(100, 30, 180, 0.07) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 1;
          filter: blur(20px);
        }

        @media (max-width: 1024px) {
          .bottle-card.center .bottle-img-wrap { width: 230px; }
          .bottle-card.side .bottle-img-wrap { width: 170px; }
        }
        @media (max-width: 768px) {
          .bottle-card.side { display: none; }
          .bottle-card.center .bottle-img-wrap { width: min(82vw, 300px); }
          .bottles-row { margin-top: 28px; }
          .hero-eyebrow { letter-spacing: 0.3em; line-height: 1.4; }
          .hero-headline { line-height: 1.15; letter-spacing: -0.005em; }
          .hero-subtext {
            max-width: min(94vw, 22rem);
            line-height: 1.55;
            letter-spacing: 0.015em;
          }
          .hero-subtext .mobile-break { display: inline; }
          .hero-cta-row { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; margin-top: 24px; }
          .hero-cta-primary, .hero-cta-secondary { justify-content: center; text-align: center; }
          .scroll-hint { display: none; }
        }
        @media (max-width: 380px) {
          .hero-eyebrow { margin-top: 0.5em; letter-spacing: 0.28em; }
          .hero-headline { font-size: clamp(1.875rem, 7vw, 2.25rem); }
          .hero-subtext { font-size: 0.9rem; line-height: 1.5; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bottle-card.center .bottle-img-wrap,
          .bottle-card.center .label-wrap::after,
          .best-match-badge,
          .scroll-arrow,
          .hero-cta-primary {
            animation: none !important;
          }
        }
      `}</style>

      <div className="hero-bg-blur" aria-hidden />
      <div className="hero-bg-overlay" aria-hidden />

      <div className="hero-atmosphere-left" aria-hidden />
      <div className="hero-atmosphere-center" aria-hidden />
      <div className="hero-atmosphere-right" aria-hidden />

      <div className="hero-content">
        <p className="hero-eyebrow">India's First AI Perfume Machine</p>
        <h1 className="hero-headline">
          <span>Your Custom Fragrance,</span>
          <span className="it">Crafted by AI</span>
        </h1>
        <p className="hero-subtext">
          India's first AI based perfume machine crafts your unique formula from 52 curated ingredients — no two fragrance alike.
        </p>

        <div className="bottles-row">
          {BOTTLES.map((b) => {
            const isCenter = b.variant === "center";
            const sideClass = isCenter ? "center" : `side ${b.variant}`;
            return (
              <div key={b.name} className={`bottle-card ${sideClass}`}>
                {isCenter && <div className="best-match-badge">✦ Signature</div>}
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
                  <div className="bottle-ground-glow" aria-hidden />
                </div>
                <div className={`bottle-name-tag ${isCenter ? "center" : ""}`}>{b.name}</div>
              </div>
            );
          })}
        </div>

        <div className="hero-cta-row">
          <div className="hero-cta-primary-wrap">
            <Link to="/shop/quiz" className="hero-cta-primary">
              Discover Your Scent <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <p className="quiz-reassurance">Starts at ₹700 · Free delivery · Tweak before you order</p>
          </div>
          <Link to="/collection" className="hero-cta-secondary">
            Browse the Library
          </Link>
        </div>
      </div>

      <div className="scroll-hint">
        <span>SCROLL TO EXPLORE</span>
        <span className="scroll-arrow">∨</span>
      </div>
    </section>
  );
};

export default Hero;
