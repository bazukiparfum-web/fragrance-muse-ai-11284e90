## Goal
Confirm the homepage section order and add scroll-triggered animations across the page, with mobile/perf checks.

## Page assembly (src/pages/Index.tsx)
Order is already correct: Header → Hero → HowItWorks → FeaturedScents → QuizCTABanner → TrustProof → B2BTeaser → FAQ → Footer. I'll remove `FAQ` from the spec? No — keep it since it's already wired and valuable; confirm with you only if you want it dropped. Otherwise leave Footer last. (Default: keep FAQ between B2B and Footer.)

## New shared animation primitives
Create `src/hooks/useInView.ts` — IntersectionObserver hook (threshold 0.2 ≈ "80% viewport entry"), one-shot trigger, respects `prefers-reduced-motion`.

Create `src/components/anim/Reveal.tsx` — wraps children, applies opacity 0→1 + translateY(24px→0) over 0.6s ease-out when in view. Variants: `headline` (24px), `item` (16px). Supports `delay` prop for staggering.

Add CSS keyframes to `src/index.css`:
- `bz-reveal-up` (used by Reveal)
- `bz-draw-line` (stroke-dashoffset 100→0, 1s ease-out) for HowItWorks connector
- `bz-count-up` is JS, not CSS

All animated wrappers add `will-change: transform, opacity` only while animating, removed after.

## Per-section changes

**HowItWorks**
- Wrap headline in `<Reveal variant="headline">`.
- Replace the dashed `<div>` connector with an inline `<svg>` containing a dashed gold line; animate `stroke-dashoffset` from full length → 0 over 1s once the section enters view (uses same `useInView`).
- Wrap each step card in `<Reveal variant="item" delay={i*80} />`.

**FeaturedScents**
- Headline + eyebrow → `<Reveal variant="headline">`.
- Each `ScentCard` → `<Reveal variant="item" delay={i*80} />`.
- Add `loading="lazy"` to any `<img>` (currently gradients only — n/a, but apply when real images land).

**QuizCTABanner**
- Split the quote into `<span>` per word; each span animates opacity 0→1 + translateY 8px→0, staggered 30ms, triggered when banner enters view via `useInView`.
- Right-column copy + CTA → `<Reveal variant="item" delay={...}>`.

**TrustProof**
- Build `useCountUp(target, duration=1200)` hook: starts when stat row enters view; parses numeric portion of strings like `"2,000+"` → animates 0 → 2000, re-appends suffix (`+`, `,`). For non-numeric (`"PAN"`) skip count and just fade in.
- Wrap each stat in `<Reveal variant="item" delay={i*80}>`; numbers replaced with `<CountUp value={...}>`.
- Testimonial cards → `<Reveal variant="item" delay={i*80}>`.

**B2BTeaser**
- Headline → `<Reveal variant="headline">`; chips + CTA → staggered `<Reveal variant="item">`.

**Hero**
- Already has bobbing notes (kept as-is, not scroll-triggered).
- Add `fetchpriority="high"` to bottle `<img>` is fine, but to ensure LCP = headline, also add `loading="eager"` only to bottle and confirm headline renders first in DOM (it does). No Reveal wrapper on hero (above the fold).

**Header**
- Scroll transition at 80px already implemented (line 33). I'll verify in browser after build.

## Performance + a11y
- All Reveal wrappers `will-change: transform, opacity` only while `data-animating="true"`; cleared on animationend.
- `prefers-reduced-motion: reduce` short-circuits Reveal/CountUp to instant final state.
- Confirm no `<img>` above the fold uses `loading="lazy"` (only hero bottle is above fold; keep eager).
- IntersectionObserver is passive — no main-thread blocking.

## Final QA pass
- Browser screenshots at 375 / 430 / 768 / 1024 / 1440 to verify responsive layout and that hero CTAs sit above the fold.
- Ripgrep for stray non-gold accent colors (`#3b82f6`, `blue-`, `gray-` in homepage components) and replace with gold tokens if any leaked in.
- Console-log check after load.

## Files
**New**: `src/hooks/useInView.ts`, `src/hooks/useCountUp.ts`, `src/components/anim/Reveal.tsx`, `src/components/anim/CountUp.tsx`, `src/components/anim/WordReveal.tsx`
**Edited**: `src/index.css` (keyframes), `src/components/home/HowItWorks.tsx`, `FeaturedScents.tsx`, `QuizCTABanner.tsx`, `TrustProof.tsx`, `B2BTeaser.tsx`, `src/pages/Index.tsx` (verify order).

## Out of scope
No backend, schema, or business-logic changes. Hero left visually unchanged aside from img priority hints.