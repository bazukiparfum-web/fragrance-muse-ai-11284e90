import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import ProductImage from "@/components/library/ProductImage";

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

function getNoteHighlights(item: LibraryItem): string[] {
  const { top, heart, base } = item.notes;
  const out: string[] = [];
  if (top[0]) out.push(top[0]);
  if (heart[0]) out.push(heart[0]);
  if (base[0]) out.push(base[0]);
  return out.slice(0, 3);
}

export default function ShopifyProductCard({ item, index = 0 }: Props) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [pulse, setPulse] = useState(false);

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
  const priceAmount = selected
    ? parseFloat(selected.price.amount)
    : parseFloat(raw.node.priceRange.minVariantPrice.amount);
  const outOfStock = !selected?.availableForSale;
  const noteHighlights = getNoteHighlights(item);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selected || status === "adding") return;
    setPulse(true);
    setTimeout(() => setPulse(false), 160);
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
      onClick={() => navigate(`/products/${raw.node.handle}`)}
      className={cn(
        "lux-card-enter lux-card-shadow group relative flex flex-col overflow-hidden rounded-xl cursor-pointer",
        "bg-[var(--anim-amber)] border border-[hsl(var(--bz-gold)/0.15)]",
        "transition-all duration-[350ms] ease-out hover:-translate-y-1 hover:border-[hsl(var(--bz-gold)/0.5)] active:scale-[0.995]",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 80}ms` }}
    >
      {/* Image stage */}
      <div className="relative">
        <ProductImage
          src={image?.url}
          alt={image?.altText || raw.node.title}
          stage
          height="h-[240px] md:h-[260px]"
          eager={index < 3}
          imgClassName="group-hover:scale-[1.06] transition-transform duration-[400ms] ease-out"
        />
        <span className="lux-card-glow absolute inset-0" aria-hidden />
      </div>

      <div className="flex flex-col gap-3 px-[18px] pt-4 pb-[18px]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[15px] text-cream leading-snug line-clamp-2">
            {raw.node.title}
          </h3>
          <span className="font-display text-[14px] text-gold whitespace-nowrap">
            {formatPrice(priceAmount, currency)}
          </span>
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

        {variants.length > 1 && (
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 rounded-md bg-[var(--anim-amber)] border border-[hsl(var(--bz-gold)/0.3)] text-gold text-xs focus:ring-1 focus:ring-[hsl(var(--bz-gold)/0.6)] focus:border-[hsl(var(--bz-gold)/0.6)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--bz-bg-card))] border-[hsl(var(--bz-gold)/0.3)]">
                {variants.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id}
                    className={cn(
                      "text-cream focus:bg-[hsl(var(--bz-gold)/0.1)] focus:text-gold",
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
            "lux-btn rounded-md mt-1 h-10 border text-[12px] uppercase tracking-[0.12em] font-medium transition-colors duration-[250ms]",
            outOfStock
              ? "bg-transparent border-[hsl(var(--bz-gold)/0.2)] text-[hsl(var(--bz-cream-muted)/0.5)] cursor-not-allowed hover:bg-transparent"
              : status === "added"
              ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-600 text-white"
              : status === "error"
              ? "bg-red-600 border-red-600 hover:bg-red-600 text-white"
              : "bg-transparent border-[hsl(var(--bz-gold))] text-gold hover:bg-[hsl(var(--bz-gold))] hover:text-primary-foreground",
            pulse && "lux-btn-pulse",
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
