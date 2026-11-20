import { useEffect, useState } from "react";
import { fetchShopifyProducts, isDiffuserFamily, isDiffuserProduct, DIFFUSER_FAMILY_QUERY } from "@/lib/shopify";
import { buildLibrary, type LibraryItem } from "@/lib/libraryMapper";
import ShopifyProductCard from "@/components/library/ShopifyProductCard";

interface Props {
  excludeHandle?: string;
  family?: "diffuser" | "default";
}

export default function RelatedProducts({ excludeHandle, family = "default" }: Props) {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const diff = family === "diffuser";
    fetchShopifyProducts(diff ? 30 : 8, diff ? DIFFUSER_FAMILY_QUERY : "NOT tag:diffuser")
      .then((all) => {
        if (cancelled) return;
        let products = all.filter((p) => p.node.handle !== excludeHandle);
        if (diff) {
          products = products.filter((p) => isDiffuserFamily(p.node));
          // Aim for at least one oil and one diffuser among the first 3.
          const oils = products.filter((p) => !isDiffuserProduct(p.node));
          const diffusers = products.filter((p) => isDiffuserProduct(p.node));
          const picked = [oils[0], diffusers[0]].filter(Boolean);
          products = [...picked, ...products.filter((p) => !picked.includes(p))];
        }
        const lib = buildLibrary(products, []).filter(
          (i) => i.shopify?.raw.node.handle !== excludeHandle,
        );
        setItems(lib.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excludeHandle, family]);

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
