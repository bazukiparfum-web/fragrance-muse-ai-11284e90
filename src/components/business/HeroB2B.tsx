import { Button } from "@/components/ui/button";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const HeroB2B = () => {
  return (
    <section className="bg-luxury-black text-primary-foreground py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-transparent to-luxury-gold/10 pointer-events-none" />
      <div className="container mx-auto px-4 text-center relative">
        <div className="inline-block px-4 py-2 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full mb-6">
          <span className="text-luxury-gold font-semibold uppercase tracking-[0.2em] text-xs">
            360° Aroma Solutions · For Businesses
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Transform Your Space <span className="text-luxury-gold">with Scent</span>
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/75 max-w-2xl mx-auto mb-10 leading-relaxed">
          From hotels to retail — Bazuki creates custom aroma identities for your brand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="luxury" size="lg" onClick={() => scrollTo("lead-form")}>
            Book a Free Consultation
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 hover:text-luxury-gold"
            onClick={() => scrollTo("use-cases")}
          >
            Explore Use Cases
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroB2B;
