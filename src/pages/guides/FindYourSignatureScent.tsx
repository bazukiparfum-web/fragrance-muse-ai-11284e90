import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const FindYourSignatureScent = () => {
  useSEO({
    title: "How to Find Your Signature Scent (2026 Guide) | Bazuki",
    description:
      "How do you find your signature scent? A step-by-step guide using AI matching, scent families, and fragrance notes — by Bazuki, India's AI perfumery.",
    type: "article",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="container mx-auto px-4 max-w-3xl pt-24 pb-16 prose prose-neutral dark:prose-invert">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-luxury-gold mb-3">Guide</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold heading-luxury mb-4">
            How to Find Your Signature Scent
          </h1>
          <p className="text-muted-foreground text-lg">
            A signature scent is the one fragrance people start to associate with you. Finding it is part self-discovery, part chemistry, and — at Bazuki — part AI matching. Here's the full method.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">What is a signature scent?</h2>
          <p>
            A signature scent is a single fragrance (or a small wardrobe of two or three) that consistently matches your personality, lifestyle, and skin chemistry. It is the perfume people recognize on you before they see you. Unlike trying random testers at a counter, finding a signature scent is a structured process of narrowing scent families, identifying notes you love, and validating wear over a few days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Step 1 — Identify your scent family</h2>
          <p>
            Every fragrance belongs to one of six broad families: <strong>floral, woody, citrus, oriental, fresh,</strong> and <strong>gourmand</strong>. Most people gravitate toward one or two. A quick way to find yours: think about smells you already enjoy in daily life — fresh-cut grass (fresh), espresso (gourmand), sandalwood incense (woody), bergamot tea (citrus).
          </p>
          <p>
            <Link to="/guide/perfume-notes-explained" className="text-primary underline-offset-4 hover:underline">
              See our glossary of perfume notes →
            </Link>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Step 2 — Map your personality and mood</h2>
          <p>
            Scent is emotional. A bold extrovert often suits warm orientals (oud, amber, vanilla); a calm minimalist often suits clean woods (cedar, vetiver) or fresh aquatics. Bazuki's quiz uses personality sliders (bold ↔ subtle, warm ↔ fresh) to translate this directly into note weightings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Step 3 — Use AI matching to shortlist</h2>
          <p>
            Manual trial-and-error at a counter wastes time and money. The <Link to="/shop/quiz" className="text-primary underline-offset-4 hover:underline">Bazuki AI fragrance quiz</Link> takes 16 questions (about 3 minutes) and returns three personalized matches: a safe favorite, an adventurous twist, and a signature statement. This range is intentional — most people don't know which direction suits them until they smell two contrasting options side by side.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Step 4 — Test on your skin, not on paper</h2>
          <p>
            Fragrance on a paper strip smells different from fragrance on warm skin. Always wear a candidate for at least 6 hours before judging it — the dry-down (the base notes) is what people actually smell on you most of the day. Bazuki delivers a 30ml bottle of each match so you can wear-test properly instead of guessing from a sample.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Step 5 — Tweak and lock in</h2>
          <p>
            Your first match is rarely your final formula. Bazuki lets you adjust intensity or swap individual notes after testing — for example, dialing down jasmine or swapping cedar for sandalwood. Once you find the version that feels unmistakably yours, you can publish it as your signature and reorder it directly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">How long does it take to find a signature scent?</h2>
          <p>
            Using the Bazuki method, most people find a signature scent within 2–3 weeks: 3 minutes for the quiz, 7 days for delivery, and a week of wear-testing the three matches before tweaking. Compared to the traditional method of buying full bottles based on counter sniffs, this saves both money and shelf-clutter.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Common mistakes to avoid</h2>
          <ul>
            <li><strong>Judging in the first 10 minutes.</strong> You're only smelling top notes. Wait for the heart and base.</li>
            <li><strong>Sniffing too many at once.</strong> Your nose fatigues after 3–4 fragrances. Take breaks.</li>
            <li><strong>Buying what someone else recommends.</strong> Skin chemistry varies. A scent that smells great on a friend can smell wrong on you.</li>
            <li><strong>Picking a "trendy" scent.</strong> Trends fade; signature scents are personal. Optimize for you, not the year.</li>
          </ul>
        </section>

        <div className="not-prose flex flex-col sm:flex-row gap-4 my-12">
          <Button asChild size="lg">
            <Link to="/shop/quiz">Take the Bazuki Quiz</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/ingredients">Browse our notes</Link>
          </Button>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Find Your Signature Scent",
            description:
              "A 5-step method to find your signature fragrance using AI matching, scent families, and skin wear-testing.",
            totalTime: "P14D",
            step: [
              { "@type": "HowToStep", name: "Identify your scent family", text: "Choose from floral, woody, citrus, oriental, fresh, or gourmand based on smells you already enjoy." },
              { "@type": "HowToStep", name: "Map your personality and mood", text: "Use bold ↔ subtle and warm ↔ fresh sliders to translate personality into note weightings." },
              { "@type": "HowToStep", name: "Use AI matching to shortlist", text: "Take the Bazuki 16-question AI quiz to get three personalized fragrance matches in 3 minutes." },
              { "@type": "HowToStep", name: "Test on skin for 6+ hours", text: "Wear each match for at least 6 hours to evaluate the dry-down before judging." },
              { "@type": "HowToStep", name: "Tweak and lock in", text: "Adjust intensity or swap notes, then publish your final formula as your signature." },
            ],
          }),
        }}
      />
      <Footer />
    </div>
  );
};

export default FindYourSignatureScent;
