# Mini Quiz Step Cards Below Hero CTA

## What

Add a compact 3-step teaser row on the homepage directly under the hero's "Discover Your Scent" CTA, presenting the AI fragrance quiz flow as: **Take the Quiz → AI Formulates → 3 Bottles Delivered**. The whole row links to the existing `/shop/quiz` route — no new quiz logic, no inline questions.

Design follows the selected "Elite glass-morphism cards" prototype with metallic gold gradient step numbers.

## Where it goes

- New component: `src/components/QuizStepsTeaser.tsx`
- Mounted in `src/pages/Index.tsx` immediately after the `<Hero />` component, before the next existing section.

## Visual spec

- 3 cards in a connected row (joined borders on md+, stacked rounded cards on mobile)
- Glass-morphism: `bg-white/5`, `border-white/10`, `backdrop-blur-sm`
- Step labels ("Step 01/02/03") rendered with a metallic gold gradient (per the user's direction) using `bg-gradient-to-r from-[hsl(var(--bz-gold-light))] via-[hsl(var(--bz-gold))] to-[hsl(var(--bz-gold-dark))] bg-clip-text text-transparent` — tokens already exist in `index.css`
- Cormorant Garamond serif titles, sans-serif uppercase eyebrows (matches site)
- Lucide icons: `ClipboardList` (Step 1), `Sparkles` (Step 2), `Package` (Step 3)
- Hover: card brightens (`bg-white/10`), border lifts, slight `-translate-y-1`
- "Begin Your Journey" gold eyebrow with hairlines under the row
- Entire row is an `<a href="/shop/quiz">` wrapping with `group` for shared hover state
- Stagger fade-in on mount (200ms each), respects `prefers-reduced-motion`

## Token compliance

Replace hardcoded `bg-white/X`, `border-white/X`, `text-amber-200/X` from the prototype with semantic equivalents using existing tokens in `index.css` (`--bz-gold*`, `--card`, `--border`, `--foreground`). No raw hex.

## Out of scope

- No changes to `Hero.tsx` (the existing CTA still links to `/shop/quiz`)
- No new routes, no quiz state, no DB changes
- No edits to existing quiz pages
