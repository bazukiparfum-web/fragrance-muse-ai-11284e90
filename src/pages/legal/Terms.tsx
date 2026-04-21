import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen">
    <Header />
    <main className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
      <div className="space-y-6 text-foreground/80">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">1. Acceptance</h2>
          <p>By using bazukifragrance.com you agree to these terms. If you do not agree, please do not use the site.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">2. Products</h2>
          <p>All fragrances are made-to-order in India. Custom AI-formulated scents are non-returnable once produced. Pre-made signature collection items may be returned unopened within 7 days of delivery.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">3. Pricing & Payment</h2>
          <p>All prices are listed in Indian Rupees (₹) and inclusive of applicable GST. Payment is processed at checkout via our secure payment partner.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">4. Intellectual Property</h2>
          <p>All content on this site — including the AI fragrance formulation system, branding, and copy — is the property of Bazuki Perfumes and may not be reproduced without permission.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">5. Limitation of Liability</h2>
          <p>Bazuki Perfumes is not liable for any indirect or consequential damages arising from use of our products or this website. Patch-test fragrances on skin before extended wear.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-3">6. Governing Law</h2>
          <p>These terms are governed by the laws of India, with exclusive jurisdiction in the courts of Ahmedabad, Gujarat.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
