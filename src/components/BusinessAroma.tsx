import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import businessImage from "@/assets/business-aroma.jpg";
import { Sparkles, Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  {
    icon: Sparkles,
    title: "Custom Scent Design",
    description: "Bespoke fragrances tailored to your brand identity",
  },
  {
    icon: Building2,
    title: "Smart Diffusion",
    description: "IoT-enabled systems for seamless scent distribution",
  },
  {
    icon: Users,
    title: "Consultation",
    description: "Expert guidance on scent marketing strategies",
  },
];

const BusinessAroma = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={businessImage}
                alt="Bazuki 360° Aroma business solutions"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-block px-4 py-2 bg-luxury-gold/10 rounded-full mb-6">
              <span className="text-luxury-gold font-semibold uppercase tracking-wider text-sm">
                For Businesses
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Bazuki 360° Aroma
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Transform your space with our premium scent marketing solutions. From luxury hotels to corporate offices, create an unforgettable sensory experience.
            </p>

            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="luxury" size="lg">
              Request Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessAroma;
