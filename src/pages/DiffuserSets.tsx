import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  fetchShopifyProducts, DIFFUSER_FAMILY_QUERY, isDiffuserProduct, matchingOils, type ShopifyProduct,
} from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

type P = ShopifyProduct;
const money = (n: number, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const priceOf = (p: P) => parseFloat(p.node.variants.edges[0]?.node.price.amount ?? p.node.priceRange.minVariantPrice.amount);

const DiffuserSets = () => {
  useSEO({
    title: "Diffusers & Matching Fragrance Oils | Bazuki",
    description: "Pick a Bazuki aroma diffuser and its matching fragrance oils, then check out once — the whole set ships together.",
  });
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    fetchShopifyProducts(50, DIFFUSER_FAMILY_QUERY).then((r) => setAll(r ?? [])).catch(() => setAll([])).finally(() => setLoading(false));
  }, []);

  const diffusers = useMemo(() => all.filter((p) => isDiffuserProduct(p.node)), [all]);
  const selected = diffusers.find((d) => d.node.handle === params.get("diffuser")) ?? diffusers[0];
  const oils = useMemo(
    () => (selected ? matchingOils(selected.node, all.map((p) => p.node)).map((n) => all.find((p) => p.node.id === n.id)!) : []),
    [selected, all],
  );
  const chosenOils = oils.filter((o) => (qty[o.node.id] ?? 0) > 0);
  const total = (selected ? priceOf(selected) : 0) + chosenOils.reduce((s, o) => s + priceOf(o) * qty[o.node.id], 0);
  const currency = selected?.node.priceRange.minVariantPrice.currencyCode ?? "INR";

  const pick = (handle: string) => { setParams({ diffuser: handle }, { replace: true }); setQty({}); };
  const step = (id: string, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10, (q[id] ?? 0) + d)) }));

  const addSet = async () => {
    if (!selected) return;
    setAdding(true);
    const lines: Array<[P, number]> = [[selected, 1], ...chosenOils.map((o) => [o, qty[o.node.id]] as [P, number])];
    let ok = true;
    for (const [p, q] of lines) {
      const v = p.node.variants.edges[0]?.node;
      if (!v) continue;
      ok = (await addItem({ product: p, variantId: v.id, variantTitle: v.title, price: v.price, quantity: q, selectedOptions: v.selectedOptions ?? [] })) && ok;
    }
    setAdding(false);
    if (ok) { toast.success("Your set is in the cart", { position: "top-center" }); openDrawer(); }
    else toast.error("Some items couldn't be added. Please try again.", { position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-40 md:pb-20">
        <header className="mx-auto max-w-2xl text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Build your set</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">Diffuser &amp; matching oils</h1>
          <p className="mt-4 text-muted-foreground">Choose a diffuser, add the oils you love, and check out once. Everything ships together in one order.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : diffusers.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No diffusers found right now.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-12">
              <section aria-labelledby="step1">
                <h2 id="step1" className="font-display text-xl mb-4">1. Pick your diffuser</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="radiogroup">
                  {diffusers.map((d) => {
                    const on = d.node.id === selected?.node.id;
                    const img = d.node.images.edges[0]?.node;
                    return (
                      <button key={d.node.id} role="radio" aria-checked={on} onClick={() => pick(d.node.handle)}
                        className={`relative text-left rounded-lg border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${on ? "border-primary bg-card" : "border-border bg-card/50 hover:border-primary/50"}`}>
                        {on && <Check className="absolute right-3 top-3 h-5 w-5 text-primary" aria-hidden />}
                        {img && <img src={img.url} alt={img.altText ?? d.node.title} loading="lazy" className="aspect-square w-full rounded object-cover" />}
                        <p className="mt-3 font-medium leading-snug">{d.node.title}</p>
                        <p className="text-sm text-primary">{money(priceOf(d), currency)}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="step2">
                <h2 id="step2" className="font-display text-xl mb-4">2. Add matching fragrance oils</h2>
                {oils.length === 0 ? (
                  <p className="rounded-lg border border-border bg-card/50 p-6 text-muted-foreground">Fragrance oils coming soon. You can still order the diffuser on its own.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {oils.map((o) => {
                      const n = qty[o.node.id] ?? 0;
                      const img = o.node.images.edges[0]?.node;
                      return (
                        <li key={o.node.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                          {img && <img src={img.url} alt={img.altText ?? o.node.title} loading="lazy" className="h-16 w-16 rounded object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{o.node.title}</p>
                            <p className="text-sm text-primary">{money(priceOf(o), currency)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Fewer ${o.node.title}`} onClick={() => step(o.node.id, -1)} disabled={n === 0}><Minus className="h-3 w-3" /></Button>
                            <span className="w-6 text-center" aria-live="polite">{n}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`More ${o.node.title}`} onClick={() => step(o.node.id, 1)}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur lg:static lg:self-start lg:rounded-lg lg:border lg:bg-card lg:p-6 lg:sticky lg:top-28">
              <h2 className="hidden lg:block font-display text-lg mb-4">Your set</h2>
              <ul className="hidden lg:block space-y-2 text-sm mb-4">
                {selected && <li className="flex justify-between gap-2"><span>{selected.node.title}</span><span>{money(priceOf(selected), currency)}</span></li>}
                {chosenOils.map((o) => (
                  <li key={o.node.id} className="flex justify-between gap-2 text-muted-foreground"><span>{o.node.title} × {qty[o.node.id]}</span><span>{money(priceOf(o) * qty[o.node.id], currency)}</span></li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-4 lg:block">
                <div className="lg:flex lg:justify-between lg:border-t lg:border-border lg:pt-4 lg:mb-4">
                  <span className="text-sm text-muted-foreground lg:text-base lg:text-foreground">Total</span>
                  <span className="block font-semibold text-lg">{money(total, currency)}</span>
                </div>
                <Button onClick={addSet} disabled={!selected || adding} className="lg:w-full" size="lg">
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add set to cart & checkout"}
                </Button>
              </div>
              <p className="hidden lg:block mt-3 text-xs text-muted-foreground">One checkout, one delivery — your whole set ships together.</p>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DiffuserSets;
