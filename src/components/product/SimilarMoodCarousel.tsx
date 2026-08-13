import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { buildLibrary } from "@/lib/libraryMapper";
import { matchProductsByMood, productMood } from "@/lib/moodMatch";
import ShopifyProductCard from "@/components/library/ShopifyProductCard";

interface Props {
  product: ShopifyProduct["node"];
}

export default function SimilarMoodCarousel({ product }: Props) {
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

  const mood = useMemo(
    () => productMood({ node: product } as ShopifyProduct),
    [product],
  );

  const items = useMemo(() => {
    const matches = matchProductsByMood(products, mood, product.handle, 8);
    return buildLibrary(matches, []);
  }, [products, mood, product.handle]);

  if (items.length === 0) return null;

  return (
    <section className="mt-20" aria-labelledby="similar-mood-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="similar-mood-heading"
            className="font-display text-[28px] flex items-center gap-3"
            style={{ color: "var(--anim-ivory)" }}
          >
            <span style={{ color: "var(--anim-gold)" }}>✦</span>
            Similar to this mood — {mood}
          </h2>
          <div className="pdp-underline-draw mt-3" />
        </div>
        <Link
          to={`/collection?mood=${mood}`}
          className="font-body text-sm text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          See all {mood} →
        </Link>
      </div>

      <div className="-mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-4 scrollbar-none">
        {items.map((item, i) => (
          <div key={item.id} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
            <ShopifyProductCard item={item} index={i} onOpen={() => {}} />
          </div>
        ))}
      </div>
    </section>
  );
}
