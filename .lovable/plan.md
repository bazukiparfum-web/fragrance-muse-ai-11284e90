## Goal

Make the hero's eyebrow, headline, and subtext fully accessible — scaling cleanly up to 200% browser/OS font size — render consistently on iOS Safari and older Android browsers, and feel tight and readable on the smallest phones (≤360px wide).

Scope is strictly the three text elements in `src/components/Hero.tsx`:
- `.hero-eyebrow` — "India's First AI Perfume Machine"
- `.hero-headline` — "Your Custom Fragrance, *Mixed by AI in India.*"
- `.hero-subtext` — 52-ingredient descriptor

No layout, image, button, animation, or copy changes.

---

## 1. Switch to relative units (font scaling up to 200%)

Today the hero text uses `px` (eyebrow `10px`) and `clamp()` with `px` anchors. Browser "Increase Text Size" and iOS Dynamic Type only scale `rem`/`em`-based typography. Convert:

| Element | Now | After |
|---|---|---|
| `.hero-eyebrow` | `font-size: 10px` | `font-size: clamp(0.625rem, 0.55rem + 0.2vw, 0.75rem)` + `letter-spacing: 0.35em` |
| `.hero-headline` | `clamp(36px, 6vw, 60px)` | `clamp(2rem, 1.4rem + 3.2vw, 3.75rem)` |
| `.hero-subtext` | `clamp(14px, 1.2vw+11px, 16px)` + `max-width: 480px` | `clamp(0.9375rem, 0.85rem + 0.4vw, 1rem)` + `max-width: min(92vw, 32rem)` |

`max-width` in `rem` means the paragraph grows with the user's font size instead of clipping into a fixed pixel box — the key fix for 200% zoom overflow.

Also remove fixed `px` margins between the three blocks and switch to `em`-based gaps (`margin-top: 1em` / `1.2em`) so vertical rhythm scales with text.

---

## 2. Prevent overlap / truncation at 200%

- Drop `min-height: 100vh` on `.hero-section`; replace with `min-height: 100dvh` and `min-height: auto` fallback so the section grows when text wraps to more lines. Keep current vertical centering.
- Allow the section to expand: change `padding: 20px 24px 80px` → `padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 1.5rem) clamp(3rem, 8vw, 5rem)`.
- Add `overflow-wrap: anywhere; hyphens: auto;` to `.hero-headline` and `.hero-subtext` so long words ("Fragrance", "ingredients") never push past the viewport at large zoom.
- Add `text-wrap: balance` to `.hero-headline` (progressive enhancement; ignored by old browsers).
- Ensure `.hero-content` has `width: 100%; max-width: 100%;` and no fixed-height ancestors.

---

## 3. iOS Safari + older Android consistency

- Add `-webkit-text-size-adjust: 100%; text-size-adjust: 100%;` on `.hero-section` to stop iOS Safari from auto-inflating text in landscape.
- Replace `100vh` with `100dvh` (Safari 15.4+) with a `100vh` fallback to avoid the iOS URL-bar jump that was previously pushing content under the fold.
- Add `font-feature-settings: "kern"` and `-webkit-font-smoothing: antialiased` only on the headline to match Cormorant rendering on iOS.
- `clamp()` is supported on iOS 13.4+ and Chrome 79+; for older Android WebViews (pre-2020) provide a base `font-size` fallback declared *before* the `clamp()` line so the cascade picks the working one.
- Verification pass with browser tool at: `375×812` (iPhone SE/12 class), `390×844` (iPhone 14), `360×800` (common Android), and a forced 200% zoom check at `768` width. Confirm: no horizontal scroll, no clipped descenders, eyebrow stays single line, subtext wraps to ≤4 lines without orphan word, no overlap with bottle row.

---

## 4. Small-screen readability tuning (≤360px)

Inside the existing `@media (max-width: 768px)` block, refine:

- `.hero-eyebrow`: `letter-spacing: 0.3em` (down from `0.4em`) and `line-height: 1.4` so it doesn't visually break apart on narrow screens.
- `.hero-headline`: `line-height: 1.15` (up from `1.1`) and add `letter-spacing: -0.005em` to tighten the italic second line.
- `.hero-subtext`: `line-height: 1.55`, `letter-spacing: 0.015em` (down from `0.03em`), `max-width: min(94vw, 22rem)`.
- Add a finer breakpoint `@media (max-width: 380px)` that nudges headline `clamp` minimum to `1.875rem` and subtext to `0.9rem`, plus tightens top spacing (`.hero-eyebrow { margin-top: 0.5em; }`).

---

## Files touched

- `src/components/Hero.tsx` — only the `<style>` block (typography rules, media queries, section min-height/padding). JSX, copy, images, buttons, and animations are untouched.

## Verification

After implementing in build mode:
1. `browser--view_preview` at 360×800, 375×812, 390×844, 768×1024, 1280×720 — screenshot each, confirm no clipping/overlap.
2. Re-test at simulated 200% zoom (viewport 640×400) — confirm hero text reflows, no horizontal scrollbar, bottle row pushed down rather than overlapped.
3. Spot-check console for layout warnings.
