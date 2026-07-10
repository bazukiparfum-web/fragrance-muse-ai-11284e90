import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
                <div className="relative aspect-square w-full overflow-hidden">
                  <img
                    src={src}
                    alt={`${alt} — image ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <Brackets />

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
    </div>
  );
}
