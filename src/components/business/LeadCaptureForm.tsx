import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { z } from "zod";

const businessTypes = [
  "Hotel & Hospitality",
  "Retail & Boutique",
  "Office & Co-working",
  "Event & Wedding",
  "Spa & Wellness",
  "Automotive",
  "Other",
];

const schema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(120),
  contact: z.string().trim().min(1, "Contact person is required").max(100),
  phone: z.string().trim().min(7, "Valid phone is required").max(20),
  businessType: z.string().min(1, "Select a business type"),
  requirement: z.string().trim().min(10, "Tell us a bit more about your requirement").max(2000),
});

const LeadCaptureForm = () => {
  const [form, setForm] = useState({ company: "", contact: "", phone: "", businessType: "", requirement: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach((er) => { const k = er.path[0] as string; if (!fe[k]) fe[k] = er.message; });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await client.from("consultation_requests").insert({
      name: result.data.contact,
      phone: result.data.phone,
      email: "noreply+b2b@bazuki.local",
      comment: `Company: ${result.data.company}\nType: ${result.data.businessType}\nRequirement: ${result.data.requirement}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }
    setSuccess(true);
  };

  return (
    <section id="lead-form" className="bg-luxury-black text-primary-foreground py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">Get in Touch</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3">Let's Build Your Aroma</h2>
            <p className="text-primary-foreground/70">Tell us about your space — we'll craft a proposal tailored to your brand.</p>
          </div>

          <div className="rounded-lg border border-luxury-gold/30 bg-white/[0.03] p-6 md:p-10">
            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-2">Thank you!</h3>
                <p className="text-primary-foreground/75">We'll reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 [&_label]:text-primary-foreground [&_input]:text-primary-foreground [&_textarea]:text-primary-foreground [&_input::placeholder]:text-primary-foreground/40 [&_textarea::placeholder]:text-primary-foreground/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="b-company">Company Name *</Label>
                    <Input id="b-company" value={form.company} onChange={(e) => setField("company", e.target.value)} maxLength={120} placeholder="Acme Hotels" />
                    {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-contact">Contact Person *</Label>
                    <Input id="b-contact" value={form.contact} onChange={(e) => setField("contact", e.target.value)} maxLength={100} placeholder="Your name" />
                    {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="b-phone">WhatsApp / Phone *</Label>
                    <Input id="b-phone" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} maxLength={20} placeholder="+91 00000 00000" />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-type">Type of Business *</Label>
                    <Select value={form.businessType} onValueChange={(v) => setField("businessType", v)}>
                      <SelectTrigger id="b-type" className="text-primary-foreground">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessType && <p className="text-xs text-destructive">{errors.businessType}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-req">Requirement *</Label>
                  <Textarea id="b-req" rows={5} value={form.requirement} onChange={(e) => setField("requirement", e.target.value)} maxLength={2000} placeholder="Tell us about your space, footfall, scent goals…" />
                  {errors.requirement && <p className="text-xs text-destructive">{errors.requirement}</p>}
                </div>
                <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Enquiry"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
