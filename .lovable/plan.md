## Goal
Add a "Meet the Machine" homepage section between HowItWorks and FeaturedScents (the "From the Library" section). This section showcases Bazuki's AI filling machine — the brand's core differentiator.

## Files to create / edit

1. **`src/components/home/MeetTheMachine.tsx`** — New section component
2. **`src/pages/Index.tsx`** — Insert `<MeetTheMachine />` between `<HowItWorks />` and `<FeaturedScents />`

## Section layout

```text
Full width, bg #0A0805, padding 80px 0
┌─────────────────────────────────────────────────────┐
│  [IMAGE — 50%]        [CONTENT — 50%]               │
│  technology-hero.jpg                                │
│  radius 8px, gold glow, rotateY(3deg)               │
│                       THE BAZUKI MACHINE            │
│                       (eyebrow, Cinzel, gold)       │
│                                                     │
│                       India's First AI Fragrance    │
│                       Filling Machine               │
│                       (Cormorant, ivory, 36px)      │
│                                                     │
│                       Body copy...                  │
│                       (15px, #C8C0B0, lh 1.8)       │
│                                                     │
│                       [52] [±0.01ml] [Your Formula] │
│                       stat pills row                │
│                                                     │
│                       See how it works →            │
│                       (link to /guide/...)          │
└─────────────────────────────────────────────────────┘
```

## Technical details

- **Image**: `src/assets/technology-hero.jpg` (existing asset). Styled with `border-radius: 8px`, `box-shadow: 0 0 60px rgba(201,168,76,0.08)`, and `transform: perspective(1000px) rotateY(3deg)`.
- **Eyebrow**: 10px, `font-display`, `#C9A84C`, `letter-spacing: 4px`, uppercase.
- **Heading**: 36px/28px responsive, `font-cormorant`, `#F5F0E8` (ivory), weight 300.
- **Body**: 15px, `font-body`, `#C8C0B0`, `line-height: 1.8`.
- **Stat pills**: horizontal row of 3. Background `rgba(201,168,76,0.06)`, border `1px solid rgba(201,168,76,0.2)`, radius 6px, padding `8px 16px`. Number in 16px gold serif, label in 10px dim gold.
- **Link**: 14px, `#C9A84C`, hover underline transition.
- **Scroll animation**: Uses existing `useInView` hook. Image slides from left (`translateX(-40px)` → `0`), content from right (`translateX(40px)` → `0`), opacity `0` → `1`, 500ms ease-out. `prefers-reduced-motion` respected via the hook's built-in fallback.
- **Mobile** (`< md`): Stacks vertically — image full width on top, text below. Perspective tilt removed on mobile for performance. Stat pills wrap if needed.
- **Accessibility**: Section has `aria-labelledby` pointing to heading. Link has descriptive `aria-label`. Stat pills use semantic list markup.

## No changes to existing sections
This is a pure addition. No edits to HowItWorks, FeaturedScents, or any other component.