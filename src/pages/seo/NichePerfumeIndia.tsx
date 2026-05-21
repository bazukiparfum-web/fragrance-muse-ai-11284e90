import { Link } from "react-router-dom";
import SeoLandingPage from "./SeoLandingPage";

const NichePerfumeIndia = () => (
  <SeoLandingPage
    path="/niche-perfume-india"
    idPrefix="niche-perfume-india"
    breadcrumbName="Niche Artisan Perfumes India"
    title="Niche Artisan Perfumes India | Bazuki 360° Aroma"
    description="Niche artisan perfumes in India by Bazuki 360° Aroma. AI-composed, small-batch, IFRA-compliant fragrances for individuals — plus 360° scent solutions for brands and spaces."
    eyebrow="Niche · Artisan · India"
    h1="Niche Artisan Perfumes, Composed in India"
    intro="Bazuki 360° Aroma is an India-based niche perfumery: small-batch, AI-composed fragrances built on an IFRA-compliant library — for individuals who care about provenance and for brands that want a signature scent."
    sections={[
      {
        heading: "What 'niche' actually means at Bazuki",
        body: (
          <p>
            Niche perfumery isn't about price tags — it's about intent. Every Bazuki fragrance is
            composed for a specific person or brand, made to order in our Ahmedabad atelier, and
            built from a curated artisan ingredient library rather than off-the-shelf concentrates.
            No mass production, no department-store dilution.
          </p>
        ),
      },
      {
        heading: "For individuals: your own niche scent",
        body: (
          <p>
            Take the{" "}
            <Link to="/shop/quiz" className="text-luxury-gold underline-offset-4 hover:underline">
              AI Scent Quiz
            </Link>{" "}
            and our engine composes three niche fragrances around your personality, mood, and the
            Indian climate. Tweak the formula, choose 30ml or 50ml, and we make it for you. Want
            human guidance?{" "}
            <Link to="/scent-coaching" className="text-luxury-gold underline-offset-4 hover:underline">
              Book a free 15-minute scent coaching call
            </Link>
            .
          </p>
        ),
      },
      {
        heading: "For brands: 360° aroma marketing",
        body: (
          <p>
            Bazuki's B2B arm composes signature scents for hotels, retail spaces, salons, and
            corporate environments — pairing fragrance with diffusion hardware and a full sensory
            strategy. See{" "}
            <Link to="/business" className="text-luxury-gold underline-offset-4 hover:underline">
              360° Aroma Solutions
            </Link>{" "}
            for case studies and packages.
          </p>
        ),
      },
      {
        heading: "An artisan ingredient library",
        body: (
          <p>
            Explore the{" "}
            <Link to="/ingredients" className="text-luxury-gold underline-offset-4 hover:underline">
              Bazuki ingredient library
            </Link>{" "}
            — oud, sandalwood, vetiver, jasmine sambac, rose, oakmoss, and modern aroma molecules
            — every note IFRA-compliant and traceable.
          </p>
        ),
      },
    ]}
    faqs={[
      {
        q: "What is a niche perfume?",
        a: "Niche perfumes are composed and produced in small batches for a specific audience, using artisan ingredients rather than mass-market formulas. Bazuki's AI-composed, made-to-order fragrances fit that definition for the Indian market.",
      },
      {
        q: "Where can I buy niche perfumes in India?",
        a: "Bazuki 360° Aroma offers niche, artisan-crafted fragrances composed in India and shipped nationwide — explore the collection or take the AI Scent Quiz at bazukifragrance.com.",
      },
      {
        q: "Does Bazuki create niche scents for brands and spaces?",
        a: "Yes. Bazuki's 360° Aroma practice composes signature scents for hotels, retail, salons, and corporate spaces, including diffusion hardware and scent-marketing strategy.",
      },
    ]}
  />
);

export default NichePerfumeIndia;
