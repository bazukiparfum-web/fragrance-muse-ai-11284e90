import { cn } from "@/lib/utils";
import { MOODS, type Mood } from "@/lib/libraryMapper";
import SortDropdown, { type SortKey } from "@/components/library/SortDropdown";

interface Props {
  active: Mood | "All";
  onChange: (m: Mood | "All") => void;
  counts?: Partial<Record<Mood | "All", number>>;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  totalLabel: string;
}

const ALL: (Mood | "All")[] = ["All", ...MOODS];

export default function MoodFilterBar({
  active,
  onChange,
  counts,
  sort,
  onSortChange,
  totalLabel,
}: Props) {
  return (
    <div className="sticky top-16 z-30 bg-[hsl(var(--bz-bg-primary)/0.85)] backdrop-blur border-b border-[hsl(var(--bz-gold)/0.15)]">
      <div className="container mx-auto px-6 pt-3 pb-4">
        {/* Showing count */}
        <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--anim-dim-gold)] mb-2">
          {totalLabel}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 flex-col sm:flex-row sm:justify-between">
          {/* Pills */}
          <div className="w-full sm:flex-1 min-w-0 overflow-x-auto scrollbar-none lux-fade-right sm:[mask-image:none] sm:[-webkit-mask-image:none]">
            <div className="flex items-center gap-[10px] py-1">
              {ALL.map((m, i) => {
                const isActive = active === m;
                const count = counts?.[m];
                return (
                  <button
                    key={m}
                    onClick={() => onChange(m)}
                    className={cn(
                      "lux-pill-enter relative overflow-hidden whitespace-nowrap rounded-pill border px-5 py-2 text-[12px] uppercase tracking-[0.1em] transition-all duration-200",
                      isActive
                        ? "bg-gold text-primary-foreground border-[hsl(var(--bz-gold))] font-semibold scale-[1.05]"
                        : "bg-transparent border-[hsl(var(--bz-gold)/0.3)] text-cream-muted hover:border-[hsl(var(--bz-gold)/0.7)] hover:text-gold hover:bg-[hsl(var(--bz-gold)/0.06)] hover:-translate-y-px",
                    )}
                    style={{ animationDelay: `${400 + i * 60}ms` }}
                    aria-pressed={isActive}
                  >
                    <span className="relative z-10">
                      {m}
                      {typeof count === "number" && (
                        <span
                          className={cn(
                            "ml-2 text-[10px]",
                            isActive ? "opacity-70" : "text-dim",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </span>
                    {isActive && <span key={m} className="lux-pill-shimmer" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <SortDropdown value={sort} onChange={onSortChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
