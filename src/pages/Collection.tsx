import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroLibrary from "@/components/library/HeroLibrary";
import MoodFilterBar from "@/components/library/MoodFilterBar";
import ScentCard from "@/components/library/ScentCard";
import ScentDetailDrawer from "@/components/library/ScentDetailDrawer";
import { fetchShopifyProducts } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { buildLibrary, MOODS, type LibraryItem, type Mood, type PublicScent } from "@/lib/libraryMapper";
import { useSEO } from "@/hooks/useSEO";
import { Loader2 } from "lucide-react";

export default function Collection() {
  useSEO({
    title: "Scent Library — Bazuki Fragrance",
    description:
      "Explore Bazuki's Scent Library: AI-crafted signature and community fragrances. Filter by mood and find your next signature.",
  });

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood | "All">("All");
  const [active, setActive] = useState<LibraryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
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
      if (cancelled) return;

      const shop = shopRes.status === "fulfilled" ? shopRes.value : [];
      const scents =
        scentRes.status === "fulfilled" && !scentRes.value.error
          ? ((scentRes.value.data ?? []) as unknown as PublicScent[])
          : [];

      setItems(buildLibrary(shop, scents));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <div className="flex items-center justify-center py-24 text-cream-muted">
              <Loader2 className="h-6 w-6 animate-spin mr-3 text-gold" />
              Loading the library…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-2xl text-cream mb-2">Nothing here yet</p>
              <p className="text-cream-muted">
                No scents match this mood right now. Try another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, idx) => (
                <ScentCard key={item.id} item={item} index={idx} onOpen={openItem} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ScentDetailDrawer item={active} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <Footer />
    </div>
  );
}
