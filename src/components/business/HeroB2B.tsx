const scrollToForm = () =>
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });

const scrollToNext = () => {
  const hero = document.getElementById("hero-b2b");
  if (hero) {
    window.scrollTo({ top: hero.offsetHeight, behavior: "smooth" });
  }
};

const WHATSAPP_URL =
  "https://wa.me/?text=" +
  encodeURIComponent("Hi Bazuki, I'm interested in aroma solutions for my business.");

const stats = [
  { key: "75%", desc: "of emotions triggered by scent" },
  { key: "44%", desc: "longer dwell time in scented spaces" },
  { key: "50+", desc: "trusted by indian businesses" },
];

type TileData = {
  label: string;
  descriptor: string;
  image: string;
  bgPosition?: string;
};

const tiles: TileData[] = [
  {
    label: "Hospitality",
    descriptor: "Hotels · Resorts · Boutique Stays",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    bgPosition: "center top",
  },
  {
    label: "Retail",
    descriptor: "Boutiques · Showrooms · Flagship Stores",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    label: "Corporate",
    descriptor: "Offices · Co-working · HQ Lobbies",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    label: "Wellness",
    descriptor: "Spas · Clinics · Yoga Studios",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    bgPosition: "center top",
  },
];

const Tile = ({ label, descriptor, image, bgPosition = "center", className = "" }: TileData & { className?: string }) => (
  <div
    className={`group relative overflow-hidden rounded-xl border border-[rgba(201,168,76,0.15)] transition-all duration-300 hover:border-[#C9A84C] hover:shadow-[0_0_24px_rgba(201,168,76,0.35)] ${className}`}
  >
    {/* background image */}
    <div
      className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: bgPosition,
      }}
    />
    {/* dark gradient overlay */}
    <div
      className="absolute inset-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-75"
      style={{
        background:
          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)",
      }}
    />
    {/* hover descriptor */}
    <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-4 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
      <span
        className="text-center font-body text-[11px]"
        style={{ color: "#C8B99A" }}
      >
        {descriptor}
      </span>
    </div>
    {/* label pill */}
    <div
      className="absolute bottom-4 left-4 z-[2] rounded-full px-3 py-1 font-body text-[9px] uppercase backdrop-blur-sm"
      style={{
        background: "rgba(10,10,10,0.55)",
        border: "1px solid rgba(201,168,76,0.4)",
        color: "#C9A84C",
        letterSpacing: "0.2em",
      }}
    >
      {label}
    </div>
  </div>
);

const HeroB2B = () => {
  return (
    <section
      id="hero-b2b"
      className="relative overflow-hidden bg-bz-primary text-cream"
      style={{ minHeight: "100vh", maxHeight: "900px" }}
    >
      <style>{`
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-gold/10" />

      <div className="relative flex h-full min-h-screen max-h-[900px] items-center pl-6 pr-6 pt-20 pb-24 md:pl-10 md:pr-10 lg:pl-16 lg:pr-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[55%_45%] lg:gap-10">
          {/* LEFT */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Scent Marketing · 360° Aroma Solutions
            </div>

            <h1 className="mt-8 mb-6 font-serif font-light text-cream text-[38px] md:text-[52px] lg:text-[64px]" style={{ lineHeight: 1.15 }}>
              <span className="block">Your Brand Has a Logo.</span>
              <span className="block">Your Brand Has a Color.</span>
              <span className="block">
                Now Give It a <span className="text-gold italic">Scent.</span>
              </span>
            </h1>

            <p className="mb-10 max-w-[460px] font-body text-base leading-[1.75] text-body">
              Bazuki partners with hotels, retail stores, offices, and event spaces across India to
              design custom aroma identities — fragrances that make your brand unforgettable.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center rounded-full bg-[#C9A84C] text-black uppercase transition-all duration-300 hover:brightness-110"
                style={{
                  padding: "14px 32px",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                }}
              >
                Request a Free Consultation
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border uppercase transition-all duration-300 hover:bg-[rgba(74,124,89,0.15)]"
                style={{
                  borderColor: "#4A7C59",
                  color: "#4A7C59",
                  padding: "14px 32px",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                }}
              >
                WhatsApp Us Now →
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
              {stats.map((stat, i) => (
                <div key={stat.key} className="flex items-center sm:flex-1">
                  <div className="flex flex-col">
                    <span
                      className="font-body uppercase"
                      style={{
                        fontSize: "13px",
                        color: "#F5ECD7",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {stat.key}
                    </span>
                    <span
                      className="mt-1 font-body uppercase"
                      style={{
                        fontSize: "10px",
                        color: "#6B5D50",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {stat.desc}
                    </span>
                  </div>
                  {i < stats.length - 1 && (
                    <span
                      className="mx-6 hidden sm:inline-block"
                      style={{
                        width: "1px",
                        height: "28px",
                        background: "rgba(201,168,76,0.4)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — desktop mosaic */}
          <div
            className="hidden lg:grid grid-cols-2 rounded-xl"
            style={{
              gap: "1px",
              backgroundColor: "rgba(201,168,76,0.15)",
              boxShadow: "inset 0 0 60px rgba(201,168,76,0.06)",
              padding: "1px",
            }}
          >
            {tiles.map((t) => (
              <Tile key={t.label} {...t} className="aspect-square" />
            ))}
          </div>

          {/* RIGHT — mobile scroll strip */}
          <div className="-mx-6 md:-mx-10 lg:hidden">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:px-10">
              {tiles.map((t) => (
                <Tile
                  key={t.label}
                  {...t}
                  className="aspect-[4/3] min-w-[70%] snap-start"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute left-1/2 flex flex-col items-center gap-2"
        style={{ bottom: "32px", transform: "translateX(-50%)" }}
        aria-label="Explore solutions"
      >
        <span
          className="font-body uppercase"
          style={{
            fontSize: "10px",
            color: "#4A3F35",
            letterSpacing: "0.15em",
          }}
        >
          Explore Solutions
        </span>
        <span
          className="text-gold"
          style={{
            opacity: 0.4,
            fontSize: "16px",
            lineHeight: 1,
            animation: "heroBounce 1.5s ease-in-out infinite",
          }}
        >
          ∨
        </span>
      </button>
    </section>
  );
};

export default HeroB2B;
