interface Feature {
  title: string;
  copy: string;
  image: string;
}

interface Props {
  images: string[];
  accentHsl: string;
}

const COPY: Omit<Feature, "image">[] = [
  {
    title: "Slow diffusion",
    copy: "Oil is released gradually so the scent stays vivid for weeks, not hours.",
  },
  {
    title: "Balanced, never harsh",
    copy: "Composed like fine perfume — present in the cabin, never overwhelming.",
  },
  {
    title: "Leak-proof glass",
    copy: "Hand-finished bottle and cord designed to sit flush on your mirror.",
  },
  {
    title: "Fine-fragrance oils",
    copy: "IFRA-compliant blends, the same grade used in luxury perfumery.",
  },
];

export default function StandOutFeatures({ images, accentHsl }: Props) {
  // Pair each feature with an available image, cycling if fewer images than features
  const features: Feature[] = COPY.map((c, i) => ({
    ...c,
    image: images[i % Math.max(images.length, 1)] ?? images[0] ?? "",
  }));

  return (
    <section className="py-16 md:py-20 border-b border-gold/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-3">
            What makes Bazuki different
          </p>
          <h2 className="font-cormorant text-3xl md:text-4xl text-cream">
            Crafted like fine perfume, not just a car freshener.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-xl border border-gold/15 bg-bz-card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              style={{ borderColor: `hsl(${accentHsl} / 0.2)` }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-bz-secondary">
                {f.image ? (
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                  />
                ) : null}
                <span
                  className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-gold/50"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-gold/50"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-gold/50"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-gold/50"
                  aria-hidden
                />
              </div>
              <div className="p-5">
                <h3 className="font-cormorant text-xl text-cream mb-1.5">
                  {f.title}
                </h3>
                <p className="text-cream-muted text-sm leading-relaxed">
                  {f.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
