import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Crown, Clock, ArrowRight, Truck } from "lucide-react";

const previews = [
  { icon: ShieldCheck, label: "Safe Favorite" },
  { icon: Sparkles, label: "Adventurous Twist" },
  { icon: Crown, label: "Signature Statement" },
];

const QuizResultPreview = () => {
  return (
    <section
      aria-label="What you'll receive from the quiz"
      className="w-full pb-12 md:pb-16 bg-background"
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <div
          className="quiz-result-preview rounded-2xl p-8 md:p-10 bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm"
        >
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.3em] text-primary/80 font-sans">
              What you'll receive
            </span>
            <h2 className="font-cormorant text-3xl md:text-4xl text-foreground mt-3 font-light">
              3 Unique Fragrances, Crafted for You
            </h2>
            <p className="text-sm md:text-base text-foreground/60 mt-4 leading-relaxed font-sans">
              Our AI analyzes your answers across 52 curated ingredients to compose three distinct
              matches. View your formulas, tweak the blend, then order in 30ml or 50ml.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-10 max-w-xl mx-auto">
            {previews.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/5 border border-primary/20">
                  <Icon className="w-5 h-5 text-primary/80" strokeWidth={1.25} />
                </div>
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-foreground/70 font-sans leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop/quiz"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-sans"
            >
              See Your Matches
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-foreground/50 font-sans">
              <Clock className="w-3.5 h-3.5" />
              Takes about 2 minutes
            </span>
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-foreground/50 font-sans uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>3 Unique Recommendations</span>
            </div>
            <span className="hidden sm:inline text-foreground/20">·</span>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-foreground/50 font-sans uppercase">
              <Truck className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>Fast 7-Day Delivery</span>
            </div>
            <span className="hidden sm:inline text-foreground/20">·</span>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.15em] text-foreground/50 font-sans uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--bz-gold-muted))]" strokeWidth={1.5} />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .quiz-result-preview {
          opacity: 0;
          animation: quiz-result-preview-in 700ms ease-out forwards;
        }
        @keyframes quiz-result-preview-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .quiz-result-preview {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default QuizResultPreview;
