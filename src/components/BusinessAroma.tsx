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
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Contact number is required").max(20, "Contact number must be less than 20 characters"),
  comment: z.string().trim().min(1, "Comment is required").max(2000, "Comment must be less than 2000 characters"),
});

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
  const [form, setForm] = useState({ name: "", email: "", phone: "", comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = consultationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    const publicClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error } = await publicClient.from("consultation_requests").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      comment: result.data.comment,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }
    toast.success("Thank you for connecting with us. Our sales person will get back to you.");
    setForm({ name: "", email: "", phone: "", comment: "" });
    setErrors({});
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
                <Label htmlFor="consult-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="consult-name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="consult-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="consult-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  maxLength={255}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consult-phone">Contact Number <span className="text-destructive">*</span></Label>
              <Input
                id="consult-phone"
                type="tel"
                placeholder="+91 (555) 000-0000"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                maxLength={20}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="consult-comment">Comment <span className="text-destructive">*</span></Label>
              <Textarea
                id="consult-comment"
                placeholder="Tell us about your needs..."
                value={form.comment}
                onChange={(e) => handleChange("comment", e.target.value)}
                maxLength={2000}
                rows={4}
              />
              {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
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
