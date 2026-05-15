import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuizCTABanner = () => {
  return (
    <section
      className="w-full py-20 md:py-28"
      style={{ background: "linear-gradient(90deg, #1A0F00 0%, #080808 100%)" }}
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
            <p className="font-display italic text-cream text-3xl md:text-[52px] leading-[1.1]">
              Every human deserves a scent that is entirely their own.
            </p>
          </blockquote>

          <div
            className="md:pl-12 md:border-l"
            style={{ borderColor: "hsl(var(--bz-gold) / 0.25)" }}
          >
            <p className="font-body text-cream-muted text-base md:text-lg leading-relaxed mb-8">
              Take our 2-minute quiz and let Bazuki's AI engineer your personal fragrance — from
              memory to molecule.
            </p>
            <Link
              to="/quiz"
              className="font-body inline-flex items-center gap-2 rounded-pill px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-md transition-all duration-200"
            >
              Begin Your Scent Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizCTABanner;
