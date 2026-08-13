import { Link } from "react-router-dom";
import type { SenseJourney } from "@/data/senseJourneys";

interface Props {
  journey: SenseJourney;
  to: string;
}

export default function SenseCard({ journey, to }: Props) {
  return (
    <Link
      to={to}
      aria-label={`${journey.title} — ${journey.blurb}`}
      className="group relative block overflow-hidden rounded-lg border border-gold/15 bg-bz-card
                 transition-colors duration-300 hover:border-gold/60
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
                 focus-visible:ring-offset-transparent motion-safe:transition-transform motion-safe:hover:-translate-y-1"
    >
      <img
        src={journey.image}
        alt={`${journey.title} scent world illustration`}
        loading="lazy"
        width={1024}
        height={768}
        className="aspect-[4/3] w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-display text-cream text-sm md:text-base leading-tight">{journey.title}</p>
        <p className="font-body text-[10px] uppercase tracking-[0.16em] text-gold/80 mt-1 line-clamp-1">
          {journey.blurb}
        </p>
      </div>
    </Link>
  );
}
