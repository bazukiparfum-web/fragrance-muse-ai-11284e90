import { Link } from "react-router-dom";

type Scent = {
  name: string;
  mood: string;
  top: string;
  heart: string;
  base: string;
  price: string;
  gradient: string;
};

const SCENTS: Scent[] = [
  {
    name: "Oud Noir",
    mood: "Smoky, midnight, mysterious.",
    top: "Bergamot",
    heart: "Rose",
    base: "Oud",
    price: "From ₹299",
    gradient: "linear-gradient(135deg, #1a0f00 0%, #080808 100%)",
  },
  {
    name: "Santal Drift",
    mood: "Creamy sandalwood, soft amber haze.",
    top: "Cardamom",
    heart: "Sandalwood",
    base: "Vanilla",
    price: "From ₹299",
    gradient: "linear-gradient(135deg, #2a1a08 0%, #0a0a0a 100%)",
  },
  {
    name: "Amber Haze",
    mood: "Warm resin, golden afternoon light.",
    top: "Saffron",
    heart: "Amber",
    base: "Musk",
    price: "From ₹299",
    gradient: "linear-gradient(135deg, #3a1f08 0%, #0d0d0d 100%)",
  },
  {
    name: "Citrus Eclipse",
    mood: "Bright bergamot fading into dark vetiver.",
    top: "Bergamot",
    heart: "Neroli",
    base: "Vetiver",
    price: "From ₹299",
    gradient: "linear-gradient(135deg, #1f1a08 0%, #080808 100%)",
  },
];

const Pill = ({ label, value }: { label: string; value: string }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[10px] font-body uppercase tracking-[0.18em]"
    style={{ border: "1px solid hsl(var(--bz-gold) / 0.25)", color: "hsl(var(--bz-cream-muted))" }}
  >
    <span className="text-gold">{label}</span>
    <span>{value}</span>
  </span>
);

const FeaturedScents = () => {
  return (
    <section className="w-full bg-bz-primary py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-4">
            From the Library
          </p>
          <h2 className="font-display text-cream text-4xl md:text-[44px]">
            Explore AI-Created Scents
          </h2>
        </div>

        {/* Mobile: horizontal scroll; Desktop: 4-col grid */}
        <div className="md:hidden -mx-6 px-6 overflow-x-auto">
          <div className="flex gap-5 snap-x snap-mandatory pb-4">
            {SCENTS.map((s) => (
              <div key={s.name} className="snap-start shrink-0 w-[78%]">
                <ScentCard scent={s} />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-4 gap-6">
          {SCENTS.map((s) => (
            <ScentCard key={s.name} scent={s} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/collection"
            className="font-body text-gold text-sm uppercase tracking-[0.22em] hover:opacity-80 transition-opacity"
          >
            View all scents →
          </Link>
        </div>
      </div>
    </section>
  );
};

const ScentCard = ({ scent }: { scent: Scent }) => (
  <article
    className="group rounded-xl overflow-hidden bg-bz-card transition-all duration-200 hover:-translate-y-1 hover:glow-gold-sm"
    style={{ border: "1px solid hsl(var(--bz-gold) / 0.15)" }}
  >
    <div
      className="aspect-square w-full relative"
      style={{ background: scent.gradient }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, hsl(var(--bz-gold) / 0.18) 0%, transparent 60%)",
        }}
      />
    </div>
    <div className="p-5">
      <h3 className="font-display text-cream text-2xl mb-1.5">{scent.name}</h3>
      <p className="font-body text-[13px] text-cream-muted mb-4">{scent.mood}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        <Pill label="Top" value={scent.top} />
        <Pill label="Heart" value={scent.heart} />
        <Pill label="Base" value={scent.base} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-gold text-sm tracking-wide">{scent.price}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="font-body text-xs uppercase tracking-[0.18em] py-2.5 rounded-pill text-cream transition-colors"
          style={{ border: "1px solid hsl(var(--bz-gold) / 0.3)" }}
        >
          Details
        </button>
        <button
          className="font-body text-xs uppercase tracking-[0.18em] py-2.5 rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-sm transition-all"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </article>
);

export default FeaturedScents;
