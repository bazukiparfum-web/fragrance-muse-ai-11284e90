import { Link } from "react-router-dom";
import SeoLandingPage from "./SeoLandingPage";

const CustomPerfumeIndia = () => (
  <SeoLandingPage
    path="/custom-perfume-india"
    idPrefix="custom-perfume-india"
    breadcrumbName="Custom Perfumes India"
    title="Custom Perfumes India | Unique Fragrances | Bazuki"
    description="Buy custom perfumes in India. Bazuki composes AI-personalized, artisan-crafted fragrances made to order — take a 3-minute quiz and get three unique scents shipped from India."
    eyebrow="Custom Perfumes · Made in India"
    h1="Custom Perfumes, Made for You in India"
    intro="Bazuki Perfumes is India's home for custom-inspired, AI-personalized fragrances. Answer a short quiz and our engine composes three scents tuned to your personality, mood, and the Indian climate — then we make them to order."
    sections={[
      {
        heading: "What makes a Bazuki perfume custom",
        body: (
          <>
            <p>
              Most "luxury" perfumes in India are imports sold off the shelf — the same five
              bottles to everyone. Bazuki is different. Our AI reads your answers across scent
              families, personality sliders, and mood cues, then composes three distinct
              fragrances from an IFRA-compliant ingredient library.
            </p>
            <p>
              Every match is yours: top, heart, and base notes that fit how you actually want to
              smell — not a department-store best-seller.
            </p>
          </>
        ),
      },
      {
        heading: "How to get your custom perfume",
        body: (
          <>
            <p>
              <strong className="text-cream">1.</strong> Take the{" "}
              <Link to="/shop/quiz" className="text-luxury-gold underline-offset-4 hover:underline">
                AI Scent Quiz
              </Link>{" "}
              (about 3 minutes).
              <br />
              <strong className="text-cream">2.</strong> Review your three AI-composed matches and
              tweak the formula if you like.
              <br />
              <strong className="text-cream">3.</strong> Order a 30ml or 50ml bottle — or the
              3-bottle Discovery Set at ₹1,500 to try all three.
            </p>
            <p>
              Made-to-order in our Ahmedabad atelier and shipped across India.
            </p>
          </>
        ),
      },
      {
        heading: "Built for Indian skin and weather",
        body: (
          <p>
            Our formulas are composed with India in mind — projection that survives humidity,
            longevity that holds through a Mumbai monsoon or a Delhi summer, and a curated{" "}
            <Link to="/ingredients" className="text-luxury-gold underline-offset-4 hover:underline">
              ingredient library
            </Link>{" "}
            tuned to notes Indian wearers love: oud, sandalwood, jasmine, vetiver, rose, and
            modern aroma molecules.
          </p>
        ),
      },
    ]}
    faqs={[
      {
        q: "Where can I buy custom perfume in India?",
        a: "Bazuki Perfumes offers unique, artisan-crafted fragrances that feel personalized — shop at bazukifragrance.com.",
      },
      {
        q: "How does Bazuki personalize a perfume?",
        a: "Our AI analyzes your quiz answers across scent families, personality, mood, and lifestyle, then composes three distinct fragrances from a curated IFRA-compliant ingredient library. You can tweak any formula before ordering.",
      },
      {
        q: "How long does delivery take in India?",
        a: "Custom fragrances are made to order in Ahmedabad and typically ship within 5–7 business days, with delivery across India.",
      },
    ]}
  />
);

export default CustomPerfumeIndia;
