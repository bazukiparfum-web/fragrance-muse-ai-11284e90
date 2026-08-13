import type { SenseJourney } from "@/data/senseJourneys";

interface Props {
  journey: SenseJourney;
  onSelect: (journey: SenseJourney) => void;
}

export default function SenseCard({ journey, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(journey)}
      aria-label={`${journey.title} — ${journey.blurb}. Preview this scent world`}
      aria-haspopup="dialog"
      style={{ WebkitTapHighlightColor: "transparent" }}
      className="group relative block w-full overflow-hidden rounded-lg border border-gold/15 bg-bz-card text-left
                 transition-all duration-300 ease-out
                 hover:border-gold/60
                 active:scale-[0.98] active:border-gold/60 active:shadow-glow-gold-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
                 focus-visible:ring-offset-transparent motion-safe:transition-transform motion-safe:hover:-translate-y-1"
    >
      <img
        src={journey.image}
        alt={`${journey.title} scent world illustration`}
        loading="lazy"
        width={1024}
        height={768}
        className="aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/3] w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent sm:from-black/85 sm:via-black/25" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-3">
        <p className="font-display text-cream text-base sm:text-sm md:text-base leading-snug md:leading-tight">
          {journey.title}
        </p>
        <p className="font-body text-[11px] md:text-[10px] uppercase tracking-[0.16em] text-gold/80 mt-1.5 line-clamp-1">
          {journey.blurb}
        </p>
      </div>
    </button>
  );
}
