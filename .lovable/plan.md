# Add "Brand Archetypes" section to /business

## What to build
A new section on the Scent Marketing (`/business`) page introducing 6 brand archetypes, each expandable to show scent details and a CTA. Followed by a "not sure?" banner linking to the quiz.

## Files
- **New:** `src/components/business/BrandArchetypes.tsx` — the full section (heading + 6-card grid + expandable panel + bottom banner).
- **New:** `src/data/brandArchetypes.ts` — typed array of the 6 archetypes (id, name, tagline, tone, notes, useCases, keywords, color token, icon).
- **Edit:** `src/pages/Business.tsx` — import and render `<BrandArchetypes />` between `<UseCasesGrid />` and `<B2BPackages />` (logical placement: after use cases, before packages).

## Component structure
```text
<section id="brand-archetypes">
  Eyebrow · H2 · Subtext
  Grid (grid-cols-2 sm:grid-cols-2 md:grid-cols-3, gap-6)
    ArchetypeCard × 6
      Icon (lucide, tinted with archetype color)
      Name (Cormorant Garamond)
      Tagline
      3 keyword pills
  ExpandedPanel (below grid, animated open when a card is selected)
    Full description · Notes as tinted pills · Use cases list · CTA "Get a formula for this archetype"
  BottomBanner
    "Not sure which archetype fits?" · Subtext · "Discover yours →"
</section>
```

## Interaction
- Local `useState<string | null>(selectedId)`. Click card → set selected; click again or click X → clear.
- Selected card gets a colored ring/border using its archetype accent color; others fade slightly.
- Expanded panel renders below the grid (full width, spanning all columns) with a smooth height/opacity transition. On mobile it appears directly under the tapped card row.
- Expanded panel CTA scrolls to `#lead-form` (existing `LeadCaptureForm` anchor on the same page) — matches the pattern used by `B2BCtaStrip`. No new route needed.
- Bottom banner CTA links via `<Link to="/shop/quiz">` (existing quiz entry route used elsewhere on the site).

## Design tokens
- Reuse existing dark/luxury palette: `bg-bz-primary`/`bg-bz-card`, `border-luxury-gold/20`, `text-cream`, `text-cream-muted`, `font-display` for headings.
- Archetype accent colors stored as **HSL values in the data file**, applied via inline `style` (border, icon tint, pill background at ~15% opacity). This avoids polluting `index.css` with 6 one-off tokens while staying off hardcoded Tailwind color classes for text/bg.
  - Sovereign: `45 65% 52%` (amber/gold)
  - Sage: `142 35% 45%` (green)
  - Explorer: `205 60% 50%` (blue)
  - Artisan: `14 65% 55%` (coral/terracotta)
  - Visionary: `265 45% 58%` (purple)
  - Caregiver: `340 55% 65%` (pink/rose)
- Icons (lucide-react): Crown, Leaf, Compass, Hammer, Sparkles, Heart.
- Flat surfaces only — no gradients. Hover: border transitions from `hsl(color / 0.2)` → `hsl(color / 0.6)` + subtle `translateY(-2px)`. Selected: solid `hsl(color / 0.9)` border.
- Note pills in expanded view: `background: hsl(color / 0.12)`, `border: hsl(color / 0.35)`, `color: cream`.
- Keyword pills on card face: neutral `bg-white/5 border-white/10`.

## Responsive
- `<640px`: 1 column
- `640–768px`: 2 columns
- `≥768px`: 3 columns
- Expanded panel always spans full row width.

## Accessibility
- Cards are `<button>` with `aria-expanded`, `aria-controls="archetype-panel"`.
- Panel has `role="region"` and a close button with `aria-label="Close archetype details"`.
- Reduced-motion: skip lift + expand animations (per project animation rules).

## Out of scope
- No changes to routing, quiz, or `LeadCaptureForm`.
- No new backend tables or edge functions.
- No new global CSS tokens.
