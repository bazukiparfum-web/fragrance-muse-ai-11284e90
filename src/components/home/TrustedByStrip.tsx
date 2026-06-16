import { CLIENT_LOGOS } from "@/data/clientLogos";

const TrustedByStrip = () => {
  const logos = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <section
      aria-label="Trusted by"
      className="tbs-section"
    >
      <div className="tbs-label-row" aria-hidden="false">
        <span className="tbs-line" />
        <span className="tbs-label">TRUSTED BY</span>
        <span className="tbs-line" />
      </div>

      <div className="tbs-marquee-mask">
        <div className="tbs-marquee-track">
          {logos.map((logo, i) => (
            <span key={`${logo.name}-${i}`} className="tbs-logo-wrap">
              <img
                src={logo.src}
                alt={logo.name}
                loading="lazy"
                className="tbs-logo-img"
              />
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .tbs-section {
          width: 100%;
          height: 80px;
          background: #0A0805;
          border-top: 1px solid rgba(201,168,76,0.1);
          border-bottom: 1px solid rgba(201,168,76,0.1);
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .tbs-label-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 8px;
        }
        .tbs-line {
          display: inline-block;
          width: 36px;
          height: 1px;
          background: rgba(201,168,76,0.5);
        }
        .tbs-label {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 4px;
          color: #8B6914;
          text-transform: uppercase;
          line-height: 1;
        }

        .tbs-marquee-mask {
          flex: 1;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%);
          display: flex;
          align-items: center;
        }
        .tbs-marquee-track {
          display: flex;
          align-items: center;
          gap: 56px;
          width: max-content;
          animation: tbs-marquee 35s linear infinite;
        }
        .tbs-marquee-mask:hover .tbs-marquee-track {
          animation-play-state: paused;
        }

        .tbs-logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
        }
        .tbs-logo-img {
          height: 28px;
          max-width: 110px;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%) brightness(1.8) opacity(0.5);
          transition: filter 300ms ease;
        }
        .tbs-logo-img:hover {
          filter: grayscale(0%) brightness(1) opacity(1);
        }

        @keyframes tbs-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .tbs-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default TrustedByStrip;
