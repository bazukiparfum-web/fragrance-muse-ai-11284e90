import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroBottleTeal from "@/assets/hero-bottle-teal.png.asset.json";
import CampaignBottle from "@/components/hero/CampaignBottle";

const Hero = () => {
  const bottleUrl = heroBottleTeal.url;

  return (
    <section
      className="bz-hero relative w-full overflow-hidden"
      aria-label="Bazuki signature fragrance campaign"
    >
      <style>{`
        .bz-hero {
          background-color: #0A0805;
          min-height: 100vh;
        }
        .bz-hero-bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transform: scale(1.1);
          filter: blur(40px) brightness(0.25) saturate(0.6);
          z-index: 0;
          pointer-events: none;
        }
        .bz-hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at center,
            rgba(0,180,200,0.04) 0%,
            rgba(10,8,5,0.7) 60%,
            rgba(10,8,5,0.95) 100%);
          z-index: 1;
          pointer-events: none;
        }
        .bz-hero-content {
          position: relative; z-index: 2;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 96px 24px 64px;
          gap: 48px;
        }

        /* TEXT */
        .bz-eyebrow {
          color: #C9A84C;
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          margin-bottom: 16px;
          opacity: 0;
          animation: bz-text-up 500ms ease-out 0ms forwards;
        }
        .bz-headline {
          font-family: 'Cormorant Garamond', serif;
          color: #F5F0E8;
          font-weight: 300;
          line-height: 1.1;
          font-size: clamp(36px, 6vw, 60px);
          text-align: center;
          margin-bottom: 12px;
          opacity: 0;
          animation: bz-text-up 500ms ease-out 80ms forwards;
        }
        .bz-headline .bz-italic { font-style: italic; display: block; }
        .bz-subtext {
          color: #C8C0B0;
          font-size: 16px;
          line-height: 1.7;
          text-align: center;
          font-family: 'Inter', sans-serif;
          max-width: 520px;
          margin: 0 auto;
          opacity: 0;
          animation: bz-text-up 500ms ease-out 160ms forwards;
        }

        /* BOTTLES ROW */
        .bz-bottles-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          width: 100%;
        }

        .bz-bottle-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
        }
        .bz-bottle-wrap {
          position: relative;
          transition: transform 200ms ease-out, opacity 200ms ease-out;
        }
        .bz-bottle-inner {
          position: relative;
          width: 100%;
          isolation: isolate;
        }
        .bz-bottle-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          mix-blend-mode: screen;
          filter: brightness(1.05)
                  drop-shadow(0 20px 40px rgba(0,0,0,0.8))
                  drop-shadow(0 0 30px rgba(0,180,200,0.12));
        }


        /* Side bottles */
        .bz-bottle-side .bz-bottle-wrap {
          width: 260px;
          opacity: 0.88;
          transform: translateY(20px);
        }
        .bz-bottle-side .bz-bottle-wrap:hover {
          transform: translateY(10px) scale(0.90 / 0.82);
          opacity: 1;
        }
        .bz-bottle-side:hover .bz-bottle-wrap {
          opacity: 1;
          transform: translateY(10px) scale(1.10);
        }
        .bz-bottle-side:hover .bz-label-svg { filter: brightness(1.15); }

        /* Center bottle */
        .bz-bottle-center .bz-bottle-wrap {
          width: 320px;
          transform: translateY(0) scale(1);
        }
        .bz-bottle-center:hover .bz-bottle-wrap {
          transform: scale(1.04);
        }
        .bz-bottle-center:hover .bz-center-glow {
          opacity: 1;
        }

        .bz-center-glow {
          position: absolute; inset: -10%;
          background: radial-gradient(ellipse 60% 70% at center,
            rgba(0,180,200,0.18) 0%,
            rgba(201,168,76,0.06) 35%,
            transparent 70%);
          z-index: 0;
          opacity: 0.7;
          transition: opacity 300ms ease-out;
          pointer-events: none;
          filter: blur(8px);
        }

        /* Float animation */
        .bz-bottle-inner {
          animation: bz-float 4s ease-in-out infinite;
        }
        .bz-bottle-center .bz-bottle-inner { animation-delay: -1s; }
        .bz-bottle-side:nth-of-type(odd) .bz-bottle-inner { animation-delay: -2s; }

        /* Label */
        .bz-label-wrap {
          position: absolute;
          top: 42%;
          left: 50%;
          width: 62%;
          transform: translate(-50%, -50%) perspective(500px) rotateY(-5deg);
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
          border-radius: 8px;
        }
        .bz-label-svg {
          width: 100%; height: auto; display: block;
          transition: filter 200ms ease-out;
        }

        /* Shimmer */
        .bz-shimmer {
          position: absolute;
          top: 0; left: -40%;
          width: 40%; height: 100%;
          background: linear-gradient(110deg,
            transparent 0%,
            rgba(255,255,255,0.08) 50%,
            transparent 100%);
          pointer-events: none;
          opacity: 0;
        }
        .bz-shimmer-loop {
          animation: bz-shimmer 8s ease-in-out 1300ms infinite;
        }
        .bz-bottle-center:hover .bz-shimmer {
          animation: bz-shimmer 800ms ease-out;
        }

        /* Name tag */
        .bz-name-tag {
          margin-top: 16px;
          text-align: center;
          opacity: 0;
          animation: bz-name-in 400ms ease-out forwards;
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
        }
        .bz-name-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          color: #C9A84C;
          letter-spacing: 0.05em;
        }
        .bz-best-match {
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 10px;
          color: #C9A84C;
          letter-spacing: 0.1em;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
        }

        /* CTAs */
        .bz-cta-row {
          display: flex; flex-wrap: wrap;
          gap: 16px; justify-content: center;
          margin-top: 12px;
          opacity: 0;
          animation: bz-text-up 500ms ease-out 1900ms forwards;
        }
        .bz-cta-primary {
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
        .bz-cta-primary:hover {
          background: #F0C040;
          transform: scale(1.03);
        }
        .bz-cta-secondary {
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
        .bz-cta-secondary:hover {
          background: rgba(201,168,76,0.06);
          border-color: #C9A84C;
        }

        /* Entry animations */
        .bz-entry-left { animation: bz-entry-left 600ms ease-out 400ms forwards; }
        .bz-entry-right { animation: bz-entry-right 600ms ease-out 500ms forwards; }
        .bz-entry-up { animation: bz-entry-up 700ms ease-out 600ms forwards; }

        @keyframes bz-text-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bz-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bz-shimmer {
          0% { left: -40%; opacity: 0; }
          10% { opacity: 1; }
          50% { opacity: 1; }
          60% { left: 110%; opacity: 0; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes bz-name-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bz-entry-left {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 0.88; transform: translateX(0); }
        }
        @keyframes bz-entry-right {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 0.88; transform: translateX(0); }
        }
        @keyframes bz-entry-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tablet */
        @media (max-width: 1024px) and (min-width: 768px) {
          .bz-bottle-center .bz-bottle-wrap { width: 240px; }
          .bz-bottle-side .bz-bottle-wrap { width: 180px; }
          .bz-bottles-row { gap: 20px; }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .bz-hero-content { padding: 80px 20px 56px; gap: 32px; text-align: center; }
          .bz-bottle-side { display: none; }
          .bz-bottles-row { gap: 0; }
          .bz-bottle-center .bz-bottle-wrap { width: 85vw; max-width: 340px; }
          .bz-cta-row { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
          .bz-cta-primary, .bz-cta-secondary { justify-content: center; text-align: center; }
        }


        @media (prefers-reduced-motion: reduce) {
          .bz-bottle-inner, .bz-shimmer-loop,
          .bz-eyebrow, .bz-headline, .bz-subtext,
          .bz-name-tag, .bz-cta-row,
          .bz-entry-left, .bz-entry-right, .bz-entry-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Blurred ambient background */}
      <img src={bottleUrl} alt="" aria-hidden className="bz-hero-bg" />
      <div className="bz-hero-overlay" aria-hidden />

      <div className="bz-hero-content">
        {/* Text */}
        <div className="flex flex-col items-center">
          <p className="bz-eyebrow">AI-Crafted · Made in India</p>
          <h1 className="bz-headline">
            <span>Your Scent,</span>
            <span className="bz-italic">Engineered by AI.</span>
          </h1>
          <p className="bz-subtext">
            Three formulas. Crafted uniquely for you. No two bottles alike.
          </p>
        </div>

        {/* Bottles */}
        <div className="bz-bottles-row">
          <CampaignBottle
            imageUrl={bottleUrl}
            line1="Timeless"
            line2="Harmony"
            displayName="Timeless Harmony"
            variant="side"
            entryClass="bz-entry-left"
            nameDelayMs={1700}
          />
          <CampaignBottle
            imageUrl={bottleUrl}
            line1="Signature"
            line2="Essence"
            displayName="Signature Essence"
            variant="center"
            entryClass="bz-entry-up"
            nameDelayMs={1700}
          />
          <CampaignBottle
            imageUrl={bottleUrl}
            line1="Modern"
            line2="Classic"
            displayName="Modern Classic"
            variant="side"
            entryClass="bz-entry-right"
            nameDelayMs={1700}
          />
        </div>

        {/* CTAs */}
        <div className="bz-cta-row">
          <Link to="/shop/quiz" className="bz-cta-primary">
            Discover Your Scent <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link to="/collection" className="bz-cta-secondary">
            Browse the Library
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
