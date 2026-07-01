import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroB2B from "@/components/business/HeroB2B";
import ScentScience from "@/components/business/ScentScience";
import UseCasesGrid from "@/components/business/UseCasesGrid";
import BrandArchetypes from "@/components/business/BrandArchetypes";
import B2BPackages from "@/components/business/B2BPackages";
import ClientStories from "@/components/business/ClientStories";
import HowItWorks from "@/components/business/HowItWorks";
import ServicesOffered from "@/components/business/ServicesOffered";
import B2BTestimonials from "@/components/business/B2BTestimonials";
import LeadCaptureForm from "@/components/business/LeadCaptureForm";
import BusinessFAQ from "@/components/business/BusinessFAQ";
import FinalCtaStrip from "@/components/business/FinalCtaStrip";
import BusinessDiffusers from "@/components/business/BusinessDiffusers";
import { TrustedByCarousel } from "@/components/TrustedByCarousel";
import { CLIENT_LOGOS } from "@/data/clientLogos";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const Business = () => {
  useSEO({
    title: "Scent Marketing for Hotels, Retail & Offices | Bazuki",
    description:
      "Scent Marketing by Bazuki — custom brand scents, IoT diffusers and refill subscriptions for hotels, retail, offices, spas and events across India.",
  });
  const breadcrumbs = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: "Scent Marketing", path: "/business" },
  ]);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Scent Marketing",
    serviceType: "Scent Marketing",
    provider: {
      "@type": "Organization",
      name: "Bazuki Perfumes",
      url: "https://www.bazukifragrance.com",
    },
    areaServed: { "@type": "Country", name: "India" },
    url: "https://www.bazukifragrance.com/business",
    description:
      "Custom brand scents, IoT-ready diffusers and refill subscriptions for hotels, retail, offices, spas and events across India.",
  };
  return (
    <div className="min-h-screen">
      <JsonLd id="breadcrumbs-business" data={breadcrumbs} />
      <JsonLd id="service-scent-marketing" data={serviceJsonLd} />
      <Header />
      <main className="pt-16">
        <HeroB2B />
        <ScentScience />
        <UseCasesGrid />
        <BrandArchetypes />
        <B2BPackages />
        <TrustedByCarousel
          logos={CLIENT_LOGOS}
          eyebrow="Trusted By"
          title="Brands that trust Bazuki"
          headingVisible={false}
        />
        <ClientStories />
        <HowItWorks />
        <ServicesOffered />
        <BusinessDiffusers />
        <B2BTestimonials />
        <LeadCaptureForm />
        <BusinessFAQ />
        <FinalCtaStrip />
      </main>
      <Footer />
    </div>
  );
};

export default Business;
