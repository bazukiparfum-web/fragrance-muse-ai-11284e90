import { useState } from "react";
import { cn } from "@/lib/utils";
import GoldBottleIcon from "@/components/library/GoldBottleIcon";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Aspect ratio class — ignored when `height` is set. */
  aspect?: string;
  /** Fixed height class, e.g. "h-[260px]". When set, overrides aspect. */
  height?: string;
  /** Apply mix-blend-multiply + padding so image floats on dark stage. */
  stage?: boolean;
  eager?: boolean;
}

/**
 * Premium product image with stage mode for the collection page:
 * dark backdrop, contained image, `mix-blend-mode: multiply` to blend away
 * white image backgrounds, and an elegant gold-bottle placeholder when missing.
 */
export default function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  aspect = "aspect-[4/5]",
  height,
  stage = false,
  eager = false,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        stage ? "lux-image-stage lux-image-fade" : "bg-bz-secondary/60",
        height ?? aspect,
        className,
      )}
    >
      {!showFallback && !loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-bz-secondary/40 via-bz-card to-bz-secondary/40"
          aria-hidden
        />
      )}

      {showFallback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gold">
          <GoldBottleIcon size={40} opacity={0.3} />
          <span className="italic text-[11px] text-gold-muted">
            Image Coming Soon
          </span>
        </div>
      ) : stage ? (
        <img
          src={src!}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
          style={{ padding: "16px" }}
        />
      ) : (
        <img
          src={src!}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

