import { Button } from "@/components/ui/button";
import GoldBottleIcon from "@/components/library/GoldBottleIcon";

export function CollectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-cream mb-6">Unable to load products. Please refresh.</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="rounded-pill border-[hsl(var(--bz-gold)/0.5)] text-gold hover:bg-gold hover:text-primary-foreground"
      >
        Retry
      </Button>
    </div>
  );
}

interface EmptyProps {
  onReset?: () => void;
  filtered?: boolean;
}

export function CollectionEmpty({ onReset, filtered = false }: EmptyProps) {
  if (!filtered) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-gold mb-5"><GoldBottleIcon size={60} opacity={0.7} /></div>
        <p className="text-cream-muted">
          Our scent library is being updated. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-gold mb-5"><GoldBottleIcon size={60} opacity={0.7} /></div>
      <h3 className="font-display text-xl text-cream mb-2">No scents found</h3>
      <p className="text-gold text-sm mb-6 max-w-sm">
        Try a different scent family or explore all our fragrances.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="rounded-pill border border-[hsl(var(--bz-gold)/0.5)] text-gold text-[12px] uppercase tracking-[0.1em] px-5 py-2 hover:bg-[hsl(var(--bz-gold)/0.08)] hover:border-[hsl(var(--bz-gold))] transition"
        >
          View All
        </button>
      )}
    </div>
  );
}
