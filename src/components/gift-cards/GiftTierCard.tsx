import { Button } from "@/components/ui/button";
import { GiftTierInfo } from "@/lib/giftCards";
import { Check } from "lucide-react";

interface Props {
  tier: GiftTierInfo;
  onBuy: () => void;
  featured?: boolean;
}

export const GiftTierCard = ({ tier, onBuy, featured }: Props) => {
  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-card p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.4)] ${
        featured ? "border-primary/60" : "border-border/60"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em]">
          Most Loved
        </span>
      )}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {tier.size} bottle
      </p>
      <h3 className="font-cormorant text-3xl md:text-4xl mt-2 text-foreground">
        {tier.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 italic">{tier.tagline}</p>

      <div className="mt-6 mb-8">
        <span className="font-cormorant text-5xl text-primary">
          ₹{tier.price.toLocaleString("en-IN")}
        </span>
      </div>

      <ul className="space-y-3 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onBuy}
        className="mt-8 w-full rounded-full text-xs uppercase tracking-[0.2em] py-6"
        variant={featured ? "default" : "outline"}
      >
        Buy {tier.name} Gift
      </Button>
    </div>
  );
};
