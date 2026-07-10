import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
  accentHsl: string;
}

export default function CarFreshenerGallery({ images, alt, accentHsl }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxApi, setLightboxApi] = useState<CarouselApi>();
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const total = images.length;
  const multi = total > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  // Sync lightbox api events
  useEffect(() => {
    if (!lightboxApi) return;
    const onSelect = () => setLightboxIndex(lightboxApi.selectedScrollSnap());
    onSelect();
    lightboxApi.on("select", onSelect);
    lightboxApi.on("reInit", onSelect);
    return () => {
      lightboxApi.off("select", onSelect);
      lightboxApi.off("reInit", onSelect);
    };
  }, [lightboxApi]);

  const openLightbox = useCallback(
    (startAt: number) => {
      setLightboxIndex(startAt);
      setLightboxOpen(true);
    },
    [],
  );

  // When the lightbox opens (or its api mounts), jump to the requested slide.
  useEffect(() => {
    if (lightboxOpen && lightboxApi) {
      lightboxApi.scrollTo(lightboxIndex, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, lightboxApi]);

  // Keyboard controls + body scroll lock while lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") lightboxApi?.scrollPrev();
      else if (e.key === "ArrowRight") lightboxApi?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, lightboxApi]);

  const Brackets = () => (
    <>
      <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-gold/50" />
      <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-gold/50" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-gold/50" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-gold/50" />
    </>
  );

  return (
    <div className="w-full">
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-gold/15 bg-bz-secondary">
        <Carousel
          setApi={setApi}
          opts={{ loop: multi, duration: 30 }}
          className="h-full w-full"
        >
          <CarouselContent className="h-full ml-0">
            {images.map((src, i) => (
              <CarouselItem key={`${src}-${i}`} className="h-full pl-0 basis-full">
                <button
                  type="button"
                  onClick={() => openLightbox(i)}
                  aria-label={`Zoom image ${i + 1}`}
                  className="relative aspect-square w-full overflow-hidden cursor-zoom-in block"
                >
                  <img
                    src={src}
                    alt={`${alt} — image ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <Brackets />

        {/* Expand hint */}
        <button
          type="button"
          onClick={() => openLightbox(index)}
          aria-label="Expand image"
          className="absolute top-3 right-3 z-10 grid place-items-center h-9 w-9 rounded-full border border-gold/30 bg-bz-primary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-primary hover:border-gold opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </button>

        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => api?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 rounded-full border border-gold/30 bg-bz-primary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-primary hover:border-gold md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => api?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 rounded-full border border-gold/30 bg-bz-primary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-primary hover:border-gold md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 right-4 z-10 rounded-full border border-gold/30 bg-bz-primary/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-gold backdrop-blur">
              {index + 1} / {total}
            </div>
          </>
        )}
      </div>

      {multi && (
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((src, i) => {
            const active = i === index;
            return (
              <button
                key={`thumb-${src}-${i}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`View image ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "relative shrink-0 h-16 w-16 md:h-[72px] md:w-[72px] rounded-md overflow-hidden border transition-all duration-300 motion-reduce:transition-none",
                  active
                    ? "border-gold"
                    : "border-gold/15 hover:border-gold/40 opacity-70 hover:opacity-100",
                )}
                style={
                  active
                    ? { boxShadow: `0 0 0 2px hsl(${accentHsl} / 0.35)` }
                    : undefined
                }
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — image ${lightboxIndex + 1} of ${total}`}
          className="fixed inset-0 z-[100] bg-bz-primary/95 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 z-10 grid place-items-center h-11 w-11 rounded-full border border-gold/30 bg-bz-secondary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-secondary hover:border-gold"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          {multi && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 rounded-full border border-gold/30 bg-bz-secondary/60 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-gold backdrop-blur">
              {lightboxIndex + 1} / {total}
            </div>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center p-6 md:p-14"
            onClick={(e) => e.stopPropagation()}
          >
            <Carousel
              setApi={setLightboxApi}
              opts={{ loop: multi, duration: 30, startIndex: lightboxIndex }}
              className="w-full h-full"
            >
              <CarouselContent className="h-full ml-0">
                {images.map((src, i) => (
                  <CarouselItem
                    key={`lb-${src}-${i}`}
                    className="h-full pl-0 basis-full flex items-center justify-center"
                  >
                    <img
                      src={src}
                      alt={`${alt} — image ${i + 1}`}
                      className="max-h-[85vh] max-w-full w-auto h-auto object-contain select-none"
                      draggable={false}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {multi && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxApi?.scrollPrev();
                  }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-12 w-12 rounded-full border border-gold/30 bg-bz-secondary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-secondary hover:border-gold"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxApi?.scrollNext();
                  }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-12 w-12 rounded-full border border-gold/30 bg-bz-secondary/70 text-gold backdrop-blur transition-all duration-300 hover:bg-bz-secondary hover:border-gold"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {multi && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[92vw] overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => {
                const active = i === lightboxIndex;
                return (
                  <button
                    key={`lb-thumb-${src}-${i}`}
                    type="button"
                    aria-label={`View image ${i + 1}`}
                    onClick={() => lightboxApi?.scrollTo(i)}
                    className={cn(
                      "relative shrink-0 h-14 w-14 rounded-md overflow-hidden border transition-all duration-300",
                      active
                        ? "border-gold"
                        : "border-gold/20 hover:border-gold/50 opacity-60 hover:opacity-100",
                    )}
                    style={
                      active
                        ? { boxShadow: `0 0 0 2px hsl(${accentHsl} / 0.4)` }
                        : undefined
                    }
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
