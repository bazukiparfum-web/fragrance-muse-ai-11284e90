import { useEffect, useState } from "react";
import { fetchShopifyProducts } from "@/lib/shopify";
import { buildLibrary, type LibraryItem } from "@/lib/libraryMapper";
import ShopifyProductCard from "@/components/library/ShopifyProductCard";

interface Props {
  excludeHandle?: string;
}

export default function RelatedProducts({ excludeHandle }: Props) {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchShopifyProducts(8, "NOT tag:diffuser")
      .then((products) => {
        if (cancelled) return;
        const lib = buildLibrary(products, []).filter(
          (i) => i.shopify?.raw.node.handle !== excludeHandle,
        );
        setItems(lib.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excludeHandle]);

  if (items.length === 0) return null;

  return (
    <section className="mt-20 mb-12">
      <div className="mb-8">
        <h2
          className="font-display text-[28px] flex items-center gap-3"
          style={{ color: "var(--anim-ivory)" }}
        >
          <span style={{ color: "var(--anim-gold)" }}>✦</span>
          You Might Also Love
        </h2>
        <div className="pdp-underline-draw mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <ShopifyProductCard
            key={item.id}
            item={item}
            index={i}
            onOpen={() => {}}
          />
        ))}
      </div>
    </section>
  );
}
