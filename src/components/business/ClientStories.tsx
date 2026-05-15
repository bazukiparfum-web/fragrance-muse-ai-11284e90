type Story = {
  industry: string;
  business: string;
  challenge: string;
  solution: string;
  results: string[];
  quote: string;
  attribution: string;
};

const stories: Story[] = [
  {
    industry: "Hospitality",
    business: "A boutique hotel in Ahmedabad",
    challenge:
      "Guests couldn't describe what made the property special — there was no sensory anchor.",
    solution:
      "Bazuki designed a custom woody-floral signature scent diffused in the lobby and corridors.",
    results: [
      "↑ 32% repeat booking rate",
      "↑ 4.8★ ambiance rating",
      "Scent mentioned in 60% of reviews",
    ],
    quote:
      "Our guests now say they can smell our hotel the moment they step off the elevator.",
    attribution: "— General Manager, Narayani Heights",
  },
  {
    industry: "Retail",
    business: "A fashion boutique in SBR, Ahmedabad",
    challenge:
      "High footfall, low conversion. Customers browsed but didn't linger.",
    solution:
      "A light citrus-musk ambient scent deployed at entry and fitting rooms.",
    results: [
      "↑ 18% average dwell time",
      "↑ 23% conversion rate",
      "Zero customer complaints",
    ],
    quote:
      "We didn't change our products or layout. Just the scent. The difference was immediate.",
    attribution: "— Owner, ADANI Menswear",
  },
];

const scrollToLead = () => {
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
};

const ClientStories = () => {
  return (
    <section id="client-stories" className="py-24" style={{ backgroundColor: "#0D0D0D" }}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Client Stories
          </p>
          <h2 className="mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]">
            Real Businesses. Real Results.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {stories.map((s) => (
            <article
              key={s.business}
              className="flex flex-col gap-6 rounded-xl border border-gold-strong/15 p-10"
              style={{ backgroundColor: "#141414" }}
            >
              <span className="inline-flex self-start rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
                {s.industry}
              </span>

              <h3 className="font-serif text-[22px] font-light text-cream">{s.business}</h3>

              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Challenge</div>
                <p className="mt-1 text-[14px] leading-relaxed text-body">{s.challenge}</p>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Solution</div>
                <p className="mt-1 text-[14px] leading-relaxed text-body">{s.solution}</p>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Result</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.results.map((r) => (
                    <span
                      key={r}
                      className="rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <blockquote className="border-l-2 border-gold pl-4 font-serif italic text-[20px] leading-snug text-cream">
                "{s.quote}"
              </blockquote>

              <p className="text-[12px]" style={{ color: "#6B5D50" }}>
                {s.attribution}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="font-serif text-[22px] text-cream md:text-[26px]">
            Want results like these for your business?
          </p>
          <button
            type="button"
            onClick={scrollToLead}
            className="mt-5 inline-flex rounded-pill bg-gold px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-gold/90"
          >
            Book a Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClientStories;
