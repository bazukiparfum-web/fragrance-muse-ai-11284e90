import { Check } from "lucide-react";

type Tier = {
  name: string;
  bestFor: string;
  price: string;
  priceSuffix?: string;
  priceSub: string;
  features: string[];
  cta: string;
  variant: "ghost" | "solid";
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    bestFor: "Small offices, boutiques, home studios",
    price: "₹5,999",
    priceSuffix: "Onwards",
    priceSub: "Includes diffuser rental + 1 refill",
    features: [
      "1 cold-air diffuser (covers up to 500 sq ft)",
      "1 custom or curated scent oil (100ml)",
      "Monthly refill delivery (refills cost extra)",
      "Scent consultation call (30 min)",
    ],
    cta: "Get Started",
    variant: "ghost",
  },
  {
    name: "Business",
    bestFor: "Retail stores, spas, co-working spaces",
    price: "₹9,999",
    priceSuffix: "Onwards",
    priceSub: "Includes 1 diffuser + custom scent",
    features: [
      "1 cold-air diffuser (covers up to 1,000 sq ft)",
      "Custom brand scent formulation",
      "Monthly refills + delivery (refills cost extra)",
      "Monthly scent review call",
      "Branded scent card for your space",
    ],
    cta: "Request a Quote",
    variant: "solid",
    featured: true,
  },
  {
    name: "Enterprise",
    bestFor: "Hotels, large retail chains, event companies",
    price: "Custom Pricing",
    priceSub: "Multi-location, white-label available",
    features: [
      "Unlimited diffusers across locations",
      "Proprietary brand scent (yours exclusively)",
      "HVAC integration available",
      "Dedicated account manager",
      "White-label oil packaging with your branding",
      "Annual scent strategy review",
    ],
    cta: "Talk to Us",
    variant: "ghost",
  },
];


const scrollToLead = () => {
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
};

const B2BPackages = () => {
  return (
    <section id="packages" className="bg-bz-primary py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Scent Marketing Packages
          </p>
          <h2 className="mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]">
            Choose the Right Aroma Plan for Your Space
          </h2>
          <p className="mt-4 text-[15px] text-body">
            All plans include a free scent consultation. No setup complexity. Ships across India.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((t) => {
            const isFeatured = !!t.featured;
            return (
              <div
                key={t.name}
                className={[
                  "relative flex flex-col rounded-xl bg-bz-card p-8",
                  isFeatured
                    ? "border border-gold-strong/40 shadow-[0_0_32px_hsl(var(--bz-gold)/0.2)] lg:-translate-y-2"
                    : "border border-gold-strong/15",
                ].join(" ")}
              >
                {isFeatured && (
                  <span className="absolute -top-3 right-6 rounded-pill bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                    Most Popular
                  </span>
                )}

                <h3 className="font-serif text-[24px] font-light text-cream">{t.name}</h3>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Best for
                  </div>
                  <p className="mt-1 text-[13px] text-body">{t.bestFor}</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-[40px] leading-none text-cream">{t.price}</span>
                    {t.priceSuffix && (
                      <span className="text-[12px] uppercase tracking-[0.2em] text-gold">
                        {t.priceSuffix}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] text-body">{t.priceSub}</p>
                </div>

                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                      <span className="text-[13px] leading-relaxed text-cream">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={scrollToLead}
                  className={[
                    "mt-auto w-full rounded-pill px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors",
                    "pt-3",
                    t.variant === "solid"
                      ? "bg-gold text-primary-foreground hover:bg-gold/90"
                      : "border border-gold-strong/40 text-gold hover:bg-gold/10",
                  ].join(" ")}
                  style={{ marginTop: "auto" }}
                >
                  <span className="block pt-0">{t.cta}</span>
                </button>
                <div className="mt-6" />
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] text-dim">
          * All prices exclusive of GST. Minimum 3-month commitment for Starter and Business plans. Enterprise pricing on request.
        </p>

      </div>
    </section>
  );
};

export default B2BPackages;
