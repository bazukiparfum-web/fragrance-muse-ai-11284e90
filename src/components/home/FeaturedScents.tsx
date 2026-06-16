import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import ProductImage from "@/components/library/ProductImage";

const formatINR = (amount: string | number) => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const FeaturedScents = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    fetchShopifyProducts(8).then((p) => {
      if (cancel) return;
      setProducts(p);
      setLoading(false);
    });
    return () => {
      cancel = true;
    };
  }, []);

  // Hide entire section if nothing to show (no dead band)
  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24" style={{ backgroundColor: "#111111" }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <Reveal variant="headline" as="p" className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-4">
            From the Library
          </Reveal>
          <Reveal variant="headline" delay={80} as="h2" className="font-display text-cream text-4xl md:text-[44px]">
            Explore Bazuki<sup className="text-[0.45em] tracking-normal align-top ml-0.5">®</sup> Signature Scents
          </Reveal>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-xl bg-bz-card border border-gold/15 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="md:hidden -mx-6 px-6 overflow-x-auto">
              <div className="flex gap-4 snap-x snap-mandatory pb-4">
                {products.slice(0, 6).map((p, i) => (
                  <div key={p.node.id} className="snap-start shrink-0 w-[78%]">
                    <ShopifyMiniCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: 4-col grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {products.slice(0, 4).map((p, i) => (
                <Reveal key={p.node.id} variant="item" delay={i * 80}>
                  <ShopifyMiniCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-10">
          <Link
            to="/collection"
            className="font-body text-gold text-sm uppercase tracking-[0.22em] hover:opacity-80 transition-opacity"
          >
            View all scents →
          </Link>
        </div>
      </div>
    </section>
  );
};

const ShopifyMiniCard = ({ product, index }: { product: ShopifyProduct; index: number }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const firstVariant = node.variants.edges.find((e) => e.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const priceAmount = firstVariant?.price.amount ?? node.priceRange.minVariantPrice.amount;
  const currency = firstVariant?.price.currencyCode ?? node.priceRange.minVariantPrice.currencyCode;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant || status !== "idle") return;
    setStatus("adding");
    try {
      const ok = await addItem({
        product,
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: { amount: firstVariant.price.amount, currencyCode: currency },
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions ?? [],
      });
      if (ok) {
        setStatus("added");
        openDrawer();
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  return (
    <article
      onClick={() => navigate(`/products/${node.handle}`)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-bz-card border border-gold/15 transition-all duration-200 hover:-translate-y-1 hover:glow-gold-sm h-full flex flex-col"
    >
      <ProductImage
        src={image?.url}
        alt={image?.altText || node.title}
        aspect="aspect-[4/5]"
        eager={index < 2}
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-cream text-xl mb-1 leading-tight">{node.title}</h3>
        <div className="flex items-center justify-between mb-4 mt-auto">
          <span className="font-body text-gold text-sm tracking-wide">
            From {formatINR(priceAmount)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={status !== "idle"}
          className="font-body text-xs uppercase tracking-[0.18em] py-2.5 rounded-pill bg-gold text-[hsl(var(--bz-bg-primary))] hover:glow-gold-sm transition-all disabled:opacity-80 flex items-center justify-center gap-2"
        >
          {status === "adding" ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Adding…</>
          ) : status === "added" ? (
            <><Check className="h-3 w-3" /> Added</>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </article>
  );
};

export default FeaturedScents;
