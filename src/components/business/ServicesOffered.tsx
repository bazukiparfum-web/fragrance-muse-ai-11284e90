import { Sparkles, Wind, RefreshCw, Check } from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Custom Brand Scent",
    desc: "A signature fragrance built around your brand DNA.",
    points: ["Discovery & mood boards", "Perfumer-led formulation", "Unlimited refinement rounds"],
  },
  {
    icon: Wind,
    title: "Diffuser Supply",
    desc: "Commercial-grade, IoT-enabled diffusion hardware.",
    points: ["Cold-air diffusion tech", "Coverage from 50 to 5000 sq ft", "Remote control & scheduling"],
  },
  {
    icon: RefreshCw,
    title: "Refill Subscription",
    desc: "Never run out — automated refills delivered to your door.",
    points: ["Monthly or quarterly cycles", "Pan-India delivery", "Pause or swap any time"],
  },
];

const ServicesOffered = () => {
  return (
    <section className="bg-luxury-black text-primary-foreground py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">Services</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">What We Offer</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, points }) => (
            <div
              key={title}
              className="p-8 rounded-lg border border-luxury-gold/20 bg-white/[0.03] hover:border-luxury-gold/60 transition-all duration-300 flex flex-col"
            >
              <div className="w-14 h-14 rounded-lg bg-luxury-gold/10 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-luxury-gold" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3 text-cream">{title}</h3>
              <p className="text-cream/90 mb-6 leading-relaxed">{desc}</p>
              <ul className="space-y-3 mt-auto">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-cream">
                    <Check className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOffered;
