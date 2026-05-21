import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/useSEO";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

export interface SeoLandingSection {
  heading: string;
  body: React.ReactNode;
}

export interface SeoLandingFaq {
  q: string;
  a: string;
}

interface Props {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: SeoLandingSection[];
  faqs: SeoLandingFaq[];
  breadcrumbName: string;
  idPrefix: string;
}

const SeoLandingPage = ({
  path,
  title,
  description,
  eyebrow,
  h1,
  intro,
  sections,
  faqs,
  breadcrumbName,
  idPrefix,
}: Props) => {
  useSEO({ title, description });

  const breadcrumbsJsonLd = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: breadcrumbName, path },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <JsonLd id={`breadcrumbs-${idPrefix}`} data={breadcrumbsJsonLd} />
      <JsonLd id={`faq-${idPrefix}`} data={faqJsonLd} />
      <Header />

      <main>
        {/* Hero */}
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Button asChild size="lg">
                <Link to="/shop/quiz">Take the AI Scent Quiz</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/collection">Browse the Collection</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content sections */}
        {sections.map((s, i) => (
          <section
            key={i}
            className="border-b border-luxury-gold/10 py-16 md:py-20"
          >
            <div className="container mx-auto px-6 max-w-3xl">
              <h2 className="font-serif text-2xl md:text-3xl text-cream mb-5">
                {s.heading}
              </h2>
              <div className="text-cream-muted leading-relaxed space-y-4 text-base md:text-lg">
                {s.body}
              </div>
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section className="border-b border-luxury-gold/10 py-16 md:py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl text-cream mb-8 text-center">
              Frequently asked
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-luxury-gold/15">
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
        <section className="py-20 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl text-cream mb-5">
              Ready to find a scent that's truly yours?
            </h2>
            <p className="text-cream-muted mb-8">
              A 3-minute quiz, three AI-composed matches, made-to-order in India.
            </p>
            <Button asChild size="lg">
              <Link to="/shop/quiz">Start the Quiz →</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SeoLandingPage;
