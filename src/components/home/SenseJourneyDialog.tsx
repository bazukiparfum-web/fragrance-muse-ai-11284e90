import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SenseJourney } from "@/data/senseJourneys";
import type { ShopifyProduct } from "@/lib/shopify";
import { matchProductsForJourney } from "@/lib/moodMatch";

interface Props {
  journey: SenseJourney | null;
  products: ShopifyProduct[];
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function price(p: ShopifyProduct) {
  const amount = Math.round(parseFloat(p.node.priceRange.minVariantPrice.amount || "0"));
  const cur = p.node.priceRange.minVariantPrice.currencyCode;
  return cur === "INR" || !cur ? `₹${amount.toLocaleString("en-IN")}` : `${cur} ${amount}`;
}

function NoteRow({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-14 shrink-0 font-body text-[10px] uppercase tracking-[0.18em] text-gold/80 pt-1">
        {label}
      </span>
      <span className="font-body text-cream/80">{items.join(" · ")}</span>
    </div>
  );
}

export default function SenseJourneyDialog({ journey, products, loading = false, open, onOpenChange }: Props) {
  if (!journey) return null;
  const recommended = matchProductsForJourney(journey, products, 3);
  const collectionHref = `/collection?mood=${journey.mood}&journey=${journey.slug}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-gold/25 bg-bz-card p-0 overflow-hidden">
        <img
          src={journey.image}
          alt={`${journey.title} scent world illustration`}
          className="h-40 w-full object-cover opacity-90"
        />
        <div className="p-6 pt-4">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-cream text-2xl">{journey.title}</DialogTitle>
            <DialogDescription className="font-body text-cream/70">{journey.blurb}</DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-2">
            <NoteRow label="Top" items={journey.notes.top} />
            <NoteRow label="Heart" items={journey.notes.heart} />
            <NoteRow label="Base" items={journey.notes.base} />
          </div>

          {loading && (
            <div className="mt-6" aria-busy>
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-gold/80 mb-3">
                Fragrances in this world
              </p>
              <ul className="space-y-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-gold/15 p-2"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-bz-secondary/60">
                      <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="relative h-3.5 w-2/3 overflow-hidden rounded bg-cream/10">
                        <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
                      </div>
                      <div className="relative h-3 w-1/4 overflow-hidden rounded bg-cream/10">
                        <div className="shimmer-gold absolute inset-0 motion-reduce:hidden" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && recommended.length > 0 && (
            <div className="mt-6">
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-gold/80 mb-3">
                Fragrances in this world
              </p>
              <ul className="space-y-2">
                {recommended.map((p) => (
                  <li key={p.node.handle}>
                    <Link
                      to={`/products/${p.node.handle}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-md border border-gold/15 p-2 transition-colors hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {p.node.images.edges[0]?.node.url && (
                        <img
                          src={p.node.images.edges[0].node.url}
                          alt={p.node.title}
                          loading="lazy"
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-body text-sm text-cream">{p.node.title}</span>
                        <span className="block font-body text-xs text-gold/80">{price(p)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button asChild className="mt-6 w-full bg-gold text-black hover:bg-gold/90">
            <Link to={collectionHref} onClick={() => onOpenChange(false)}>
              Explore all {journey.mood}
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
