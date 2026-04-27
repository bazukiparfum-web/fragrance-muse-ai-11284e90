import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import scienceHero from "@/assets/science-hero.jpg";
import technologyHero from "@/assets/technology-hero.jpg";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  const navigate = useNavigate();

  useSEO({
    title: "The Science & Technology Behind Bazuki Fragrances",
    description:
      "Discover how Bazuki blends AI-driven perfumery with a precision 10-pump dispensing machine to craft fragrances that feel unmistakably yours.",
    image: scienceHero,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page heading */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">
            Our Craft
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-4">
            The science and technology behind every Bazuki scent
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We blend artificial intelligence, classical perfumery, and precision engineering to
            create fragrances that feel unmistakably yours.
          </p>
        </div>
      </section>

      {/* Two columns: Science + Technology */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12">
            {/* Science */}
            <Card className="p-6 md:p-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-6">
                The Science
              </h2>
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={scienceHero}
                  alt="Hand holding a small fragrance vial with a QR-code label in soft daylight"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We treat AI as a tool — not the answer. The journey is led by you. Your quiz answers
                give the system signals about who you are, where you wear scent, and what feels like
                home; the AI translates those signals into accords across our IFRA-compliant palette.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Think of it as classical perfumery education compressed into a model: it learns
                from how notes compose, supports our perfumers' intuition, and helps you skip the
                years of training. You answer — and a fragrance, almost personal, comes back.
              </p>
            </Card>

            {/* Technology */}
            <Card className="p-6 md:p-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-6">
                The Technology
              </h2>
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={technologyHero}
                  alt="Algorithmic perfumery machine with rows of glass funnels and electronic dispensing modules"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our algorithmic perfumery system is built around a precision pump array (PUMP-01
                through PUMP-10), each tied to a single fragrance note. When your formula is
                approved, the machine measures and dispenses every ingredient by the millilitre —
                so what you smell is exactly what was composed.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Designed and assembled in India, the system pairs hardware reliability with a
                software pipeline that turns AI matches into production-ready instructions. It's
                the bridge between the model's idea of "you" and a bottle in your hands.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            {[
              { num: "10", label: "Curated launch notes" },
              { num: "3 min", label: "To complete the quiz" },
              { num: "3", label: "Personalised matches" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl md:text-5xl font-bold heading-luxury mb-2">
                  {s.num}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-4">
            Experience it for yourself
          </h2>
          <p className="text-muted-foreground mb-8">
            See the palette behind the system, then take the quiz to compose your three matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/ingredients")}>
              Explore Ingredients
            </Button>
            <Button size="lg" onClick={() => navigate("/shop/quiz")}>
              Take the Quiz
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
