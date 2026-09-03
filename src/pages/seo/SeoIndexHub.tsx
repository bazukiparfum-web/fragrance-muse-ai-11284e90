import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/useSEO";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

export interface HubItem {
  to: string;
  title: string;
  blurb: string;
  image?: string;
}

interface Props {
  path: string;
  idPrefix: string;
  breadcrumbName: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  items: HubItem[];
}

const SITE_URL = "https://www.bazukifragrance.com";

const SeoIndexHub = ({
  path,
  idPrefix,
  breadcrumbName,
  title,
  description,
  eyebrow,
  h1,
  intro,
  items,
}: Props) => {
  useSEO({ title, description });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      url: `${SITE_URL}${item.to}`,
    })),
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <JsonLd
        id={`breadcrumbs-${idPrefix}`}
        data={buildBreadcrumbs([
          { name: "Home", path: "/" },
          { name: breadcrumbName, path },
        ])}
      />
      <JsonLd id={`itemlist-${idPrefix}`} data={itemListJsonLd} />
      <Header />

      <main>
        <section className="border-b border-luxury-gold/10 py-20 md:py-28">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <p className="text-luxury-gold text-[11px] uppercase tracking-[0.3em] mb-5">
              {eyebrow}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl text-cream leading-tight mb-6">
              {h1}
            </h1>
            <p className="text-cream-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {intro}
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group block h-full rounded-lg border border-luxury-gold/15 bg-white/[0.02] overflow-hidden transition-colors hover:border-luxury-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/70"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-36 object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      />
                    )}
                    <div className="p-5">
                      <h2 className="font-serif text-xl text-cream mb-2">{item.title}</h2>
                      <p className="text-cream-muted text-sm leading-relaxed">{item.blurb}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 text-center border-t border-luxury-gold/10">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl text-cream mb-5">
              Not sure where to start?
            </h2>
            <p className="text-cream-muted mb-8">
              A 3-minute quiz, three AI-composed matches, made-to-order in India.
            </p>
            <Button asChild size="lg">
              <Link to="/shop/quiz">Take the AI Scent Quiz →</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SeoIndexHub;
