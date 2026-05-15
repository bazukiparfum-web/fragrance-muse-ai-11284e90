import { Button } from "@/components/ui/button";

const B2BCtaStrip = () => {
  return (
    <section className="bg-gradient-to-r from-luxury-gold/15 via-luxury-gold/25 to-luxury-gold/15 border-y border-luxury-gold/30 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-luxury-black">
          Ready to define your aroma identity?
        </h3>
        <Button
          variant="luxury"
          size="lg"
          onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
        >
          Book a Free Consultation
        </Button>
      </div>
    </section>
  );
};

export default B2BCtaStrip;
