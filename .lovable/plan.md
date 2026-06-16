## Summary
Add a small reassurance line directly below every "Take the Quiz" CTA button across the homepage to remove the silent price objection.

## Files to change

1. **`src/components/Hero.tsx`** — Wrap the primary CTA (`hero-cta-primary`) in a flex-column container and add the reassurance line below it. Add a `.quiz-reassurance` CSS class in the `<style>` block with the specified styling.

2. **`src/components/home/QuizCTABanner.tsx`** — Wrap the `Link` CTA in a flex-column div and add the reassurance line below it.

3. **`src/components/FAQ.tsx`** — Wrap the `Button` in a flex-column div and add the reassurance line below it.

## Reassurance line spec
- Text: `Starts at ₹700 · Free delivery · Tweak before you order`
- Font: Inter (body font)
- Size: 11px
- Color: `#8B6914`
- Letter-spacing: 0.05em
- Text-align: center
- Margin-top: 8px
- No border, no background

## CSS approach
Add a shared `.quiz-reassurance` class in Hero.tsx's `<style>` block (since Hero already uses scoped CSS). For QuizCTABanner and FAQ, use an inline `style` prop or Tailwind utility classes to match the same values, keeping changes minimal and consistent.