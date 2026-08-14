import { useState } from "react";
import type { SenseJourney } from "@/data/senseJourneys";

interface Props {
  journey: SenseJourney;
  onSelect: (journey: SenseJourney) => void;
  /** Above-the-fold cards load eagerly to settle fast. */
  eager?: boolean;
}

export default function SenseCard({ journey, onSelect, eager = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const pending = !loaded && !errored;

  return (
    <button
      type="button"
      onClick={() => onSelect(journey)}
      aria-label={`${journey.title} — ${journey.blurb}. Preview this scent world`}
      aria-haspopup="dialog"
      aria-busy={pending}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className="group relative block w-full overflow-hidden rounded-lg border border-gold/15 bg-bz-card text-left
                 transition-all duration-300 ease-out
                 hover:border-gold/60
                 active:scale-[0.98] active:border-gold/60 active:shadow-glow-gold-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
                 focus-visible:ring-offset-transparent motion-safe:transition-transform motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/3] w-full overflow-hidden bg-bz-card">
        {pending && (
          <div className="absolute inset-0 bg-bz-secondary/60" aria-hidden>
            <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
          </div>
        )}
        {!errored && (
          <img
            src={journey.image}
            alt={`${journey.title} scent world illustration`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchpriority={eager ? "high" : "low"}
            width={1024}
            height={768}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`h-full w-full object-cover transition-opacity duration-[400ms] ease-out group-hover:opacity-100 ${
              loaded ? "opacity-85" : "opacity-0"
            }`}
          />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent sm:from-black/85 sm:via-black/25" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-3">
        {pending ? (
          <div aria-hidden className="space-y-2">
            <div className="relative h-4 w-3/4 overflow-hidden rounded bg-cream/10">
              <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
            </div>
            <div className="relative h-2.5 w-1/2 overflow-hidden rounded bg-cream/10">
              <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
            </div>
          </div>
        ) : (
          <>
            <p className="font-display text-cream text-base sm:text-sm md:text-base leading-snug md:leading-tight">
              {journey.title}
            </p>
            <p className="font-body text-[11px] md:text-[10px] uppercase tracking-[0.16em] text-gold/80 mt-1.5 line-clamp-1">
              {journey.blurb}
            </p>
          </>
        )}
      </div>
    </button>
  );
}
