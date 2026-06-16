## Summary
Merge `QuizResultPreview` (WHAT YOU'LL RECEIVE) and `HowItWorks` (Three Steps) into one unified section on the homepage. Preserve all existing icons, labels, copy, animations, and styling — only restructure the layout per the spec.

## Approach

Rather than editing two files and a third orchestration, build the merged section inside the existing `HowItWorks.tsx` (rename internally to act as the unified "How It Works + What You'll Receive" section), then remove `QuizResultPreview` from `Index.tsx`.

## Files to change

### 1. `src/components/home/HowItWorks.tsx` — full rewrite
Single section with `background: #111111`, `padding: 80px 0`.

**Part A — Header (centered):**
- Eyebrow `"HOW IT WORKS"` (10px, Cinzel/font-display, `#C9A84C`, letter-spacing 4px)
- Heading `"Three Steps to Your Signature Scent"` (42px / 28px mobile, Cormorant Garamond, `#F5F0E8`)
- Subtext `"Our AI analyzes your answers across 52 curated ingredients to compose three distinct matches."` (15px, `#C8C0B0`, max-width 520px)

**Part B — 3 step cards row** (unchanged content)
- Keep existing `STEPS` array, `Reveal` stagger, card styling, and SVG dashed connector line (desktop only)
- Mobile: stack vertically with a vertical dashed connector line on the left

**Part C — Divider + WHAT YOU'LL RECEIVE:**
- Horizontal divider: `1px solid rgba(201,168,76,0.15)`, `margin: 40px auto`, `width: 80%`, animated `width: 0 → 80%` on scroll-in (500ms ease-out)
- Label `"WHAT YOU'LL RECEIVE"` (9px, Cinzel, `#8B6914`, letter-spacing 4px, centered, mb-24px)
- 3 outcome icons row from `QuizResultPreview.previews` (Safe Favorite / Adventurous Twist / Signature Statement) — **no card border/box**, fade-up staggered

**Part D — Single CTA + trust badges:**
- One button: `START THE QUIZ →` (existing gold pill style) + `⏱ Takes about 2 minutes` inline
- Trust badges row: `3 Unique Recommendations · Fast 7-Day Delivery · Secure Checkout` (existing styling)
- Reassurance line: `Starts at ₹700 · Free delivery · Tweak before you order` (11px, `#8B6914`, centered)
- CTA fades in last (delay 400ms)

**Mobile adaptation:** step cards stack with vertical connector, outcome icons stay in row, CTA full width, trust badges wrap.

### 2. `src/pages/Index.tsx`
- Remove `import QuizResultPreview from "@/components/QuizResultPreview"`
- Remove `<QuizResultPreview />` from JSX (line 126)
- Keep `<HowItWorks />` in place

`QuizResultPreview.tsx` file stays on disk (not deleted) in case it's referenced elsewhere; only removed from homepage.

## Out of scope
No changes to Hero, FeaturedScents, QuizCTABanner, TrustProof, B2BTeaser, scent-coaching strip, FAQ, Footer, or any other section.