import { Star, ShieldCheck, Leaf, Truck, MapPin } from "lucide-react";

const TrustStrip = () => {
  return (
    <section className="border-y border-border bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
          {/* Star rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center" aria-label="4.8 out of 5 stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-luxury-gold text-luxury-gold" />
              ))}
            </div>
            <span className="font-medium text-foreground">4.8</span>
            <span className="text-muted-foreground">from 312+ happy customers</span>
          </div>

          <span className="hidden md:inline text-border">·</span>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-luxury-gold" />
              <span>Made in India</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-luxury-gold" />
              <span>IFRA Compliant Ingredients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-luxury-gold" />
              <span>Cruelty-Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-luxury-gold" />
              <span>7-Day Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
