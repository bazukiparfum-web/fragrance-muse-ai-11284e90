import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Star, Users, Sparkles, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchShopifyProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { JsonLd } from "@/components/JsonLd";

interface PublicScent {
  id: string;
  name: string;
  formulation_notes: string | null;
  match_score: number | null;
  intensity: number | null;
  longevity: number | null;
  visual_data: any;
  fragrance_code: string | null;
  creator_tag: string | null;
  created_at: string | null;
}

function getWeeklyIndex(length: number): number {
  if (length === 0) return 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(Date.now() / weekMs) % length;
}

function ScentCard({ scent, onClick }: { scent: PublicScent; onClick: () => void }) {
  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-center mb-3">
          {scent.visual_data && (
            <FragranceVisualizer visualData={scent.visual_data} size="small" />
          )}
        </div>
        <h3 className="font-serif text-lg font-bold text-center">{scent.name}</h3>
        {scent.formulation_notes && (
          <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2 italic">
            {scent.formulation_notes}
          </p>
        )}
        <div className="flex justify-center gap-2 mt-3">
          {scent.match_score && (
            <Badge variant="secondary" className="text-xs">{scent.match_score}% Match</Badge>
          )}
          {scent.creator_tag && (
            <Badge variant="outline" className="text-xs capitalize">{scent.creator_tag}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function ShopifyProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const navigate = useNavigate();
  const node = product.node;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants?.edges?.[0]?.node;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
    toast.success(`${node.title} added to cart`);
  };

  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg group"
      onClick={() => navigate(`/product/${node.handle}`)}
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
        <h3 className="font-serif text-lg font-bold">{node.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{node.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-lg">₹{parseFloat(price.amount).toLocaleString()}</span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading || !firstVariant}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}

const ProductShowcase = () => {
  const [scents, setScents] = useState<PublicScent[]>([]);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
      const [scentsResult, products] = await Promise.allSettled([
          supabase
            .from("saved_scents")
            .select("id, name, formulation_notes, match_score, intensity, longevity, visual_data, fragrance_code, creator_tag, created_at")
            .eq("is_public", true)
            .order("match_score", { ascending: false }),
          fetchShopifyProducts(),
        ]);

        if (scentsResult.status === 'fulfilled' && !scentsResult.value.error) {
          setScents((scentsResult.value.data || []) as PublicScent[]);
        }
        if (products.status === 'fulfilled') {
          setShopifyProducts(products.value);
        }
      } catch (err) {
        console.error("Failed to load showcase:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const hasContent = scents.length > 0 || shopifyProducts.length > 0;
  if (!hasContent) return null;

  const featuredScent = scents.length > 0 ? scents[getWeeklyIndex(scents.length)] : null;
  const trendingPicks = scents.filter(s => s.creator_tag === 'influencer' || s.creator_tag === 'celebrity').slice(0, 4);
  const communityFavs = scents.filter(s => !s.creator_tag).slice(0, 4);

  const priceValidUntil = `${new Date().getFullYear()}-12-31`;
  const itemListJsonLd = shopifyProducts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bazuki Signature Collection",
    itemListElement: shopifyProducts.map((p, idx) => {
      const node = p.node;
      const img = node.images?.edges?.[0]?.node;
      const price = node.priceRange.minVariantPrice;
      const productUrl = `${window.location.origin}/product/${node.handle}`;
      const item: Record<string, any> = {
        "@type": "Product",
        name: node.title,
        description: node.description || `${node.title} — luxury fragrance by Bazuki.`,
        url: productUrl,
        brand: { "@type": "Brand", name: "Bazuki Perfumes" },
        offers: {
          "@type": "Offer",
          price: parseFloat(price.amount).toFixed(2),
          priceCurrency: price.currencyCode || "INR",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          priceValidUntil,
          url: productUrl,
        },
      };
      if (img?.url) item.image = img.url;
      return {
        "@type": "ListItem",
        position: idx + 1,
        item,
      };
    }),
  } : null;

  return (
    <section className="py-20 md:py-32 bg-secondary">
      {itemListJsonLd && <JsonLd id="homepage-collection" data={itemListJsonLd} />}
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Signature Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each fragrance tells a story. Discover yours.
          </p>
        </div>

        {/* Shopify Products */}
        {shopifyProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <ShoppingBag className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Shop Our Collection</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {shopifyProducts.map(product => (
                <ShopifyProductCard key={product.node.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Fragrance of the Week */}
        {featuredScent && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Fragrance of the Week</h3>
            </div>
            <Card
              className="max-w-2xl mx-auto overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-xl"
              onClick={() => navigate(`/collection/${featuredScent.id}`)}
            >
              <div className="flex flex-col md:flex-row items-center p-8 gap-8">
                <div className="flex-shrink-0">
                  {featuredScent.visual_data && (
                    <FragranceVisualizer visualData={featuredScent.visual_data} size="large" />
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-serif text-3xl font-bold mb-2">{featuredScent.name}</h3>
                  {featuredScent.formulation_notes && (
                    <p className="text-muted-foreground italic mb-4">{featuredScent.formulation_notes}</p>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {featuredScent.match_score && (
                      <Badge variant="secondary">{featuredScent.match_score}% Match</Badge>
                    )}
                    {featuredScent.fragrance_code && (
                      <Badge variant="outline">{featuredScent.fragrance_code}</Badge>
                    )}
                    {featuredScent.creator_tag && (
                      <Badge className="capitalize">{featuredScent.creator_tag}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trending Picks */}
        {trendingPicks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Trending Picks</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingPicks.map(scent => (
                <ScentCard key={scent.id} scent={scent} onClick={() => navigate(`/collection/${scent.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Community Favorites */}
        {communityFavs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="h-5 w-5 text-accent" />
              <h3 className="font-serif text-2xl font-bold">Community Favorites</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {communityFavs.map(scent => (
                <ScentCard key={scent.id} scent={scent} onClick={() => navigate(`/collection/${scent.id}`)} />
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/collection")}>
            View Full Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
