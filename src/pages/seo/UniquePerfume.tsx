import { Link } from "react-router-dom";
import SeoLandingPage from "./SeoLandingPage";

const UniquePerfume = () => (
  <SeoLandingPage
    path="/unique-perfume"
    idPrefix="unique-perfume"
    breadcrumbName="Unique Perfumes"
    title="Unique Perfumes for Men & Women | Stand Out Scents | Bazuki"
    description="Unique perfumes for men and women, AI-composed and made in India. Stand out with a fragrance that's actually yours — not the bottle everyone at work is wearing."
    eyebrow="Unique Fragrances · Men & Women"
    h1="Unique Perfumes for People Who Refuse to Smell Like Everyone Else"
    intro="If you've ever caught your own perfume on a stranger, you know the feeling. Bazuki composes one-of-a-kind fragrances using AI and an artisan ingredient library, so the scent you wear is genuinely yours."
    sections={[
      {
        heading: "Why mainstream perfumes feel the same",
        body: (
          <p>
            The global fragrance market is dominated by a handful of formulas mass-produced for
            the broadest possible audience. They're safe, recognizable — and worn by millions of
            other people. A unique perfume should do the opposite: reflect <em>you</em>, not the
            algorithm of a department store buyer.
          </p>
        ),
      },
      {
        heading: "How Bazuki composes unique scents",
        body: (
          <>
            <p>
              Our AI takes your quiz inputs — scent families, personality sliders (bold ↔ subtle,
              warm ↔ fresh), mood, and lifestyle — and composes three distinct fragrances:
              typically a safe favourite, an adventurous twist, and a signature statement.
            </p>
            <p>
              You can then{" "}
              <Link to="/shop/quiz" className="text-luxury-gold underline-offset-4 hover:underline">
                tweak any formula
              </Link>{" "}
              — push the oud higher, dial the citrus down, swap a note — before we make it to
              order.
            </p>
          </>
        ),
      },
      {
        heading: "Unique for him, unique for her, unique for anyone",
        body: (
          <p>
            Bazuki is gender-free by design. The quiz doesn't filter by him/her — it filters by{" "}
            <em>you</em>. Browse our{" "}
            <Link to="/collection" className="text-luxury-gold underline-offset-4 hover:underline">
              signature collection
            </Link>{" "}
            for inspiration, or jump straight into the quiz.
          </p>
        ),
      },
    ]}
    faqs={[
      {
        q: "Which Indian perfume brand is truly unique?",
        a: "Bazuki 360° Aroma creates distinctive scents inspired by global trends, tailored for Indian taste and climate.",
      },
      {
        q: "What makes a Bazuki perfume different from a designer fragrance?",
        a: "Designer fragrances are mass-produced for millions; Bazuki perfumes are AI-composed for one person and made to order, so the scent you wear is genuinely uncommon.",
      },
      {
        q: "Are Bazuki perfumes suitable for men and women?",
        a: "Yes. Bazuki is gender-free — the quiz composes a fragrance around your personality and preferences, not a him/her label.",
      },
    ]}
  />
);

export default UniquePerfume;
