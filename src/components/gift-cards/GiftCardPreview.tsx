import { GIFT_TIERS, GiftTier } from "@/lib/giftCards";
import { cn } from "@/lib/utils";

interface Props {
  tier: GiftTier;
  recipientName?: string;
  senderName?: string;
  message?: string;
  code?: string;
  className?: string;
}

export const GiftCardPreview = ({
  tier,
  recipientName,
  senderName,
  message,
  code,
  className,
}: Props) => {
  const t = GIFT_TIERS.find((x) => x.id === tier)!;
  return (
    <div
      className={cn(
        "relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-primary/40 shadow-2xl",
        "bg-gradient-to-br from-[#0a0908] via-[#1a1410] to-[#0a0908]",
        className,
      )}
    >
      {/* Foil shimmer */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.25), transparent 50%)",
        }}
      />

      {/* Top: brand */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
        <span
          className="font-cormorant text-xl tracking-[0.4em] text-primary"
          style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
        >
          BAZUKI
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
          Gift Card · {t.name}
        </span>
      </div>

      {/* Middle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/50 mb-2">
          For
        </p>
        <p className="font-cormorant text-3xl md:text-4xl text-foreground mb-4 line-clamp-1">
          {recipientName || "Your loved one"}
        </p>
        {message && (
          <p className="font-cormorant italic text-sm md:text-base text-foreground/70 max-w-md line-clamp-3">
            "{message}"
          </p>
        )}
      </div>

      {/* Bottom */}
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            From
          </p>
          <p className="font-cormorant text-base text-foreground/90">
            {senderName || "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-cormorant text-2xl text-primary">
            ₹{t.price.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] tracking-[0.2em] text-foreground/40 font-mono mt-1">
            {code || "XXXX-XXXX-XXXX"}
          </p>
        </div>
      </div>
    </div>
  );
};
