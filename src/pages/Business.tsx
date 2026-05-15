import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroB2B from "@/components/business/HeroB2B";
import ScentScience from "@/components/business/ScentScience";
import UseCasesGrid from "@/components/business/UseCasesGrid";
import B2BPackages from "@/components/business/B2BPackages";
import ClientStories from "@/components/business/ClientStories";
import HowItWorks from "@/components/business/HowItWorks";
import ServicesOffered from "@/components/business/ServicesOffered";
import B2BTestimonials from "@/components/business/B2BTestimonials";
import LeadCaptureForm from "@/components/business/LeadCaptureForm";
import B2BCtaStrip from "@/components/business/B2BCtaStrip";
import FAQ from "@/components/FAQ";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const Business = () => {
  useSEO({
    title: "360° Aroma Solutions for Business | Bazuki Fragrance",
    description:
      "Custom brand scents, IoT diffusers and refill subscriptions for hotels, retail, offices, spas, events and automotive across India.",
  });
  const breadcrumbs = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: "Business", path: "/business" },
  ]);
  return (
    <div className="min-h-screen">
      <JsonLd id="breadcrumbs-business" data={breadcrumbs} />
      <Header />
      <main className="pt-16">
        <HeroB2B />
        <ScentScience />
        <UseCasesGrid />
        <B2BPackages />
        <ClientStories />
        <HowItWorks />
        <ServicesOffered />
        <B2BTestimonials />
        <LeadCaptureForm />
        <div id="faq">
          <FAQ />
        </div>
        <B2BCtaStrip />
      </main>
      <Footer />
    </div>
  );
};

export default Business;
