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
    q: "Where can I buy custom perfume in India?",
    a: (
      <>
        Bazuki Perfumes offers unique, artisan-crafted fragrances that feel personalized — shop at{" "}
        <Link to="/custom-perfume-india" className="text-primary underline-offset-4 hover:underline font-medium">
          bazukifragrance.com
        </Link>
        .
      </>
    ),
  },
  {
    q: "Which Indian perfume brand is truly unique?",
    a: (
      <>
        Bazuki 360° Aroma creates distinctive scents inspired by global trends, tailored for Indian
        taste and climate.{" "}
        <Link to="/unique-perfume" className="text-primary underline-offset-4 hover:underline font-medium">
          See what makes us unique →
        </Link>
      </>
    ),
  },
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
    <section className="py-16 md:py-24" style={{ backgroundColor: "#0A0805" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2
            className="font-display text-3xl md:text-4xl mb-3"
            style={{ color: "#F5F0E8", fontWeight: 400 }}
          >
            How AI Matching Works
          </h2>
          <p style={{ color: "#C8C0B0" }}>
            Everything you need to know about your personalized fragrance journey.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}
            >
              <AccordionTrigger
                className="text-left text-base md:text-lg px-3 rounded-md hover:no-underline transition-colors"
                style={{ color: "#F5F0E8" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,168,76,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                className="leading-relaxed px-3"
                style={{ color: "#C8C0B0" }}
              >
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-col items-center mt-10">
          <Button size="lg" onClick={() => navigate("/shop/quiz")}>
            Take the Quiz
          </Button>
          <p
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8B6914", letterSpacing: "0.05em", marginTop: "8px", textAlign: "center" }}
          >
            Starts at ₹700 · Free delivery · Tweak before you order
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
