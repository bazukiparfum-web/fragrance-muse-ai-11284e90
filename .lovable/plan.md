# Improve Mobile Layout for Travel Through the Senses Cards

## Goal
Refine the "Travel Through the Senses" mood card grid so it displays cleanly on mobile, uses touch-friendly spacing, and keeps smooth hover/active states without feeling cramped or hard to tap.

## Current state
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4`
- Card image aspect ratio: `aspect-[4/3]`
- Card text overlay padding: `p-3`
- Blurb text: `text-[10px]` uppercase with wide tracking
- Hover effects: border lightens, image opacity increases, card lifts via `motion-safe:hover:-translate-y-1`
- Cards are `<button>` elements but rely mostly on hover states; no explicit active/touch feedback

## Issues to fix
1. **Cramped two-column cards on small screens** — `gap-3` plus overlay text can make titles and blurbs collide or truncate.
2. **Tiny blurbs** — `text-[10px]` is hard to read on 375 px devices.
3. **Hover-only feedback** — on touch devices there is no visual confirmation when a card is pressed.
4. **Touch target / padding** — the entire card is tappable, but the text overlay area is dense and could benefit from slightly more internal breathing room.
5. **Image aspect ratio** — `4/3` keeps cards short, which compresses the text block against the gradient.

## Proposed changes

### 1. Mobile grid and spacing
- Keep 2 columns on mobile but increase the gap: use `gap-4` (or `gap-3.5`) on small screens and `md:gap-4` on larger ones.
- Add a touch more horizontal section padding or keep `px-6` but ensure cards never touch the viewport edge.

### 2. Card padding and typography
- Increase bottom overlay padding on mobile: `p-3.5 sm:p-3` or `p-4`.
- Scale the title up slightly on mobile: `text-base sm:text-sm md:text-base` (current `text-sm md:text-base` is fine but can be bumped).
- Bump blurb size on mobile: `text-[11px] sm:text-[10px]` so it remains readable while keeping the refined uppercase treatment.
- Improve line-height for the title on mobile to avoid descender clipping: `leading-snug` or `leading-tight`.

### 3. Touch-friendly states
- Add an `active:` state that gives immediate feedback on tap:
  - `active:scale-[0.98]`
  - `active:border-gold/60`
- Keep hover lift for desktop but make sure it does not conflict with touch (use `hover:` only, no `active:` transform conflict).
- Consider a subtle gold glow shadow on focus/active: `focus-visible:ring-2 focus-visible:ring-gold` (already present; keep).

### 4. Image aspect and readability
- Switch to a slightly taller aspect ratio on mobile so text has room: `aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/3]` or similar.
- Strengthen the bottom gradient slightly on mobile so white text stays legible over busy artwork.

### 5. Accessibility
- Confirm each card remains a `<button>` with a clear `aria-label`.
- Ensure the focus ring is visible and the tap highlight is removed (`-webkit-tap-highlight-color: transparent`) via Tailwind or CSS.

## Files to edit
- `src/components/home/SenseCard.tsx` — spacing, typography, aspect ratio, active states
- `src/components/home/TravelThroughSenses.tsx` — grid gap and section padding

## Verification
- Preview the homepage on mobile viewport (375 px, 414 px, 768 px).
- Confirm no text truncation or overlap in any card.
- Tap a card and verify a visible press state.
- Confirm desktop hover lift still works.
