import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    type: "Boutique Hotel",
    quote: "Our guests now ask what scent we use the moment they enter the lobby. Bazuki nailed our brand in one blend.",
    author: "General Manager, Heritage Hotel · Jaipur",
  },
  {
    type: "Retail Brand",
    quote: "Footfall dwell time is up 22% since we installed Bazuki diffusers across our flagship stores.",
    author: "Head of Retail, Lifestyle Brand · Mumbai",
  },
  {
    type: "Wellness Spa",
    quote: "The custom blend feels like an extension of our therapy. Calming, distinct, unforgettable.",
    author: "Founder, Wellness Spa · Bengaluru",
  },
];

const B2BTestimonials = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">Trusted By</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold">What Partners Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="p-8 rounded-lg border border-luxury-gold/20 bg-luxury-black text-primary-foreground flex flex-col"
            >
              <Quote className="w-8 h-8 text-luxury-gold/60 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
                ))}
              </div>
              <p className="text-primary-foreground/85 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-luxury-gold border border-luxury-gold/40 rounded-full px-3 py-1 mb-2">
                  {t.type}
                </span>
                <p className="text-sm text-primary-foreground/70">{t.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default B2BTestimonials;
