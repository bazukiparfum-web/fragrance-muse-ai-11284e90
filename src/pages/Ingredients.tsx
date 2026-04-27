import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Layers, Sparkles } from "lucide-react";
import ingredientsHero from "@/assets/ingredients-hero.jpg";
import { getNoteColor } from "@/lib/fragranceColorMapper";

interface LaunchNote {
  name: string;
  family: string;
  description: string;
}

const launchNotes: LaunchNote[] = [
  { name: "Bergamot", family: "citrus", description: "Bright, sparkling top note that opens nearly every fresh composition." },
  { name: "Lemon", family: "citrus", description: "Crisp and uplifting — adds clarity and zing in the opening minutes." },
  { name: "Lavender", family: "aromatic", description: "Calming aromatic herb that bridges fresh tops with woody hearts." },
  { name: "Rose", family: "floral", description: "Romantic, layered floral that gives depth and elegance to the heart." },
  { name: "Jasmine", family: "floral", description: "Lush, narcotic white floral — sensual and unmistakable." },
  { name: "Cedarwood", family: "woody", description: "Dry, refined wood that anchors compositions with quiet structure." },
  { name: "Sandalwood", family: "woody", description: "Creamy, warm and meditative — a cornerstone of luxury bases." },
  { name: "Vanilla", family: "gourmand", description: "Soft, edible warmth that adds comfort and a long, gentle sillage." },
  { name: "Musk", family: "oriental", description: "Skin-like and intimate — the invisible thread that ties a scent together." },
  { name: "Amber", family: "oriental", description: "Resinous, golden warmth for an enveloping, long-lasting trail." },
];

const Ingredients = () => {
  const navigate = useNavigate();

  const scrollToList = () => {
    document.getElementById("list")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={ingredientsHero}
                alt="Premium fragrance ingredients in glass bottles with electronic dispensing nozzles"
                width={1280}
                height={896}
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">
                Our Palette
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-6">
                10 essential building blocks
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We've put care and craft into curating a small palette of premium, IFRA-compliant
                ingredients so every fragrance we compose feels personal — not generic.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our perfumers combine these into accords — mini building blocks of 2 to 10 materials —
                so the AI can compose a wide sensory range from a tightly chosen library.
              </p>
              <button
                onClick={scrollToList}
                className="inline-flex items-center gap-2 text-foreground font-medium hover:text-luxury-gold transition-colors"
              >
                Discover the ingredients
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient list */}
      <section id="list" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-3">
              The 10 launch notes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each note is precision-dosed by our algorithmic perfumery system. All materials are
              IFRA-compliant and sourced for clarity, longevity, and skin safety.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {launchNotes.map((note) => (
              <Card key={note.name} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getNoteColor(note.family) }}
                    aria-hidden="true"
                  />
                  <h3 className="font-serif text-lg font-semibold">{note.name}</h3>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {note.family}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {note.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why a small library */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury text-center mb-12">
            Why a small library
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "Quality over quantity", body: "Each material is hand-picked for clarity, longevity, and how well it composes with the others." },
              { icon: ShieldCheck, title: "IFRA-safe by default", body: "Every accord respects international fragrance safety standards — kind to your skin and the people around you." },
              { icon: Layers, title: "Composable accords", body: "Ten notes, dozens of accords, infinite combinations — that's the power of a smartly designed palette." },
            ].map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-5 w-5 text-luxury-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-4">
            Ready to find your accord?
          </h2>
          <p className="text-muted-foreground mb-8">
            Take the 3-minute quiz and we'll compose three fragrances from these ten building blocks
            — tailored to you.
          </p>
          <Button size="lg" onClick={() => navigate("/shop/quiz")}>
            Take the Quiz
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ingredients;
