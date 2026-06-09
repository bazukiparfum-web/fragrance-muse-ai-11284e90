import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Dark luxury image stage: square, gold corner brackets, dark card backdrop,
 * gradient bottom fade so light-bg product photos blend in cleanly,
 * hover gold radial glow + image zoom, entry fade/scale.
 */
export default function ProductImageStage({ src, alt, className }: Props) {
  return (
    <div className={cn("pdp-image-stage pdp-image-fade group relative aspect-square w-full rounded-xl overflow-hidden", className)}>
      <div className="pdp-image-glow absolute inset-0 pointer-events-none" aria-hidden />
      {src ? (
        <img
          src={src}
          alt={alt}
          className="pdp-image relative z-[1] w-full h-full object-contain object-center p-5 transition-transform duration-[400ms] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="relative z-[1] w-full h-full flex items-center justify-center">
          <ShoppingBag className="h-16 w-16" style={{ color: "var(--anim-dim-gold)" }} />
        </div>
      )}
      <span className="pdp-corner pdp-corner-tl" aria-hidden />
      <span className="pdp-corner pdp-corner-tr" aria-hidden />
      <span className="pdp-corner pdp-corner-bl" aria-hidden />
      <span className="pdp-corner pdp-corner-br" aria-hidden />
    </div>
  );
}

