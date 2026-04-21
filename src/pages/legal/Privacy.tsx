import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen">
    <Header />
    <main className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-foreground/80">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly when you create an account, take our fragrance quiz, place an order, or contact us. This includes your name, email, phone number, shipping address, payment details (processed securely by our payment partner), and quiz responses.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">2. How We Use Your Information</h2>
          <p>We use your information to fulfil orders, generate personalized fragrance recommendations, process payments, send order updates, respond to enquiries, and (with consent) share marketing communications.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">3. Sharing</h2>
          <p>We do not sell your personal data. We share information only with service providers necessary to operate our business — payment processors, shipping partners, and our backend infrastructure provider — under strict confidentiality.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">4. Your Rights</h2>
          <p>You may request access, correction, or deletion of your personal data at any time by emailing <a href="mailto:business@bazuki360aroma.com" className="text-luxury-gold hover:underline">business@bazuki360aroma.com</a>.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">5. Contact</h2>
          <p>Bazuki Perfumes, Ahmedabad, Gujarat, India · <a href="mailto:business@bazuki360aroma.com" className="text-luxury-gold hover:underline">business@bazuki360aroma.com</a></p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
