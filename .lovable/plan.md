## What

Add a compact row of 3 trust badges inside `QuizResultPreview`, directly below the "Start the Quiz" CTA and time estimate.

## Where

- File: `src/components/QuizResultPreview.tsx`

## Visual spec

- **Layout**: centered horizontal row of 3 items with dot separators (desktop only), wrapping on mobile
- **Items**:
  1. `Sparkles` icon + "3 UNIQUE RECOMMENDATIONS"
  2. `Truck` icon + "Fast DELIVERY"
  3. `ShieldCheck` icon + "SECURE CHECKOUT"
- **Styling**: `text-[11px] tracking-[0.15em] text-foreground/40` labels; icons use `text-[hsl(var(--bz-gold-muted))]` at `w-3.5 h-3.5`; dot separators at `text-foreground/20`
- No hardcoded hex, no new files, no route or state changes.

## Out of scope

- No changes to any other component
- No animation beyond existing panel fade-in
- No new dependencies