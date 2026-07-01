import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, MessageCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { z } from "zod";


const industries = [
  "Hotel / Resort",
  "Retail Store",
  "Office / Co-working",
  "Spa & Wellness",
  "Events & Weddings",
  "Automotive",
  "Restaurant & Café",
  "Other",
];

const spaceSizes = [
  "Under 500 sq ft",
  "500–1,500 sq ft",
  "1,500–5,000 sq ft",
  "5,000+ sq ft",
  "Multiple locations",
];

const budgets = ["Under ₹6,000", "₹6,000–₹15,000", "₹15,000+", "Not sure yet"];

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  company: z.string().trim().min(1, "Required").max(120),
  phone: z.string().trim().min(7, "Valid number required").max(20),
  email: z.string().trim().email("Valid email required").max(255),
  industry: z.string().min(1, "Select an industry"),
  spaceSize: z.string().min(1, "Select a space size"),
  budget: z.string().min(1, "Select a budget range"),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

type FormState = z.infer<typeof schema>;

const fieldClass =
  "w-full rounded-lg border border-gold-strong/20 px-4 py-3 text-[14px] text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none transition-colors";
const fieldStyle = { backgroundColor: "#0D0D0D" } as const;
const labelClass = "text-[11px] uppercase tracking-[0.2em] text-gold mb-1.5 block";
const errorClass = "mt-1 text-[11px] text-destructive";

const chevronBg = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M3 4.5l3 3 3-3' stroke='%23C9A84C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
  backgroundSize: "12px",
  paddingRight: "2.5rem",
} as const;

const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with real Bazuki business number

