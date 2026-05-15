import { cn } from "@/lib/utils";
import { MOODS, type Mood } from "@/lib/libraryMapper";

interface Props {
  active: Mood | "All";
  onChange: (m: Mood | "All") => void;
  counts?: Partial<Record<Mood | "All", number>>;
}

const ALL: (Mood | "All")[] = ["All", ...MOODS];

export default function MoodFilterBar({ active, onChange, counts }: Props) {
  return (
    <div className="sticky top-16 z-30 bg-bz-primary/85 backdrop-blur border-b border-gold">
      <div className="container mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto py-4 snap-x scrollbar-none">
          {ALL.map((m) => {
            const isActive = active === m;
            const count = counts?.[m];
            return (
              <button
                key={m}
                onClick={() => onChange(m)}
                className={cn(
                  "snap-start whitespace-nowrap rounded-pill border px-4 py-2 text-sm transition-all",
                  isActive
                    ? "bg-gold text-primary-foreground border-transparent glow-gold-sm"
                    : "border-gold-strong text-cream-muted hover:text-cream hover:border-gold",
                )}
                aria-pressed={isActive}
              >
                {m}
                {typeof count === "number" && (
                  <span className={cn("ml-2 text-xs", isActive ? "opacity-70" : "text-dim")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
