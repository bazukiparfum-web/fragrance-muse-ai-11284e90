import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalIcon, Check, ChevronLeft, ChevronRight, Clock, Gift, MessagesSquare, Sparkles, User } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";

type Intent = "self" | "gift";

const SLOT_TIMES = ["10:00", "11:30", "14:00", "15:30", "17:00"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 = Sun
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isWeekend(d: Date) {
  const g = d.getDay();
  return g === 0 || g === 6;
}

function isPast(d: Date, time: string) {
  const [h, m] = time.split(":").map(Number);
  const slot = new Date(d);
  slot.setHours(h, m, 0, 0);
  return slot.getTime() < Date.now();
}

// Deterministic mock availability — weekdays full, weekends limited.
function isSlotAvailable(d: Date, time: string) {
  if (isPast(d, time)) return false;
  if (isWeekend(d)) return time === "11:30" || time === "15:30";
  return true;
}

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  whatsapp: z.string().trim().regex(/^[+\d\s-]{10,20}$/, "Valid WhatsApp number required"),
  fragrance: z.string().trim().min(2, "Tell us a fragrance").max(200),
});
type BookingForm = z.infer<typeof bookingSchema>;

const ScentCoaching = () => {
  useSEO({
    title: "Scent Coaching — Talk to a Fragrance Expert | Bazuki",
    description:
      "Book a free 15-minute 1-on-1 call with a Bazuki fragrance specialist. Personalized scent guidance for you or as a gift.",
  });

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [intent, setIntent] = useState<Intent>("self");
  const [selected, setSelected] = useState<{ date: Date; time: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<{ name: string; whenLabel: string; fragrance: string } | null>(null);
  const bookingRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const scrollToBooking = (next: Intent) => {
    setIntent(next);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSlotClick = (date: Date, time: string) => {
    setSelected({ date, time });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-luxury-black text-cream">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.85) 60%, rgba(8,8,8,1) 100%), url('/placeholder.svg')",
          }}
          aria-hidden
        />
        <div className="relative container mx-auto px-4 py-28 md:py-40 text-center max-w-3xl">
          <p className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold mb-4">
            Scent Coaching
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-light leading-tight text-cream">
            Talk to a Scent Expert
          </h1>
          <p className="mt-5 text-cream/85 text-base md:text-lg leading-relaxed">
            Book a free 15-minute 1-on-1 call with our fragrance specialists.
            Personalized guidance, no pressure to buy.
          </p>
          <Button
            variant="luxury"
            size="lg"
            className="mt-8"
            onClick={() => scrollToBooking("self")}
          >
            Find a Time
          </Button>
        </div>
      </section>

      {/* INTENT CARDS */}
      <section className="py-16 md:py-20 bg-luxury-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                key: "self" as const,
                icon: User,
                title: "For Your Own Scent",
                desc: "Get matched, refine an existing favorite, or build a signature fragrance with expert input.",
              },
              {
                key: "gift" as const,
                icon: Gift,
                title: "Gift a Consultation",
                desc: "Book a session as a thoughtful gift — we'll guide them through their first signature scent.",
              },
            ].map(({ key, icon: Icon, title, desc }) => (
              <div
                key={key}
                className="rounded-2xl border border-luxury-gold/25 bg-[#141414] p-8 md:p-10 flex flex-col"
              >
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 border border-luxury-gold/40 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-luxury-gold" />
                </div>
                <h2 className="font-serif text-2xl md:text-[28px] font-light text-cream mb-3">
                  {title}
                </h2>
                <p className="text-cream/80 text-[15px] leading-relaxed flex-1">{desc}</p>
                <Button
                  variant="luxury"
                  className="mt-6 self-start"
                  onClick={() => scrollToBooking(key)}
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-luxury-black border-t border-luxury-gold/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              The Process
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-cream">How It Works</h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
              {[
                { icon: CalIcon, title: "Choose a time", desc: "Pick a 15-minute slot that suits you." },
                { icon: MessagesSquare, title: "Share your scent history", desc: "Tell us what you've worn, loved, or are curious about." },
                { icon: Sparkles, title: "Get personalized guidance", desc: "Walk away with a tailored shortlist and next steps." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="text-center flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-full bg-luxury-black border border-luxury-gold/40 flex items-center justify-center mb-5 shadow-lg">
                    <Icon className="w-7 h-7 text-luxury-gold" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-luxury-gold text-luxury-black text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-cream mb-2">{title}</h3>
                  <p className="text-cream/70 text-sm leading-relaxed max-w-[16rem]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING PICKER / CONFIRMATION */}
      <section ref={bookingRef} className="py-16 md:py-24 bg-[#0d0d0d] border-t border-luxury-gold/10">
        <div className="container mx-auto px-4 max-w-5xl">
          {confirmed ? (
            <BookingSuccess data={confirmed} onReset={() => setConfirmed(null)} />
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-luxury-gold uppercase tracking-[0.2em] text-xs font-semibold mb-3">
                  {intent === "gift" ? "Booking a Gift" : "Book Your Session"}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-cream">
                  Pick a date &amp; time
                </h2>
                <p className="mt-3 text-cream/70 text-sm">
                  Slots in <span className="text-luxury-gold">gold</span> are available. All times IST.
                </p>
              </div>

              <div className="rounded-2xl border border-luxury-gold/20 bg-[#141414] p-5 md:p-8">
                {/* Week nav */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                    disabled={addDays(weekStart, -7) < startOfWeek(new Date())}
                    className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-cream/80 hover:text-luxury-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <p className="text-cream font-serif text-base md:text-lg">
                    {fmtDate(days[0])} – {fmtDate(days[6])}
                  </p>
                  <button
                    type="button"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                    className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-cream/80 hover:text-luxury-gold transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Week grid */}
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {days.map((d) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <div key={d.toISOString()} className="text-center">
                        <div
                          className={`text-[10px] md:text-xs uppercase tracking-wider ${
                            isToday ? "text-luxury-gold" : "text-cream/60"
                          }`}
                        >
                          {fmtDay(d)}
                        </div>
                        <div
                          className={`text-sm md:text-base font-serif mb-3 ${
                            isToday ? "text-luxury-gold" : "text-cream"
                          }`}
                        >
                          {d.getDate()}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {SLOT_TIMES.map((t) => {
                            const available = isSlotAvailable(d, t);
                            const isSel =
                              selected?.date.toDateString() === d.toDateString() &&
                              selected?.time === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                disabled={!available}
                                onClick={() => onSlotClick(d, t)}
                                className={[
                                  "rounded-md py-1.5 px-1 text-[11px] md:text-xs font-medium transition-all",
                                  available
                                    ? isSel
                                      ? "bg-luxury-gold text-luxury-black border border-luxury-gold"
                                      : "border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black"
                                    : "border border-cream/10 text-cream/25 cursor-not-allowed line-through",
                                ].join(" ")}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-center mt-6 text-xs text-cream/50 flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Each session is 15 minutes &middot; Free
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      {!confirmed && (
        <section className="py-16 md:py-24 bg-luxury-black border-t border-luxury-gold/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-light text-cream">
                Frequently Asked
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Is it free?",
                  a: "Yes — your first 15-minute scent coaching call is completely free, with no obligation to buy.",
                },
                {
                  q: "How do I prepare?",
                  a: "Think about a few fragrances you've worn or loved (or disliked). If you have a recent purchase or quiz result from Bazuki, have it handy. That's it.",
                },
                {
                  q: "Can I reschedule?",
                  a: "Absolutely. Reply to your WhatsApp confirmation up to 2 hours before the call and we'll find a new time that works.",
                },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-luxury-gold/15">
                  <AccordionTrigger className="text-left text-base md:text-lg text-cream hover:no-underline hover:text-luxury-gold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-cream/75 leading-relaxed text-[15px]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      <Footer />

      {/* CONFIRMATION DIALOG */}
      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selected={selected}
        intent={intent}
        onConfirmed={(c) => {
          setConfirmed(c);
          setDialogOpen(false);
          setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }}
      />
    </div>
  );
};

const BookingDialog = ({
  open,
  onOpenChange,
  selected,
  intent,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: { date: Date; time: string } | null;
  intent: Intent;
  onConfirmed: (c: { name: string; whenLabel: string; fragrance: string }) => void;
}) => {
  const [form, setForm] = useState<BookingForm>({ name: "", email: "", whatsapp: "", fragrance: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: "", email: "", whatsapp: "", fragrance: "" });
      setErrors({});
    }
  }, [open]);

  const whenLabel = selected
    ? `${selected.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at ${selected.time} IST`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.errors.forEach((er) => {
        const k = er.path[0] as string;
        if (!fe[k]) fe[k] = er.message;
      });
      setErrors(fe);
      return;
    }
    if (!selected) return;
    setSubmitting(true);
    const d = result.data;
    const { error } = await supabase.from("consultation_requests").insert({
      name: d.name,
      email: d.email,
      phone: d.whatsapp,
      comment: `[Scent Coaching · ${intent === "gift" ? "Gift" : "Self"}]\nWhen: ${whenLabel}\nFragrance interest: ${d.fragrance}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't book your session. Please try again.");
      return;
    }
    onConfirmed({ name: d.name, whenLabel, fragrance: d.fragrance });
  };

  const setField = <K extends keyof BookingForm>(k: K, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-luxury-gold/30 text-cream max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary-foreground font-light">
            Confirm your session
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            {whenLabel || "Pick a time"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="b-name" className="text-luxury-gold uppercase text-[11px] tracking-[0.2em]">
              Name
            </Label>
            <Input
              id="b-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              maxLength={100}
              className="mt-1.5 bg-luxury-black border-luxury-gold/20 text-cream"
              placeholder="Your name"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="b-email" className="text-luxury-gold uppercase text-[11px] tracking-[0.2em]">
              Email
            </Label>
            <Input
              id="b-email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              maxLength={255}
              className="mt-1.5 bg-luxury-black border-luxury-gold/20 text-cream"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="b-wa" className="text-luxury-gold uppercase text-[11px] tracking-[0.2em]">
              WhatsApp Number
            </Label>
            <Input
              id="b-wa"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
              maxLength={20}
              className="mt-1.5 bg-luxury-black border-luxury-gold/20 text-cream"
              placeholder="+91 XXXXX XXXXX"
            />
            {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
          </div>
          <div>
            <Label htmlFor="b-fr" className="text-luxury-gold uppercase text-[11px] tracking-[0.2em]">
              Which fragrance did you buy or are considering?
            </Label>
            <Textarea
              id="b-fr"
              value={form.fragrance}
              onChange={(e) => setField("fragrance", e.target.value)}
              maxLength={200}
              rows={3}
              className="mt-1.5 bg-luxury-black border-luxury-gold/20 text-cream"
              placeholder="e.g. Midnight Velvet, or a quiz match you got"
            />
            {errors.fragrance && <p className="text-xs text-destructive mt-1">{errors.fragrance}</p>}
          </div>
          <Button type="submit" variant="luxury" className="w-full" disabled={submitting}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BookingSuccess = ({
  data,
  onReset,
}: {
  data: { name: string; whenLabel: string; fragrance: string };
  onReset: () => void;
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="mx-auto w-20 h-20 rounded-full bg-luxury-gold/15 border border-luxury-gold/50 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
        <Check className="w-9 h-9 text-luxury-gold" />
      </div>
      <p className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold mb-4">
        You're booked
      </p>
      <h2 className="font-serif text-3xl md:text-5xl font-light text-cream leading-tight">
        See you soon, {data.name.split(" ")[0]}.
      </h2>
      <p className="mt-6 text-cream/85 text-base md:text-lg leading-relaxed">
        We'll reach you on WhatsApp 10 minutes before{" "}
        <span className="text-luxury-gold">{data.whenLabel}</span> to talk about{" "}
        <span className="text-luxury-gold">{data.fragrance}</span>.
      </p>
      <p className="mt-4 text-cream/60 text-sm">
        A confirmation has been logged with our scent team. No payment needed — your first call is on us.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="luxury-outline" onClick={onReset}>
          Book another time
        </Button>
        <Link to="/collection">
          <Button variant="luxury">Explore the Collection</Button>
        </Link>
      </div>
    </div>
  );
};

export default ScentCoaching;
