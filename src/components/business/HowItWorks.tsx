import { MessagesSquare, Fingerprint, FlaskConical, Truck } from "lucide-react";

const steps = [
  { icon: MessagesSquare, title: "Consultation", desc: "We learn your brand, space and vision." },
  { icon: Fingerprint, title: "Scent Profile", desc: "We craft a sensory brief unique to you." },
  { icon: FlaskConical, title: "Custom Formulation", desc: "Our perfumers blend and refine your signature." },
  { icon: Truck, title: "Deployment", desc: "Diffusers installed, refills delivered, on schedule." },
];

const HowItWorks = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">The Process</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">How It Works</h2>
        </div>

        <div className="relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="text-center flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-full bg-luxury-black border border-luxury-gold/40 flex items-center justify-center mb-5 shadow-lg">
                  <Icon className="w-7 h-7 text-luxury-gold" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-luxury-gold text-luxury-black text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[14rem]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
