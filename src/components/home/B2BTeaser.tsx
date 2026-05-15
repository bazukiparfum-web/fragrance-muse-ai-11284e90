import { Link } from "react-router-dom";
import { Building2, ShoppingBag, Sparkles, Leaf, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";

const CHIPS = [
  { Icon: Building2, label: "Hotels & Hospitality" },
  { Icon: ShoppingBag, label: "Retail & Boutiques" },
  { Icon: Sparkles, label: "Events" },
  { Icon: Leaf, label: "Wellness Spas" },
];

const B2BTeaser = () => {
  return (
    <section className="w-full py-20 md:py-28" style={{ backgroundColor: "#111111" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <Reveal variant="headline" as="p" className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-4">
              For Businesses
            </Reveal>
            <Reveal variant="headline" delay={80} as="h2" className="font-display text-cream text-3xl md:text-[40px] leading-tight mb-4">
              Scent Your Space with Bazuki 360° Aroma
            </Reveal>
            <Reveal variant="item" delay={200} as="p" className="font-body text-body text-base leading-relaxed">
              Custom aroma identities for hotels, retail, offices, and events.
            </Reveal>
          </div>

          <div>
            <div className="flex flex-wrap gap-3 mb-8">
              {CHIPS.map(({ Icon, label }, i) => (
                <Reveal
                  key={label}
                  variant="item"
                  delay={i * 80}
                  className="inline-flex items-center gap-2 rounded-pill px-4 py-2.5 bg-bz-card"
                  style={{ border: "1px solid hsl(var(--bz-gold) / 0.2)" }}
                >
                  <Icon className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                  <span className="font-body text-cream text-xs uppercase tracking-[0.16em]">
                    {label}
                  </span>
                </Reveal>
              ))}
            </div>

            <Reveal variant="item" delay={400}>
              <Link
                to="/business"
                className="font-body inline-flex items-center gap-2 rounded-pill px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream hover:bg-gold hover:text-[hsl(var(--bz-bg-primary))] transition-all duration-200"
                style={{ border: "1px solid hsl(var(--bz-gold) / 0.4)" }}
              >
                Explore B2B Solutions
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default B2BTeaser;
