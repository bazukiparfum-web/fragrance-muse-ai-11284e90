import { BedDouble, ShoppingBag, Building2, PartyPopper, Flower2, Car } from "lucide-react";

const cases = [
  { icon: BedDouble, title: "Hotels & Hospitality", desc: "Signature lobby and suite scents that define your guest experience." },
  { icon: ShoppingBag, title: "Retail & Boutiques", desc: "Aroma identities that boost dwell time and brand recall." },
  { icon: Building2, title: "Offices & Co-working", desc: "Calming, focus-enhancing scents for productive workspaces." },
  { icon: PartyPopper, title: "Events & Weddings", desc: "Bespoke fragrances curated for once-in-a-lifetime moments." },
  { icon: Flower2, title: "Spas & Wellness", desc: "Therapeutic blends designed to relax, restore and rejuvenate." },
  { icon: Car, title: "Automotive", desc: "Premium cabin scenting for showrooms and luxury fleets." },
];

const UseCasesGrid = () => {
  return (
    <section id="use-cases" className="bg-luxury-black text-primary-foreground py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">Where We Work</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">Industries We Scent</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-8 rounded-lg border border-luxury-gold/15 bg-white/[0.02] hover:border-luxury-gold/60 hover:bg-luxury-gold/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-lg bg-luxury-gold/10 flex items-center justify-center mb-5 group-hover:bg-luxury-gold/20 transition-colors">
                <Icon className="w-7 h-7 text-luxury-gold" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesGrid;
