import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Shipping = () => (
  <div className="min-h-screen">
    <Header />
    <main className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Shipping Policy</h1>
      <div className="space-y-6 text-foreground/80">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">1. Production Time</h2>
          <p>Custom AI-formulated fragrances are made-to-order and typically ship within 5–7 business days. Pre-made signature collection items ship within 1–2 business days.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">2. Delivery</h2>
          <p>We currently ship across India via reputable courier partners. Standard delivery takes 3–5 business days after dispatch. You will receive a tracking link by email and SMS once your order ships.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">3. Shipping Charges</h2>
          <p>Shipping fees are calculated at checkout based on your delivery address and order value. Free shipping is available on qualifying orders.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">4. Returns</h2>
          <p>Pre-made signature scents may be returned unopened within 7 days of delivery. Custom AI-formulated fragrances are non-returnable. If your order arrives damaged, contact us within 48 hours at <a href="mailto:business@bazuki360aroma.com" className="text-luxury-gold hover:underline">business@bazuki360aroma.com</a> and we will arrange a replacement.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">5. International Orders</h2>
          <p>International shipping is not currently offered. For B2B enquiries outside India, please <a href="/business" className="text-luxury-gold hover:underline">contact our business team</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Shipping;
