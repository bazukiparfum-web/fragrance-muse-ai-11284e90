export default function HeroLibrary() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, hsl(var(--bz-gold) / 0.18), transparent 70%)",
        }}
      />
      <div className="container relative mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="font-display text-4xl md:text-6xl text-cream tracking-tight">
          Discover Our Scent Universe
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-cream-muted text-base md:text-lg">
          Every bottle is a unique formula created by Bazuki's AI engine.
        </p>
      </div>
    </section>
  );
}
