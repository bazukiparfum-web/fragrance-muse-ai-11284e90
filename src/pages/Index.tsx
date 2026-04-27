import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProductShowcase from "@/components/ProductShowcase";
import IngredientsTeaser from "@/components/IngredientsTeaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = "https://bazukifragrance.com";

const Index = () => {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd id="breadcrumbs-home" data={breadcrumbsJsonLd} />
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
