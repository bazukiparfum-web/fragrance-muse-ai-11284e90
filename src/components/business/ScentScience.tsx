import { Wind, Brain, Sparkles } from "lucide-react";

const stats = [
  {
    value: "75%",
    label: "of all emotions are influenced by what we smell",
    source: "— Harvard Medical School",
  },
  {
    value: "44%",
    label: "longer time spent in retail environments with ambient scenting",
    source: "— Journal of Marketing Research",
  },
  {
    value: "10–15%",
    label: "more a customer is willing to pay in a pleasantly scented space",
    source: "— Spectrio Research, 2023",
  },
];

const steps = [
  { icon: Wind, label: "Scent enters the nose", body: "Odor molecules reach the olfactory bulb." },
  { icon: Brain, label: "Triggers the limbic system", body: "Seat of emotion and memory." },
  { icon: Sparkles, label: "Creates an emotional response", body: "Instantly linked to your brand." },
];

const ScentScience = () => {
  return (
    <section className="bg-bz-secondary py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Why Scent Works
          </div>
          <h2 className="mt-5 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px] max-w-3xl mx-auto">
            The Most Powerful Sense. The Most Underused Brand Tool.
          </h2>
          <p className="mt-6 font-body text-[15px] leading-[1.75] text-body max-w-[560px] mx-auto">
            Scent bypasses rational thought and speaks directly to emotion and memory — making it
            the most potent branding channel available.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.value}
              className="rounded-xl border border-gold-strong/15 bg-bz-card p-10 text-center transition-all duration-300 hover:border-gold-strong/40"
            >
              <div className="font-serif font-light leading-none text-gold text-[80px]">
                {s.value}
              </div>
              <p className="mt-5 font-body text-[15px] leading-relaxed text-cream-muted">
                {s.label}
              </p>
              <div className="mt-6 text-[10px] uppercase tracking-[0.15em] text-[hsl(30_15%_25%)]">
                {s.source}
              </div>
            </div>
          ))}
        </div>

        {/* Brain explainer */}
        <div className="mt-24 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            How Scent Works in the Brain
          </div>
        </div>

        <div className="relative mt-10">
          {/* Dashed connector */}
          <div
            aria-hidden
            className="hidden md:block absolute left-[16.66%] right-[16.66%] top-[68px] border-t border-dashed border-gold-strong/30"
          />
          <div className="relative grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="relative z-10 rounded-xl border border-gold-strong/15 bg-bz-card p-6 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-strong/30 bg-bz-primary text-gold">
                    <Icon size={22} />
                  </div>
                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Step {i + 1}
                  </div>
                  <div className="mt-2 font-body text-[13px] leading-snug text-cream">
                    {step.label}
                  </div>
                  <div className="mt-2 text-[12px] leading-relaxed text-body">{step.body}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#use-cases"
            className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-cream"
          >
            See How We Apply This for Your Industry
            <span className="inline-block animate-bounce">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ScentScience;
