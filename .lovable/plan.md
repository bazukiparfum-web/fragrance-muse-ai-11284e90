# Lead Capture Form Upgrade — `/business`

Rewrite `LeadCaptureForm` into a consultative, pre-qualifying form with a richer success state and alternate-contact strip. No DB schema changes — extra qualifying fields are packed into the existing `comment` column.

## Files

- **Edit** `src/components/business/LeadCaptureForm.tsx` — full rewrite of the section.
- No page wiring change (already mounted in `Business.tsx`); no new deps; reuse existing zod, supabase client, sonner.

## Section wrapper

`<section id="lead-form" className="bg-bz-primary py-24">` (keep existing id so all CTAs still scroll here).

## Form card

Outer card: `mx-auto max-w-[680px] rounded-2xl border border-gold-strong/20 p-8 md:p-12` with inline `style={{ backgroundColor: "#141414" }}`.

Header inside card (centered):
- Headline `font-serif font-light text-cream text-[28px] md:text-[32px]` → "Start Your Aroma Journey"
- Sub `mt-2 text-[14px]` with inline `style={{ color: "#8A7A6A" }}` → "Fill this in and our scent consultant will reach out within 24 hours."

## Field styling (shared)

Every input/select/textarea uses raw native elements (avoid pulling shadcn theme):
- Base classes: `w-full rounded-lg border border-gold-strong/20 px-4 py-3 text-[14px] text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none transition-colors` with inline `style={{ backgroundColor: "#0D0D0D" }}`.
- Labels: `text-[11px] uppercase tracking-[0.2em] text-gold mb-1.5 block`.
- Error text: `mt-1 text-[11px] text-destructive`.
- Selects use native `<select>` styled the same way + a chevron via `appearance-none bg-no-repeat` (inline `backgroundImage` URL data SVG of a gold chevron, `paddingRight: 2.5rem`).

## Form rows

- **Row 1** — `grid grid-cols-1 sm:grid-cols-2 gap-4`:
  - Full Name (`name`, placeholder "Your name", maxLength 100)
  - Business Name (`company`, placeholder "Your company or brand name", maxLength 120)
- **Row 2** — `grid grid-cols-1 sm:grid-cols-2 gap-4`:
  - WhatsApp Number (`phone`, type=tel, placeholder "+91 XXXXX XXXXX", maxLength 20). Wrapped in a relative div with a `<MessageCircle />` lucide icon (16px, `text-gold`, absolute `left-3 top-1/2 -translate-y-1/2`); input gets `pl-10`.
  - Email Address (`email`, type=email, placeholder "you@company.com", maxLength 255)
- **Row 3 (full)** — Industry select (`industry`), placeholder option "Select your industry". Options: `Hotel / Resort`, `Retail Store`, `Office / Co-working`, `Spa & Wellness`, `Events & Weddings`, `Automotive`, `Restaurant & Café`, `Other`.
- **Row 4 (full)** — Space size select (`spaceSize`), placeholder "Approximate space size". Options: `Under 500 sq ft`, `500–1,500 sq ft`, `1,500–5,000 sq ft`, `5,000+ sq ft`, `Multiple locations`.
- **Row 5 (full)** — Budget select (`budget`), placeholder "Monthly budget range". Options: `Under ₹6,000`, `₹6,000–₹15,000`, `₹15,000+`, `Not sure yet`.
- **Row 6 (full)** — Textarea (`message`, rows=4, maxLength 2000, placeholder "Tell us about your space and what you're hoping to achieve").

## Submit button

Native `<button type="submit">`:
`mt-2 w-full h-[52px] rounded-pill bg-gold text-primary-foreground text-[13px] font-semibold uppercase tracking-[0.1em] hover:bg-gold/90 transition-colors disabled:opacity-60`

Label: `Request My Free Consultation →` (or "Submitting…" when in flight).

## Validation (zod)

```
name: trim min 1 max 100
company: trim min 1 max 120
phone: trim min 7 max 20
email: trim email max 255
industry: min 1
spaceSize: min 1
budget: min 1
message: trim min 10 max 2000
```

On invalid → set per-field error map, render under each field.

## Submit handler

Reuse existing `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)` pattern. Insert into `consultation_requests`:
```
{
  name,
  email,
  phone,
  comment: `Company: ${company}\nIndustry: ${industry}\nSpace size: ${spaceSize}\nBudget: ${budget}\nMessage: ${message}`,
}
```
On error → `toast.error("Failed to submit. Please try again.")`. On success → set `success=true` and store the submitted name in state for the confirmation copy.

## Success state

Replaces the `<form>` (still inside the same dark card):
- Centered column.
- Gold check: 64px circle `border border-gold-strong/40 bg-gold/10`, lucide `<Check size={32} className="text-gold" />`.
- Headline `mt-6 font-serif text-[28px] font-light text-cream` → `Thank you, {name}! Our scent consultant will WhatsApp you within 24 hours.`
- Link `mt-4 inline-flex items-center gap-1 text-[13px] uppercase tracking-[0.2em] text-gold hover:text-gold/80`, using `<Link to="/library">` → "While you wait, explore our Scent Library →".

## Alternate contact strip (below card)

`mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[680px] mx-auto text-center`. Two columns:

1. "Prefer WhatsApp?" — `text-[13px] text-body`, then a button:
   - `<a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">` styled `mt-3 inline-flex items-center gap-2 rounded-pill bg-[#25D366] text-white px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] hover:bg-[#1ebe5d] transition-colors`. Lucide `<MessageCircle size={14} />` + "Chat with us". (Phone number — see Open question.)
2. "Have more questions?" — same body class. A `<button>` `mt-3 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.2em] text-gold hover:text-gold/80` → "Read the FAQ ↓". `onClick` scrolls to `#faq`.

## FAQ anchor

`/business` does not currently render the shared `<FAQ />` component, so `#faq` would not exist. To make the FAQ link work without expanding scope, the existing `FAQ` component will be wrapped at use-time in the page (small page edit) — see Open question 2.

## Open questions for the user

1. **WhatsApp number** — what number should the green "Chat with us" button dial? (Currently no business number is wired in code.) If unspecified, I'll use a placeholder `+91 99999 99999` and flag it in code.
2. **FAQ link target** — `/business` has no FAQ section. Options: (a) add the existing `<FAQ />` component to the page so `#faq` resolves, (b) link to a dedicated `/faq` route (does not exist either), or (c) drop the FAQ link. Default if no answer: option (a) — render `<FAQ />` between `LeadCaptureForm` and `B2BCtaStrip`, give it `id="faq"`.

## Out of scope

- No schema migration (consultation_requests already accepts the data via `comment`).
- No backend notification / WhatsApp send-out wiring.
- No analytics events.
- `B2BCtaStrip`, `B2BTestimonials`, `ClientStories`, `B2BPackages`, etc., untouched.
