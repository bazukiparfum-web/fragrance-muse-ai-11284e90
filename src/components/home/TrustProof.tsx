import { Star } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { CountUp } from "@/components/anim/CountUp";

const STATS = [
  { n: "52", label: "Curated Ingredients" },
  { n: "3", label: "Custom Perfumes Per Order" },
  { n: "2,000+", label: "Unique Formulas Created" },
  { n: "​Make In India", label: "​PAN" },
];

const TESTIMONIALS = [
  {
    name: "Ananya R.",
    city: "Mumbai",
    quote: "It smells like a memory I didn't know I had. My signature, finally.",
  },
  {
    name: "Karan M.",
    city: "Bangalore",
    quote: "Three bottles, three moods. The AI nailed every single one.",
  },
  {
    name: "Priya S.",
    city: "Delhi",
    quote: "I've stopped wearing anything else. It feels truly mine.",
  },
];

const TrustProof = () => {
  return (
    <section className="w-full py-24 md:py-32" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="container mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              variant="item"
              delay={i * 80}
              className={`text-center px-4 ${
                i < STATS.length - 1 ? "md:border-r" : ""
              } ${i % 2 === 0 ? "border-r md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0 pb-8 md:pb-0" : ""}`}
              style={{ borderColor: "hsl(var(--bz-gold) / 0.15)" }}
            >
              <div className="font-display text-gold text-4xl md:text-[48px] leading-none mb-3">
                <CountUp value={s.n} />
              </div>
              <div className="font-body text-cream text-[11px] uppercase tracking-[0.2em]">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              variant="item"
              delay={i * 80}
              className="rounded-lg p-7 bg-bz-card transition-all duration-200 hover:-translate-y-1 hover:glow-gold-sm"
              style={{ border: "1px solid hsl(var(--bz-gold) / 0.15)" }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p className="font-display italic text-cream text-lg leading-snug mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-body font-semibold text-cream text-sm">{t.name}</span>
                <span className="font-body text-cream-muted text-xs">{t.city}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustProof;
