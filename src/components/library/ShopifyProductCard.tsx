import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { LibraryItem } from "@/lib/libraryMapper";

interface Props {
  item: LibraryItem;
  onOpen: (item: LibraryItem) => void;
  index?: number;
}

function formatPrice(amount: number, currencyCode: string) {
  const rounded = Math.round(amount);
  if (currencyCode === "INR" || !currencyCode) return `₹${rounded}`;
  return `${currencyCode} ${rounded}`;
}

export default function ShopifyProductCard({ item, onOpen, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");

  const raw = item.shopify!.raw;
  const variants = raw.node.variants.edges.map((e) => e.node);
  const [selectedId, setSelectedId] = useState<string>(
    variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id,
  );
  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0],
    [variants, selectedId],
  );

  const image = raw.node.images.edges[0]?.node;
  const currency =
    selected?.price.currencyCode ||
    raw.node.priceRange.minVariantPrice.currencyCode ||
    "INR";
  const priceAmount = selected ? parseFloat(selected.price.amount) : parseFloat(raw.node.priceRange.minVariantPrice.amount);
  const outOfStock = !selected?.availableForSale;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selected || status === "adding") return;
    setStatus("adding");
    try {
      const ok = await addItem({
        product: raw,
        variantId: selected.id,
        variantTitle: selected.title,
        price: { amount: selected.price.amount, currencyCode: currency },
        quantity: 1,
        selectedOptions: selected.selectedOptions ?? [],
      });
      if (ok) {
        setStatus("added");
        openDrawer();
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <article
      onClick={() => onOpen(item)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-bz-card border border-gold cursor-pointer",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-strong hover:glow-gold-sm",
        "animate-[fade-in_0.5s_ease-out_both]",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bz-secondary/60">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || raw.node.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gold-muted text-xs uppercase tracking-widest">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-cream leading-tight">
            {raw.node.title}
          </h3>
          <span className="text-gold whitespace-nowrap">
            {formatPrice(priceAmount, currency)}
          </span>
        </div>

        {variants.length > 1 && (
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="bg-bz-secondary/60 border-gold-strong text-cream rounded-pill h-10 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bz-card border-gold-strong">
                {variants.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id}
                    className={cn(
                      "text-cream focus:bg-gold/10 focus:text-cream",
                      !v.availableForSale && "opacity-50",
                    )}
                  >
                    {v.title} — {formatPrice(parseFloat(v.price.amount), v.price.currencyCode)}
                    {!v.availableForSale && " (Sold out)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          disabled={outOfStock || status === "adding"}
          onClick={handleAdd}
          className={cn(
            "rounded-pill mt-1 transition-colors",
            outOfStock
              ? "bg-bz-secondary/60 text-cream-muted hover:bg-bz-secondary/60 cursor-not-allowed"
              : status === "added"
              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
              : status === "error"
              ? "bg-red-600 hover:bg-red-600 text-white"
              : "bg-gold text-primary-foreground hover:bg-gold/90",
          )}
        >
          {status === "adding" ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding...</>
          ) : status === "added" ? (
            <><Check className="h-4 w-4 mr-2" />Added</>
          ) : status === "error" ? (
            "Failed — Retry"
          ) : outOfStock ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>
    </article>
  );
}
