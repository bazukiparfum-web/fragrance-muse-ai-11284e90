import { Button } from "@/components/ui/button";

export function CollectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-cream mb-6">Unable to load products. Please refresh.</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="rounded-pill border-gold-strong text-gold hover:bg-gold hover:text-primary-foreground"
      >
        Retry
      </Button>
    </div>
  );
}

export function CollectionEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <img
        src="/favicon.png"
        alt="Bazuki"
        className="h-14 w-14 mb-5 opacity-90"
      />
      <p className="text-cream-muted">
        Our scent library is being updated. Check back soon.
      </p>
    </div>
  );
}
