# B2B Pricing & Packages Section — `/business`

Add a self-qualifying 3-tier pricing section + trusted-by strip after the industry grid.

## Files

- **New** `src/components/business/B2BPackages.tsx` — section with header, 3 cards, footnote, trust strip.
- **Edit** `src/pages/Business.tsx` — render `<B2BPackages />` between `<UseCasesGrid />` and `<HowItWorks />`.

No new deps, no DB, no other sections touched.

## Section structure (`B2BPackages.tsx`)

Wrapper: `<section id="packages" className="bg-bz-primary py-24">` (token `--bz-bg-primary` = `#080808`).

### Header (centered, max-w-2xl)
- Eyebrow: `text-[10px] font-semibold uppercase tracking-[0.3em] text-gold` → "B2B PACKAGES"
- Headline: `font-serif font-light text-cream text-[34px] md:text-[44px]` → "Choose the Right Aroma Plan for Your Space"
- Sub: `text-[15px] text-body` → "All plans include a free scent consultation. No setup complexity. Ships across India."

### Pricing cards — `grid grid-cols-1 lg:grid-cols-3 gap-6`

Shared card classes: `relative rounded-xl bg-bz-card p-8 flex flex-col`.

Each card:
- Tier name — `font-serif text-[24px] text-cream`
- "Best for:" line — `text-[11px] uppercase tracking-[0.2em] text-gold` label + `text-[13px] text-body` value
- Price — `font-serif text-[40px] text-cream` + small "Onwards" / sub line below in `text-[12px] text-body`
- Feature list — `<ul className="space-y-3">` items: `<Check size={16} className="text-gold mt-0.5 shrink-0" />` + `text-[13px] text-cream`
- CTA at bottom (`mt-auto pt-6`): full-width button

Card 1 — Starter
- Border: `border border-gold-strong/15`
- Best for: "Small offices, boutiques, home studios"
- Price: "₹5,999" + "Onwards"
- Sub: "Includes diffuser rental + 1 refill"
- Features (4): 1 cold-air diffuser (up to 500 sq ft); 1 custom or curated scent oil (100ml); Monthly refill delivery (refills extra); Scent consultation call (30 min)
- CTA: ghost gold — `border border-gold-strong/40 text-gold hover:bg-gold/10` → "Get Started"

Card 2 — Business (featured)
- Border: `border border-gold-strong/40`, `shadow-[0_0_32px_hsl(var(--bz-gold)/0.2)]`, `lg:-translate-y-2`
- Top-right badge: absolute `-top-3 right-6 rounded-pill bg-gold text-bz-primary text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1` → "Most Popular"
- Best for: "Retail stores, spas, co-working spaces"
- Price: "₹9,999" + "Onwards"
- Sub: "Includes 1 diffuser + custom scent"
- Features (5): 1 cold-air diffuser (up to 1,000 sq ft); Custom brand scent formulation; Monthly refills + delivery (refills extra); Monthly scent review call; Branded scent card for your space
- CTA: solid gold — `bg-gold text-bz-primary hover:bg-gold/90 font-semibold` → "Request a Quote"

Card 3 — Enterprise
- Border: `border border-gold-strong/15`
- Best for: "Hotels, large retail chains, event companies"
- Price: "Custom Pricing" (no Onwards)
- Sub: "Multi-location, white-label available"
- Features (6): Unlimited diffusers across locations; Proprietary brand scent (yours exclusively); HVAC integration available; Dedicated account manager; White-label oil packaging with your branding; Annual scent strategy review
- CTA: ghost gold → "Talk to Us"

All CTAs scroll to `#lead-form` via `onClick` → `document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })`.

### Footnote
`mt-8 text-center text-[11px] text-dim` → "* All prices exclusive of GST. Minimum 3-month commitment for Starter and Business plans. Enterprise pricing on request."

### Trusted-by strip
- `mt-16 border-t border-gold-strong/15 pt-10` container.
- Centered eyebrow: `text-[10px] uppercase tracking-[0.3em] text-gold` → "TRUSTED BY"
- Wrap row `mt-6 flex flex-wrap justify-center gap-3`:
  - Chip: `rounded-pill border border-gold-strong/40 bg-bz-card px-4 py-2 text-[12px] tracking-[0.1em] text-cream`
  - Brands: Narayani Heights Hotel · Concept Hyundai · MG · Harley Davidson · Honda Motors · KGB Golf Clubs

## Page wiring (`Business.tsx`)

Insert `<B2BPackages />` after `<UseCasesGrid />` and before `<HowItWorks />`.

## Out of scope
- No real form — CTAs scroll to existing `#lead-form`.
- No analytics, no CMS, no logo image assets (text chips only as requested).
