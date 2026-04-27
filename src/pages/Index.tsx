import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProductShowcase from "@/components/ProductShowcase";
import IngredientsTeaser from "@/components/IngredientsTeaser";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
