import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { BRAND_ARCHETYPES, type BrandArchetype } from "@/data/brandArchetypes";

const BrandArchetypes = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = BRAND_ARCHETYPES.find((a) => a.id === selectedId) ?? null;

  const handleToggle = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleRequestFormula = (a: BrandArchetype) => {
    window.dispatchEvent(
      new CustomEvent("bz:prefill-lead-form", {
        detail: {
          name: a.name,
          tone: a.tone,
          notes: a.notes,
          useCases: a.useCases,
        },
      }),
    );
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <section
      id="brand-archetypes"
      className="py-20 md:py-28"
      style={{ backgroundColor: "hsl(var(--bz-bg-primary))" }}
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p
            className="text-[11px] md:text-xs uppercase mb-4 font-body"
            style={{
              color: "hsl(var(--bz-gold))",
              letterSpacing: "0.2em",
            }}
          >
            Fragrance solutions for every brand
          </p>
          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ color: "hsl(var(--bz-cream))" }}
          >
            Find your scent archetype
          </h2>
          <p
            className="font-body text-base md:text-lg leading-relaxed"
            style={{ color: "hsl(var(--bz-cream-muted))" }}
          >
            Every brand has a distinct identity. We translate yours into a fragrance formula —
            whether you're outfitting a retail space, creating corporate gifts, or building a
            signature scent for your team.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {BRAND_ARCHETYPES.map((a) => {
            const isSelected = a.id === selectedId;
            const dimmed = selectedId !== null && !isSelected;
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => handleToggle(a.id)}
                aria-expanded={isSelected}
                aria-controls="archetype-panel"
                className="group relative text-left rounded-2xl p-6 md:p-7 transition-all duration-300 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: "hsl(var(--bz-bg-card))",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: isSelected
                    ? `hsl(${a.color} / 0.9)`
                    : `hsl(${a.color} / 0.2)`,
                  boxShadow: isSelected
                    ? `0 0 0 1px hsl(${a.color} / 0.6), 0 8px 32px hsl(${a.color} / 0.15)`
                    : "none",
                  transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                  opacity: dimmed ? 0.55 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = `hsl(${a.color} / 0.6)`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = `hsl(${a.color} / 0.2)`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: `hsl(${a.color} / 0.12)`,
                    border: `1px solid hsl(${a.color} / 0.3)`,
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: `hsl(${a.color})` }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Name */}
                <h3
                  className="font-display text-2xl md:text-[26px] mb-2 leading-tight"
                  style={{ color: "hsl(var(--bz-cream))" }}
                >
                  {a.name}
                </h3>

                {/* Tagline */}
                <p
                  className="font-body text-sm mb-5 leading-relaxed"
                  style={{ color: "hsl(var(--bz-cream-muted))" }}
                >
                  {a.tagline}
                </p>

                {/* Keyword pills */}
                <div className="flex flex-wrap gap-2">
                  {a.keywords.map((k) => (
                    <span
                      key={k}
                      className="font-body text-[11px] uppercase px-2.5 py-1 rounded-full"
                      style={{
                        letterSpacing: "0.1em",
                        backgroundColor: "hsl(var(--bz-cream) / 0.05)",
                        color: "hsl(var(--bz-cream) / 0.8)",
                        border: "1px solid hsl(var(--bz-cream) / 0.1)",
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded panel */}
        {selected && (
          <ExpandedPanel
            archetype={selected}
            onClose={() => setSelectedId(null)}
            onCta={() => handleRequestFormula(selected)}
          />
        )}


        {/* Bottom banner */}
        <div
          className="mt-16 md:mt-20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
          style={{
            backgroundColor: "hsl(var(--bz-bg-card))",
            border: "1px solid hsl(var(--bz-gold) / 0.35)",
          }}
        >
          <div>
            <h3
              className="font-display text-2xl md:text-3xl mb-2"
              style={{ color: "hsl(var(--bz-cream))" }}
            >
              Not sure which archetype fits?
            </h3>
            <p
              className="font-body text-sm md:text-base"
              style={{ color: "hsl(var(--bz-cream-muted))" }}
            >
              Take the 5-minute brand quiz and we'll recommend the right formula.
            </p>
          </div>
          <Link
            to="/shop/quiz"
            className="font-body inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] whitespace-nowrap transition-all duration-200"
            style={{
              backgroundColor: "hsl(var(--bz-gold))",
              color: "hsl(var(--bz-bg-primary))",
            }}
          >
            Discover yours
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const ExpandedPanel = ({
  archetype,
  onClose,
  onCta,
}: {
  archetype: BrandArchetype;
  onClose: () => void;
  onCta: () => void;
}) => {
  const { color } = archetype;
  return (
    <div
      id="archetype-panel"
      role="region"
      aria-label={`${archetype.name} details`}
      className="mt-6 md:mt-8 rounded-2xl p-6 md:p-10 animate-fade-in motion-reduce:animate-none"
      style={{
        backgroundColor: "hsl(var(--bz-bg-card))",
        border: `1px solid hsl(${color} / 0.5)`,
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p
            className="font-body text-[11px] uppercase mb-2"
            style={{ color: `hsl(${color})`, letterSpacing: "0.2em" }}
          >
            {archetype.tone}
          </p>
          <h3
            className="font-display text-3xl md:text-4xl"
            style={{ color: "hsl(var(--bz-cream))" }}
          >
            {archetype.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close archetype details"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: "hsl(var(--bz-cream) / 0.05)",
            color: "hsl(var(--bz-cream) / 0.8)",
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p
        className="font-body text-base md:text-lg leading-relaxed mb-8 max-w-3xl"
        style={{ color: "hsl(var(--bz-cream-muted))" }}
      >
        {archetype.description}
      </p>

      <div className="grid md:grid-cols-2 gap-8 md:gap-10 mb-8">
        {/* Notes */}
        <div>
          <p
            className="font-body text-[11px] uppercase mb-3"
            style={{
              color: "hsl(var(--bz-cream) / 0.5)",
              letterSpacing: "0.2em",
            }}
          >
            Signature notes
          </p>
          <div className="flex flex-wrap gap-2">
            {archetype.notes.map((n) => (
              <span
                key={n}
                className="font-body text-xs md:text-sm px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: `hsl(${color} / 0.12)`,
                  border: `1px solid hsl(${color} / 0.35)`,
                  color: "hsl(var(--bz-cream))",
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div>
          <p
            className="font-body text-[11px] uppercase mb-3"
            style={{
              color: "hsl(var(--bz-cream) / 0.5)",
              letterSpacing: "0.2em",
            }}
          >
            Use cases
          </p>
          <ul className="space-y-2">
            {archetype.useCases.map((u) => (
              <li
                key={u}
                className="font-body text-sm md:text-base flex items-start gap-2"
                style={{ color: "hsl(var(--bz-cream-muted))" }}
              >
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(${color})` }}
                />
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={onCta}
        className="font-body inline-flex items-center gap-2 rounded-pill px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] transition-all duration-200"
        style={{
          backgroundColor: `hsl(${color})`,
          color: "hsl(var(--bz-bg-primary))",
        }}
      >
        Get a formula for this archetype
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BrandArchetypes;
