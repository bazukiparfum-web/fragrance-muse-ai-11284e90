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
import BusinessFAQ from "@/components/business/BusinessFAQ";
import FinalCtaStrip from "@/components/business/FinalCtaStrip";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

const Business = () => {
  useSEO({
    title: "Scent Marketing for Business | Bazuki Fragrance",
    description:
      "Scent Marketing — custom brand scents, IoT diffusers and refill subscriptions for hotels, retail, offices, spas, events and automotive across India.",
  });
  const breadcrumbs = buildBreadcrumbs([
    { name: "Home", path: "/" },
    { name: "Scent Marketing", path: "/business" },
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
        <BusinessFAQ />
        <FinalCtaStrip />
      </main>
      <Footer />
    </div>
  );
};

export default Business;
