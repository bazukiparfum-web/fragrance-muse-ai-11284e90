import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CarFreshener } from "@/data/carFresheners";

interface Props {
  item: CarFreshener;
}

export default function CarFreshenerCard({ item }: Props) {
  const accent = `hsl(${item.accentHsl})`;
  const accentSoft = `hsl(${item.accentHsl} / 0.14)`;
  const accentBorder = `hsl(${item.accentHsl} / 0.45)`;

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-gold/15 bg-bz-card transition-all duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      style={{ ["--card-accent" as any]: accent }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = accentBorder;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      {/* Image stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-bz-secondary">
        <img
          src={item.image}
          alt={`${item.name} hanging car freshener`}
          width={1024}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
        {/* gold corner brackets */}
        <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-gold/50" aria-hidden />
        <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-gold/50" aria-hidden />
        <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-gold/50" aria-hidden />
        <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-gold/50" aria-hidden />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-cormorant text-2xl text-cream leading-tight">{item.name}</h3>
        <p className="mt-1 text-sm text-cream-muted line-clamp-2">{item.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.notes.map((n) => (
            <span
              key={n}
              className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
              style={{ backgroundColor: accentSoft, color: "hsl(var(--bz-cream))" }}
            >
              {n}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gold/10">
          <span className="font-cormorant text-xl text-cream">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button size="sm" variant="outline" disabled className="gap-2">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Coming soon
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Launching soon — join the waitlist below.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </article>
  );
}
