import { Link } from "react-router-dom";
import { MessageSquare, Atom, FlaskConical, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    n: "01",
    Icon: MessageSquare,
    title: "Take the Quiz",
    body: "7 questions about your personality, memories, and preferences.",
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
    body: "3 custom 5ml bottles arrive at your door, labeled with your formula ID.",
  },
];

const HowItWorks = () => {
  const { ref: lineRef, inView: lineIn } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="relative w-full bg-bz-secondary py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <Reveal variant="headline" as="h2" className="font-display text-center text-cream text-4xl md:text-[48px] leading-tight mb-16 md:mb-20">
          Three Steps to Your Signature Scent
        </Reveal>

        <div className="relative" ref={lineRef}>
          {/* Connecting dashed gold line — animated draw (desktop) */}
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

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 relative">
            {STEPS.map(({ n, Icon, title, body }, i) => (
              <Reveal
                key={n}
                variant="item"
                delay={i * 80}
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

        <Reveal variant="item" delay={300} className="mt-14 flex justify-center">
          <Link
            to="/shop/quiz"
            className="font-body inline-flex items-center gap-2 rounded-pill px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md transition-all duration-200"
          >
            Start the Quiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
