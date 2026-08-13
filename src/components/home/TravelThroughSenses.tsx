import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/anim/Reveal";
import SenseCard from "@/components/home/SenseCard";
import { SENSE_JOURNEYS, type SenseJourney } from "@/data/senseJourneys";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";

function resolveLink(journey: SenseJourney, products: ShopifyProduct[]): string {
  const match = journey.keywords.reduce<ShopifyProduct | undefined>((found, keyword) => {
    if (found) return found;
    const k = keyword.toLowerCase();
    return products.find((p) => {
      const haystack = `${p.node.title} ${p.node.handle} ${p.node.description ?? ""}`.toLowerCase();
      return haystack.includes(k);
    });
  }, undefined);

  if (match) return `/products/${match.node.handle}`;
  return `/collection?mood=${journey.mood}`;
}

export default function TravelThroughSenses() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);

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

  const links = useMemo(
    () => SENSE_JOURNEYS.map((j) => resolveLink(j, products)),
    [products],
  );

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
          <Reveal
            variant="headline"
            delay={80}
            as="h2"
            id="travel-senses-heading"
            className="font-display text-cream text-3xl md:text-[44px] uppercase tracking-[0.06em]"
          >
            Travel Through the Senses
          </Reveal>
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
          {SENSE_JOURNEYS.map((journey, i) => (
            <SenseCard key={journey.slug} journey={journey} to={links[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
