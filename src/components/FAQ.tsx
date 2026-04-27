import { useNavigate, Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does the AI match me to a fragrance?",
    a: (
      <>
        Our engine analyzes your quiz answers across personality, mood, scent-family preferences,
        and lifestyle signals, then maps them to a curated IFRA-compliant ingredient library to
        compose scents that fit you.{" "}
        <Link to="/about" className="text-primary underline-offset-4 hover:underline font-medium">
          Learn about our science →
        </Link>
      </>
    ),
  },
  {
    q: "What do I answer in the quiz?",
    a: "A short 16-question journey covering scent families you love, personality sliders (bold ↔ subtle, warm ↔ fresh), mood and occasion, color preferences, and a few lifestyle cues. It takes about 3 minutes.",
  },
  {
    q: "Why do I receive 3 fragrances?",
    a: "Instead of one guess, our AI generates three distinct matches — typically a “safe favorite,” an “adventurous twist,” and a “signature statement” — so you can explore the range of what suits you.",
  },
  {
    q: "Can I see what's inside each fragrance?",
    a: (
      <>
        Yes. Every match shows its top, heart, and base notes, intensity, longevity, and a visual
        fingerprint. All ingredients are IFRA-compliant.{" "}
        <Link to="/ingredients" className="text-primary underline-offset-4 hover:underline font-medium">
          Browse our ingredients →
        </Link>
      </>
    ),
  },
  {
    q: "What sizes can I order?",
    a: "30ml and 50ml bottles, plus a 3-bottle Discovery Set (₹1,500) so you can try all three matches together at a saving.",
  },
  {
    q: "Can I tweak my fragrance after seeing the results?",
    a: "Yes — use the “Tweak Formula” option on any result to adjust intensity or swap notes before ordering or publishing it to the community.",
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold heading-luxury mb-3">
            How AI Matching Works
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about your personalized fragrance journey.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-center mt-10">
          <Button size="lg" onClick={() => navigate("/shop/quiz")}>
            Take the Quiz
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
