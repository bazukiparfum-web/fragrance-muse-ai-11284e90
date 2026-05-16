import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "@/hooks/useInView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroLibrary from "@/components/library/HeroLibrary";
import MoodFilterBar from "@/components/library/MoodFilterBar";
import ScentCard from "@/components/library/ScentCard";
import ShopifyProductCard from "@/components/library/ShopifyProductCard";
import CardSkeleton from "@/components/library/CardSkeleton";
import { CollectionEmpty, CollectionError } from "@/components/library/CollectionStates";
import ScentDetailDrawer from "@/components/library/ScentDetailDrawer";
import { fetchShopifyProducts } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { buildLibrary, MOODS, type LibraryItem, type Mood, type PublicScent } from "@/lib/libraryMapper";
import { useSEO } from "@/hooks/useSEO";

export default function Collection() {
  useSEO({
    title: "Scent Library — Bazuki Fragrance",
    description:
      "Explore Bazuki's Scent Library: AI-crafted signature and community fragrances. Filter by mood and find your next signature.",
  });

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mood, setMood] = useState<Mood | "All">("All");
  const [active, setActive] = useState<LibraryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(false);
    const [shopRes, scentRes] = await Promise.allSettled([
      fetchShopifyProducts(),
      supabase
        .from("saved_scents")
        .select(
          "id, name, formulation_notes, formula, visual_data, prices, fragrance_code, creator_tag, shopify_product_id, shopify_variant_id",
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

    const shopOk = shopRes.status === "fulfilled";
    const scentOk = scentRes.status === "fulfilled" && !scentRes.value.error;

    if (!shopOk && !scentOk) {
      console.error("Collection load failed", { shopRes, scentRes });
      setError(true);
      setLoading(false);
      return;
    }

    const shop = shopOk ? shopRes.value : [];
    const scents = scentOk ? ((scentRes.value.data ?? []) as unknown as PublicScent[]) : [];
    setItems(buildLibrary(shop, scents));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: items.length };
    MOODS.forEach((m) => (c[m] = 0));
    items.forEach((i) => (c[i.mood] = (c[i.mood] ?? 0) + 1));
    return c as Partial<Record<Mood | "All", number>>;
  }, [items]);

  const filtered = useMemo(
    () => (mood === "All" ? items : items.filter((i) => i.mood === mood)),
    [items, mood],
  );

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [mood]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "0px 0px 400px 0px",
    once: false,
  });

  useEffect(() => {
    if (!sentinelInView || !hasMore) return;
    const t = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
    }, 150);
    return () => clearTimeout(t);
  }, [sentinelInView, hasMore, filtered.length]);

  const openItem = (i: LibraryItem) => {
    setActive(i);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-bz-primary text-cream">
      <Header />
      <main>
        <HeroLibrary />
        <MoodFilterBar active={mood} onChange={setMood} counts={counts} />

        <section className="container mx-auto px-6 py-10 md:py-14">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <CollectionError onRetry={loadLibrary} />
          ) : filtered.length === 0 ? (
            <CollectionEmpty />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleItems.map((item, idx) =>
                  item.source === "shopify" && item.shopify ? (
                    <ShopifyProductCard key={item.id} item={item} index={idx} onOpen={openItem} />
                  ) : (
                    <ScentCard key={item.id} item={item} index={idx} onOpen={openItem} />
                  ),
                )}
              </div>

              {hasMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={`more-${i}`} />
                  ))}
                </div>
              )}

              <div ref={sentinelRef} aria-hidden className="h-1 w-full" />

              {!hasMore && filtered.length > PAGE_SIZE && (
                <p role="status" className="text-center text-cream-muted text-sm mt-10">
                  You've reached the end of the library.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <ScentDetailDrawer item={active} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <Footer />
    </div>
  );
}
