import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { WordReveal } from "@/components/anim/WordReveal";

const QuizCTABanner = () => {
  return (
    <section
      className="w-full py-16 md:py-20"
      style={{ backgroundColor: "#0A0805" }}
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <blockquote className="relative">
            <span
              aria-hidden
              className="font-display text-gold absolute -top-8 -left-2 select-none"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.15 }}
            >
              "
            </span>
            <WordReveal
              text="Every human deserves a scent that is entirely their own."
              as="p"
              className="font-display italic text-cream text-3xl md:text-[52px] leading-[1.1]"
              stagger={30}
            />
          </blockquote>

          <Reveal
            variant="item"
            delay={200}
            className="md:pl-12 md:border-l"
            style={{ borderColor: "hsl(var(--bz-gold) / 0.25)" }}
          >
            <p className="font-body text-cream-muted text-base md:text-lg leading-relaxed mb-8">
              Take our 2-minute quiz and let Bazuki's AI engineer your personal fragrance — from
              memory to molecule.
            </p>
            <div className="inline-flex flex-col items-center">
              <Link
                to="/shop/quiz"
                className="font-body inline-flex items-center gap-2 rounded-pill px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md transition-all duration-200"
              >
                Begin Your Scent Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p
                className="font-body text-center"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8B6914", letterSpacing: "0.05em", marginTop: "8px" }}
              >
                Starts at ₹700 · Free delivery · Tweak before you order
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default QuizCTABanner;
