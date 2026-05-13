import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProductShowcase from "@/components/ProductShowcase";
import IngredientsTeaser from "@/components/IngredientsTeaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/useSEO";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const SITE_URL = "https://www.bazukifragrance.com";

const Index = () => {
  useSEO({
    title: "Bazuki Perfumes – AI Fragrances & 360° Aroma Solutions",
    description: "AI-personalized luxury perfumes made in India. Take a 2-minute quiz to discover your signature scent, plus 360° aroma solutions for business.",
  });

  const breadcrumbsJsonLd = buildBreadcrumbs([{ name: "Home", path: "/" }]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does the AI match me to a fragrance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our engine analyzes your quiz answers across personality, mood, scent-family preferences, and lifestyle signals, then maps them to a curated IFRA-compliant ingredient library to compose scents that fit you.",
        },
      },
      {
        "@type": "Question",
        name: "What do I answer in the quiz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A short 16-question journey covering scent families you love, personality sliders (bold ↔ subtle, warm ↔ fresh), mood and occasion, color preferences, and a few lifestyle cues. It takes about 3 minutes.",
        },
      },
      {
        "@type": "Question",
        name: "Why do I receive 3 fragrances?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Instead of one guess, our AI generates three distinct matches — typically a safe favorite, an adventurous twist, and a signature statement — so you can explore the range of what suits you.",
        },
      },
      {
        "@type": "Question",
        name: "Can I see what's inside each fragrance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every match shows its top, heart, and base notes, intensity, longevity, and a visual fingerprint. All ingredients are IFRA-compliant.",
        },
      },
      {
        "@type": "Question",
        name: "What sizes can I order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "30ml and 50ml bottles, plus a 3-bottle Discovery Set (₹1,500) so you can try all three matches together at a saving.",
        },
      },
      {
        "@type": "Question",
        name: "Can I tweak my fragrance after seeing the results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — use the Tweak Formula option on any result to adjust intensity or swap notes before ordering or publishing it to the community.",
        },
      },
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Bazuki Perfumes",
    image: `${SITE_URL}/favicon.png`,
    url: SITE_URL,
    telephone: "+91-79900-97922",
    email: "business@bazuki360aroma.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/bazukiperfume/",
      "https://www.facebook.com/Bazukiperfume",
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd id="breadcrumbs-home" data={breadcrumbsJsonLd} />
      <JsonLd id="faq-home" data={faqJsonLd} />
      <JsonLd id="localbusiness-home" data={localBusinessJsonLd} />
      <Header />
      <Hero />
      <TrustStrip />
      <ProductShowcase />
      <IngredientsTeaser />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
