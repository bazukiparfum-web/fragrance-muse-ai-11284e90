import { Button } from "@/components/ui/button";
import { FragrancePyramid } from "@/components/FragrancePyramid";
import { toNotes } from "@/lib/noteDescriptions";
import type { LibraryItem } from "@/lib/libraryMapper";
import { cn } from "@/lib/utils";

interface Props {
  item: LibraryItem;
  onOpen: (item: LibraryItem) => void;
  index?: number;
}

function NotePills({ label, notes }: { label: string; notes: string[] }) {
  if (!notes.length) return null;
  const shown = notes.slice(0, 2);
  const extra = notes.length - shown.length;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] uppercase tracking-wider text-dim">{label}</span>
      {shown.map((n) => (
        <span
          key={n}
          className="rounded-pill border border-gold-strong/60 bg-gold/5 text-gold text-[11px] px-2 py-0.5"
        >
          {n}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px] text-gold-muted">+{extra}</span>
      )}
    </div>
  );
}

export default function ScentCard({ item, onOpen, index = 0 }: Props) {
  return (
    <article
      className={cn(
        "group relative bg-bz-card border border-gold rounded-xl p-5 flex flex-col gap-4",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-strong hover:glow-gold-sm",
        "animate-[fade-in_0.5s_ease-out_both]",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
    >
      <div className="flex items-center justify-center bg-bz-secondary/60 rounded-lg py-3">
        <FragrancePyramid
          size="sm"
          topNotes={toNotes(item.notes.top)}
          heartNotes={toNotes(item.notes.heart)}
          baseNotes={toNotes(item.notes.base)}
        />
      </div>

      <div className="space-y-1">
        <h3 className="font-display text-2xl text-cream leading-tight">{item.name}</h3>
        <p className="text-sm italic text-cream-muted line-clamp-2">{item.description}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <NotePills label="Top" notes={item.notes.top} />
        <NotePills label="Heart" notes={item.notes.heart} />
        <NotePills label="Base" notes={item.notes.base} />
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div className="text-sm text-gold">
          {item.prices.ml30 && <span>30ml ₹{item.prices.ml30}</span>}
          {item.prices.ml30 && item.prices.ml50 && <span className="text-dim mx-1.5">·</span>}
          {item.prices.ml50 && <span>50ml ₹{item.prices.ml50}</span>}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-pill border-gold-strong text-gold hover:bg-gold hover:text-primary-foreground"
          onClick={() => onOpen(item)}
        >
          Details →
        </Button>
      </div>
    </article>
  );
}
