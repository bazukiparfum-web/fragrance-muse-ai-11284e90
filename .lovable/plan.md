## Goal
The `/scent-coaching` page exists but has no entry points. Add navigation so users can discover and reach it.

## Changes

1. **Header nav (`src/components/Header.tsx`)**
   - Add `{ label: 'Scent Coaching', path: '/scent-coaching' }` to `NAV_LINKS` (desktop + mobile menu use the same array).
   - Placement: between "Scent Library" and "Scent Marketing" so consult-style links sit together.

2. **Footer (`src/components/Footer.tsx`)**
   - Add a "Scent Coaching" link under the existing Explore/Services column so it's reachable from every page.

3. **Homepage teaser (`src/pages/Index.tsx`)**
   - Add a small CTA link to `/scent-coaching` — either as a secondary button inside the existing `B2BTeaser` section or as a one-line strip above the FAQ ("Want personal guidance? Book a free 15-min call with a scent expert →").

4. **Quiz Results page (`src/pages/QuizResults.tsx`)**
   - Add a soft prompt near the results ("Not sure which match is you? Talk to a scent expert →" linking to `/scent-coaching`) — high-intent placement.

## Out of scope
- No changes to `/scent-coaching` itself.
- No new sitemap/robots edits (route already deployed; sitemap update optional, can be added if you want).

## Confirm
Should I include all four touchpoints, or only the header + footer for now?
