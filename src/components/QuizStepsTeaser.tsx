import { Link } from "react-router-dom";
import { ClipboardList, Sparkles, Package } from "lucide-react";

const steps = [
  {
    step: "Step 01",
    icon: ClipboardList,
    title: "Take the Quiz",
    desc: "Tell us your preferences",
  },
  {
    step: "Step 02",
    icon: Sparkles,
    title: "AI Formulates",
    desc: "Custom scent profile synthesis",
  },
  {
    step: "Step 03",
    icon: Package,
    title: "3 Bottles Delivered",
    desc: "Your signature trio at your door",
  },
];

const QuizStepsTeaser = () => {
  return (
    <section
      aria-label="Start your fragrance quiz"
      className="w-full py-12 md:py-16 bg-background"
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <Link to="/shop/quiz" className="group block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isFirst = i === 0;
              const isLast = i === steps.length - 1;
              return (
                <div
                  key={s.step}
                  className={[
                    "quiz-step-card relative flex flex-col items-center p-8",
                    "bg-foreground/[0.04] border border-foreground/10 backdrop-blur-sm",
                    "rounded-2xl",
                    isFirst ? "md:rounded-r-none md:border-r-0" : "",
                    isLast ? "md:rounded-l-none md:border-l-0" : "",
                    !isFirst && !isLast ? "md:rounded-none md:border-x-0" : "",
                    "transition-all duration-500 ease-out",
                    "group-hover:bg-foreground/[0.07] group-hover:border-foreground/20",
                    "hover:-translate-y-1",
                  ].join(" ")}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span
                    className="text-[10px] uppercase tracking-[0.3em] mb-4 font-sans bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, hsl(var(--bz-cream)) 0%, hsl(var(--bz-gold)) 50%, hsl(var(--bz-gold-muted)) 100%)",
                    }}
                  >
                    {s.step}
                  </span>
                  <div className="mb-6 text-foreground/80">
                    <Icon className="w-8 h-8" strokeWidth={1} />
                  </div>
                  <h3 className="font-cormorant text-xl text-foreground font-light text-center">
                    {s.title}
                  </h3>
                  <p className="text-xs text-foreground/40 mt-2 text-center font-sans tracking-wide">
                    {s.desc}
                  </p>
                </div>
              );
            })}

            {/* Connector dots between cards (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[33%] w-8 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent -translate-y-1/2 pointer-events-none" />
            <div className="hidden md:block absolute top-1/2 left-[66%] w-8 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="mt-8 text-center flex items-center justify-center gap-3 group-hover:gap-5 transition-all duration-500">
            <div className="h-px w-12 bg-primary/30" />
            <span className="text-[11px] font-sans tracking-[0.4em] uppercase text-primary">
              Begin Your Journey
            </span>
            <div className="h-px w-12 bg-primary/30" />
          </div>
        </Link>
      </div>

      <style>{`
        .quiz-step-card {
          opacity: 0;
          animation: quiz-step-fade-in 700ms ease-out forwards;
        }
        @keyframes quiz-step-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .quiz-step-card {
            opacity: 1;
            animation: none;
          }
          .quiz-step-card:hover { transform: none !important; }
        }
      `}</style>
    </section>
  );
};

export default QuizStepsTeaser;
