import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Loader2,
  Check,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Wallet,
  ShieldCheck,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CarFreshenerCard from "@/components/car-fresheners/CarFreshenerCard";
import CarFreshenerGallery from "@/components/car-fresheners/CarFreshenerGallery";
import PurityPromiseStrip from "@/components/car-fresheners/PurityPromiseStrip";
import StandOutFeatures from "@/components/car-fresheners/StandOutFeatures";
import {
  getCarFreshenerByHandle,
  fetchCarFreshenerCatalog,
  type CarFreshenerListItem,
} from "@/lib/carFreshenerCatalog";
import { useCartStore } from "@/stores/cartStore";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { cn } from "@/lib/utils";

const USE_STEPS = [
  {
    step: "01",
    title: "Unwrap",
    copy: "Slide the bottle out of its box. Handle by the cord to keep the glass clean.",
  },
  {
    step: "02",
    title: "Hang from your mirror",
    copy: "Loop the cord over your rear-view mirror. It sits flush, no rattle.",
  },
  {
    step: "03",
    title: "Refresh in ~45 days",
    copy: "Swap for a new bottle every 30–45 days to keep the scent vivid.",
  },
];

const SAFETY = [
  "IFRA-compliant fragrance oils — the same standards used in fine perfumery.",
  "Alcohol-free, low-VOC formulation.",
  "Recyclable card and cord. No plastic in packaging.",
];

const BENEFITS = [
  "Pure fragrance-oil formula",
  "30–45 days of scent",
  "Leak-proof glass · hand-finished cord",
];

const TRUST_BADGES = [
  { Icon: Truck, label: "Pan-India delivery" },
  { Icon: Wallet, label: "COD available" },
  { Icon: ShieldCheck, label: "Secure payment" },
];

const FAQS = [
  {
    q: "How long does it last?",
    a: "Between 30 and 45 days depending on climate, ventilation and cabin exposure to sun.",
  },
  {
    q: "Can I reorder the same scent?",
    a: "Yes — each freshener is single-use, but reordering the same fragrance is one click.",
  },
  {
    q: "Is the fragrance safe?",
    a: "Every scent is IFRA-compliant, alcohol-free and skin-friendly on brief contact.",
  },
  {
    q: "Do you do bulk / gifting?",
    a: "Yes — custom-branded fresheners in your signature scent, from 250 units. See our B2B page.",
  },
];

function formatPrice(amount: number, currency: string) {
  if (currency === "INR" || !currency)
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  return `${currency} ${Math.round(amount)}`;
}

