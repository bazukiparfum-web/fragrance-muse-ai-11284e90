import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Sparkles, Factory, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CarFreshenerCard from "@/components/car-fresheners/CarFreshenerCard";
import {
  fetchCarFreshenerCatalog,
  type CarFreshenerListItem,
} from "@/lib/carFreshenerCatalog";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const TRUST = [
  { Icon: Sparkles, label: "Long-lasting", sub: "Up to 45 days of scent" },
  { Icon: ShieldCheck, label: "IFRA-safe oils", sub: "Skin & cabin-friendly" },
  { Icon: Factory, label: "Made in India", sub: "Small-batch, hand-finished" },
  { Icon: Leaf, label: "Plastic-free card", sub: "Recyclable materials" },
];

const HOW = [
  { step: "01", title: "Hang", copy: "Loop over your rear-view mirror. It sits flush, no rattle." },
  { step: "02", title: "Diffuse", copy: "The oil-infused disc releases scent slowly as air moves." },
  { step: "03", title: "Refresh", copy: "Swap for a new one every 30–45 days to keep it vivid." },
];

const FAQS = [
  {
    q: "How long does each freshener last?",
    a: "Between 30 and 45 days depending on climate, ventilation and how much sun the cabin gets.",
  },
  {
    q: "Are the fragrances safe?",
    a: "Yes — every scent uses IFRA-compliant fragrance oils, the same standards used in fine perfumery.",
  },
  {
    q: "Can I refill or reorder my favourite?",
    a: "Each disc is a single-use hanging freshener. Reordering the same scent is one click when we go live.",
  },
  {
    q: "Do you do bulk orders for dealerships, taxis or corporate gifting?",
    a: "Absolutely. We produce custom-branded hanging fresheners in your signature scent. Reach out via our B2B page for pricing.",
  },
];

const CarFreshenersPage = () => {
  useSEO({
    title: "Hanging Car Perfumes & Fresheners | Bazuki",
    description:
      "Luxury hanging car fresheners by Bazuki — IFRA-safe fragrance oils, 30–45 days of scent, crafted like fine perfume. Made in India.",
  });

  const [items, setItems] = useState<CarFreshenerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCarFreshenerCatalog().then((res) => {
      if (cancelled) return;
      setItems(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbs = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: "Car Fresheners", path: "/shop/car-fresheners" },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bazuki Hanging Car Fresheners",
    itemListElement: items.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.name,
      description: f.tagline,
    })),
  };

  return (
    <div className="min-h-screen bg-bz-primary">
      <JsonLd id="breadcrumbs-car-fresheners" data={breadcrumbs} />
      <JsonLd id="itemlist-car-fresheners" data={itemListJsonLd} />
      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="border-b border-gold/10 py-20 md:py-28">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-5">
              Fine fragrance for your drive
            </p>
            <h1 className="font-cormorant text-4xl md:text-6xl text-cream leading-tight mb-6">
              Hanging car perfumes, crafted like fine fragrance
            </h1>
            <p className="text-cream-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Six carefully-composed scents on hand-finished discs. Long-lasting,
              IFRA-safe, and designed to make every drive feel considered.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Button asChild size="lg">
                <a href="#collection">Explore the collection</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/business">Bulk & corporate gifting</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-gold/10 py-10 md:py-14">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {TRUST.map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30">
                    <Icon strokeWidth={1.25} className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-cream text-sm font-medium">{label}</div>
                    <div className="text-cream-muted text-xs mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collection */}
        <section id="collection" className="py-20 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-4">
                The collection
              </p>
              <h2 className="font-cormorant text-3xl md:text-5xl text-cream leading-tight">
                Six scents. One considered ritual.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CAR_FRESHENERS.map((item) => (
                <CarFreshenerCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-gold/10 py-20 md:py-24 bg-bz-secondary">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-4">
                How it works
              </p>
              <h2 className="font-cormorant text-3xl md:text-4xl text-cream">
                Hang · Diffuse · Refresh
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
              {HOW.map(({ step, title, copy }) => (
                <div key={step} className="text-center md:text-left">
                  <div className="font-cormorant text-4xl text-gold mb-3">{step}</div>
                  <h3 className="font-cormorant text-2xl text-cream mb-2">{title}</h3>
                  <p className="text-cream-muted text-sm leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bulk / corporate strip */}
        <section className="py-16 md:py-20 border-b border-gold/10">
          <div className="container mx-auto px-6">
            <div className="rounded-2xl border border-gold/20 bg-bz-card p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-3">
                  For dealerships, hotels & corporate gifting
                </p>
                <h2 className="font-cormorant text-2xl md:text-3xl text-cream mb-3">
                  Your brand's signature scent, on every mirror.
                </h2>
                <p className="text-cream-muted text-sm md:text-base leading-relaxed">
                  Custom-branded hanging fresheners in your own signature fragrance —
                  from 250 units. Perfect for auto dealerships, taxi fleets, hotel
                  valet or premium client gifts.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:shrink-0">
                <Button asChild size="lg">
                  <Link to="/business#lead-form">Request a quote</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-cormorant text-3xl md:text-4xl text-cream mb-8 text-center">
              Frequently asked
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-gold/15">
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

        {/* Final CTA */}
        <section className="border-t border-gold/10 py-20 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-cormorant text-3xl md:text-4xl text-cream mb-5">
              Not sure which scent fits you?
            </h2>
            <p className="text-cream-muted mb-8">
              Take our 3-minute AI scent quiz and we'll match you to the freshener
              (and full-size perfume) that suits your personality.
            </p>
            <Button asChild size="lg">
              <Link to="/shop/quiz">Take the Quiz →</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CarFreshenersPage;
