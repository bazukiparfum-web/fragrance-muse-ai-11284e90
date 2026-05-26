import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FragrancePyramid } from "@/components/FragrancePyramid";
import { FormulaTweakDialog } from "@/components/FormulaTweakDialog";
import { toNotes } from "@/lib/noteDescriptions";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LibraryItem } from "@/lib/libraryMapper";

interface Props {
  item: LibraryItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type SizeKey = "ml30" | "ml50";

export default function ScentDetailDrawer({ item, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [size, setSize] = useState<SizeKey>("ml30");
  const [tweakOpen, setTweakOpen] = useState(false);

  useEffect(() => {
    if (item) {
      // Custom scents (source === 'scent') cannot be bought as single 30ml.
      const allow30 = item.source === 'shopify';
      if (allow30 && item.prices.ml30) setSize('ml30');
      else setSize('ml50');
    }
  }, [item]);

  if (!item) return null;

  const sizeLabel = size === "ml30" ? "30ml" : "50ml";
  const price = item.prices[size];

  const handleAddToCart = async () => {
    if (item.source !== "shopify" || !item.shopify) {
      toast.info("Add to cart for community scents is coming soon", {
        description: "Tap 'Tweak This Scent' to craft your own with our AI engine.",
      });
      return;
    }
    const wantedSize = size === "ml30" ? /30\s?ml/i : /50\s?ml/i;
    const variant =
      item.shopify.variants.find(
        (v) => wantedSize.test(`${v.title} ${v.size ?? ""}`) && v.available,
      ) ||
      item.shopify.variants.find((v) => v.available) ||
      item.shopify.variants[0];

    if (!variant) {
      toast.error("This fragrance is currently unavailable.");
      return;
    }

    await addItem({
      product: item.shopify.raw,
      variantId: variant.id,
      variantTitle: variant.title,
      price: { amount: String(variant.amount), currencyCode: "INR" },
      quantity: 1,
      selectedOptions: [{ name: "Size", value: sizeLabel }],
    });
    toast.success(`Added to cart`, { description: `${item.name} · ${sizeLabel}` });
  };

  const hasEditableFormula =
    item.source === "scent" &&
    item.scent?.formula &&
    (Array.isArray(item.scent.formula)
      ? item.scent.formula.length > 0
      : Array.isArray(item.scent.formula?.notes) && item.scent.formula.notes.length > 0);

  const handleTweak = () => {
    if (hasEditableFormula) {
      setTweakOpen(true);
      return;
    }
    toast.info("This signature's formula is private", {
      description: "Take the quiz to craft a similar scent with our AI.",
    });
    onOpenChange(false);
    navigate(`/shop/quiz?seed=${encodeURIComponent(item.id)}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-bz-bg-card border-l border-gold w-full sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <div className="text-xs uppercase tracking-widest text-gold-muted">{item.mood}</div>
          <SheetTitle className="font-display text-3xl text-cream">{item.name}</SheetTitle>
          <SheetDescription className="text-cream-muted text-sm leading-relaxed">
            {item.description}
          </SheetDescription>
        </SheetHeader>

        <div className="my-6 flex justify-center">
          <FragrancePyramid
            size="lg"
            topNotes={toNotes(item.notes.top)}
            heartNotes={toNotes(item.notes.heart)}
            baseNotes={toNotes(item.notes.base)}
          />
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-gold-muted">Choose your size</div>
          <div className="flex gap-2">
            {(["ml30", "ml50"] as SizeKey[]).map((k) => {
              const p = item.prices[k];
              if (!p) return null;
              const label = k === "ml30" ? "30ml" : "50ml";
              const active = size === k;
              return (
                <button
                  key={k}
                  onClick={() => setSize(k)}
                  className={cn(
                    "flex-1 rounded-pill border px-4 py-3 text-sm transition-all",
                    active
                      ? "bg-gold text-primary-foreground border-transparent glow-gold-sm"
                      : "border-gold-strong text-cream hover:border-gold",
                  )}
                >
                  <div className="font-medium">{label}</div>
                  <div className={cn("text-xs mt-0.5", active ? "opacity-80" : "text-gold")}>
                    ₹{p}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            disabled={isLoading}
            onClick={handleAddToCart}
            className="bg-gold text-primary-foreground hover:bg-gold/90 rounded-pill"
          >
            {isLoading ? "Adding…" : `Add to Cart — ₹${price ?? "--"}`}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleTweak}
            className="rounded-pill border-gold-strong text-gold hover:bg-gold hover:text-primary-foreground"
          >
            Tweak This Scent
          </Button>
        </div>
      </SheetContent>
      {item.scent && (
        <FormulaTweakDialog
          open={tweakOpen}
          onOpenChange={setTweakOpen}
          originalScent={item.scent}
        />
      )}
    </Sheet>
  );
}
