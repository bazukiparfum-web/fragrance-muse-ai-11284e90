import { BedDouble, ShoppingBag, Building2, PartyPopper, Flower2, Car, type LucideIcon } from "lucide-react";

type Case = {
  icon: LucideIcon;
  name: string;
  problem: string;
  solution: string;
  outcome: string;
};

const cases: Case[] = [
  {
    icon: BedDouble,
    name: "Hotels & Hospitality",
    problem: "Guests forget a stay. They never forget a scent.",
    solution: "Signature lobby and suite scents tied to your brand identity.",
    outcome: "↑ Guest satisfaction scores",
  },
  {
    icon: ShoppingBag,
    name: "Retail & Boutiques",
    problem: "Browsers leave. Scented spaces convert.",
    solution: "Custom in-store aroma tuned to your category and customer.",
    outcome: "↑ Dwell time by 44%",
  },
  {
    icon: Building2,
    name: "Offices & Co-working",
    problem: "Productivity drops in sterile, odorless environments.",
    solution: "Calming, focus-enhancing diffusion across workspaces.",
    outcome: "↑ Focus & wellbeing",
  },
  {
    icon: PartyPopper,
    name: "Events & Weddings",
    problem: "A signature scent makes your event unforgettable.",
    solution: "Bespoke fragrance designed for the occasion and venue.",
    outcome: "↑ Lasting brand recall",
  },
  {
    icon: Flower2,
    name: "Spas & Wellness",
    problem: "Inconsistent scent breaks the relaxation experience.",
    solution: "Therapeutic, consistent blends across every treatment room.",
    outcome: "↑ Repeat bookings",
  },
  {
    icon: Car,
    name: "Automotive",
    problem: "New car smell is the world's most powerful brand memory.",
    solution: "Showroom and cabin scenting that defines your marque.",
    outcome: "↑ Premium brand perception",
  },
];

const UseCasesGrid = () => {
  return (
    <section id="use-cases" className="bg-bz-primary py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Our Industries
          </p>
          <h2 className="mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]">
            We Scent Every Space That Matters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(({ icon: Icon, name, problem, solution, outcome }) => (
            <div
              key={name}
              className="group relative overflow-hidden rounded-xl border border-gold-strong/15 bg-bz-card p-8 pb-10 transition-all duration-300 hover:-translate-y-1 hover:border-gold-strong/60 hover:shadow-[0_0_28px_hsl(var(--bz-gold)/0.25)]"
            >
              <Icon size={32} strokeWidth={1.25} className="text-gold" />

              <h3 className="mt-4 font-serif text-[22px] font-light text-cream">{name}</h3>

              <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                The challenge:
              </div>
              <p className="mt-1 text-[14px] italic leading-snug text-body">{problem}</p>

              <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                What Bazuki does:
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-cream">{solution}</p>

              <div className="relative z-10 mt-6">
                <span className="inline-flex rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold">
                  {outcome}
                </span>
              </div>

              {/* Hover slide-up */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full border-t border-gold-strong/30 bg-bz-primary/90 px-8 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
                Learn More →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesGrid;
