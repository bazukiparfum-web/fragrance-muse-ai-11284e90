import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import heroBottle from "@/assets/hero-bottle.png";
import FloatingNoteTag, { NOTE_FAMILIES } from "@/components/hero/FloatingNoteTag";

const GOLD = "#C9A84C";
const CREAM = "#F5ECD7";
const AMBER = "#7B4A1E";
const BLACK = "#080808";
const SUB = "#8A7A6A";
const MICRO = "#6B5D50";

type NoteTag = {
  family: keyof typeof NOTE_FAMILIES;
  position: CSSProperties;
  driftClass: string;
  startIndex: number;
  intervalMs: number;
};

const NOTE_TAGS: NoteTag[] = [
  { family: "green",  position: { top: "12%", left: "8%" },      driftClass: "bz-drift-1", startIndex: 0, intervalMs: 3500 },
  { family: "citrus", position: { top: "30%", right: "6%" },     driftClass: "bz-drift-2", startIndex: 1, intervalMs: 3800 },
  { family: "wood",   position: { bottom: "26%", left: "4%" },   driftClass: "bz-drift-3", startIndex: 2, intervalMs: 3300 },
  { family: "floral", position: { bottom: "10%", right: "10%" }, driftClass: "bz-drift-4", startIndex: 1, intervalMs: 4000 },
];

const MARQUEE_NOTES = [
  "Vetiver", "Oud", "Bergamot", "Sandalwood",
  "Rose", "Amber", "Musk", "Patchouli",
];

// Tiny inline noise SVG (data URI) for film-grain overlay
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

