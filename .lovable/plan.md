# 360° Aroma Solutions — B2B Page Rebuild

Replace the current `/business` page with a full marketing landing built to spec, keeping Bazuki's dark luxury aesthetic.

## Sections

1. **Hero** — Full-width dark band, gold "For Businesses" eyebrow, Cormorant headline "Transform Your Space with Scent", sub "From hotels to retail — Bazuki creates custom aroma identities for your brand", primary CTA scrolls to lead form, secondary CTA scrolls to use cases.
2. **Use Cases Grid** — 6 cards, lucide icons, gold border on hover:
   - Hotels & Hospitality (`Hotel`/`BedDouble`)
   - Retail & Boutiques (`ShoppingBag`)
   - Offices & Co-working (`Building2`)
   - Events & Weddings (`PartyPopper`)
   - Spas & Wellness (`Flower2`)
   - Automotive (`Car`)
3. **How It Works** — 4-step horizontal timeline (vertical on mobile) with gold step numbers and connector line: Consultation → Scent Profile → Custom Formulation → Deployment.
4. **Services Offered** — 3 columns: Custom Brand Scent, Diffuser Supply, Refill Subscription. Each with icon, short description, bullet list.
5. **Testimonials** — 3 placeholder cards (boutique hotel, retail brand, wellness spa) with company-type badge, quote, 5-star gold rating.
6. **Lead Capture Form** — `id="lead-form"`, dark card with gold border. Fields: Company Name, Contact Person, WhatsApp/Phone, Type of Business (Select dropdown: Hotel, Retail, Office, Event, Spa, Automotive, Other), Requirement (textarea). On success, replaces form with confirmation panel "We'll reach out within 24 hours".
7. **Footer CTA Strip** — Gold gradient band: "Ready to define your aroma identity?" + "Book a Free Consultation" button (scrolls to form).

## Technical

**Files:**
- `src/pages/Business.tsx` — rewrite to compose new sections directly (drop `BusinessAroma` import).
- `src/components/business/HeroB2B.tsx`
- `src/components/business/UseCasesGrid.tsx`
- `src/components/business/HowItWorks.tsx`
- `src/components/business/ServicesOffered.tsx`
- `src/components/business/B2BTestimonials.tsx`
- `src/components/business/LeadCaptureForm.tsx`
- `src/components/business/B2BCtaStrip.tsx`

`BusinessAroma.tsx` stays untouched (still used by `B2BTeaser` on home).

**Data persistence:** Reuse existing `consultation_requests` table via the same public-client insert pattern as `BusinessAroma.tsx`. Mapping:
- `name` ← Contact Person
- `phone` ← WhatsApp/Phone
- `email` ← `noreply+b2b@bazuki.local` (placeholder, since schema requires non-null email and the spec form omits it)
- `comment` ← formatted string: `Company: {company}\nType: {businessType}\nRequirement: {requirement}`

Validation via zod (company ≤120, contact ≤100, phone ≤20, type required, requirement ≤2000). No DB migration.

**Design tokens:** `bg-luxury-black`, `text-luxury-gold`, `border-luxury-gold/20`, `font-serif` for headlines, semantic tokens elsewhere. No new colors.

**SEO:** Update `useSEO` title/description to match new headline; keep breadcrumb JSON-LD.

## Out of Scope
- No changes to `BusinessAroma.tsx`, admin consultations view, or DB schema.
- No new email/notification wiring (existing insert flow already feeds admin queue).
