import { Button } from "@/components/ui/button";

const scrollToForm = () =>
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });

const WHATSAPP_URL =
  "https://wa.me/?text=" +
  encodeURIComponent("Hi Bazuki, I'm interested in aroma solutions for my business.");

const stats = [
  "75% of emotions are triggered by scent",
  "Customers stay 44% longer in scented spaces",
  "Trusted by 50+ Indian businesses",
];

const tiles = [
  { label: "Hospitality", accent: "from-amber-900/40" },
  { label: "Retail", accent: "from-rose-900/40" },
  { label: "Corporate", accent: "from-slate-700/40" },
  { label: "Wellness", accent: "from-emerald-900/40" },
];

const Tile = ({ label, accent, className = "" }: { label: string; accent: string; className?: string }) => (
  <div
    className={`group relative overflow-hidden rounded-xl border border-gold-strong/20 bg-gradient-to-br ${accent} via-bz-secondary to-bz-primary transition-all duration-500 hover:border-gold-strong hover:shadow-[0_0_28px_hsl(var(--bz-gold)/0.28)] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-bz-primary/80 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70" />
    <div className="absolute bottom-3 left-3 rounded-pill border border-gold-strong/40 bg-bz-primary/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur">
      {label}
    </div>
  </div>
);

const HeroB2B = () => {
  return (
    <section className="relative overflow-hidden bg-bz-primary text-cream">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-gold/10" />
      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 py-20 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[55%_45%] lg:gap-10">
          {/* LEFT */}
          <div className="space-y-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              360° Aroma Solutions · B2B
            </div>

            <h1 className="font-serif font-light leading-[1.1] text-cream text-[38px] md:text-[52px] lg:text-[64px]">
              <span className="block">Your Brand Has a Logo.</span>
              <span className="block">Your Brand Has a Color.</span>
              <span className="block">
                Now Give It a <span className="text-gold italic">Scent.</span>
              </span>
            </h1>

            <p className="max-w-[460px] font-body text-base leading-[1.75] text-body">
              Bazuki partners with hotels, retail stores, offices, and event spaces across India to
              design custom aroma identities — fragrances that make your brand unforgettable.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="luxury"
                size="lg"
                onClick={scrollToForm}
                className="rounded-pill"
              >
                Request a Free Consultation
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-pill border-2 border-[#25D366] px-8 text-sm font-semibold uppercase tracking-wider text-[#25D366] transition-all duration-300 hover:bg-[#25D366]/10 hover:shadow-[0_0_20px_rgba(37,211,102,0.25)]"
              >
                WhatsApp Us Now →
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-0">
              {stats.map((stat, i) => (
                <div key={stat} className="flex items-center sm:flex-1">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-dim">{stat}</span>
                  {i < stats.length - 1 && (
                    <span className="mx-4 hidden h-3 w-px bg-gold-strong/30 sm:inline-block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — desktop mosaic */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {tiles.map((t) => (
              <Tile key={t.label} label={t.label} accent={t.accent} className="aspect-square" />
            ))}
          </div>

          {/* RIGHT — mobile scroll strip */}
          <div className="-mx-4 lg:hidden">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
              {tiles.map((t) => (
                <Tile
                  key={t.label}
                  label={t.label}
                  accent={t.accent}
                  className="aspect-[4/3] min-w-[70%] snap-start"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroB2B;
