import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ClientLogo } from "@/data/clientLogos";

interface TrustedByCarouselProps {
  logos: ClientLogo[];
  eyebrow?: string;
  title?: string;
  className?: string;
  /** Visible heading on About page; sr-only on Business strip */
  headingVisible?: boolean;
}

const LogoTile = ({ logo }: { logo: ClientLogo }) => {
  const content = (
    <span className="tb-logo-wrap group/logo">
      <img
        src={logo.src}
        alt={logo.name}
        loading="lazy"
        className="tb-logo-img"
      />
      <span className="tb-tooltip" role="tooltip">
        {logo.name}
        <span className="tb-tooltip-arrow" aria-hidden="true" />
      </span>
    </span>
  );
  return logo.href ? (
    <a
      href={logo.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={logo.name}
      className="tb-logo-link"
    >
      {content}
    </a>
  ) : (
    content
  );
};

export const TrustedByCarousel = ({
  logos,
  eyebrow = "Trusted By",
  title = "Brands that trust Bazuki",
  className,
  headingVisible = true,
}: TrustedByCarouselProps) => {
  if (!logos || logos.length === 0) return null;

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const marqueeLogos = [...logos, ...logos];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trusted-by-heading"
      className={cn("tb-section", inView && "is-in", className)}
    >
      <span className="tb-border tb-border-top" aria-hidden="true" />
      <span className="tb-border tb-border-bottom" aria-hidden="true" />
      <span className="tb-glow" aria-hidden="true" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <div className="tb-eyebrow" aria-hidden={false}>
            <span className="tb-eyebrow-line tb-eyebrow-line-left" />
            <span className="tb-eyebrow-text">{eyebrow}</span>
            <span className="tb-eyebrow-line tb-eyebrow-line-right" />
          </div>
          <h2
            id="trusted-by-heading"
            className={cn(
              "mt-3 font-serif font-light text-cream text-[26px] md:text-[34px]",
              !headingVisible && "sr-only",
            )}
          >
            {title}
          </h2>
        </div>

        <div className="tb-marquee-mask">
          <div className="tb-marquee-track">
            {marqueeLogos.map((logo, i) => (
              <LogoTile key={`${logo.name}-${i}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tb-section {
          position: relative;
          padding: 64px 0;
          background: #0D0C0A;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .tb-section { padding: 80px 0; }
        }
        .tb-border {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 1px;
          background: rgba(201,168,76,0.15);
          transition: width 600ms ease-out;
        }
        .tb-border-top { top: 0; }
        .tb-border-bottom { bottom: 0; }
        .tb-section.is-in .tb-border { width: 100%; }

        .tb-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 800px 120px at center, rgba(201,168,76,0.04) 0%, transparent 70%);
        }

        .tb-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .tb-eyebrow-line {
          display: inline-block;
          width: 0;
          height: 1px;
          background: rgba(201,168,76,0.5);
          transition: width 400ms ease-out 200ms;
        }
        .tb-section.is-in .tb-eyebrow-line { width: 40px; }
        .tb-eyebrow-text {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #C9A84C;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0;
          transition: opacity 300ms ease-out 200ms;
        }
        .tb-section.is-in .tb-eyebrow-text { opacity: 1; }

        .tb-marquee-mask {
          overflow: hidden;
          opacity: 0;
          transition: opacity 400ms ease-out 300ms;
          mask-image: linear-gradient(to right, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%);
        }
        .tb-section.is-in .tb-marquee-mask { opacity: 1; }

        .tb-marquee-track {
          display: flex;
          align-items: center;
          gap: 80px;
          width: max-content;
          padding: 8px 0;
          animation: tb-marquee 35s linear infinite;
          animation-play-state: paused;
          animation-delay: 700ms;
        }
        .tb-section.is-in .tb-marquee-track { animation-play-state: running; }
        .tb-marquee-mask:hover .tb-marquee-track { animation-play-state: paused; }

        .tb-logo-link { display: inline-flex; }
        .tb-logo-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 52px;
          transition: transform 200ms ease-out;
        }
        .tb-logo-img {
          height: 52px;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          filter: grayscale(100%) brightness(0.75);
          opacity: 0.55;
          transition: filter 300ms ease, opacity 300ms ease;
        }
        .tb-logo-wrap:hover { transform: translateY(-3px); }
        .tb-logo-wrap:hover .tb-logo-img {
          filter: grayscale(0%) brightness(1);
          opacity: 1;
        }

        .tb-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translate(-50%, 4px);
          background: #1A1408;
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 6px;
          padding: 6px 10px;
          color: #C9A84C;
          font-size: 11px;
          letter-spacing: 0.1em;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease;
          z-index: 5;
        }
        .tb-tooltip-arrow {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid rgba(201,168,76,0.4);
        }
        .tb-logo-wrap:hover .tb-tooltip {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        @keyframes tb-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tb-border,
          .tb-eyebrow-line,
          .tb-eyebrow-text,
          .tb-marquee-mask { transition: none; }
          .tb-marquee-track { animation: none; }
          .tb-section .tb-border { width: 100%; }
          .tb-section .tb-eyebrow-line { width: 40px; }
          .tb-section .tb-eyebrow-text,
          .tb-section .tb-marquee-mask { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default TrustedByCarousel;
