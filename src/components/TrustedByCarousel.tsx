import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { ClientLogo } from "@/data/clientLogos";

interface TrustedByCarouselProps {
  logos: ClientLogo[];
  eyebrow?: string;
  title?: string;
  className?: string;
  /** Visible heading on About page; sr-only on Business strip */
  headingVisible?: boolean;
}

const LogoTile = ({ logo }: { logo: ClientLogo }) => {
  const img = (
    <img
      src={logo.src}
      alt={logo.name}
      loading="lazy"
      className="h-12 md:h-14 w-auto max-w-[160px] object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
    />
  );
  return (
    <div className="flex h-20 items-center justify-center px-6">
      {logo.href ? (
        <a
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={logo.name}
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
};

export const TrustedByCarousel = ({
  logos,
  eyebrow = "Trusted By",
  title = "Brands that trust Bazuki",
  className,
  headingVisible = true,
}: TrustedByCarouselProps) => {
  if (!logos || logos.length === 0) return null;

  const autoplay = useRef(
    Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  // Duplicate logos for seamless mobile marquee loop
  const marqueeLogos = [...logos, ...logos];

  return (
    <section
      aria-labelledby="trusted-by-heading"
      className={cn("py-16 md:py-20 bg-bz-secondary", className)}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {eyebrow}
          </p>
          <h2
            id="trusted-by-heading"
            className={cn(
              "mt-3 font-serif font-light text-cream text-[26px] md:text-[34px]",
              !headingVisible && "sr-only",
            )}
          >
            {title}
          </h2>
        </div>

        {/* Mobile marquee */}
        <div className="md:hidden tb-marquee-mask">
          <div className="tb-marquee-track">
            {marqueeLogos.map((logo, i) => (
              <LogoTile key={`${logo.name}-${i}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* Desktop carousel */}
        <div className="hidden md:block">
          <Carousel
            opts={{ align: "start", loop: logos.length > 5 }}
            plugins={logos.length > 5 ? [autoplay.current] : []}
            className="mx-12"
          >
            <CarouselContent>
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.name}
                  className="basis-1/3 lg:basis-1/5"
                >
                  <LogoTile logo={logo} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {logos.length > 5 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </div>
      </div>

      <style>{`
        .tb-marquee-mask {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
        }
        .tb-marquee-track {
          display: flex;
          width: max-content;
          animation: tb-marquee 28s linear infinite;
        }
        .tb-marquee-mask:hover .tb-marquee-track,
        .tb-marquee-mask:active .tb-marquee-track {
          animation-play-state: paused;
        }
        @keyframes tb-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tb-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default TrustedByCarousel;
