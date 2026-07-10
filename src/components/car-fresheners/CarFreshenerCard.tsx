import { Link } from "react-router-dom";
import { useState } from "react";
import { Loader2, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import type { CarFreshenerListItem } from "@/lib/carFreshenerCatalog";

interface Props {
  item: CarFreshenerListItem;
}

export default function CarFreshenerCard({ item }: Props) {
  const accent = `hsl(${item.accentHsl})`;
  const accentSoft = `hsl(${item.accentHsl} / 0.14)`;
  const accentBorder = `hsl(${item.accentHsl} / 0.45)`;

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">(
    "idle",
  );

  const canBuy = !!(item.shopify && item.variantId);
  const detailHref = `/shop/car-fresheners/${item.handle}`;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canBuy || !item.shopify || !item.variantId || status === "adding") return;
    setStatus("adding");
    const variant = item.shopify.node.variants.edges[0]?.node;
    const ok = await addItem({
      product: item.shopify,
      variantId: item.variantId,
      variantTitle: variant?.title ?? "Default",
      price: {
        amount: String(item.price),
        currencyCode: item.currency,
      },
      quantity: 1,
      selectedOptions: variant?.selectedOptions ?? [],
    });
    if (ok) {
      setStatus("added");
      openDrawer();
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

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
      <Link to={detailHref} className="block">
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
          <span
            className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-gold/50"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-gold/50"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-gold/50"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-gold/50"
            aria-hidden
          />
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link to={detailHref} className="block">
          <h3 className="font-cormorant text-2xl text-cream leading-tight hover:text-gold transition-colors">
            {item.name}
          </h3>
          <p className="mt-1 text-sm text-cream-muted line-clamp-2">
            {item.tagline}
          </p>
        </Link>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.notes.map((n) => (
            <span
              key={n}
              className="rounded-full px-2.5 py-1 text-[11px] tracking-wide"
              style={{
                backgroundColor: accentSoft,
                color: "hsl(var(--bz-cream))",
              }}
            >
              {n}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gold/10">
          <span className="font-cormorant text-xl text-cream">
            {item.currency === "INR" || !item.currency
              ? `₹${Math.round(item.price).toLocaleString("en-IN")}`
              : `${item.currency} ${Math.round(item.price)}`}
          </span>
          {canBuy ? (
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={status === "adding"}
              className={cn(
                "gap-2",
                status === "added" && "bg-emerald-600 hover:bg-emerald-600",
                status === "error" && "bg-red-600 hover:bg-red-600",
              )}
            >
              {status === "adding" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Adding
                </>
              ) : status === "added" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added
                </>
              ) : status === "error" ? (
                "Retry"
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to cart
                </>
              )}
            </Button>
          ) : (
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
                <TooltipContent side="top">
                  Launching soon on our store.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </article>
  );
}
