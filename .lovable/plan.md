# Client Stories Section — `/business`

Add a 2-card case study / social proof section between `<B2BPackages />` and `<HowItWorks />`.

## Files

- **New** `src/components/business/ClientStories.tsx`
- **Edit** `src/pages/Business.tsx` — render `<ClientStories />` after `<B2BPackages />`, before `<HowItWorks />`.

No new deps, no DB, no other sections touched. Existing `B2BTestimonials` stays as-is (different content/style).

## Section structure (`ClientStories.tsx`)

Wrapper: `<section id="client-stories" className="py-24" style={{ backgroundColor: "#0D0D0D" }}>`.

### Header (centered, max-w-2xl)
- Eyebrow: `text-[10px] font-semibold uppercase tracking-[0.3em] text-gold` → "CLIENT STORIES"
- Headline: `mt-4 font-serif font-light leading-[1.15] text-cream text-[34px] md:text-[44px]` → "Real Businesses. Real Results."

### Cards grid — `mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6`

Shared card classes: `rounded-xl border border-gold-strong/15 p-10 flex flex-col gap-6` with inline `style={{ backgroundColor: "#141414" }}`.

Each card renders, in order:
1. **Industry pill** — `inline-flex self-start rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold` → "Hospitality" / "Retail"
2. **Business name** — `font-serif text-[22px] text-cream`
3. **Challenge block**
   - Label `text-[11px] uppercase tracking-[0.2em] text-gold` → "Challenge"
   - Body `mt-1 text-[14px] leading-relaxed text-body`
4. **Solution block** — same label/body pattern → "Solution"
5. **Result block**
   - Label "Result"
   - Chips row `mt-2 flex flex-wrap gap-2` — each chip: `rounded-pill border border-gold-strong/40 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold`
6. **Quote** — `<blockquote className="border-l-2 border-gold pl-4 font-serif italic text-[20px] leading-snug text-cream">"…"</blockquote>`
7. **Attribution** — `text-[12px]` with inline `style={{ color: "#6B5D50" }}` → "— General Manager, Narayani Heights" / "— Owner, ADANI Menswear"

### Card data

**Card 1 — Hospitality**
- Business: "A boutique hotel in Ahmedabad"
- Challenge: "Guests couldn't describe what made the property special — there was no sensory anchor."
- Solution: "Bazuki designed a custom woody-floral signature scent diffused in the lobby and corridors."
- Chips: "↑ 32% repeat booking rate" · "↑ 4.8★ ambiance rating" · "Scent mentioned in 60% of reviews"
- Quote: "Our guests now say they can smell our hotel the moment they step off the elevator."
- Attribution: "— General Manager, Narayani Heights"

**Card 2 — Retail**
- Business: "A fashion boutique in SBR, Ahmedabad"
- Challenge: "High footfall, low conversion. Customers browsed but didn't linger."
- Solution: "A light citrus-musk ambient scent deployed at entry and fitting rooms."
- Chips: "↑ 18% average dwell time" · "↑ 23% conversion rate" · "Zero customer complaints"
- Quote: "We didn't change our products or layout. Just the scent. The difference was immediate."
- Attribution: "— Owner, ADANI Menswear"

### Bottom CTA
- `mt-14 text-center` block
- Line: `font-serif text-[22px] md:text-[26px] text-cream` → "Want results like these for your business?"
- Button: `mt-5 inline-flex rounded-pill bg-gold px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-gold/90 transition-colors` → "Book a Free Consultation". `onClick` scrolls to `#lead-form` via `document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })`.

## Page wiring (`Business.tsx`)

```
<B2BPackages />
<ClientStories />
<HowItWorks />
```

## Out of scope
- No CMS, no real photos/logos, no schema.org review markup.
- Existing `B2BTestimonials` left intact.