const LeadCaptureForm = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    company: "",
    phone: "",
    email: "",
    industry: "",
    spaceSize: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ name: string } | null>(null);
  const [prefillArchetype, setPrefillArchetype] = useState<string | null>(null);
  const autoFilledRef = useRef(false);

  useEffect(() => {
    type PrefillDetail = {
      name: string;
      tone: string;
      notes: string[];
      useCases: string[];
    };
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PrefillDetail>).detail;
      if (!detail?.name) return;
      const msg =
        `I'm interested in a fragrance formula aligned with the "${detail.name}" archetype (${detail.tone}).\n` +
        `Signature notes we're drawn to: ${detail.notes.join(", ")}.\n` +
        `Ideal use cases: ${detail.useCases.join(", ")}.\n` +
        `Please help us craft a scent that reflects this brand identity.`;
      setForm((p) => {
        const canOverwrite = p.message.trim() === "" || autoFilledRef.current;
        return canOverwrite ? { ...p, message: msg } : p;
      });
      autoFilledRef.current = true;
      setPrefillArchetype(detail.name);
      setErrors((p) => {
        if (!p.message) return p;
        const n = { ...p };
        delete n.message;
        return n;
      });
      setSuccess(null);
    };
    window.addEventListener("bz:prefill-lead-form", handler);
    return () => window.removeEventListener("bz:prefill-lead-form", handler);
  }, []);

  const clearPrefill = () => {
    if (autoFilledRef.current) {
      setForm((p) => ({ ...p, message: "" }));
      autoFilledRef.current = false;
    }
    setPrefillArchetype(null);
  };

  const setField = <K extends keyof FormState>(k: K, v: string) => {
    if (k === "message") autoFilledRef.current = false;
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) {
      setErrors((p) => {
        const n = { ...p };
        delete n[k];
        return n;
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach((er) => {
        const k = er.path[0] as string;
        if (!fe[k]) fe[k] = er.message;
      });
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const d = result.data;
    const { error } = await client.from("consultation_requests").insert({
      name: d.name,
      email: d.email,
      phone: d.phone,
      comment: `Company: ${d.company}\nIndustry: ${d.industry}\nSpace size: ${d.spaceSize}\nBudget: ${d.budget}\nMessage: ${d.message}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit. Please try again.");
      return;
    }
    setSuccess({ name: d.name });
  };

  const scrollToFaq = () => {
    document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="lead-form" className="bg-bz-primary py-24">
      <div className="container mx-auto px-4">
        <div
          className="mx-auto max-w-[680px] rounded-2xl border border-gold-strong/20 p-8 md:p-12"
          style={{ backgroundColor: "#141414" }}
        >
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-strong/40 bg-gold/10">
                <Check size={32} className="text-gold" />
              </div>
              <h3 className="mt-6 font-serif text-[24px] font-light leading-snug text-cream md:text-[28px]">
                Thank you, {success.name}! Our scent consultant will WhatsApp you within 24 hours.
              </h3>
              <Link
                to="/library"
                className="mt-6 inline-flex items-center gap-1 text-[13px] uppercase tracking-[0.2em] text-gold hover:text-gold/80"
              >
                While you wait, explore our Scent Library →
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="font-serif text-[28px] font-light leading-tight text-cream md:text-[32px]">
                  Start Your Aroma Journey
                </h2>
                <p className="mt-2 text-[14px]" style={{ color: "#8A7A6A" }}>
                  Fill this in and our scent consultant will reach out within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lf-name" className={labelClass}>Full Name</label>
                    <input
                      id="lf-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      maxLength={100}
                      placeholder="Your name"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="lf-company" className={labelClass}>Business Name</label>
                    <input
                      id="lf-company"
                      type="text"
                      value={form.company}
                      onChange={(e) => setField("company", e.target.value)}
                      maxLength={120}
                      placeholder="Your company or brand name"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                    {errors.company && <p className={errorClass}>{errors.company}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lf-phone" className={labelClass}>WhatsApp Number</label>
                    <div className="relative">
                      <MessageCircle
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold"
                      />
                      <input
                        id="lf-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        maxLength={20}
                        placeholder="+91 XXXXX XXXXX"
                        className={`${fieldClass} pl-10`}
                        style={fieldStyle}
                      />
                    </div>
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="lf-email" className={labelClass}>Email Address</label>
                    <input
                      id="lf-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      maxLength={255}
                      placeholder="you@company.com"
                      className={fieldClass}
                      style={fieldStyle}
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="lf-industry" className={labelClass}>Industry</label>
                  <select
                    id="lf-industry"
                    value={form.industry}
                    onChange={(e) => setField("industry", e.target.value)}
                    className={`${fieldClass} appearance-none`}
                    style={{ ...fieldStyle, ...chevronBg }}
                  >
                    <option value="" disabled>Select your industry</option>
                    {industries.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {errors.industry && <p className={errorClass}>{errors.industry}</p>}
                </div>

                <div>
                  <label htmlFor="lf-space" className={labelClass}>Space Size</label>
                  <select
                    id="lf-space"
                    value={form.spaceSize}
                    onChange={(e) => setField("spaceSize", e.target.value)}
                    className={`${fieldClass} appearance-none`}
                    style={{ ...fieldStyle, ...chevronBg }}
                  >
                    <option value="" disabled>Approximate space size</option>
                    {spaceSizes.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {errors.spaceSize && <p className={errorClass}>{errors.spaceSize}</p>}
                </div>

                <div>
                  <label htmlFor="lf-budget" className={labelClass}>Monthly Budget</label>
                  <select
                    id="lf-budget"
                    value={form.budget}
                    onChange={(e) => setField("budget", e.target.value)}
                    className={`${fieldClass} appearance-none`}
                    style={{ ...fieldStyle, ...chevronBg }}
                  >
                    <option value="" disabled>Monthly budget range</option>
                    {budgets.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {errors.budget && <p className={errorClass}>{errors.budget}</p>}
                </div>

                <div>
                  <label htmlFor="lf-message" className={labelClass}>Your Goal</label>
                  <textarea
                    id="lf-message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    maxLength={2000}
                    placeholder="Tell us about your space and what you're hoping to achieve"
                    className={`${fieldClass} resize-none`}
                    style={fieldStyle}
                  />
                  {errors.message && <p className={errorClass}>{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 h-[52px] w-full rounded-pill bg-gold text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-gold/90 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Request My Free Consultation →"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mx-auto mt-10 grid max-w-[680px] grid-cols-1 gap-6 text-center sm:grid-cols-2">
          <div>
            <p className="text-[13px] text-body">Prefer WhatsApp?</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#1ebe5d]"
            >
              <MessageCircle size={14} />
              Chat with us
            </a>
          </div>
          <div>
            <p className="text-[13px] text-body">Have more questions?</p>
            <button
              type="button"
              onClick={scrollToFaq}
              className="mt-3 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.2em] text-gold hover:text-gold/80"
            >
              Read the FAQ ↓
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureForm;
