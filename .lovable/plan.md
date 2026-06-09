## Problem

Footer link `/business#consultation` does two things wrong:
1. The target section id is `lead-form`, not `consultation` — so the hash matches nothing.
2. The global `ScrollToTop` component force-scrolls to `(0,0)` on every route change, overriding any browser hash-anchor jump.

Result: clicking "Book a Consultation" lands at the top of `/business` instead of the form.

## Changes

1. **`src/components/Footer.tsx`** — change the link target from `/business#consultation` to `/business#lead-form` so it matches the existing `<section id="lead-form">` in `LeadCaptureForm.tsx`. (Only the footer link is touched; no other nav.)

2. **`src/components/ScrollToTop.tsx`** — make hash-aware:
   - Read `hash` from `useLocation()` alongside `pathname`.
   - If `hash` is present: try `document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" })`. If the element isn't mounted yet (lazy section), retry once on the next animation frame.
   - If no hash: keep current behavior (instant scroll to top + Safari resets).
   - Trigger effect on both `pathname` and `hash` so in-page hash changes also work.

## Out of scope
- No changes to `LeadCaptureForm`, other footer links, or any other navigation.
- Smooth scrolling stays off (per existing CSS rule) — instant jump is intentional.

## Files touched
- edit: `src/components/Footer.tsx` (1 href change)
- edit: `src/components/ScrollToTop.tsx` (hash handling)
