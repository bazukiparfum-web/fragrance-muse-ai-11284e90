import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function DiffuserCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const navigate = useNavigate();
  const node = product.node;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants?.edges?.[0]?.node;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant) return;
    const ok = await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
    if (ok) toast.success(`${node.title} added to cart`);
    else toast.error("Failed to add to cart.");
  };

  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg group"
      onClick={() => navigate(`/products/${node.handle}`)}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-bold line-clamp-1">{node.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{node.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-lg">₹{parseFloat(price.amount).toLocaleString()}</span>
          <Button size="sm" onClick={handleAdd} disabled={isLoading || !firstVariant}>
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}

const BusinessDiffusers = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopifyProducts(50, "tag:diffuser")
      .then((p) => setProducts(p))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Aroma Diffusers for Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            IoT-ready diffusers engineered for hotels, retail, offices and spas — pair with any Bazuki signature scent.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <DiffuserCard key={p.node.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessDiffusers;