export default function CarFreshenerDetail() {
  const { handle = "" } = useParams();
  const [item, setItem] = useState<CarFreshenerListItem | null>(null);
  const [siblings, setSiblings] = useState<CarFreshenerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">(
    "idle",
  );
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  useSEO({
    title: item
      ? `${item.name} — Hanging Car Perfume | Bazuki`
      : "Hanging Car Perfume | Bazuki",
    description: item
      ? `${item.name}: ${item.tagline} Luxury hanging car freshener by Bazuki — IFRA-safe, 30–45 days.`
      : "Luxury hanging car fresheners by Bazuki.",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [detail, catalog] = await Promise.all([
        getCarFreshenerByHandle(handle),
        fetchCarFreshenerCatalog(),
      ]);
      if (cancelled) return;
      setItem(detail);
      setSiblings(catalog.filter((c) => c.handle !== handle).slice(0, 3));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const canBuy = !!(item?.shopify && item.variantId);

  const handleAdd = async (openAfter = true) => {
    if (!canBuy || !item?.shopify || !item.variantId || status === "adding")
      return;
    setStatus("adding");
    const variant = item.shopify.node.variants.edges[0]?.node;
    const ok = await addItem({
      product: item.shopify,
      variantId: item.variantId,
      variantTitle: variant?.title ?? "Default",
      price: { amount: String(item.price), currencyCode: item.currency },
      quantity,
      selectedOptions: variant?.selectedOptions ?? [],
    });
    if (ok) {
      setStatus("added");
      if (openAfter) openDrawer();
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const breadcrumbs = item
    ? buildBreadcrumbs([
        { name: "Home", path: "/" },
        { name: "Car Fresheners", path: "/shop/car-fresheners" },
        { name: item.name, path: `/shop/car-fresheners/${item.handle}` },
      ])
    : null;

  const productJsonLd = item
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: item.name,
        description: item.tagline,
        image: item.images.length > 0 ? item.images : [item.image],
        brand: { "@type": "Brand", name: "Bazuki" },
        offers: {
          "@type": "Offer",
          priceCurrency: item.currency || "INR",
          price: item.price,
          availability: canBuy
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-bz-primary">
      {breadcrumbs && (
        <JsonLd id="breadcrumbs-car-freshener-detail" data={breadcrumbs} />
      )}
      {productJsonLd && (
        <JsonLd id="product-car-freshener" data={productJsonLd} />
      )}
      <Header />

      <main className="pt-16 pb-24 md:pb-16">
        {loading ? (
          <div className="container mx-auto px-6 py-24 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
          </div>
        ) : !item ? (
          <div className="container mx-auto px-6 py-24 text-center">
            <h1 className="font-cormorant text-3xl text-cream mb-4">
              We couldn't find that freshener
            </h1>
            <p className="text-cream-muted mb-6">
              It may have moved or been renamed.
            </p>
            <Button asChild>
              <Link to="/shop/car-fresheners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to the collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Top: image + summary */}
            <section className="py-10 md:py-16">
              <div className="container mx-auto px-6">
                <div className="mb-6 text-sm text-cream-muted">
                  <Link to="/shop/car-fresheners" className="hover:text-gold">
                    ← Hanging Car Fresheners
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
                  {/* Image gallery */}
                  <CarFreshenerGallery
                    images={item.images}
                    alt={`${item.name} hanging car freshener`}
                    accentHsl={item.accentHsl}
                  />

                  {/* Summary / buy-box */}
                  <div>
                    <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-4">
                      Hanging Car Perfume
                    </p>
                    <h1 className="font-cormorant text-4xl md:text-5xl text-cream leading-tight mb-3">
                      {item.name}
                    </h1>
                    <p className="text-cream-muted text-base md:text-lg leading-relaxed mb-5">
                      {item.tagline}
                    </p>

                    {/* Benefit bullets */}
                    <ul className="space-y-2.5 mb-6">
                      {BENEFITS.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-cream text-sm"
                        >
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gold/40"
                            aria-hidden
                          >
                            <Check className="h-2.5 w-2.5 text-gold" strokeWidth={3} />
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {item.notes.length > 0 && (
                      <div className="mb-6">
                        <p className="text-cream-muted text-xs uppercase tracking-[0.2em] mb-2">
                          Notes
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.notes.map((n) => (
                            <span
                              key={n}
                              className="rounded-full px-3 py-1 text-xs text-cream"
                              style={{
                                backgroundColor: `hsl(${item.accentHsl} / 0.16)`,
                              }}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gold/10 pt-5">
                      <div className="flex items-baseline gap-3">
                        <span className="font-cormorant text-3xl text-cream">
                          {formatPrice(item.price, item.currency)}
                        </span>
                        <span className="text-cream-muted text-sm">
                          · ~45 days
                        </span>
                      </div>
                      <p className="text-cream-muted text-xs mt-1">
                        Tax included · Shipping calculated at checkout
                      </p>
                    </div>

                    {/* Qty + Add to cart */}
                    <div className="mt-5 flex items-stretch gap-3">
                      <div className="flex items-center rounded-md border border-gold/25 bg-bz-card">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity((q) => Math.max(1, q - 1))
                          }
                          className="flex h-11 w-10 items-center justify-center text-cream hover:text-gold transition-colors disabled:opacity-40"
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span
                          className="min-w-[2ch] px-2 text-center text-cream tabular-nums"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity((q) => Math.min(10, q + 1))
                          }
                          className="flex h-11 w-10 items-center justify-center text-cream hover:text-gold transition-colors disabled:opacity-40"
                          disabled={quantity >= 10}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {canBuy ? (
                        <Button
                          size="lg"
                          onClick={() => handleAdd(true)}
                          disabled={status === "adding"}
                          className={cn(
                            "flex-1 gap-2",
                            status === "added" &&
                              "bg-emerald-600 hover:bg-emerald-600",
                            status === "error" &&
                              "bg-red-600 hover:bg-red-600",
                          )}
                        >
                          {status === "adding" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adding
                            </>
                          ) : status === "added" ? (
                            <>
                              <Check className="h-4 w-4" />
                              Added to cart
                            </>
                          ) : status === "error" ? (
                            "Retry"
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" />
                              Add to cart
                            </>
                          )}
                        </Button>
                      ) : (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="inline-flex flex-1">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  disabled
                                  className="w-full gap-2"
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                  Coming soon
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Launching soon on our store.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {/* Buy it now */}
                    {canBuy && (
                      <button
                        type="button"
                        onClick={() => handleAdd(true)}
                        disabled={status === "adding"}
                        className="mt-3 w-full rounded-md border border-gold/40 bg-transparent py-3 text-cream transition-colors hover:bg-gold/10 disabled:opacity-60"
                      >
                        <span className="flex items-center justify-center gap-2 font-medium">
                          <Zap className="h-4 w-4 text-gold" />
                          Buy it now
                        </span>
                        <span className="mt-0.5 block text-[11px] text-cream-muted">
                          10% off on prepaid orders
                        </span>
                      </button>
                    )}

                    {/* Trust badges */}
                    <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-gold/10">
                      {TRUST_BADGES.map(({ Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-2 text-center"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30">
                            <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                          </span>
                          <span className="text-cream-muted text-[11px] leading-tight">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Description accordion */}
                    <Accordion
                      type="single"
                      collapsible
                      className="mt-6 border-t border-gold/10"
                      defaultValue="desc"
                    >
                      <AccordionItem value="desc" className="border-gold/10">
                        <AccordionTrigger className="text-cream hover:no-underline text-sm uppercase tracking-[0.2em]">
                          Description
                        </AccordionTrigger>
                        <AccordionContent className="text-cream-muted leading-relaxed">
                          {item.name} is a hanging car perfume composed like
                          fine fragrance — a slow-diffusing blend that keeps
                          your cabin considered for 30–45 days. Leak-proof
                          glass, hand-finished cord, IFRA-safe oils. Made in
                          India in small batches.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="mt-4 text-center">
                      <Link
                        to="/business#lead-form"
                        className="text-xs text-cream-muted hover:text-gold underline underline-offset-4"
                      >
                        Bulk / corporate gifting →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use instructions */}
            <section className="border-y border-gold/10 py-16 md:py-20 bg-bz-secondary">
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-3">
                    How to use
                  </p>
                  <h2 className="font-cormorant text-3xl md:text-4xl text-cream">
                    Three simple steps
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
                  {USE_STEPS.map(({ step, title, copy }) => (
                    <div key={step}>
                      <div className="font-cormorant text-4xl text-gold mb-3">
                        {step}
                      </div>
                      <h3 className="font-cormorant text-2xl text-cream mb-2">
                        {title}
                      </h3>
                      <p className="text-cream-muted text-sm leading-relaxed">
                        {copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Safety / what's inside */}
            <section className="py-14 md:py-16 border-b border-gold/10">
              <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="font-cormorant text-3xl md:text-4xl text-cream mb-6 text-center">
                  What's inside
                </h2>
                <ul className="space-y-3">
                  {SAFETY.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-3 text-cream-muted"
                    >
                      <Check className="h-4 w-4 text-gold shrink-0 mt-1" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Our promise */}
            <PurityPromiseStrip />

            {/* What makes Bazuki different */}
            <StandOutFeatures
              images={item.images}
              accentHsl={item.accentHsl}
            />

            {/* FAQ */}
            <section className="py-16 md:py-20 border-b border-gold/10">
              <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="font-cormorant text-3xl md:text-4xl text-cream mb-8 text-center">
                  Frequently asked
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {FAQS.map((f, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="border-gold/15"
                    >
                      <AccordionTrigger className="text-left text-cream text-base md:text-lg hover:no-underline">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-cream-muted leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            {/* Related */}
            {siblings.length > 0 && (
              <section className="py-16 md:py-20">
                <div className="container mx-auto px-6">
                  <div className="text-center mb-12">
                    <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-3">
                      You might also like
                    </p>
                    <h2 className="font-cormorant text-3xl md:text-4xl text-cream">
                      Other scents in the collection
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {siblings.map((s) => (
                      <CarFreshenerCard key={s.handle} item={s} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Sticky mobile add-to-cart bar */}
      {item && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-gold/15 bg-bz-primary/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="text-cream text-sm font-medium truncate">
                {item.name}
              </div>
              <div className="text-gold text-sm">
                {formatPrice(item.price, item.currency)}
              </div>
            </div>
            {canBuy ? (
              <Button
                size="sm"
                onClick={() => handleAdd(true)}
                disabled={status === "adding"}
                className="shrink-0"
              >
                {status === "adding" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === "added" ? (
                  "Added"
                ) : (
                  "Add to cart"
                )}
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled className="shrink-0">
                Coming soon
              </Button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
