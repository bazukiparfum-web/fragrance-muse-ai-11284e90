import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const SITE_URL = "https://www.bazukifragrance.com";
const PAGE_PATH = "/guide/ai-perfume-vs-traditional";

const breadcrumbs = buildBreadcrumbs([
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guide/ai-perfume-vs-traditional" },
  { name: "AI Perfume vs Traditional", path: PAGE_PATH },
]);

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Perfume vs Traditional Perfume",
  description: "A side-by-side comparison of AI-matched perfume and traditional designer fragrance for buyers in India in 2026.",
  author: { "@type": "Organization", name: "Bazuki Perfumes", url: SITE_URL },
  publisher: {
    "@type": "Organization",
    name: "Bazuki Perfumes",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
  },
  datePublished: "2026-05-13",
  dateModified: "2026-05-13",
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${PAGE_PATH}` },
};

const rows: { aspect: string; ai: string; trad: string }[] = [
  { aspect: "Personalization", ai: "Matched to individual via AI quiz", trad: "One scent for everyone" },
  { aspect: "Production model", ai: "Made-to-order per customer", trad: "Bulk-manufactured in advance" },
  { aspect: "Time to choose", ai: "~3-minute quiz returns 3 matches", trad: "Hours of in-store sampling" },
  { aspect: "Ingredient transparency", ai: "Full top/heart/base notes shown per match", trad: "Marketing-led, often opaque" },
  { aspect: "Iteration", ai: "Tweak intensity or swap notes after testing", trad: "Buy a new bottle to change anything" },
  { aspect: "Skin chemistry fit", ai: "Quiz uses lifestyle/climate signals", trad: "Trial and error" },
  { aspect: "Pricing (30ml)", ai: "₹700 (Bazuki)", trad: "Often ₹3,000+ for designer 30ml" },
  { aspect: "Lead time", ai: "~7 days (made-to-order in India)", trad: "Off-the-shelf, instant" },
  { aspect: "Sustainability", ai: "Made-to-order reduces overproduction", trad: "Inventory-driven, higher waste" },
  { aspect: "Best for", ai: "Personal signature scent, gifting, exploration", trad: "Brand-status buyers, fans of a specific designer" },
];

const AIPerfumeVsTraditional = () => {
  useSEO({
    title: "AI Perfume vs Traditional Perfume: 2026 Comparison | Bazuki",
    description:
      "How does AI-matched perfume compare to traditional designer fragrance? A side-by-side breakdown of personalization, price, lead time, and ingredient transparency.",
    type: "article",
  });

  return (
    <div className="min-h-screen bg-background">
      <JsonLd id="breadcrumbs-guide-aivstrad" data={breadcrumbs} />
      <JsonLd id="article-guide-aivstrad" data={articleJsonLd} />
      <Header />
      <article className="container mx-auto px-4 max-w-4xl pt-24 pb-16">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">Comparison</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-4">
            AI Perfume vs Traditional Perfume
          </h1>
          <p className="text-muted-foreground text-lg">
            AI perfumery composes a fragrance for one specific person; traditional perfumery composes one fragrance for a marketing-defined audience. Here's how they actually differ for a buyer in India in 2026.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Short answer</h2>
          <p>
            <strong>AI perfume</strong> (like Bazuki) is better for personal signature scents, gifting, and ingredient transparency, because each bottle is composed for the wearer and made-to-order. <strong>Traditional perfume</strong> is better when you specifically want an established designer house and don't mind that millions of other people wear the same composition.
          </p>
        </section>

        <section className="mb-10 overflow-x-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Side-by-side comparison</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 border border-border">Aspect</th>
                <th className="text-left p-3 border border-border">AI Perfume (Bazuki)</th>
                <th className="text-left p-3 border border-border">Traditional Designer Perfume</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.aspect}>
                  <td className="p-3 border border-border font-medium">{r.aspect}</td>
                  <td className="p-3 border border-border">{r.ai}</td>
                  <td className="p-3 border border-border text-muted-foreground">{r.trad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Is AI-composed perfume actually good?</h2>
          <p>
            Yes — when the underlying ingredient library is high quality and the matching engine is grounded in real perfumery rules, not just keyword matching. Bazuki uses 10 IFRA-compliant fragrance notes at launch (cedarwood, sandalwood, bergamot, jasmine, oud, vanilla, vetiver, rose, musk, amber) and composes each formula respecting traditional top–heart–base structure. The "AI" part is the matching, not the chemistry.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Is AI perfume cheaper than designer perfume?</h2>
          <p>
            For comparable concentration (eau de parfum), AI-composed perfume is significantly cheaper in India. Bazuki's 30ml custom is ₹700, and a 3-bottle Discovery Set is ₹1,500. Designer 30ml EDPs typically retail in India between ₹3,000 and ₹8,000. Made-to-order production removes inventory and middleman costs.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">When is traditional perfume the better choice?</h2>
          <p>
            If brand identity matters more than personal fit — for example, you specifically want to wear a particular designer house as a status or sentimental signal — traditional perfume is the right pick. AI perfume optimizes for <em>you</em>; designer perfume optimizes for <em>the brand</em>. Both are valid.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 my-12">
          <Button asChild size="lg">
            <Link to="/shop/quiz">Try the AI Quiz</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/guide/find-your-signature-scent">Read the signature scent guide</Link>
          </Button>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default AIPerfumeVsTraditional;
