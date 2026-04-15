import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import businessImage from "@/assets/business-aroma.jpg";
import { Sparkles, Building2, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("consultation_requests").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }
    toast.success("Thank you for connecting with us. Our sales person will get back to you.");
    setName("");
    setEmail("");
    setPhone("");
    setComment("");
    setDialogOpen(false);
  };

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

            <Button variant="luxury" size="lg" onClick={() => setDialogOpen(true)}>
              Request Consultation
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[hsl(var(--luxury-black))] border-luxury-gold/20 text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">How can we help you?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submit your query and our team will get back to you shortly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consult-name">Name</Label>
                <Input
                  id="consult-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consult-email">Email</Label>
                <Input
                  id="consult-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consult-phone">Mobile Number</Label>
              <Input
                id="consult-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consult-comment">Comment</Label>
              <Textarea
                id="consult-comment"
                placeholder="Tell us about your needs..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>
            <Button type="submit" variant="luxury" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default BusinessAroma;
