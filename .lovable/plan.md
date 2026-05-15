# Business FAQ + Final CTA — `/business`

Add a B2B-specific FAQ accordion just above the footer, plus a closing CTA strip. Replaces the current generic `<FAQ />` (which is about AI quiz matching) and the existing `<B2BCtaStrip />` on this page only.

> Note: the brief lists "8 FAQ items" but only 7 questions are provided. Building the 7 supplied. If you want an 8th, send the copy and I'll append it.

## Files

- **New** `src/components/business/BusinessFAQ.tsx` — section with eyebrow, headline, accordion (built on existing `@/components/ui/accordion`, which is shadcn Radix-based and natively single-open).
- **New** `src/components/business/FinalCtaStrip.tsx` — closing CTA strip with WhatsApp + consultation buttons.
- **Edit** `src/pages/Business.tsx` — drop the temporary `<div id="faq"><FAQ /></div>` and the existing `<B2BCtaStrip />`; render `<BusinessFAQ />` then `<FinalCtaStrip />` as the last sections before `<Footer />`. Remove unused `FAQ` and `B2BCtaStrip` imports. (`B2BCtaStrip.tsx` file stays in repo, just unused on this page.)

## `BusinessFAQ.tsx`

Wrapper: `<section id="faq" className="py-24" style={{ backgroundColor: "#080808" }}>` (keeps the `#faq` anchor used by the lead form's "Read the FAQ ↓" link).

Header (centered, max-w-2xl):
- Eyebrow `text-[10px] font-semibold uppercase tracking-[0.3em] text-gold` → "COMMON QUESTIONS"
- Headline `mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]` → "Everything You Need to Know"

Accordion: shadcn `<Accordion type="single" collapsible className="mx-auto mt-12 max-w-3xl space-y-3">`.

Per item — `<AccordionItem>` styled (override default border) with classes:
`group rounded-lg border border-gold-strong/10 px-6 py-1 transition-colors data-[state=open]:border-gold-strong/30`
and inline `style={{ backgroundColor: "#0D0D0D" }}` (active state via class `data-[state=open]:bg-[#141414]`).

`<AccordionTrigger>` overrides default chevron with a custom "+" icon that rotates to "×" when open. Implementation:
- Wrap shadcn `AccordionTrigger` is fine; pass `className="hover:no-underline py-5 text-left"` and disable the built-in chevron via `[&>svg]:hidden`.
- Append a custom span: `<Plus className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-data-[state=open]:rotate-45" />` (rotating a `+` 45° visually becomes `×`).
- Question text: `text-[15px] font-medium text-cream` (Inter via base font).

`<AccordionContent>` uses shadcn's built-in max-height/opacity animation (matches the requested smooth reveal). Inner `<p className="pb-5 text-[14px] leading-[1.7]" style={{ color: "#8A7A6A" }}>{answer}</p>`.

Items array (7):

1. Q: "How long does it take to get a custom scent made?"  
   A: "For curated scents from our library — we can deploy within 5–7 business days. For a fully custom brand scent formulation, the process typically takes 2–3 weeks including consultation, sampling, and your approval."
2. Q: "Can I get our brand's exclusive scent — one no other business uses?"  
   A: "Yes. Our Enterprise plan includes a proprietary scent formulation that is registered to your brand exclusively. No other Bazuki client will use the same formula."
3. Q: "Do you provide the diffuser hardware or do we need to buy it?"  
   A: "All plans include diffuser rental — you don't need to purchase anything upfront. Hardware is maintained and replaced by Bazuki. Enterprise clients can opt for HVAC-integrated diffusion systems."
4. Q: "What cities do you currently serve?"  
   A: "We currently serve businesses in Ahmedabad, Mumbai, Surat, Vadodara, and Bangalore. We're expanding rapidly — reach out even if your city isn't listed and we'll confirm availability."
5. Q: "Can you white-label the scent oil with our branding?"  
   A: "Yes — our Enterprise plan includes branded oil packaging with your logo, label design, and product name. Ideal for hospitality brands and retail chains."
6. Q: "What's the refill process like?"  
   A: "Monthly refills are shipped to your door automatically. You'll receive a WhatsApp notification 3 days before dispatch. No phone calls, no paperwork."
7. Q: "Is there a free trial or sample?"  
   A: "We offer a free scent consultation call and, for Business and Enterprise prospects, we can send a curated sample kit (3 scent strips) before you commit."

## `FinalCtaStrip.tsx`

Wrapper: `<section className="py-20" style={{ background: "linear-gradient(135deg, #1A0F00 0%, #080808 100%)" }}>`.

Inner `container mx-auto px-4 text-center`:
- Headline `font-serif font-light text-cream text-[26px] md:text-[32px]` → "Still have questions?"
- Buttons row `mt-8 flex flex-col sm:flex-row items-center justify-center gap-4`:
  - WhatsApp ghost: `<a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-pill border border-[#25D366] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white">` with `<MessageCircle size={14} />` + "WhatsApp Us"
  - Solid gold: `<button onClick={scrollToLead} className="rounded-pill bg-gold px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-gold/90">` → "Book a Consultation". Scrolls to `#lead-form`.

Reuses the same placeholder WhatsApp number (`919999999999`) flagged earlier.

## `Business.tsx` page wiring

Final order:
```
<HeroB2B />
<ScentScience />
<UseCasesGrid />
<B2BPackages />
<ClientStories />
<HowItWorks />
<ServicesOffered />
<B2BTestimonials />
<LeadCaptureForm />
<BusinessFAQ />
<FinalCtaStrip />
```
Remove imports: `FAQ`, `B2BCtaStrip`.

## Out of scope
- No FAQPage JSON-LD schema (can add if you want SEO rich results).
- No CMS / DB-driven FAQ — items live in the component.
- No analytics, no live chat widget.
- WhatsApp number stays as placeholder until you provide the real one.
