import { Link } from "react-router-dom";
import { MessageSquare, Atom, FlaskConical, ArrowRight, ShieldCheck, Sparkles, Crown, Clock, Truck } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    n: "01",
    Icon: MessageSquare,
    title: "Take the Quiz",
    body: "A 16-question journey through your personality, memories, and preferences.",
  },
  {
    n: "02",
    Icon: Atom,
    title: "AI Formulates",
    body: "Our engine selects from 52 curated ingredients to build your unique profile.",
  },
  {
    n: "03",
    Icon: FlaskConical,
    title: "Receive Your Scents",
    body: "3 custom 30ml bottles arrive at your door, labeled with your formula ID.",
  },
];

const OUTCOMES = [
  { Icon: ShieldCheck, label: "Safe Favorite" },
  { Icon: Sparkles, label: "Adventurous Twist" },
  { Icon: Crown, label: "Signature Statement" },
];

const HowItWorks = () => {
  const { ref: lineRef, inView: lineIn } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const { ref: dividerRef, inView: dividerIn } = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#111111", padding: "80px 0" }}
    >
      <div className="container mx-auto px-6">
        {/* PART A — Header */}
        <Reveal variant="headline" className="text-center max-w-2xl mx-auto">
          <div
            className="font-display"
            style={{
              fontSize: "10px",
              color: "#C9A84C",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            How It Works
          </div>
          <h2
            className="font-cormorant"
            style={{
              color: "#F5F0E8",
              fontWeight: 300,
              lineHeight: 1.15,
            }}
          >
            <span className="block text-[28px] md:text-[42px]">
              Three Steps to Your Signature Scent
            </span>
          </h2>
          <p
            className="font-body mx-auto"
            style={{
              fontSize: "15px",
              color: "#C8C0B0",
              maxWidth: "520px",
              marginTop: "16px",
              lineHeight: 1.6,
            }}
          >
            Our AI analyzes your answers across 52 curated ingredients to compose three distinct matches.
          </p>
        </Reveal>

        {/* PART B — 3 step cards */}
        <div className="relative mt-10 md:mt-10" ref={lineRef} style={{ marginTop: "40px" }}>
          {/* Desktop dashed connector */}
          <svg
            aria-hidden
            className="hidden md:block absolute top-[120px] left-[16%] right-[16%] h-px overflow-visible pointer-events-none"
            width="100%"
            height="2"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="hsl(var(--bz-gold) / 0.45)"
              strokeWidth="1"
              strokeDasharray="8 8"
              pathLength={100}
              style={{
                strokeDashoffset: lineIn ? 0 : 100,
                transition: "stroke-dashoffset 1s ease-out 0.2s",
                willChange: lineIn ? undefined : "stroke-dashoffset",
              }}
            />
          </svg>

          {/* Mobile vertical dashed connector */}
          <div
            aria-hidden
            className="md:hidden absolute top-12 bottom-12 left-[34px] pointer-events-none"
            style={{
              borderLeft: "1px dashed hsl(var(--bz-gold) / 0.25)",
            }}
          />

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 relative">
            {STEPS.map(({ n, Icon, title, body }, i) => (
              <Reveal
                key={n}
                variant="item"
                delay={i * 100}
                className="relative rounded-lg p-10 bg-transparent overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:glow-gold-sm"
                style={{ border: "1px solid hsl(var(--bz-gold) / 0.1)" }}
              >
                <span
                  aria-hidden
                  className="font-display absolute -top-6 -left-2 text-gold pointer-events-none select-none"
                  style={{ fontSize: "120px", lineHeight: 1, opacity: 0.05 }}
                >
                  {n}
                </span>

                <div className="relative">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6"
                    style={{
                      border: "1px solid hsl(var(--bz-gold) / 0.3)",
                      background: "hsl(var(--bz-bg-primary))",
                    }}
                  >
                    <Icon className="w-6 h-6 text-gold" strokeWidth={1.25} />
                  </div>
                  <h3 className="font-display text-cream text-2xl md:text-[28px] mb-3">{title}</h3>
                  <p className="font-body text-body text-sm leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* PART C — Divider + WHAT YOU'LL RECEIVE */}
        <div
          ref={dividerRef}
          aria-hidden
          className="mx-auto"
          style={{
            height: "1px",
            backgroundColor: "rgba(201,168,76,0.15)",
            margin: "40px auto",
            width: dividerIn ? "80%" : "0%",
            transition: "width 500ms ease-out",
          }}
        />

        <div className="text-center">
          <div
            className="font-display"
            style={{
              fontSize: "9px",
              color: "#8B6914",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            What You'll Receive
          </div>

          <div className="flex flex-row justify-center items-start gap-6 md:gap-12 max-w-xl mx-auto">
            {OUTCOMES.map(({ Icon, label }, i) => (
              <Reveal
                key={label}
                variant="item"
                delay={i * 100}
                className="flex flex-col items-center text-center gap-3 flex-1"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "hsl(var(--bz-gold) / 0.05)",
                    border: "1px solid hsl(var(--bz-gold) / 0.2)",
                  }}
                >
                  <Icon className="w-5 h-5 text-gold/80" strokeWidth={1.25} />
                </div>
                <span
                  className="font-body uppercase leading-tight"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    color: "#C8C0B0",
                  }}
                >
                  {label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* PART D — CTA + trust badges + reassurance */}
        <Reveal variant="item" delay={400} className="mt-8 flex flex-col items-center" style={{ marginTop: "32px" }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/shop/quiz"
              className="font-body inline-flex items-center justify-center gap-2 rounded-pill px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md transition-all duration-200 w-full sm:w-auto"
            >
              Start the Quiz
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-cream/60 font-body">
              <Clock className="w-3.5 h-3.5" />
              Takes about 2 minutes
            </span>
          </div>

          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{ marginTop: "16px" }}
          >
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-cream/50 font-body uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>3 Unique Recommendations</span>
            </div>
            <span className="hidden sm:inline text-cream/20">·</span>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-cream/50 font-body uppercase">
              <Truck className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>Fast 7-Day Delivery</span>
            </div>
            <span className="hidden sm:inline text-cream/20">·</span>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-cream/50 font-body uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>Secure Checkout</span>
            </div>
          </div>

          <p
            className="font-body text-center"
            style={{
              fontSize: "11px",
              color: "#8B6914",
              letterSpacing: "0.05em",
              marginTop: "8px",
            }}
          >
            Starts at ₹700 · Free delivery · Tweak before you order
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
