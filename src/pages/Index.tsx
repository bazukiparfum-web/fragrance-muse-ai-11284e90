import Header from "@/components/Header";
import Hero from "@/components/Hero";

import TrustedByStrip from "@/components/home/TrustedByStrip";
import HowItWorks from "@/components/home/HowItWorks";
import MeetTheMachine from "@/components/home/MeetTheMachine";
import FeaturedScents from "@/components/home/FeaturedScents";
import QuizCTABanner from "@/components/home/QuizCTABanner";
import TrustProof from "@/components/home/TrustProof";
import B2BTeaser from "@/components/home/B2BTeaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WelcomeBackBanner from "@/components/retarget/WelcomeBackBanner";
import WhatsAppFab from "@/components/WhatsAppFab";
import { JsonLd } from "@/components/JsonLd";
import { useSEO } from "@/hooks/useSEO";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://www.bazukifragrance.com";

const Index = () => {
  useSEO({
    title: "Bazuki – AI Custom Perfumes Made in India · From ₹700",
    description:
      "Take a 2-minute quiz and our AI filling machine blends 3 custom fragrances from 52 ingredients. Free delivery across India. From ₹700.",
    image: "/og-image.jpg",
    noindex: false,
    canonical: "https://www.bazukifragrance.com/home",
  });


  // Log return_visit conversion when arriving from the welcome email.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("utm_source") !== "welcome_email") return;
      const mid = params.get("emid");
      if (!mid) return;
      const sessionKey = `email_return_visit_logged:${mid}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
      const match = mid.match(/^waitlist-confirm-(.+)$/i);
      const email = match ? match[1].toLowerCase() : null;
      if (!email) return;
      supabase.functions
        .invoke("email-track", {
          body: {
            template_name: "waitlist-confirmation",
            recipient_email: email,
            conversion_kind: "return_visit",
            message_id: mid,
            variant: params.get("ev") || undefined,
          },
        })
        .catch(() => { /* non-blocking */ });
    } catch { /* noop */ }
  }, []);

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
    sameAs: ["https://www.instagram.com/bazukiperfume/", "https://www.facebook.com/Bazukiperfume"],
  };

  const sectionsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bazuki Homepage Sections",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "How It Works — Three Steps to Your Signature Scent",
        url: `${SITE_URL}/#how-it-works`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Meet the Bazuki Machine — India's First AI Fragrance Filling Machine",
        url: `${SITE_URL}/#meet-the-machine`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Signature Collection — Explore Bazuki Scents",
        url: `${SITE_URL}/#signature-collection`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Frequently Asked Questions",
        url: `${SITE_URL}/#faq`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd id="breadcrumbs-home" data={breadcrumbsJsonLd} />
      <JsonLd id="faq-home" data={faqJsonLd} />
      <JsonLd id="localbusiness-home" data={localBusinessJsonLd} />
      <JsonLd id="sections-home" data={sectionsJsonLd} />
      <WelcomeBackBanner />
      <Header />
      <Hero />
      <TrustedByStrip />
      <div id="how-it-works" style={{ scrollMarginTop: "80px" }}>
        <HowItWorks />
      </div>
      <div id="meet-the-machine" style={{ scrollMarginTop: "80px" }}>
        <MeetTheMachine />
      </div>

      <div id="signature-collection" style={{ scrollMarginTop: "80px" }}>
        <FeaturedScents />
      </div>
      <QuizCTABanner />
      <TrustProof />
      <B2BTeaser />
      <section className="w-full py-10 border-t border-luxury-gold/15" style={{ backgroundColor: "#0A0805" }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          <p className="font-cormorant text-xl md:text-2xl text-cream">
            Want personal guidance? Book a free 15-min call with a scent expert.
          </p>
          <a
            href="/scent-coaching"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-cream border border-luxury-gold/50 hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            Book a Consultation →
          </a>
        </div>
      </section>
      <div id="faq" style={{ scrollMarginTop: "80px" }}>
        <FAQ />
      </div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
};

export default Index;
