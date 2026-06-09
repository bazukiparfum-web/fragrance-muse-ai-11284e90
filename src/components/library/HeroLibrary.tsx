const WORDS = "Discover Our Scent Universe".split(" ");

export default function HeroLibrary() {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="lux-hero-h1 font-display tracking-tight text-cream text-[32px] md:text-[48px] leading-[1.05]">
          {WORDS.map((w, i) => (
            <span
              key={i}
              className="lux-word"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {w}
              {i < WORDS.length - 1 ? "\u00A0" : ""}
            </span>
          ))}
        </h1>

        {/* Divider */}
        <div
          className="flex items-center justify-center gap-3 my-6"
          aria-hidden
        >
          <span
            className="lux-divider-line block h-px w-[60px] bg-[hsl(var(--bz-gold)/0.5)]"
            style={{ animationDelay: "500ms" }}
          />
          <span
            className="text-gold text-sm opacity-0"
            style={{ animation: "lux-word-rise 500ms ease-out 600ms both" }}
          >
            ✦
          </span>
          <span
            className="lux-divider-line block h-px w-[60px] bg-[hsl(var(--bz-gold)/0.5)]"
            style={{ animationDelay: "500ms" }}
          />
        </div>

        <p
          className="max-w-xl mx-auto text-gold text-sm md:text-base opacity-0"
          style={{
            letterSpacing: "0.05em",
            animation: "lux-word-rise 600ms ease-out 400ms both",
          }}
        >
          Every bottle is a unique formula created by Bazuki's AI engine.
        </p>
      </div>
    </section>
  );
}
