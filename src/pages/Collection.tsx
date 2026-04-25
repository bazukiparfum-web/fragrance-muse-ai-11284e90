import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FragranceVisualizer } from "@/components/FragranceVisualizer";
import { Loader2, Star, Crown, Users, Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchShopifyProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

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
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

function ScentCard({ scent, creatorName }: { scent: PublicScent; creatorName: string }) {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={() => navigate(`/collection/${scent.id}`)}
    >
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          {scent.visual_data && (
            <FragranceVisualizer visualData={scent.visual_data} size="medium" />
          )}
        </div>
        <div className="text-center mb-3">
          <h3 className="font-serif text-xl font-bold">{scent.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">by {creatorName}</p>
        </div>
        {scent.formulation_notes && (
          <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2 italic">
            {scent.formulation_notes}
          </p>
        )}
        <div className="flex justify-center gap-3">
          {scent.match_score && (
            <Badge variant="secondary">{scent.match_score}% Match</Badge>
          )}
          {scent.fragrance_code && (
            <Badge variant="outline">{scent.fragrance_code}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function ShopifyProductCard({ product }: { product: ShopifyProduct }) {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const node = product.node;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const variants = node.variants?.edges || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.node);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
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

        {/* Size selector */}
        {variants.length > 1 && (
          <div className="flex gap-2 mt-3">
            {variants.map(v => (
              <Button
                key={v.node.id}
                size="sm"
                variant={selectedVariant?.id === v.node.id ? "default" : "outline"}
                className="text-xs px-3"
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v.node); }}
              >
                {v.node.title}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-lg">
            ₹{parseFloat(selectedVariant?.price.amount || price.amount).toLocaleString()}
          </span>
          <Button size="sm" onClick={handleAddToCart} disabled={isLoading || !selectedVariant}>
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="h-6 w-6 text-accent" />
        <h2 className="font-serif text-3xl font-bold">{title}</h2>
      </div>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export default function Collection() {
  const [scents, setScents] = useState<PublicScent[]>([]);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [intensityRange, setIntensityRange] = useState([1, 10]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-fill search from ?product= query (from homepage product card clicks)
  useEffect(() => {
    const product = searchParams.get("product");
    if (product && shopifyProducts.length > 0) {
      const match = shopifyProducts.find(
        (p) => p.node.handle === product || p.node.id.endsWith(product)
      );
      if (match) {
        setSearchQuery(match.node.title);
        setCategoryFilter("shop");
      }
    }
  }, [searchParams, shopifyProducts]);

  const fetchData = async () => {
    try {
      const [scentsResult, products] = await Promise.all([
        supabase
          .from("saved_scents")
          .select("id, name, formulation_notes, match_score, intensity, longevity, visual_data, fragrance_code, creator_tag, created_at, user_id")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        fetchShopifyProducts(),
      ]);

      if (scentsResult.error) throw scentsResult.error;

      const scentData = (scentsResult.data || []) as PublicScent[];
      setScents(scentData);
      setShopifyProducts(products);

      const userIds = [...new Set(scentData.map((s) => s.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap: Record<string, Profile> = {};
        (profileData || []).forEach((p: Profile) => { profileMap[p.id] = p; });
        setProfiles(profileMap);
      }
    } catch (err) {
      console.error("Error fetching collection:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCreatorName = (userId: string) => {
    const profile = profiles[userId];
    if (profile?.full_name) return profile.full_name;
    if (profile?.email) return profile.email.split("@")[0];
    return "Anonymous";
  };

  const isFiltering = searchQuery || categoryFilter !== "all" || intensityRange[0] > 1 || intensityRange[1] < 10 || sortBy !== "newest";

  // Filter Shopify products by search query
  const filteredShopifyProducts = useMemo(() => {
    if (!searchQuery) return shopifyProducts;
    const q = searchQuery.toLowerCase();
    return shopifyProducts.filter(p => p.node.title.toLowerCase().includes(q) || p.node.description.toLowerCase().includes(q));
  }, [shopifyProducts, searchQuery]);

  const filteredScents = useMemo(() => {
    let result = [...scents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (categoryFilter === "influencer") result = result.filter((s) => s.creator_tag === "influencer");
    else if (categoryFilter === "celebrity") result = result.filter((s) => s.creator_tag === "celebrity");
    else if (categoryFilter === "community") result = result.filter((s) => !s.creator_tag);
    else if (categoryFilter === "shop") return []; // Show only Shopify products

    result = result.filter((s) => {
      const i = s.intensity ?? 5;
      return i >= intensityRange[0] && i <= intensityRange[1];
    });

    if (sortBy === "oldest") result.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    else if (sortBy === "match") result.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));

    return result;
  }, [scents, searchQuery, categoryFilter, intensityRange, sortBy]);

  const influencerScents = filteredScents.filter((s) => s.creator_tag === "influencer");
  const celebrityScents = filteredScents.filter((s) => s.creator_tag === "celebrity");
  const communityScents = filteredScents.filter((s) => !s.creator_tag);

  const showShopify = categoryFilter === "all" || categoryFilter === "shop";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading collection…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Explore the Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover unique fragrances created and published by our community, influencers, and celebrities.
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="shop">Shop Products</SelectItem>
                <SelectItem value="influencer">Influencer Picks</SelectItem>
                <SelectItem value="celebrity">Celebrity Scents</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Intensity: {intensityRange[0]} – {intensityRange[1]}
              </span>
              <Slider
                min={1}
                max={10}
                step={1}
                value={intensityRange}
                onValueChange={setIntensityRange}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="match">Highest Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Fragrance of the Week */}
        {!isFiltering && scents.length > 0 && (() => {
          const weekMs = 7 * 24 * 60 * 60 * 1000;
          const featured = scents[Math.floor(Date.now() / weekMs) % scents.length];
          return (
            <section className="mb-16">
              <SectionHeader icon={Star} title="Fragrance of the Week" subtitle="This week's spotlight pick from the collection" />
              <Card
                className="max-w-2xl mx-auto overflow-hidden hover-lift cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => navigate(`/collection/${featured.id}`)}
              >
                <div className="flex flex-col md:flex-row items-center p-8 gap-8">
                  <div className="flex-shrink-0">
                    {featured.visual_data && (
                      <FragranceVisualizer visualData={featured.visual_data} size="large" />
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-serif text-3xl font-bold mb-2">{featured.name}</h3>
                    {featured.formulation_notes && (
                      <p className="text-muted-foreground italic mb-4">{featured.formulation_notes}</p>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {featured.match_score && (
                        <Badge variant="secondary">{featured.match_score}% Match</Badge>
                      )}
                      {featured.fragrance_code && (
                        <Badge variant="outline">{featured.fragrance_code}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          );
        })()}

        {/* Shop Products */}
        {showShopify && filteredShopifyProducts.length > 0 && (
          <section className="mb-16">
            <SectionHeader icon={ShoppingBag} title="Shop Our Collection" subtitle="Ready-to-order signature fragrances" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredShopifyProducts.map(product => (
                <ShopifyProductCard key={product.node.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* When filtering (except shop-only), show scent results */}
        {isFiltering && categoryFilter !== "shop" ? (
          <section className="mb-16">
            <SectionHeader icon={Search} title="Search Results" subtitle={`${filteredScents.length} fragrance${filteredScents.length !== 1 ? 's' : ''} found`} />
            {filteredScents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredScents.map((scent) => (
                  <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fragrances match your filters.</p>
              </div>
            )}
          </section>
        ) : !isFiltering && (
          <>
            {/* Influencer Picks */}
            {influencerScents.length > 0 && (
              <section className="mb-16">
                <SectionHeader icon={Star} title="Influencer Picks" subtitle="Curated fragrances from top creators and tastemakers" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {influencerScents.map((scent) => (
                    <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Celebrity Scents */}
            {celebrityScents.length > 0 && (
              <section className="mb-16">
                <SectionHeader icon={Crown} title="Celebrity Scents" subtitle="Signature fragrances from renowned personalities" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {celebrityScents.map((scent) => (
                    <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Community Collection */}
            <section className="mb-16">
              <SectionHeader icon={Users} title="Community Collection" subtitle="Fragrances published by our creative community" />
              {communityScents.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {communityScents.map((scent) => (
                    <ScentCard key={scent.id} scent={scent} creatorName={getCreatorName(scent.user_id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No fragrances published yet. Be the first to share yours!</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
