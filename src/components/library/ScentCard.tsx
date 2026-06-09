import { Button } from "@/components/ui/button";
import type { LibraryItem } from "@/lib/libraryMapper";
import { cn } from "@/lib/utils";
import GoldBottleIcon from "@/components/library/GoldBottleIcon";

interface Props {
  item: LibraryItem;
  onOpen: (item: LibraryItem) => void;
  index?: number;
}

function getNoteHighlights(item: LibraryItem): string[] {
  const { top, heart, base } = item.notes;
  const out: string[] = [];
  if (top[0]) out.push(top[0]);
  if (heart[0]) out.push(heart[0]);
  if (base[0]) out.push(base[0]);
  return out.slice(0, 3);
}

export default function ScentCard({ item, onOpen, index = 0 }: Props) {
  const noteHighlights = getNoteHighlights(item);

  return (
    <article
      onClick={() => onOpen(item)}
      className={cn(
        "lux-card-enter lux-card-shadow group relative flex flex-col overflow-hidden rounded-xl cursor-pointer",
        "bg-[var(--anim-amber)] border border-[hsl(var(--bz-gold)/0.15)]",
        "transition-all duration-[350ms] ease-out hover:-translate-y-1 hover:border-[hsl(var(--bz-gold)/0.5)] active:scale-[0.995]",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 80}ms` }}
    >
      {/* AI/community scent — no Shopify image, show stylized bottle on dark stage */}
      <div className="lux-image-stage relative h-[240px] md:h-[260px] flex items-center justify-center">
        <div
          className="text-gold transition-transform duration-[400ms] ease-out group-hover:scale-[1.06]"
          style={{ opacity: 0.55 }}
        >
          <GoldBottleIcon size={110} />
        </div>
        <span className="lux-card-glow absolute inset-0" aria-hidden />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-gold-muted italic">
          AI Crafted
        </span>
      </div>

      <div className="flex flex-col gap-3 px-[18px] pt-4 pb-[18px]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[15px] text-cream leading-snug line-clamp-2">
            {item.name}
          </h3>
          {item.prices.ml30 && (
            <span className="font-display text-[14px] text-gold whitespace-nowrap">
              ₹{item.prices.ml30}
            </span>
          )}
        </div>

        {noteHighlights.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap min-h-[20px]">
            {noteHighlights.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="lux-note-tag rounded-pill bg-[var(--anim-amber)] border border-[hsl(var(--bz-gold)/0.2)] text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 text-[hsl(var(--bz-gold)/0.6)]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {n}
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item);
          }}
          className="lux-btn rounded-md mt-1 h-10 border border-[hsl(var(--bz-gold))] bg-transparent text-gold text-[12px] uppercase tracking-[0.12em] font-medium hover:bg-[hsl(var(--bz-gold))] hover:text-primary-foreground transition-colors duration-[250ms]"
        >
          View Details
        </Button>
      </div>
    </article>
  );
}
