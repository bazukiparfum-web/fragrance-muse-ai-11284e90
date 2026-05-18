import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Aspect ratio class, e.g. "aspect-[4/5]". Defaults to aspect-[4/5]. */
  aspect?: string;
  /** Higher-priority image (above-the-fold). Skips lazy loading. */
  eager?: boolean;
}

/**
 * Premium product image with:
 *  - shimmer skeleton while loading
 *  - graceful fallback on error / missing src (no broken-image icon)
 *  - lazy decoding by default
 *  - fixed aspect ratio so layout never shifts on slow devices
 */
export default function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  aspect = "aspect-[4/5]",
  eager = false,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-bz-secondary/60",
        aspect,
        className,
      )}
    >
      {/* Shimmer skeleton — visible until image loads */}
      {!showFallback && !loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-bz-secondary/40 via-bz-card to-bz-secondary/40"
          aria-hidden
        />
      )}

      {showFallback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-bz-card to-bz-secondary/60 text-gold-muted">
          <ImageOff className="h-6 w-6 opacity-60" aria-hidden />
          <span className="font-body text-[10px] uppercase tracking-[0.22em]">
            Image unavailable
          </span>
        </div>
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
