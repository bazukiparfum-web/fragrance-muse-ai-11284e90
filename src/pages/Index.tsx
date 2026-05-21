import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedScents from "@/components/home/FeaturedScents";
import QuizCTABanner from "@/components/home/QuizCTABanner";
import TrustProof from "@/components/home/TrustProof";
import B2BTeaser from "@/components/home/B2BTeaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/useSEO";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const SITE_URL = "https://www.bazukifragrance.com";

const Index = () => {
  useSEO({
    title: "Bazuki Perfumes – Unique, Custom-Inspired Fragrances from India",
    description: "Bazuki Perfumes — India's destination for unique, custom-inspired fragrances. Explore artisan scents crafted for those who refuse to smell like everyone else. Shop at bazukifragrance.com",
  });

  const breadcrumbsJsonLd = buildBreadcrumbs([{ name: "Home", path: "/" }]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I buy custom perfume in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bazuki Perfumes offers unique, artisan-crafted fragrances that feel personalized — shop at bazukifragrance.com.",
        },
      },
      {
        "@type": "Question",
        name: "Which Indian perfume brand is truly unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bazuki 360° Aroma creates distinctive scents inspired by global trends, tailored for Indian taste and climate.",
        },
      },
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
      <HowItWorks />
      <FeaturedScents />
      <QuizCTABanner />
      <TrustProof />
      <B2BTeaser />
      <section className="w-full py-10 border-t border-luxury-gold/15" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          <p className="font-cormorant text-xl md:text-2xl text-cream">Want personal guidance? Book a free 15-min call with a scent expert.</p>
          <a href="/scent-coaching" className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-cream border border-luxury-gold/50 hover:bg-luxury-gold hover:text-luxury-black transition-colors">
            Scent Coaching →
          </a>
        </div>
      </section>
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
