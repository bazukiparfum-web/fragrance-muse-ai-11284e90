import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxury-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-luxury-gold">Bazuki</h3>
            <p className="text-white/70 mb-6">
              AI-crafted luxury fragrances and 360° aroma solutions for discerning individuals and businesses.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/bazukiperfume/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/Bazukiperfume" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-lg mb-4 uppercase tracking-wider">Products</h4>
            <ul className="space-y-3">
              <li><a href="/collection" className="text-white/70 hover:text-luxury-gold transition-colors">Signature Collection</a></li>
              <li><a href="/shop/quiz" className="text-white/70 hover:text-luxury-gold transition-colors">AI Fragrance Quiz</a></li>
              <li><a href="/collection" className="text-white/70 hover:text-luxury-gold transition-colors">Gift Sets</a></li>
              <li><a href="/collection" className="text-white/70 hover:text-luxury-gold transition-colors">Sample Kits</a></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-semibold text-lg mb-4 uppercase tracking-wider">Business</h4>
            <ul className="space-y-3">
              <li><a href="/business" className="text-white/70 hover:text-luxury-gold transition-colors">360° Aroma Solutions</a></li>
              <li><a href="/business" className="text-white/70 hover:text-luxury-gold transition-colors">Custom Fragrances</a></li>
              <li><a href="/business#consultation" className="text-white/70 hover:text-luxury-gold transition-colors">Consultation</a></li>
              <li><a href="/business" className="text-white/70 hover:text-luxury-gold transition-colors">Case Studies</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-white/70">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
              <li className="flex gap-3 text-white/70">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+917990097922" className="hover:text-luxury-gold transition-colors">+91 79900 97922</a>
              </li>
              <li className="flex gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:business@bazuki360aroma.com" className="hover:text-luxury-gold transition-colors break-all">business@bazuki360aroma.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} Bazuki Perfumes. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/legal/privacy" className="text-white/50 hover:text-luxury-gold transition-colors">Privacy Policy</a>
              <a href="/legal/terms" className="text-white/50 hover:text-luxury-gold transition-colors">Terms of Service</a>
              <a href="/legal/shipping" className="text-white/50 hover:text-luxury-gold transition-colors">Shipping Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
