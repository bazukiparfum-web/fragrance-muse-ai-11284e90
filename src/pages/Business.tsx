import Header from "@/components/Header";
import BusinessAroma from "@/components/BusinessAroma";
import Footer from "@/components/Footer";

const Business = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <section className="bg-luxury-black text-primary-foreground py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block px-4 py-2 bg-luxury-gold/10 rounded-full mb-6">
              <span className="text-luxury-gold font-semibold uppercase tracking-wider text-sm">
                For Businesses
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
              Scent Your Brand
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              From boutique hotels to boardrooms — bespoke scent design and IoT-enabled aroma systems for premium spaces across India.
            </p>
          </div>
        </section>
        <BusinessAroma />
      </div>
      <Footer />
    </div>
  );
};

export default Business;
