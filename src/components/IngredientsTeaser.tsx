import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ingredientsHero from "@/assets/ingredients-hero.jpg";

const IngredientsTeaser = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={ingredientsHero}
              alt="Premium fragrance ingredients in glass bottles with electronic dispensing nozzles"
              width={1280}
              height={896}
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">
              Our Palette
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-6">
              10 essential building blocks
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We've put care and craft into curating a small palette of premium, IFRA-compliant
              ingredients so every fragrance we compose feels personal — not generic.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our perfumers combine these into accords — mini building blocks of 2 to 10 materials —
              so the AI can compose a wide sensory range from a tightly chosen library.
            </p>
            <Link
              to="/ingredients"
              className="inline-flex items-center gap-2 text-foreground font-medium hover:text-luxury-gold transition-colors"
            >
              Discover the ingredients
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IngredientsTeaser;
