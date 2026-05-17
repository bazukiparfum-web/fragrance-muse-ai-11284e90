import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "917990097922"; // E.164 without +

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bz-primary pt-20 pb-10 border-t border-gold/15">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="font-display text-3xl text-cream tracking-[0.25em] inline-block mb-5"
              aria-label="Bazuki home"
            >
              BAZUKI
            </Link>
            <p className="text-cream-muted text-sm leading-relaxed mb-6 max-w-xs">
              AI-crafted luxury fragrances and 360° aroma solutions, made in India for discerning individuals and brands.
            </p>
            <div className="flex gap-3">
              {[
                { href: "https://www.instagram.com/bazukiperfume/", label: "Instagram", Icon: Instagram },
                { href: "https://www.facebook.com/Bazukiperfume", label: "Facebook", Icon: Facebook },
                { href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp", Icon: MessageCircle },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bazuki on ${label}`}
                  className="w-9 h-9 rounded-full border border-gold/30 text-cream-muted hover:text-bz-primary hover:bg-gold hover:border-gold flex items-center justify-center transition-colors"
                >
                  <Icon strokeWidth={1.25} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-5">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/collection" className="text-cream-muted hover:text-gold transition-colors">Signature Collection</Link></li>
              <li><Link to="/shop/quiz" className="text-cream-muted hover:text-gold transition-colors">AI Scent Quiz</Link></li>
              <li><Link to="/gift-cards" className="text-cream-muted hover:text-gold transition-colors">Gift Cards</Link></li>
              <li><Link to="/collection" className="text-cream-muted hover:text-gold transition-colors">Discovery Sets</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-5">Business</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/business" className="text-cream-muted hover:text-gold transition-colors">360° Aroma Solutions</Link></li>
              <li><Link to="/business" className="text-cream-muted hover:text-gold transition-colors">Custom Fragrances</Link></li>
              <li><Link to="/business#consultation" className="text-cream-muted hover:text-gold transition-colors">Book a Consultation</Link></li>
              <li><Link to="/scent-coaching" className="text-cream-muted hover:text-gold transition-colors">Scent Coaching</Link></li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-5">Discover</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-cream-muted hover:text-gold transition-colors">Our Story</Link></li>
              <li><Link to="/ingredients" className="text-cream-muted hover:text-gold transition-colors">Ingredient Library</Link></li>
              <li><Link to="/guide/find-your-signature-scent" className="text-cream-muted hover:text-gold transition-colors">Find Your Scent</Link></li>
              <li><Link to="/guide/perfume-notes-explained" className="text-cream-muted hover:text-gold transition-colors">Perfume Notes 101</Link></li>
              <li><Link to="/guide/ai-perfume-vs-traditional" className="text-cream-muted hover:text-gold transition-colors">AI vs Traditional</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="font-body text-gold text-[10px] uppercase tracking-[0.3em] mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 text-cream-muted">
                <MapPin strokeWidth={1.25} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
              <li className="flex gap-3 text-cream-muted">
                <Phone strokeWidth={1.25} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                <a href="tel:+917990097922" className="hover:text-gold transition-colors">+91 79900 97922</a>
              </li>
              <li className="flex gap-3 text-cream-muted">
                <MessageCircle strokeWidth={1.25} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex gap-3 text-cream-muted">
                <Mail strokeWidth={1.25} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                <a href="mailto:business@bazuki360aroma.com" className="hover:text-gold transition-colors break-all">
                  business@bazuki360aroma.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-dim text-xs tracking-wide">
              © {currentYear} Bazuki Perfumes · Crafted in India
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
              <Link to="/legal/privacy" className="text-dim hover:text-gold transition-colors">Privacy</Link>
              <Link to="/legal/terms" className="text-dim hover:text-gold transition-colors">Terms</Link>
              <Link to="/legal/shipping" className="text-dim hover:text-gold transition-colors">Shipping</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
