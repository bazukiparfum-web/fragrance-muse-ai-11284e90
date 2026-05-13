import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const SITE_URL = "https://www.bazukifragrance.com";
const PAGE_PATH = "/guide/perfume-notes-explained";

const breadcrumbs = buildBreadcrumbs([
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guide/perfume-notes-explained" },
  { name: "Perfume Notes Explained", path: PAGE_PATH },
]);

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Perfume Notes Explained",
  description: "A glossary of perfume terms — top, heart and base notes, sillage, longevity, accords and scent families.",
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

const terms: { term: string; def: string; detail: string }[] = [
  { term: "Top notes", def: "The first scents you smell when you spray a fragrance, lasting 5–15 minutes.", detail: "Top notes are typically light, volatile molecules like citrus, herbs, and light fruits. They form the first impression but evaporate fast." },
  { term: "Heart notes", def: "The core character of the fragrance, emerging after the top notes fade and lasting 2–4 hours.", detail: "Heart (or middle) notes carry the personality — usually florals, spices, or green notes. This is what most people associate with the perfume." },
  { term: "Base notes", def: "The deep, long-lasting foundation that appears after 30 minutes and can linger 6–24 hours.", detail: "Base notes are heavy molecules like woods, musk, amber, vanilla, and oud. They define the dry-down and how the perfume smells on your skin all day." },
  { term: "Sillage", def: "The trail of scent a fragrance leaves behind as you move.", detail: "Pronounced 'see-yazh.' Heavy sillage means people can smell you from across a room; intimate sillage stays close to your skin." },
  { term: "Longevity", def: "How many hours a fragrance remains detectable on skin.", detail: "Eau de parfum (EDP) typically lasts 6–8 hours; eau de toilette (EDT) 3–5 hours. Bazuki's AI-composed scents target 6–8 hour longevity." },
  { term: "Concentration", def: "The percentage of fragrance oil in the alcohol base, which determines strength and longevity.", detail: "Parfum: 20–30%. EDP: 15–20%. EDT: 5–15%. Higher concentration = stronger projection and longer wear." },
  { term: "Accord", def: "A blend of multiple notes that combine to smell like a single new scent.", detail: "For example, a 'oriental amber' accord might combine vanilla, benzoin, and labdanum into one warm impression." },
  { term: "Floral family", def: "Fragrances dominated by flower notes like rose, jasmine, tuberose, or lily.", detail: "Florals can be soliflore (one flower) or bouquet (multiple). Common in romantic and feminine compositions." },
  { term: "Woody family", def: "Fragrances built around tree-derived notes like sandalwood, cedar, vetiver, and oud.", detail: "Woody scents are warm, dry, and often unisex. Sandalwood and cedar are gentler; oud is dense and luxurious." },
  { term: "Citrus family", def: "Fresh, zesty fragrances built on bergamot, lemon, grapefruit, or orange.", detail: "Citrus notes are top-note dominant and short-lived, often used to open compositions or for daytime, summer wear." },
  { term: "Oriental family", def: "Warm, sensual fragrances featuring amber, vanilla, spices, and resins.", detail: "Also called 'amber.' Common in evening and winter perfumes. Heavy projection, long wear." },
  { term: "Fresh family", def: "Clean, aquatic, or green fragrances suggesting sea air, rain, or cut grass.", detail: "Often built on synthetic aquatic molecules, mint, or green leaves. Light and modern." },
  { term: "Gourmand family", def: "Edible-smelling fragrances built on vanilla, caramel, chocolate, or coffee.", detail: "Sweet and dessert-like. Popular in winter and in modern niche perfumery." },
  { term: "IFRA-compliant", def: "Made using ingredients that meet International Fragrance Association safety standards.", detail: "Every note in Bazuki's library is IFRA-compliant, meaning it passes skin-safety and allergen limits." },
  { term: "Dry-down", def: "How a fragrance smells after the top and heart notes have evaporated.", detail: "The dry-down is the base notes on your skin — usually 4–8 hours after spraying. It's the truest test of whether you'll love a perfume." },
];

const PerfumeNotesExplained = () => {
  useSEO({
    title: "Perfume Notes Explained: A Glossary (2026) | Bazuki",
    description:
      "What are top, heart, and base notes? A clear glossary of perfume terms — sillage, longevity, accords, scent families — by Bazuki.",
    type: "article",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="container mx-auto px-4 max-w-3xl pt-24 pb-16">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">Glossary</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-4">
            Perfume Notes Explained
          </h1>
          <p className="text-muted-foreground text-lg">
            Every Bazuki fragrance is described in terms of top, heart, and base notes, sillage, longevity, and scent family. Here's a plain-English glossary so you can read any fragrance description with confidence.
          </p>
        </header>

        <div className="space-y-8">
          {terms.map((t) => (
            <section key={t.term}>
              <h2 className="font-serif text-2xl font-bold mb-2">{t.term}</h2>
              <p className="font-medium mb-2">{t.def}</p>
              <p className="text-muted-foreground">{t.detail}</p>
            </section>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 my-12">
          <Button asChild size="lg">
            <Link to="/shop/quiz">Find your matching notes</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/ingredients">See our 10 launch notes</Link>
          </Button>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Perfume Notes Glossary",
            hasDefinedTerm: terms.map((t) => ({
              "@type": "DefinedTerm",
              name: t.term,
              description: t.def,
            })),
          }),
        }}
      />
      <Footer />
    </div>
  );
};

export default PerfumeNotesExplained;
