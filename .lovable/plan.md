
## Goal
Add a homepage FAQ section that explains how the AI fragrance matching works — what users answer in the quiz and how/why they receive 3 fragrance matches.

## Files

### 1. Create `src/components/FAQ.tsx`
A new client component using the existing shadcn `Accordion` primitive (`@/components/ui/accordion`).

- Wrapper `<section className="py-16 md:py-24 bg-background">`
- Container `max-w-3xl mx-auto px-4`
- Centered heading **"How AI Matching Works"** (`text-3xl md:text-4xl font-display`)
- Subheading: "Everything you need to know about your personalized fragrance journey." (`text-muted-foreground`)
- `<Accordion type="single" collapsible>` with 6 items:

  1. **How does the AI match me to a fragrance?** — Engine analyzes quiz answers across personality, mood, scent-family preferences, and lifestyle signals, then maps them to a curated IFRA-compliant ingredient library.
  2. **What do I answer in the quiz?** — A 16-question, ~3-minute journey covering scent families, personality sliders (bold↔subtle, warm↔fresh), mood/occasion, color preferences, and lifestyle cues.
  3. **Why do I receive 3 fragrances?** — Instead of one guess, the AI generates three distinct matches — typically a "safe favorite," an "adventurous twist," and a "signature statement" — so you can explore the range of what suits you.
  4. **Can I see what's inside each fragrance?** — Yes. Every match shows top/heart/base notes, intensity, longevity, and a visual fingerprint. All ingredients are IFRA-compliant.
  5. **What sizes can I order?** — 30ml and 50ml bottles, plus a 3-bottle Discovery Set (₹1,500) so you can try all three matches together at a saving.
  6. **Can I tweak my fragrance after seeing results?** — Yes — use "Tweak Formula" on any result to adjust intensity or swap notes before ordering or publishing.

- Below the accordion: centered `<Button size="lg">` "Take the Quiz" → `navigate('/quiz')`.

### 2. Edit `src/pages/Index.tsx`
- Import `FAQ` from `@/components/FAQ`.
- Render `<FAQ />` between `<ProductShowcase />` and `<Footer />`.

## Out of scope
- No backend, migrations, or new memories needed.
- No edits to existing components.
