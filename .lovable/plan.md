# Science Behind Scent Marketing — `/business`

Add one new section between `HeroB2B` and `UseCasesGrid`. No other changes.

## New file

`src/components/business/ScentScience.tsx`

## Structure

Section: `bg-bz-secondary` (#0D0D0D), `py-24` (96px top/bottom), centered container.

1. **Eyebrow**: "WHY SCENT WORKS" — Inter, `text-[10px]`, `text-gold`, `tracking-[0.3em]`, uppercase, centered.
2. **Headline**: "The Most Powerful Sense. The Most Underused Brand Tool." — `font-serif font-light text-[34px] md:text-[44px] text-cream`, centered, `max-w-3xl mx-auto`.
3. **Sub-copy**: scent-bypasses-rational-thought paragraph — Inter `text-[15px] text-body leading-[1.75] max-w-[560px] mx-auto`.
4. **Stat cards** (`grid md:grid-cols-3 gap-6`):
   - Card: `bg-bz-card border border-gold-strong/15 rounded-xl p-10 text-center`.
   - Stat number: `font-serif text-[80px] leading-none text-gold`.
   - Label: Inter `text-[15px] text-cream-muted leading-relaxed mt-4`.
   - Source: `text-[10px] uppercase tracking-[0.15em] mt-6 text-[hsl(30_15%_25%)]` (≈ #4A3F35, inline since no token matches).
   - Content: 75% / 44% / 10–15% with the spec'd labels and sources.
5. **3-step brain explainer** — sub-heading "How Scent Works in the Brain" (small, gold, centered).
   - `grid md:grid-cols-3 gap-6 relative`.
   - Dashed connector: a single absolute `border-t border-dashed border-gold-strong/30` line behind the row, `hidden md:block`, vertically centered between icon rows.
   - Each step: `bg-bz-card border border-gold-strong/15 rounded-xl p-6 text-center relative z-10` with lucide icon (`Wind` for nose/wave, `Brain`, `Sparkles` for heart/spark) in a `w-12 h-12 rounded-full bg-bz-primary border border-gold-strong/30 text-gold` circle, then label in Inter 13px cream, then 1-line body in `text-body text-[12px]`.
6. **Bottom CTA**: "See How We Apply This for Your Industry ↓" — `<a href="#use-cases">` button-styled gold text link, centered, with the arrow wrapped in a span using `animate-bounce`.

## Wiring

Edit `src/pages/Business.tsx` only to:
- import `ScentScience`
- render `<ScentScience />` between `<HeroB2B />` and `<UseCasesGrid />`

Also confirm `UseCasesGrid` section root has `id="use-cases"` (matches existing CTA scroll target). If missing, add it — single attribute change.

## Tokens & constraints

- Reuses existing `bz-*`/`gold` tokens. Only the source-tag color (`#4A3F35`) is hard-coded inline since no semantic token matches and adding one isn't justified for 3 lines of caption.
- No new deps (lucide-react already in use). No DB changes. No new routes.