const Hero = () => {
  return (
    <section
      className="relative w-full h-screen min-h-[640px] overflow-hidden"
      style={{ backgroundColor: BLACK }}
      aria-label="Hero"
    >
      {/* Scoped styles for animations */}
      <style>{`
        @keyframes bz-orb-a {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(60px,-40px) scale(1.15); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes bz-orb-b {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(-50px,30px) scale(1.1); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes bz-bounce-down {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50%     { transform: translateY(6px); opacity: 0.8; }
        }
        @keyframes bz-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bz-drift-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-12px,10px); } }
        @keyframes bz-drift-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(14px,-8px); } }
        @keyframes bz-drift-3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-10px,-12px); } }
        @keyframes bz-drift-4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(12px,12px); } }
        .bz-drift-1 { animation: bz-drift-1 9s ease-in-out infinite; }
        .bz-drift-2 { animation: bz-drift-2 11s ease-in-out infinite; animation-delay: -2s; }
        .bz-drift-3 { animation: bz-drift-3 13s ease-in-out infinite; animation-delay: -4s; }
        .bz-drift-4 { animation: bz-drift-4 10s ease-in-out infinite; animation-delay: -6s; }
        .hero-bottle-wrap:hover ~ * .hero-note-tag,
        .hero-right-col:hover .hero-note-tag { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .bz-drift-1, .bz-drift-2, .bz-drift-3, .bz-drift-4 { animation: none; }
        }
      `}</style>

      {/* Orb A — bottom-left amber */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: "-15%",
          bottom: "-20%",
          width: "70vw",
          height: "70vw",
          maxWidth: "900px",
          maxHeight: "900px",
          background: `radial-gradient(closest-side, ${AMBER}26, transparent 70%)`,
          filter: "blur(40px)",
          animation: "bz-orb-a 20s ease-in-out infinite",
        }}
      />
      {/* Orb B — top-right gold */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "-15%",
          top: "-20%",
          width: "65vw",
          height: "65vw",
          maxWidth: "850px",
          maxHeight: "850px",
          background: `radial-gradient(closest-side, ${GOLD}14, transparent 70%)`,
          filter: "blur(50px)",
          animation: "bz-orb-b 22s ease-in-out infinite",
        }}
      />

      {/* Film-grain noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("${NOISE_DATA_URI}")`,
          backgroundRepeat: "repeat",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-6 flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 w-full pt-20 md:pt-0">
          {/* Left column — 60% (3/5) */}
          <div className="md:col-span-3 flex flex-col justify-center">
            {/* Eyebrow */}
            <p
              className="font-sans uppercase mb-6"
              style={{
                color: GOLD,
                fontSize: "10px",
                letterSpacing: "0.3em",
              }}
            >
              AI-Crafted · Made in India
            </p>

            {/* Headline */}
            <h1
              className="font-cormorant"
              style={{
                color: CREAM,
                fontWeight: 300,
                lineHeight: 1.1,
                fontSize: "clamp(42px, 7vw, 72px)",
                letterSpacing: "-0.01em",
              }}
            >
              <span className="block">Your Scent,</span>
              <span className="block italic" style={{ color: CREAM }}>
                Engineered by AI.
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="font-sans mt-6"
              style={{
                color: SUB,
                fontSize: "16px",
                lineHeight: 1.7,
                maxWidth: "420px",
              }}
            >
              A personalised AI journey. Receive 3 perfumes crafted uniquely for you —
              no two bottles alike.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop/quiz"
                className="group inline-flex items-center gap-2 transition-all duration-300"
                style={{
                  backgroundColor: GOLD,
                  color: "#000",
                  padding: "14px 32px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.filter = "brightness(1.1)";
                  t.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  t.style.filter = "";
                  t.style.transform = "";
                }}
              >
                Discover Your Scent
                <ArrowRight size={14} strokeWidth={2} />
              </Link>

              <Link
                to="/collection"
                className="inline-flex items-center transition-colors duration-300"
                style={{
                  border: `1px solid ${GOLD}`,
                  color: CREAM,
                  padding: "14px 32px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${GOLD}33`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                Browse the Library
              </Link>
            </div>

            {/* Trust micro-stats */}
            <div
              className="mt-10 flex flex-wrap items-center"
              style={{
                color: MICRO,
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {["2,000+ Unique Formulas", "AI-Matched Accuracy", "Ships Across India"].map(
                (t, i) => (
                  <div key={t} className="flex items-center">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="inline-block mx-4"
                        style={{
                          width: "1px",
                          height: "12px",
                          backgroundColor: `${GOLD}80`,
                        }}
                      />
                    )}
                    <span>{t}</span>
                  </div>
                )
              )}
            </div>

            {/* Mobile-only marquee */}
            <div className="md:hidden mt-10 -mx-6 overflow-hidden" style={{ borderTop: `1px solid ${GOLD}33`, borderBottom: `1px solid ${GOLD}33` }}>
              <div
                className="flex whitespace-nowrap py-3"
                style={{ animation: "bz-marquee 25s linear infinite" }}
              >
                {[...MARQUEE_NOTES, ...MARQUEE_NOTES].map((note, i) => (
                  <span
                    key={i}
                    className="font-sans"
                    style={{
                      color: CREAM,
                      fontSize: "11px",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      padding: "0 18px",
                    }}
                  >
                    {note} ·
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — 40% (2/5) — desktop only */}
          <div className="hidden md:flex md:col-span-2 relative items-center justify-center hero-right-col">
            {/* Floating note tags — drift around and cycle through note names */}
            {NOTE_TAGS.map((tag, i) => (
              <FloatingNoteTag
                key={i}
                family={tag.family}
                position={tag.position}
                driftClass={tag.driftClass}
                startIndex={tag.startIndex}
                intervalMs={tag.intervalMs}
              />
            ))}

            {/* Bottle */}
            <div className="relative hero-bottle-wrap" style={{ width: 260, height: 400 }}>
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(201,168,76,0.32), transparent 70%)",
                  filter: "blur(36px)",
                  animation: "bz-bottle-glow 6s ease-in-out infinite",
                }}
              />
              <img
                src={heroBottle}
                alt="Bazuki signature perfume bottle"
                width={1024}
                height={1536}
                loading="eager"
                decoding="async"
                // @ts-expect-error – fetchpriority is a valid HTML attribute
                fetchpriority="low"
                className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
                style={{ animation: "bz-bob 6s ease-in-out infinite", willChange: "transform" }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ bottom: "28px", color: GOLD, opacity: 0.4 }}
      >
        <span
          className="font-sans"
          style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase" }}
        >
          Scroll to explore
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          style={{ animation: "bz-bounce-down 1.8s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
};

export default Hero;
