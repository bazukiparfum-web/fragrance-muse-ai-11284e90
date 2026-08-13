import { useEffect, useState } from "react";
import { Reveal } from "@/components/anim/Reveal";
import SenseCard from "@/components/home/SenseCard";
import SenseJourneyDialog from "@/components/home/SenseJourneyDialog";
import { SENSE_JOURNEYS, type SenseJourney } from "@/data/senseJourneys";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";

export default function TravelThroughSenses() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selected, setSelected] = useState<SenseJourney | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchShopifyProducts(50, "NOT tag:diffuser")
      .then((p) => {
        if (!cancelled) setProducts(p);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (journey: SenseJourney) => {
    setSelected(journey);
    setOpen(true);
  };

  return (
    <section
      aria-labelledby="travel-senses-heading"
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: "#0A0805" }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <Reveal variant="headline" as="p" className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-4">
            Pick a world
          </Reveal>
          <h2 id="travel-senses-heading">
            <Reveal
              variant="headline"
              delay={80}
              as="span"
              className="block font-display text-cream text-3xl md:text-[44px] uppercase tracking-[0.06em]"
            >
              Travel Through the Senses
            </Reveal>
          </h2>
          <Reveal
            variant="headline"
            delay={140}
            as="p"
            className="font-body text-cream/60 text-sm md:text-base mt-4 max-w-xl mx-auto"
          >
            Choose the place you want to be — we'll take you to the scent that lives there.
          </Reveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {SENSE_JOURNEYS.map((journey) => (
            <SenseCard key={journey.slug} journey={journey} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      <SenseJourneyDialog
        journey={selected}
        products={products}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}
