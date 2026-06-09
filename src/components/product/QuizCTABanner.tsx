import { Link } from "react-router-dom";

export default function QuizCTABanner() {
  return (
    <section
      className="pdp-quiz-banner my-16 px-6 sm:px-10 py-10"
      style={{
        background:
          "linear-gradient(135deg, rgba(201,168,76,0.04) 0%, transparent 50%, rgba(201,168,76,0.04) 100%)",
        borderTop: "1px solid rgba(201,168,76,0.4)",
        borderBottom: "1px solid rgba(201,168,76,0.4)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p
            className="text-[11px] uppercase mb-2"
            style={{ color: "var(--anim-dim-gold)", letterSpacing: "0.2em" }}
          >
            Not sure which is yours?
          </p>
          <h3
            className="font-display text-[24px] mb-1"
            style={{ color: "var(--anim-ivory)" }}
          >
            Let AI find your perfect scent
          </h3>
          <p className="text-[13px]" style={{ color: "#C8C0B0" }}>
            Answer 10 questions. Get your unique formula.
          </p>
        </div>
        <Link
          to="/quiz"
          className="pdp-cta-gold inline-flex items-center justify-center px-7 h-[52px] rounded-lg text-[13px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
          style={{ background: "var(--anim-gold)", color: "var(--anim-bg)" }}
        >
          Take the Quiz →
        </Link>
      </div>
    </section>
  );
}
