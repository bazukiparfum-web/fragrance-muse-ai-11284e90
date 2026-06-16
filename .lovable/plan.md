# Results Preview Snippet Below Quiz Teaser

## What
Add a compact reassurance component directly under `QuizStepsTeaser` on the homepage. It previews what users receive after completing the quiz — 3 unique AI-generated fragrance recommendations — and briefly explains the next steps (view formulas, tweak, order).

## Where
- New component: `src/components/QuizResultPreview.tsx`
- Mounted in: `src/pages/Index.tsx` between `<QuizStepsTeaser />` and `<HowItWorks />`

## Visual spec
- **Layout**: A single rounded glass-morphism panel (not 3 separate cards) so it reads as a "snippet" and doesn't compete with the step cards above or the HowItWorks section below.
- **Background**: `bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm rounded-2xl`
- **Content**:
  - Headline: "3 Unique Fragrances, Crafted for You" (font-cormorant, text-foreground)
  - Sub-copy: "Our AI analyzes your quiz answers across 52 curated ingredients to compose a Safe Favorite, an Adventurous Twist, and a Signature Statement. View your formulas, tweak the blend, then order in 30ml or 50ml."
  - 3 micro-icons in a row: `ShieldCheck` (safe match), `Sparkles` (adventurous), `Crown` (signature) — each with a tiny label underneath, rendered in `text-primary/70`
  - CTA line: "Takes about 2 minutes" with `Clock` icon, linking to `/shop/quiz`
- **Typography**: Serif headline, sans-serif body (matches site). Step labels use `text-[11px] uppercase tracking-[0.25em]`.
- **Entrance**: Fade-in + translateY(12px) on mount, 600ms ease-out, respects `prefers-reduced-motion`.
- **Tokens**: No hardcoded hex. Uses `bg-foreground/[0.04]`, `border-foreground/10`, `text-primary`, `text-foreground/60`, etc.

## Out of scope
- No changes to `QuizStepsTeaser` or `HowItWorks`
- No new routes, no quiz state, no DB changes
- No mock product cards or dynamic data — this is a static reassurance snippet