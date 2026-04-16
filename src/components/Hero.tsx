import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight text-primary">
            AI-Crafted Luxury in Every Breath
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed text-primary">
            Answer a few questions. Receive 3 unique fragrances. Fall in love with your signature scent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="luxury" size="xl" onClick={() => window.location.href = '/shop/quiz'}>
              Find Your Scent
            </Button>
            <Button variant="luxury-outline" size="xl" className="text-luxury-black" onClick={() => window.location.href = '/collection'}>
              Explore Collection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
