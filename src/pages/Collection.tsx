import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroLibrary from "@/components/library/HeroLibrary";
import MoodFilterBar from "@/components/library/MoodFilterBar";
import ScentCard from "@/components/library/ScentCard";
import ShopifyProductCard from "@/components/library/ShopifyProductCard";
import CardSkeleton from "@/components/library/CardSkeleton";
import CollectionAmbience from "@/components/library/CollectionAmbience";
import { CollectionEmpty, CollectionError } from "@/components/library/CollectionStates";
import ScentDetailDrawer from "@/components/library/ScentDetailDrawer";
import { fetchShopifyProducts } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { buildLibrary, MOODS, type LibraryItem, type Mood, type PublicScent } from "@/lib/libraryMapper";
import { useSEO } from "@/hooks/useSEO";
import type { SortKey } from "@/components/library/SortDropdown";

function getStartingPrice(item: LibraryItem): number {
  if (item.prices.ml30) return item.prices.ml30;
  if (item.prices.ml50) return item.prices.ml50;
  if (item.shopify) {
    const min = Math.min(
      ...item.shopify.variants.map((v) => v.amount).filter((n) => !isNaN(n)),
    );
    return isFinite(min) ? min : 0;
  }
  return 0;
}

function getCreatedAt(item: LibraryItem): number {
  // saved_scents fetched in created_at desc order, so use position-based proxy.
  // Shopify items keep their fetch order; combine using array index baseline (handled by caller).
  return 0;
}

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMood = useMemo<Mood | "All">(() => {
    const raw = searchParams.get("mood");
    const found = MOODS.find((m) => m.toLowerCase() === raw?.toLowerCase());
    return found ?? "All";
  }, [searchParams]);
  const journeySlug = searchParams.get("journey");
  const journey = useMemo(
    () => SENSE_JOURNEYS.find((j) => j.slug === journeySlug),
    [journeySlug],
  );

  useSEO({
    title:
      initialMood === "All"
        ? "Scent Library — Bazuki Fragrance"
        : `${initialMood} Fragrances — Bazuki Scent Library`,
    description:
      initialMood === "All"
        ? "Explore Bazuki's Scent Library: AI-crafted signature and community fragrances. Filter by mood and find your next signature."
        : `Browse ${initialMood} fragrances from Bazuki — AI-crafted, made-to-order in India.`,
  });

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mood, setMood] = useState<Mood | "All">(initialMood);

  useEffect(() => {
    setMood(initialMood);
  }, [initialMood]);

  const changeMood = useCallback(
    (m: Mood | "All") => {
      setMood(m);
      const next = new URLSearchParams(searchParams);
      if (m === "All") next.delete("mood");
      else next.set("mood", m);
      next.delete("journey");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );


  const [sort, setSort] = useState<SortKey>("featured");
  const [active, setActive] = useState<LibraryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(false);
    const [shopRes, scentRes] = await Promise.allSettled([
      fetchShopifyProducts(50, "NOT tag:diffuser"),
      supabase
        .from("saved_scents")
        .select(
          "id, name, visual_data, prices, fragrance_code, creator_tag, shopify_product_id, shopify_variant_id",
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

  const sorted = useMemo(() => {
    if (sort === "featured") return filtered;
    const arr = [...filtered];
    if (sort === "price-asc") arr.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
    else if (sort === "price-desc") arr.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
    else if (sort === "newest") {
      // Scents come from DB in created_at desc order already; push scents first.
      arr.sort((a, b) => {
        const aw = a.source === "scent" ? 0 : 1;
        const bw = b.source === "scent" ? 0 : 1;
        return aw - bw;
      });
    }
    return arr;
  }, [filtered, sort]);

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [mood, sort]);

  const visibleItems = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);
  const hasMore = visibleCount < sorted.length;

  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "0px 0px 400px 0px",
    once: false,
  });

  useEffect(() => {
    if (!sentinelInView || !hasMore) return;
    const t = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
    }, 150);
    return () => clearTimeout(t);
  }, [sentinelInView, hasMore, sorted.length]);

  const openItem = (i: LibraryItem) => {
    setActive(i);
    setDrawerOpen(true);
  };

  const totalLabel = useMemo(() => {
    const n = sorted.length;
    const noun = n === 1 ? "fragrance" : "fragrances";
    if (mood === "All") return `Showing ${n} ${noun}`;
    return `Showing ${n} ${mood} ${noun}`;
  }, [sorted.length, mood]);

  return (
    <div className="relative min-h-screen bg-[var(--anim-bg)] text-cream overflow-hidden">
      <CollectionAmbience />
      <div className="relative z-10">
        <Header />
        <main>
          <HeroLibrary />
          <MoodFilterBar
            active={mood}
            onChange={setMood}
            counts={counts}
            sort={sort}
            onSortChange={setSort}
            totalLabel={totalLabel}
          />

          <section className="container mx-auto px-6 py-10 md:py-14 max-w-[1200px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <CollectionError onRetry={loadLibrary} />
            ) : sorted.length === 0 ? (
              <CollectionEmpty filtered onReset={() => setMood("All")} />
            ) : (
              <>
                <div
                  key={`${mood}-${sort}`}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
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

                {!hasMore && sorted.length > PAGE_SIZE && (
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
    </div>
  );
}
