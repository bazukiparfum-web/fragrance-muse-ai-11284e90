import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-perfume.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury perfume lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            AI-Crafted Luxury in Every Breath
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Answer a few questions. Receive 3 unique fragrances. Fall in love with your signature scent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="luxury" size="xl" onClick={() => window.location.href = '/shop/quiz'}>
              Find Your Scent
            </Button>
            <Button variant="luxury-outline" size="xl" onClick={() => window.location.href = '/collection'}>
              Explore Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
